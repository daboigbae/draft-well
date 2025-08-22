import { useState, useEffect } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { handleRedirectResult } from "../lib/auth";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Handle redirect result on app load
    handleRedirectResult().catch(console.error);

    return unsubscribe;
  }, []);

  return { user, loading };
};
