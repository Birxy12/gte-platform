import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, PhoneAuthProvider } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBFGmSq_c_4T7Tviiy3EGn6OkDwlY259f4",
  authDomain: "globixtechent.firebaseapp.com",
  projectId: "globixtechent",

  // ✅ FIXED STORAGE BUCKET
  storageBucket: "globixtechent.appspot.com",

  messagingSenderId: "541702545683",
  appId: "1:541702545683:web:392a13dcb322014e767ae6",
  measurementId: "G-F50LKBYLDD"
};

// Initialize Firebase (safely for HMR)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Services
export const auth = getAuth(app);

// Enable offline persistence with multi-tab support (safely for HMR)
let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
  });
} catch (e) {
  firestoreDb = getFirestore(app);
}
export const db = firestoreDb;

export const storage = getStorage(app);

// Analytics (safe initialization)
let analytics;
isSupported().then((yes) => {
  if (yes) analytics = getAnalytics(app);
});
export { analytics };

// Providers
export const googleProvider = new GoogleAuthProvider();
// Always prompt account selection — prevents stale credential / invalid-credential errors
googleProvider.setCustomParameters({ prompt: 'select_account' });
googleProvider.addScope('email');
googleProvider.addScope('profile');

export const phoneProvider = new PhoneAuthProvider(auth);

export default app;