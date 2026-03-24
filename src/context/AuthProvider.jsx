import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { presenceService } from "../services/presenceService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribePresence = null;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        unsubscribePresence = presenceService.initializePresence(currentUser.uid);
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setRole(docSnap.data().role);
          } else {
            setRole("student"); // Initial default
          }
        } catch (error) {
          console.error("Error fetching role:", error);
          setRole("student");
        }
      } else {
        setUser(null);
        setRole(null);
        if (unsubscribePresence) {
          unsubscribePresence();
          unsubscribePresence = null;
        }
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (unsubscribePresence) {
        unsubscribePresence();
      }
    };
  }, []);

  const value = {
    user,
    role,
    isAdmin: role === "admin",
    isInstructor: role === "instructor",
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);