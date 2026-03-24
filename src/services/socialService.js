import { db } from "../config/firebase";
import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    getDoc,
    getDocs,
    query,
    where,
    serverTimestamp
} from "firebase/firestore";

export const socialService = {
    /**
     * Send a friend request from sender to receiver
     */
    async sendFriendRequest(senderId, receiverId) {
        const requestId = `${senderId}_${receiverId}`;
        const requestRef = doc(db, "friendRequests", requestId);
        await setDoc(requestRef, {
            senderId,
            receiverId,
            status: "pending",
            createdAt: serverTimestamp()
        });
    },

    /**
     * Accept a friend request
     */
    async acceptFriendRequest(senderId, receiverId) {
        const requestId = `${senderId}_${receiverId}`;

        // Add to friends collection for both
        await setDoc(doc(db, "friends", `${receiverId}_${senderId}`), {
            userId: receiverId,
            friendId: senderId,
            createdAt: serverTimestamp()
        });
        await setDoc(doc(db, "friends", `${senderId}_${receiverId}`), {
            userId: senderId,
            friendId: receiverId,
            createdAt: serverTimestamp()
        });

        // Delete the request
        const requestRef = doc(db, "friendRequests", requestId);
        await deleteDoc(requestRef);
    },

    /**
     * Follow a user
     */
    async followUser(followerId, targetUserId) {
        const followId = `${followerId}_${targetUserId}`;
        await setDoc(doc(db, "followers", followId), {
            followerId,
            targetUserId,
            createdAt: serverTimestamp()
        });
    },

    /**
     * Unfollow a user
     */
    async unfollowUser(followerId, targetUserId) {
        const followId = `${followerId}_${targetUserId}`;
        await deleteDoc(doc(db, "followers", followId));
    },

    /**
     * Get incoming friend requests
     */
    async getIncomingRequests(userId) {
        const q = query(collection(db, "friendRequests"), where("receiverId", "==", userId), where("status", "==", "pending"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    /**
     * Get list of following
     */
    async getFollowing(userId) {
        const q = query(collection(db, "followers"), where("followerId", "==", userId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data().targetUserId);
    },

    /**
     * Get list of friends
     */
    async getFriends(userId) {
        const q = query(collection(db, "friends"), where("userId", "==", userId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data().friendId);
    }
};
