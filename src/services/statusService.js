import { db, storage, auth } from "../config/firebase";
import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    Timestamp
} from "firebase/firestore";
import {
    ref,
    uploadBytes,
    getDownloadURL
} from "firebase/storage";

export const statusService = {
    // Create status
    createStatus: async (userId, userDisplayName, text, imageFile = null) => {
        let imageUrl = null;
        if (imageFile) {
            const storageRef = ref(storage, `status/${userId}/${Date.now()}_${imageFile.name}`);
            const uploadResult = await uploadBytes(storageRef, imageFile);
            imageUrl = await getDownloadURL(uploadResult.ref);
        }

        const statusData = {
            userId,
            userDisplayName,
            text,
            imageUrl,
            createdAt: serverTimestamp(),
            expiresAt: Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000) // 24 hours expiry
        };

        await addDoc(collection(db, "statuses"), statusData);
    },

    // Subscribe to active statuses
    subscribeToStatuses: (callback, onError) => {
        if (!auth.currentUser) return () => { };
        const twentyFourHoursAgo = Timestamp.fromMillis(Date.now() - 24 * 60 * 60 * 1000);
        const q = query(
            collection(db, "statuses"),
            where("createdAt", ">", twentyFourHoursAgo),
            orderBy("createdAt", "desc")
        );

        return onSnapshot(q, (snapshot) => {
            const statuses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(statuses);
        }, (error) => {
            console.error("Status subscription error:", error);
            if (onError) onError(error);
        });
    }
};
