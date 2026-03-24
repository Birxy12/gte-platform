import { db, auth } from "../config/firebase";
import { doc, setDoc, onSnapshot, serverTimestamp, updateDoc } from "firebase/firestore";

export const presenceService = {
    // Basic presence based on app focus state
    initializePresence: (userId) => {
        if (!userId) return;

        const userPresenceRef = doc(db, "presence", userId);

        const setOnline = async () => {
            try {
                await setDoc(userPresenceRef, {
                    isOnline: true,
                    lastSeen: serverTimestamp()
                }, { merge: true });
            } catch (error) {
                console.error("Error setting presence online:", error);
            }
        };

        const setOffline = async () => {
            try {
                await setDoc(userPresenceRef, {
                    isOnline: false,
                    lastSeen: serverTimestamp()
                }, { merge: true });
            } catch (error) {
                console.error("Error setting presence offline:", error);
            }
        };

        // Set online initially
        setOnline();

        // Listen for window focus/blur
        window.addEventListener("focus", setOnline);
        window.addEventListener("blur", setOffline);
        
        // Also try to set offline when closing tab
        window.addEventListener("beforeunload", setOffline);

        return () => {
            window.removeEventListener("focus", setOnline);
            window.removeEventListener("blur", setOffline);
            window.removeEventListener("beforeunload", setOffline);
            setOffline();
        };
    },

    // Subscribe to a user's presence state
    subscribeToPresence: (userId, callback) => {
        if (!userId) return () => {};
        
        const userPresenceRef = doc(db, "presence", userId);
        return onSnapshot(userPresenceRef, (doc) => {
            if (doc.exists()) {
                callback(doc.data());
            } else {
                callback({ isOnline: false, lastSeen: null });
            }
        }, (error) => {
            console.error("Error subscribing to presence:", error);
        });
    }
};
