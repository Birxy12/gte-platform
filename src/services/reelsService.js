import { db, auth } from "../config/firebase";
import { 
    collection, 
    addDoc, 
    updateDoc, 
    doc, 
    getDoc,
    deleteDoc, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    arrayUnion, 
    arrayRemove, 
    serverTimestamp 
} from "firebase/firestore";
import { supabase } from "../config/supabase";

export const reelsService = {
    /**
     * Upload a new reel
     */
    async uploadReel(file, description, user, options = {}) {
        if (!file && !options.isRepost) throw new Error("Missing file for original reel");
        if (!user) throw new Error("Missing user");
        
        let videoUrl = options.isRepost ? options.originalVideoUrl : null;
        let storagePath = null;

        // 1. Upload to Supabase Storage if a file is provided
        if (file) {
            const fileExtension = file.name.split('.').pop();
            storagePath = `${user.uid}_${Date.now()}.${fileExtension}`;
            
            const { data, error } = await supabase.storage
                .from('reels')
                .upload(storagePath, file, {
                    contentType: file.type,
                    upsert: false
                });

            if (error) throw new Error(`Supabase upload failed: ${error.message}`);
            
            const { data: { publicUrl } } = supabase.storage
                .from('reels')
                .getPublicUrl(storagePath);
                
            videoUrl = publicUrl;
        }
        
        // 2. Save to Firestore
        const reelDoc = await addDoc(collection(db, "reels"), {
            userId: user.uid,
            authorName: user.displayName || user.email.split('@')[0],
            authorPhoto: user.photoURL || "",
            videoUrl,
            description,
            storagePath,
            likes: [],
            comments: [],
            shares: 0,
            
            // New Advanced Meta
            music: options.music || "Original Audio",
            filter: options.filter || "none",
            textOverlays: options.textOverlays || [],
            stickers: options.stickers || [],
            // Repost / Duet Meta
            isRepost: options.isRepost || false,
            originalReelId: options.originalReelId || null,
            isDuet: options.isDuet || false,
            duetVideoUrl: options.duetVideoUrl || null,
            
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
        const snapshot = await getDoc(reelRef);
        const data = snapshot.data();
        
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
        
        // 2. Delete from Supabase Storage
        if (storagePath) {
            const { error } = await supabase.storage
                .from('reels')
                .remove([storagePath]);
            
            if (error) {
                console.error("Error deleting from Supabase storage:", error);
            }
        }
    },

    /**
     * Increment share count
     */
    async incrementShare(reelId) {
        const reelRef = doc(db, "reels", reelId);
        const snapshot = await getDoc(reelRef);
        const currentShares = snapshot.data()?.shares || 0;
        await updateDoc(reelRef, { shares: currentShares + 1 });
    }
};
