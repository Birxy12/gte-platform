import { db } from "../config/firebase";
import { 
    collection, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    getDocs, 
    query, 
    orderBy,
    serverTimestamp 
} from "firebase/firestore";

const MISSIONS_COLLECTION = "missions";

export const missionsService = {
    /**
     * Fetch all missions
     */
    async getMissions() {
        const q = query(collection(db, MISSIONS_COLLECTION), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    /**
     * Add a new mission
     */
    async addMission(missionData) {
        const docRef = await addDoc(collection(db, MISSIONS_COLLECTION), {
            ...missionData,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    },

    /**
     * Update an existing mission
     */
    async updateMission(id, missionData) {
        const docRef = doc(db, MISSIONS_COLLECTION, id);
        await updateDoc(docRef, {
            ...missionData,
            updatedAt: serverTimestamp()
        });
    },

    /**
     * Delete a mission
     */
    async deleteMission(id) {
        await deleteDoc(doc(db, MISSIONS_COLLECTION, id));
    },

    /**
     * Bulk upload initial missions (Seed)
     */
    async seedMissions(initialMissions) {
        const results = [];
        for (const mission of initialMissions) {
            const id = await this.addMission(mission);
            results.push(id);
        }
        return results;
    }
};
