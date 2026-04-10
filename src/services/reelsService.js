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
    serverTimestamp,
    limit
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
            // Meta
            music: options.music || "Original Audio",
            filter: options.filter || "none",
            textOverlays: options.textOverlays || [],
            stickers: options.stickers || [],
            
            // Interaction & Admin
            isAd: options.isAd || false,
            isPromotional: options.isPromotional || options.isAd || false,
            likes: [],
            comments: [],
            shares: 0,
            
            createdAt: serverTimestamp()
        });
        
        return reelDoc.id;
    },

    /**
     * Fetch all reels - FIXED: No index required
     */
    async getAllReels() {
        try {
            // Simple query without orderBy (no index needed)
            const snapshot = await getDocs(collection(db, "reels"));
            const reels = snapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data() 
            }));
            
            // Sort in JavaScript instead of Firestore to avoid index requirement
            return reels.sort((a, b) => {
                // Handle Firestore timestamps or ISO strings
                const getTime = (item) => {
                    if (!item.createdAt) return 0;
                    // Firestore timestamp
                    if (item.createdAt.toMillis) return item.createdAt.toMillis();
                    // JavaScript Date or string
                    return new Date(item.createdAt).getTime();
                };
                
                return getTime(b) - getTime(a); // Descending order (newest first)
            });
        } catch (error) {
            console.error("getAllReels error:", error);
            throw error;
        }
    },

    /**
     * Fetch reels with pagination (for performance with large datasets)
     */
    async getReelsPaginated(lastDoc = null, pageSize = 10) {
        try {
            let q = query(
                collection(db, "reels"), 
                orderBy("createdAt", "desc"),
                limit(pageSize)
            );
            
            if (lastDoc) {
                q = query(q, startAfter(lastDoc));
            }
            
            const snapshot = await getDocs(q);
            const reels = snapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data() 
            }));
            
            return {
                reels,
                lastDoc: snapshot.docs[snapshot.docs.length - 1],
                hasMore: snapshot.docs.length === pageSize
            };
        } catch (error) {
            // If index error, fall back to simple query
            if (error.code === 'failed-precondition') {
                console.warn('Index not found, using fallback query');
                return this.getAllReels();
            }
            throw error;
        }
    },

    /**
     * Get single reel by ID
     */
    async getReelById(reelId) {
        const docRef = doc(db, "reels", reelId);
        const snapshot = await getDoc(docRef);
        if (!snapshot.exists()) return null;
        return { id: snapshot.id, ...snapshot.data() };
    },

    /**
     * Get reels by user
     */
    async getReelsByUser(userId) {
        const q = query(
            collection(db, "reels"), 
            where("userId", "==", userId)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
        })).sort((a, b) => {
            const getTime = (item) => {
                if (!item.createdAt) return 0;
                if (item.createdAt.toMillis) return item.createdAt.toMillis();
                return new Date(item.createdAt).getTime();
            };
            return getTime(b) - getTime(a);
        });
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
     * Delete a comment
     */
    async deleteComment(reelId, commentId, userId) {
        const reelRef = doc(db, "reels", reelId);
        const snapshot = await getDoc(reelRef);
        const data = snapshot.data();
        
        const comment = data.comments?.find(c => c.id === commentId);
        if (!comment) throw new Error("Comment not found");
        if (comment.userId !== userId) throw new Error("Not authorized");
        
        await updateDoc(reelRef, {
            comments: arrayRemove(comment)
        });
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
    },

    /**
     * Update reel description
     */
    async updateReel(reelId, updates, userId) {
        const reelRef = doc(db, "reels", reelId);
        const snapshot = await getDoc(reelRef);
        const data = snapshot.data();
        
        if (data.userId !== userId) throw new Error("Not authorized");
        
        await updateDoc(reelRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });
    },

    /**
     * Report a reel
     */
    async reportReel(reelId, reason, userId) {
        await addDoc(collection(db, "reports"), {
            reelId,
            reason,
            reportedBy: userId,
            createdAt: serverTimestamp(),
            status: "pending"
        });
    }
};
