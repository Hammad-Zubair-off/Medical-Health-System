import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User as FirebaseUser } from "firebase/auth";
// Note: Auth imports commented out until auth is enabled
// import { onAuthStateChanged } from "firebase/auth";
// import { auth } from "../../firebase";

interface UserContextType {
  currentUser: FirebaseUser | null;
  doctorUserId: string | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  currentUser: null,
  doctorUserId: null,
  loading: true,
});

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  // Hardcoded doctor IDs for testing (until auth is enabled)
  // doctorUserId: /Users/kEmEnYxoHLQifCyS6IOF0FDXQYl2 (document ID in Users collection)
  // doctorId: /Doctor/rg7yL0esOEBVsv1Lh9mt (document ID in Doctor collection)
  const HARDCODED_DOCTOR_USER_ID = "kEmEnYxoHLQifCyS6IOF0FDXQYl2";
  // const HARDCODED_DOCTOR_ID = "rg7yL0esOEBVsv1Lh9mt"; // Reserved for future use when querying Doctor collection
  
  const [currentUser] = useState<FirebaseUser | null>(null); // Reserved for when auth is enabled
  const [doctorUserId] = useState<string | null>(
    HARDCODED_DOCTOR_USER_ID // Hardcoded for testing
  );
  const [loading] = useState<boolean>(false); // Set to false since we're not waiting for auth

  useEffect(() => {
    // For now, skip auth check and use hardcoded doctor ID
    // TODO: Enable auth and get doctorUserId from authenticated user
    // When auth is enabled, uncomment the following:
    // const unsubscribe = onAuthStateChanged(auth, (user) => {
    //   setCurrentUser(user);
    //   // Verify user role is "Doctor" before setting doctorUserId
    //   setDoctorUserId(user?.uid || null);
    //   setLoading(false);
    // });
    // return () => unsubscribe();
    
    // Hardcoded for testing - using specified doctor IDs
    // doctorUserId is already set in useState initial value
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, doctorUserId, loading }}>
      {children}
    </UserContext.Provider>
  );
};

