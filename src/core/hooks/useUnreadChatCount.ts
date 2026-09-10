import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  subscribeMyThreads,
  totalUnreadForUser,
} from "../services/firestore/chat.service";

/** Live total of unread chat messages for the signed-in doctor/patient. */
export function useUnreadChatCount(): number {
  const { user, role } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user?.uid || (role !== "doctor" && role !== "patient")) {
      setCount(0);
      return;
    }
    return subscribeMyThreads(user.uid, (threads) => {
      setCount(totalUnreadForUser(threads, user.uid));
    });
  }, [user?.uid, role]);

  return count;
}
