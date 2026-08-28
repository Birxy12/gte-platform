import { auth, db, googleProvider } from "../config/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  signInWithRedirect,
  updateProfile
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export const authService = {
  async login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  },

  async register(email, password, displayName, role = "student") {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    const userRef = doc(db, "users", cred.user.uid);
    await setDoc(userRef, {
      uid: cred.user.uid,
      email,
      displayName: displayName || email.split("@")[0],
      role,
      coins: 100, // Welcome gift coins
      createdAt: serverTimestamp()
    });
    return cred.user;
  },

  async loginWithGoogle(isMobile = false) {
    if (isMobile) {
      return await signInWithRedirect(auth, googleProvider);
    }
    const cred = await signInWithPopup(auth, googleProvider);
    const userRef = doc(db, "users", cred.user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName || "Operative",
        photoURL: cred.user.photoURL,
        role: "student",
        coins: 100,
        createdAt: serverTimestamp()
      });
    }
    return cred.user;
  },

  async resetPassword(email) {
    return await sendPasswordResetEmail(auth, email);
  },

  async logout() {
    return await signOut(auth);
  }
};
