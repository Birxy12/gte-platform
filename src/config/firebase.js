import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, PhoneAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics (safe initialization)
let analytics;
isSupported().then((yes) => {
  if (yes) analytics = getAnalytics(app);
});
export { analytics };

// Providers
export const googleProvider = new GoogleAuthProvider();
export const phoneProvider = new PhoneAuthProvider(auth);

export default app;