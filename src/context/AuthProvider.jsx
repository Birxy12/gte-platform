import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../config/firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { presenceService } from "../services/presenceService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [siteSettings, setSiteSettings] = useState({ siteName: "GTE Portal" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to global settings in real-time
    const unsubscribeSettings = onSnapshot(doc(db, "settings", "global"), (snap) => {
      if (snap.exists()) {
        setSiteSettings(prev => ({ ...prev, ...snap.data() }));
      }
    }, (err) => console.error("Error fetching settings:", err));

    let unsubscribePresence = null;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        unsubscribePresence = presenceService.initializePresence(currentUser.uid);
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setRole(data.role || "student");
            // Check for suspension
            if (data.suspendedUntil) {
              const suspensionDate = new Date(data.suspendedUntil);
              if (suspensionDate > new Date()) {
                setRole("suspended"); // Temporary role change for restricted access
              }
            }
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
      unsubscribeSettings();
      if (unsubscribePresence) {
        unsubscribePresence();
      }
    };
  }, []);

  const value = {
    user,
    role,
    siteSettings,
    isAdmin: role === "admin",
    isInstructor: role === "instructor",
    isAdminOrInstructor: role === "admin" || role === "instructor",
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