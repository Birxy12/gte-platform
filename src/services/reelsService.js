import { db, storage } from "../config/firebase";
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
    limit,
    startAfter
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { supabase } from "../config/supabase";

const DEMO_FALLBACK_VIDEOS = [
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4"
];

export const reelsService = {
    /**
     * Upload a new reel to Firebase Storage (with Supabase fallback)
     */
    async uploadReel(file, description, user, options = {}) {
        if (!file && !options.isRepost) throw new Error("Missing file for original reel");
        if (!user) throw new Error("Missing user");
        
        let videoUrl = options.isRepost ? options.originalVideoUrl : null;
        let storagePath = null;

        // 1. Primary: Upload to Firebase Storage
        if (file) {
            const fileExtension = file.name.split('.').pop();
            storagePath = `reels/${user.uid}_${Date.now()}.${fileExtension}`;
            
            try {
                const storageRef = ref(storage, storagePath);
                const uploadResult = await uploadBytes(storageRef, file, {
                    contentType: file.type || 'video/mp4'
                });
                videoUrl = await getDownloadURL(uploadResult.ref);
            } catch (fbErr) {
                console.warn("Firebase storage reel upload encountered issue, checking fallback:", fbErr);
                try {
                    const fallbackPath = `${user.uid}_${Date.now()}.${fileExtension}`;
                    const { error } = await supabase.storage
                        .from('reels')
                        .upload(fallbackPath, file, {
                            contentType: file.type,
                            upsert: false
                        });

                    if (error) throw error;
                    
                    const { data: { publicUrl } } = supabase.storage
                        .from('reels')
                        .getPublicUrl(fallbackPath);
                        
                    videoUrl = publicUrl;
                    storagePath = fallbackPath;
                } catch (supabaseErr) {
                    throw new Error(`Upload failed: ${fbErr.message || supabaseErr.message}`);
                }
            }
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
            coinCost: options.coinCost || 0,
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
     * Fetch all reels with dead Supabase URL sanitation
     */
    async getAllReels() {
        try {
            const snapshot = await getDocs(collection(db, "reels"));
            const rawReels = snapshot.docs.map(d => ({ 
                id: d.id, 
                ...d.data() 
            }));
            
            // Sort descending (newest first)
            const sorted = rawReels.sort((a, b) => {
                const getTime = (item) => {
                    if (!item.createdAt) return 0;
                    if (item.createdAt.toMillis) return item.createdAt.toMillis();
                    return new Date(item.createdAt).getTime();
                };
                return getTime(b) - getTime(a);
            });

            // Sanitize dead domain URLs
            return sorted.map((reel, idx) => {
                const isDeadUrl = !reel.videoUrl || reel.videoUrl.includes("njhbnqyamkwlsobqplvm.supabase.co");
                if (isDeadUrl) {
                    return {
                        ...reel,
                        videoUrl: DEMO_FALLBACK_VIDEOS[idx % DEMO_FALLBACK_VIDEOS.length],
                        isLegacyFallback: true
                    };
                }
                return reel;
            });
        } catch (error) {
            console.error("getAllReels error:", error);
            throw error;
        }
    },

    /**
     * Fetch single reel
     */
    async getReelById(reelId) {
        const docRef = doc(db, "reels", reelId);
        const snapshot = await getDoc(docRef);
        if (!snapshot.exists()) return null;
        const data = snapshot.data();
        if (data.videoUrl && data.videoUrl.includes("njhbnqyamkwlsobqplvm.supabase.co")) {
            data.videoUrl = DEMO_FALLBACK_VIDEOS[0];
            data.isLegacyFallback = true;
        }
        return { id: snapshot.id, ...data };
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
        return snapshot.docs.map((doc, idx) => {
            const data = doc.data();
            if (data.videoUrl && data.videoUrl.includes("njhbnqyamkwlsobqplvm.supabase.co")) {
                data.videoUrl = DEMO_FALLBACK_VIDEOS[idx % DEMO_FALLBACK_VIDEOS.length];
                data.isLegacyFallback = true;
            }
            return { id: doc.id, ...data };
        }).sort((a, b) => {
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
     * Delete a reel from Firestore and Storage
     */
    async deleteReel(reelId, storagePath) {
        // 1. Delete from Firestore
        await deleteDoc(doc(db, "reels", reelId));
        
        // 2. Delete from Firebase Storage if path starts with reels/
        if (storagePath) {
            if (storagePath.startsWith('reels/')) {
                try {
                    const storageRef = ref(storage, storagePath);
                    await deleteObject(storageRef);
                } catch (e) {
                    console.warn("Error deleting from Firebase storage:", e);
                }
            } else {
                try {
                    await supabase.storage.from('reels').remove([storagePath]);
                } catch (e) {
                    console.warn("Error deleting from Supabase storage:", e);
                }
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
