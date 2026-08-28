import { db } from "../config/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";

export const blogService = {
  async getPosts(limitCount = 20) {
    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async getPostById(postId) {
    if (!postId) return null;
    const snap = await getDoc(doc(db, "posts", postId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  },

  async createPost(postData, user) {
    return await addDoc(collection(db, "posts"), {
      ...postData,
      authorId: user.uid,
      authorName: user.displayName || "Operative",
      authorPhoto: user.photoURL || null,
      likes: [],
      likesCount: 0,
      commentsCount: 0,
      viewsCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  },

  async toggleLike(postId, userId) {
    if (!postId || !userId) return;
    const postRef = doc(db, "posts", postId);
    const snap = await getDoc(postRef);
    if (!snap.exists()) return;

    const data = snap.data();
    const likes = data.likes || [];
    const hasLiked = likes.includes(userId);

    if (hasLiked) {
      await updateDoc(postRef, {
        likes: arrayRemove(userId),
        likesCount: increment(-1)
      });
      return false;
    } else {
      await updateDoc(postRef, {
        likes: arrayUnion(userId),
        likesCount: increment(1)
      });
      return true;
    }
  },

  async addComment(postId, commentText, user) {
    if (!postId || !commentText || !user) return;
    const commentsRef = collection(db, "posts", postId, "comments");
    const commentDoc = await addDoc(commentsRef, {
      text: commentText,
      authorId: user.uid,
      authorName: user.displayName || "Operative",
      authorPhoto: user.photoURL || null,
      createdAt: serverTimestamp()
    });

    await updateDoc(doc(db, "posts", postId), {
      commentsCount: increment(1)
    });

    return commentDoc.id;
  },

  async getComments(postId) {
    if (!postId) return [];
    const q = query(
      collection(db, "posts", postId, "comments"),
      orderBy("createdAt", "asc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async deletePost(postId) {
    return await deleteDoc(doc(db, "posts", postId));
  }
};
