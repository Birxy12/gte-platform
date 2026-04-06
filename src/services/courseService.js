import { db } from "../config/firebase";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    updateDoc,
    serverTimestamp
} from "firebase/firestore";

export const courseService = {
    /**
     * Get all published courses
     */
    async getAllCourses() {
        const q = query(collection(db, "courses"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    /**
     * Get a single course by ID
     */
    async getCourseById(courseId) {
        if (!courseId) return null;
        const snap = await getDoc(doc(db, "courses", courseId));
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    },

    /**
     * Get materials for a specific course
     */
    async getCourseMaterials(courseId) {
        const q = query(
            collection(db, "courseMaterials"),
            where("courseId", "==", courseId),
            orderBy("order", "asc")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    /**
     * Toggle a course's live status (Instructor only)
     */
    async toggleLiveStatus(courseId, isLive) {
        await updateDoc(doc(db, "courses", courseId), {
            isLive: isLive,
            liveStartedAt: isLive ? serverTimestamp() : null
        });
    },

    /**
     * Toggle a quiz's active status (Instructor only)
     */
    async toggleQuizStatus(quizId, isActive) {
        await updateDoc(doc(db, "quizzes", quizId), {
            isActive: isActive,
            activatedAt: isActive ? serverTimestamp() : null
        });
    }
};
