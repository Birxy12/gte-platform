import { db } from "../config/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query
} from "firebase/firestore";

export const firestoreService = {
  async getDocument(collName, docId) {
    const snap = await getDoc(doc(db, collName, docId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  async setDocument(collName, docId, data, merge = true) {
    return await setDoc(doc(db, collName, docId), data, { merge });
  },

  async updateDocument(collName, docId, data) {
    return await updateDoc(doc(db, collName, docId), data);
  },

  async deleteDocument(collName, docId) {
    return await deleteDoc(doc(db, collName, docId));
  },

  async queryCollection(collName, ...queryConstraints) {
    const q = query(collection(db, collName), ...queryConstraints);
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
};
