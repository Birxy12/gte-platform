import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";

export const notificationService = {
    /**
     * Request permission for Desktop Notifications
     */
    async requestPermission() {
        if ("Notification" in window) {
            if (Notification.permission !== "granted" && Notification.permission !== "denied") {
                await Notification.requestPermission();
            }
        }
    },

    /**
     * Subscribe to new messages for the user.
     * Compares the chat's lastMessage sender to see if it's someone else.
     */
    subscribeToUnread(userId, onUpdate) {
        if (!userId) return () => { };

        const q = query(
            collection(db, "chats"),
            where("participants", "array-contains", userId)
        );

        return onSnapshot(q, (snapshot) => {
            let unreadCount = 0;
            let latestMessageMap = new Map();

            snapshot.forEach((doc) => {
                const data = doc.data();
                // If the last message was NOT sent by me, and it exists
                if (data.lastMessageSenderId && data.lastMessageSenderId !== userId) {
                    unreadCount++;

                    // Check if we need to trigger a desktop notification
                    if (data.lastMessageAt) {
                        const timeKey = data.lastMessageAt.toMillis();
                        latestMessageMap.set(doc.id, {
                            text: data.lastMessage,
                            sender: data.groupName || "New Message",
                            time: timeKey
                        });
                    }
                }
            });

            onUpdate(unreadCount, latestMessageMap);
        });
    },

    /**
     * Show a native desktop notification
     */
    showNotification(title, options) {
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification(title, {
                icon: "/GlobixTech-logo.png",
                ...options
            });
        }
    }
};
