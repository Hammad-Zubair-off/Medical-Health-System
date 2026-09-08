import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth } from "../../firebase";
import { signOutUser } from "../services/auth/auth.service";
import {
  getUserProfile,
  resolveDoctorId,
} from "../services/firestore/users.service";
import type { AppUser, AuthStatus, UserRole } from "../types/auth.types";

interface AuthContextValue {
  user: AppUser | null;
  status: AuthStatus;
  role: UserRole | null;
  isAuthenticated: boolean;
  doctorUserId: string | null;
  doctorId: string | null;
  /** Resolves with the loaded profile, or null if signed out / incomplete. */
  refreshProfile: () => Promise<AppUser | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const PROFILE_MISSING_MESSAGE =
  "Your account is not fully set up. Contact an administrator.";

async function buildAppUser(firebaseUser: FirebaseUser): Promise<AppUser> {
  const profile = await getUserProfile(firebaseUser.uid);
  if (!profile) {
    throw new Error(PROFILE_MISSING_MESSAGE);
  }

  let doctorId: string | null = null;
  if (profile.role === "doctor") {
    doctorId = await resolveDoctorId(firebaseUser.uid);
  }

  return {
    ...profile,
    email: firebaseUser.email ?? profile.email,
    emailVerified: firebaseUser.emailVerified,
    displayName: firebaseUser.displayName ?? profile.displayName,
    photoURL: firebaseUser.photoURL ?? profile.photoURL,
    doctorId,
  };
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  /** Ignores stale async auth resolutions when a newer one has started. */
  const epochRef = useRef(0);

  const applyFirebaseUser = useCallback(
    async (firebaseUser: FirebaseUser | null): Promise<AppUser | null> => {
      const epoch = ++epochRef.current;
      flushSync(() => {
        setStatus("loading");
      });

      if (!firebaseUser) {
        if (epoch !== epochRef.current) return null;
        flushSync(() => {
          setUser(null);
          setStatus("unauthenticated");
        });
        return null;
      }

      try {
        const appUser = await buildAppUser(firebaseUser);
        if (epoch !== epochRef.current) return null;
        // Ensure role is in context before login navigates
        flushSync(() => {
          setUser(appUser);
          setStatus("authenticated");
        });
        return appUser;
      } catch (error) {
        if (epoch !== epochRef.current) return null;
        console.error("[AuthContext] Profile missing or incomplete:", error);
        await signOutUser().catch(() => undefined);
        if (epoch !== epochRef.current) return null;
        flushSync(() => {
          setUser(null);
          setStatus("unauthenticated");
        });
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem("auth_profile_missing", "1");
        }
        return null;
      }
    },
    []
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      void applyFirebaseUser(firebaseUser);
    });
    return unsubscribe;
  }, [applyFirebaseUser]);

  const refreshProfile = useCallback(async (): Promise<AppUser | null> => {
    const current = auth.currentUser;
    if (!current) {
      epochRef.current += 1;
      flushSync(() => {
        setUser(null);
        setStatus("unauthenticated");
      });
      return null;
    }
    await current.reload();
    return applyFirebaseUser(auth.currentUser);
  }, [applyFirebaseUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      role: user?.role ?? null,
      isAuthenticated: status === "authenticated" && user !== null,
      doctorUserId: user?.uid ?? null,
      doctorId: user?.doctorId ?? null,
      refreshProfile,
    }),
    [user, status, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
