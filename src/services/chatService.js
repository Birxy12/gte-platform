import { db, storage, auth } from "../config/firebase";
import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    doc,
    updateDoc,
    getDocs,
    setDoc,
    getDoc,
    deleteDoc,
    writeBatch,
    arrayRemove
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { notificationService } from "./notificationService";

export const chatService = {
    // Create or get existing 1:1 chat
    getOrCreateDirectChat: async (user1Id, user2Id) => {
        const chatId = [user1Id, user2Id].sort().join("_");
        const chatRef = doc(db, "chats", chatId);
        const chatSnap = await getDoc(chatRef);

        if (!chatSnap.exists()) {
            await setDoc(chatRef, {
                participants: [user1Id, user2Id],
                type: "direct",
                createdAt: serverTimestamp(),
                lastMessage: "",
                lastMessageAt: serverTimestamp()
            });
        }
        return chatId;
    },

    // Create group chat
    createGroupChat: async (creatorId, participantIds, groupName) => {
        const chatData = {
            participants: [creatorId, ...participantIds],
            type: "group",
            groupName: groupName,
            createdBy: creatorId,
            createdAt: serverTimestamp(),
            lastMessage: "",
            lastMessageAt: serverTimestamp()
        };
        const docRef = await addDoc(collection(db, "chats"), chatData);
        return docRef.id;
    },

    // Send message (now supports images/files)
    sendMessage: async (chatId, senderId, text, type = "text", file = null) => {
        let fileUrl = null;
        if (file) {
            const storageRef = ref(storage, `chat_attachments/${chatId}/${Date.now()}_${file.name}`);
            const uploadResult = await uploadBytes(storageRef, file);
            fileUrl = await getDownloadURL(uploadResult.ref);
            type = "image"; // Default to image if file is provided
        }

        const messageData = {
            chatId,
            senderId,
            text: fileUrl || text,
            type,
            timestamp: serverTimestamp(),
            isRead: false
        };

        if (fileUrl) messageData.fileUrl = fileUrl;

        const msgRef = await addDoc(collection(db, "chats", chatId, "messages"), messageData);

        // Update last message in chat document
        await updateDoc(doc(db, "chats", chatId), {
            lastMessage: type === "image" ? "📷 Image" : text,
            lastMessageAt: serverTimestamp()
        });

        // Notify other participants
        const chatSnap = await getDoc(doc(db, "chats", chatId));
        if (chatSnap.exists()) {
            const chatData = chatSnap.data();
            const groupName = chatData.groupName;
            
            chatData.participants.forEach(pId => {
                if (pId !== senderId) {
                    notificationService.createNotification({
                        userId: pId,
                        type: "message",
                        message: groupName ? `New message in ${groupName}` : "You received a new message.",
                        fromUserId: senderId,
                        link: "/chat"
                    });
                }
            });
        }
        return msgRef.id;
    },

    // Mark message as read
    markAsRead: async (chatId, messageId) => {
        if (!chatId || !messageId) return;
        try {
            const msgRef = doc(db, "chats", chatId, "messages", messageId);
            await updateDoc(msgRef, { isRead: true });
        } catch (error) {
            console.error("Mark read error:", error);
        }
    },

    // Mark all messages as read in a chat
    markAllAsRead: async (chatId, currentUserId) => {
        try {
            const q = query(
                collection(db, "chats", chatId, "messages"),
                where("senderId", "!=", currentUserId),
                where("isRead", "==", false)
            );
            const snap = await getDocs(q);
            const batch = writeBatch(db);
            snap.docs.forEach(doc => batch.update(doc.ref, { isRead: true }));
            await batch.commit();
        } catch (error) {
            console.error("Mark all read error:", error);
        }
    },

    // Listen for messages in a chat
    subscribeToMessages: (chatId, callback) => {
        if (!auth.currentUser) return () => { };
        const q = query(
            collection(db, "chats", chatId, "messages"),
            orderBy("timestamp", "asc")
        );
        return onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(messages);
        }, (error) => {
            console.error("Messages subscription error:", error);
        });
    },

    // Listen for user's chats
    subscribeToUserChats: (userId, callback, onError) => {
        if (!auth.currentUser) return () => { };
        const q = query(
            collection(db, "chats"),
            where("participants", "array-contains", userId)
        );
        return onSnapshot(q, (snapshot) => {
            const chats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Client-side sort to avoid Firebase Composite Index requirement
            chats.sort((a, b) => {
                const timeA = a.lastMessageAt?.toMillis() || 0;
                const timeB = b.lastMessageAt?.toMillis() || 0;
                return timeB - timeA;
            });

            callback(chats);
        }, (error) => {
            console.error("Chats subscription error:", error);
            if (onError) onError(error);
        });
    },

    // Set typing/recording status
    setStatus: async (chatId, userId, status = "none") => {
        if (!chatId || !userId) return;
        const statusRef = doc(db, "chats", chatId, "status", userId);
        if (status !== "none") {
            await setDoc(statusRef, { status, updatedAt: serverTimestamp() });
        } else {
            await deleteDoc(statusRef).catch(() => {});
        }
    },

    // Subscribe to statuses (typing/recording)
    subscribeToStatuses: (chatId, callback) => {
        if (!chatId) return () => {};
        const q = query(collection(db, "chats", chatId, "status"));
        return onSnapshot(q, (snapshot) => {
            const statuses = {};
            snapshot.docs.forEach(doc => {
                statuses[doc.id] = doc.data().status;
            });
            callback(statuses);
        });
    },

    // Delete message (Admins or sender)
    deleteMessage: async (chatId, messageId) => {
        try {
            const messageRef = doc(db, "chats", chatId, "messages", messageId);
            await deleteDoc(messageRef);
        } catch (error) {
            console.error("Delete message error:", error);
            throw error;
        }
    },

    // Edit message
    editMessage: async (chatId, messageId, newText) => {
        try {
            const messageRef = doc(db, "chats", chatId, "messages", messageId);
            await updateDoc(messageRef, {
                text: newText,
                isEdited: true,
                editedAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Edit message error:", error);
            throw error;
        }
    },

    // Clear all messages in a chat (for both users)
    clearChatMessages: async (chatId) => {
        try {
            const q = query(collection(db, "chats", chatId, "messages"));
            const snap = await getDocs(q);
            const batch = writeBatch(db);
            snap.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            
            // Reset last message
            await updateDoc(doc(db, "chats", chatId), {
                lastMessage: "Messages cleared",
                lastMessageAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Clear chat error:", error);
            throw error;
        }
    },

    // Leave group
    leaveGroup: async (chatId, userId) => {
        try {
            const chatRef = doc(db, "chats", chatId);
            await updateDoc(chatRef, {
                participants: arrayRemove(userId)
            });
            // Send system message
            await chatService.sendMessage(chatId, "system", "A user has left the group.", "system");
        } catch (error) {
            console.error("Leave group error:", error);
            throw error;
        }
    },

    // Block a user
    blockUser: async (currentUserId, targetUserId) => {
        const userRef = doc(db, "users", currentUserId);
        try {
            const userSnap = await getDoc(userRef);
            const blockedUsers = userSnap.data()?.blockedUsers || [];
            if (!blockedUsers.includes(targetUserId)) {
                await updateDoc(userRef, {
                    blockedUsers: [...blockedUsers, targetUserId]
                });
            }
        } catch (error) {
            console.error("Block user error:", error);
            throw error;
        }
    },

    // Suspend a user (Admin only)
    suspendUser: async (targetUserId, days) => {
        const userRef = doc(db, "users", targetUserId);
        const suspendedUntil = new Date();
        suspendedUntil.setDate(suspendedUntil.getDate() + days);
        
        try {
            await updateDoc(userRef, {
                suspendedUntil: suspendedUntil.toISOString()
            });
        } catch (error) {
            console.error("Suspend user error:", error);
            throw error;
        }
    }
};

