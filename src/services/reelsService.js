import { db, storage, auth } from "../config/firebase";
import { 
    collection, 
    addDoc, 
    updateDoc, 
    doc, 
    deleteDoc, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    arrayUnion, 
    arrayRemove, 
    serverTimestamp 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export const reelsService = {
    /**
     * Upload a new reel
     */
    async uploadReel(file, description, user) {
        if (!file || !user) throw new Error("Missing file or user");
        
        // 1. Upload to Storage
        const fileExtension = file.name.split('.').pop();
        const fileName = `reels/${user.uid}_${Date.now()}.${fileExtension}`;
        const storageRef = ref(storage, fileName);
        
        const metadata = { contentType: file.type };
        const uploadTask = await uploadBytes(storageRef, file, metadata);
        const videoUrl = await getDownloadURL(uploadTask.ref);
        
        // 2. Save to Firestore
        const reelDoc = await addDoc(collection(db, "reels"), {
            userId: user.uid,
            authorName: user.displayName || user.email.split('@')[0],
            authorPhoto: user.photoURL || "",
            videoUrl,
            description,
            storagePath: fileName,
            likes: [],
            comments: [],
            shares: 0,
            createdAt: serverTimestamp()
        });
        
        return reelDoc.id;
    },

    /**
     * Fetch all reels
     */
    async getAllReels() {
        const q = query(collection(db, "reels"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    /**
     * Toggle like on a reel
     */
    async toggleLike(reelId, userId) {
        const reelRef = doc(db, "reels", reelId);
        const snapshot = await getDocs(query(collection(db, "reels"), where("__name__", "==", reelId)));
        const data = snapshot.docs[0].data();
        
        if (data.likes?.includes(userId)) {
            await updateDoc(reelRef, { likes: arrayRemove(userId) });
        } else {
            await updateDoc(reelRef, { likes: arrayUnion(userId) });
        }
    },

    /**
     * Add a comment
     */
    async addComment(reelId, user, text) {
        const reelRef = doc(db, "reels", reelId);
        const comment = {
            id: `${user.uid}_${Date.now()}`,
            userId: user.uid,
            userName: user.displayName || user.email.split('@')[0],
            userPhoto: user.photoURL || "",
            text,
            createdAt: new Date().toISOString()
        };
        
        await updateDoc(reelRef, {
            comments: arrayUnion(comment)
        });
        return comment;
    },

    /**
     * Delete a reel
     */
    async deleteReel(reelId, storagePath) {
        // 1. Delete from Firestore
        await deleteDoc(doc(db, "reels", reelId));
        
        // 2. Delete from Storage
        if (storagePath) {
            const storageRef = ref(storage, storagePath);
            await deleteObject(storageRef);
        }
    },

    /**
     * Increment share count
     */
    async incrementShare(reelId) {
        const reelRef = doc(db, "reels", reelId);
        const snapshot = await getDocs(query(collection(db, "reels"), where("__name__", "==", reelId)));
        const currentShares = snapshot.docs[0].data().shares || 0;
        await updateDoc(reelRef, { shares: currentShares + 1 });
    }
};
