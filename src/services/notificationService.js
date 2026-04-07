import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp, doc, updateDoc, writeBatch } from "firebase/firestore";
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
     * Subscribe to real notifications for the user.
     */
    subscribeToNotifications(userId, onUpdate) {
        if (!userId) return () => { };

        const q = query(
            collection(db, "notifications"),
            where("userId", "==", userId),
            orderBy("timestamp", "desc")
        );

        return onSnapshot(q, (snapshot) => {
            const notifications = [];
            let unreadCount = 0;
            let newUnreadIds = new Set();

            snapshot.forEach((doc) => {
                const data = doc.data();
                const notification = { id: doc.id, ...data };
                notifications.push(notification);
                
                if (!data.read) {
                    unreadCount++;
                    newUnreadIds.add(doc.id);
                }
            });

            onUpdate(notifications, unreadCount, newUnreadIds);
        }, (error) => {
            console.error("Firebase Snapshot Error (Notifications):", error);
        });
    },

    /**
     * Create a notification in Firestore
     */
    async createNotification({ userId, type, message, fromUserId, link }) {
        if (!userId) return;
        try {
            await addDoc(collection(db, "notifications"), {
                userId,
                type,
                message,
                fromUserId: fromUserId || null,
                link: link || null,
                read: false,
                timestamp: serverTimestamp()
            });
        } catch (error) {
            console.error("Failed to create notification:", error);
        }
    },

    /**
     * Mark a single notification as read
     */
    async markAsRead(notificationId) {
        if (!notificationId) return;
        try {
            await updateDoc(doc(db, "notifications", notificationId), {
                read: true
            });
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    },

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId, notificationsList) {
        if (!userId || !notificationsList?.length) return;
        try {
            const batch = writeBatch(db);
            notificationsList.forEach(n => {
                if (!n.read) {
                    batch.update(doc(db, "notifications", n.id), { read: true });
                }
            });
            await batch.commit();
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    },

    /**
     * Delete all notifications for a user
     */
    async clearAll(userId, notificationsList) {
        if (!userId || !notificationsList?.length) return;
        try {
            const batch = writeBatch(db);
            notificationsList.forEach(n => {
                batch.delete(doc(db, "notifications", n.id));
            });
            await batch.commit();
        } catch (error) {
            console.error("Failed to clear notifications:", error);
        }
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
