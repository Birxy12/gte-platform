import { db } from "../config/firebase";
import {
    collection,
    query,
    where,
    getDocs,
    setDoc,
    doc,
    serverTimestamp
} from "firebase/firestore";

export const progressService = {
    /**
     * Mark a course as completed for a user
     */
    async markCourseCompleted(userId, courseId, courseTitle) {
        // We use a composite ID so a user can only complete a course once
        const progressId = `${userId}_${courseId}`;
        const docRef = doc(db, "userProgress", progressId);
        
        await setDoc(docRef, {
            userId,
            courseId,
            courseTitle,
            completedAt: serverTimestamp()
        });
    },

    /**
     * Get all completed courses for a user
     */
    async getUserCompletedCourses(userId) {
        if (!userId) return [];
        const q = query(collection(db, "userProgress"), where("userId", "==", userId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
};
