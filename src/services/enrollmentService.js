import { db } from "../config/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
  runTransaction
} from "firebase/firestore";

export const enrollmentService = {
  /**
   * Enroll a user in a course, deducting coins from their vault
   */
  async enrollInCourse(userId, courseId, coinCost) {
    const enrollmentId = `${userId}_${courseId}`;
    const enrollmentRef = doc(db, "enrollments", enrollmentId);
    const userRef = doc(db, "users", userId);

    // Check if already enrolled
    const existingSnap = await getDoc(enrollmentRef);
    if (existingSnap.exists()) {
      throw new Error("Already enrolled in this course");
    }

    // Use transaction to atomically deduct coins and create enrollment
    await runTransaction(db, async (tx) => {
      const userSnap = await tx.get(userRef);
      if (!userSnap.exists()) throw new Error("User not found");

      const currentCoins = userSnap.data().coins || 0;
      if (currentCoins < coinCost) {
        throw new Error(`Insufficient coins. You have ${currentCoins} coins, need ${coinCost}.`);
      }

      // Deduct coins
      tx.update(userRef, { coins: increment(-coinCost) });

      // Create enrollment
      tx.set(enrollmentRef, {
        userId,
        courseId,
        enrolledAt: serverTimestamp(),
        progress: 0,
        completedLessons: [],
        lastAccessed: serverTimestamp(),
        coinsPaid: coinCost,
        quizScores: {}
      });
    });

    return enrollmentId;
  },

  /**
   * Check if a user is enrolled in a course (free courses)
   */
  async enrollFree(userId, courseId) {
    const enrollmentId = `${userId}_${courseId}`;
    const enrollmentRef = doc(db, "enrollments", enrollmentId);
    const existingSnap = await getDoc(enrollmentRef);
    if (existingSnap.exists()) return enrollmentId;

    await setDoc(enrollmentRef, {
      userId,
      courseId,
      enrolledAt: serverTimestamp(),
      progress: 0,
      completedLessons: [],
      lastAccessed: serverTimestamp(),
      coinsPaid: 0,
      quizScores: {}
    });
    return enrollmentId;
  },

  /**
   * Check if a user is enrolled in a course
   */
  async isEnrolled(userId, courseId) {
    if (!userId || !courseId) return false;
    const enrollmentId = `${userId}_${courseId}`;
    const snap = await getDoc(doc(db, "enrollments", enrollmentId));
    return snap.exists();
  },

  /**
   * Get enrollment data for a user + course
   */
  async getEnrollment(userId, courseId) {
    const enrollmentId = `${userId}_${courseId}`;
    const snap = await getDoc(doc(db, "enrollments", enrollmentId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  /**
   * Get all enrolled courses for a user
   */
  async getEnrolledCourses(userId) {
    if (!userId) return [];
    const q = query(collection(db, "enrollments"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  /**
   * Mark a lesson/material as completed
   */
  async markLessonComplete(userId, courseId, lessonId) {
    const enrollmentId = `${userId}_${courseId}`;
    const enrollmentRef = doc(db, "enrollments", enrollmentId);
    const snap = await getDoc(enrollmentRef);
    if (!snap.exists()) return;

    const data = snap.data();
    const completedLessons = data.completedLessons || [];
    if (completedLessons.includes(lessonId)) return;

    const newCompleted = [...completedLessons, lessonId];
    await updateDoc(enrollmentRef, {
      completedLessons: newCompleted,
      lastAccessed: serverTimestamp()
    });
  },

  /**
   * Save a quiz score result
   */
  async submitQuizResult(userId, courseId, quizId, score, total) {
    const enrollmentId = `${userId}_${courseId}`;
    const enrollmentRef = doc(db, "enrollments", enrollmentId);

    // Also write to quizResults collection for instructor view
    const resultRef = doc(db, "quizResults", `${userId}_${quizId}`);
    
    const batch = [
      updateDoc(enrollmentRef, {
        [`quizScores.${quizId}`]: { score, total, submittedAt: new Date().toISOString() },
        lastAccessed: serverTimestamp()
      }),
      setDoc(resultRef, {
        userId,
        courseId,
        quizId,
        score,
        total,
        percentage: Math.round((score / total) * 100),
        submittedAt: serverTimestamp()
      })
    ];

    await Promise.all(batch);
  },

  /**
   * Get quiz results for a user
   */
  async getUserQuizResults(userId) {
    if (!userId) return [];
    const q = query(collection(db, "quizResults"), where("userId", "==", userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  /**
   * Get all students enrolled in a course (for instructors)
   */
  async getCourseEnrollments(courseId) {
    const q = query(collection(db, "enrollments"), where("courseId", "==", courseId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
};
