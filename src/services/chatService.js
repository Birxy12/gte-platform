import { db, auth } from "../config/firebase";
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
    deleteDoc
} from "firebase/firestore";
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

    // Send message
    sendMessage: async (chatId, senderId, text, type = "text") => {
        const messageData = {
            chatId,
            senderId,
            text,
            type,
            timestamp: serverTimestamp()
        };

        await addDoc(collection(db, "chats", chatId, "messages"), messageData);

        // Update last message in chat document
        await updateDoc(doc(db, "chats", chatId), {
            lastMessage: text,
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
    }
};
