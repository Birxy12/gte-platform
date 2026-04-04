import { useState, useEffect } from 'react';
import { chatService } from '../services/chatService';
import { useAuth } from '../context/AuthProvider';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * useChat Hook
 * Custom hook to manage real-time chat state and actions.
 */
export const useChat = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [activeContact, setActiveContact] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Subscribe to all conversations for the current user
    useEffect(() => {
        if (!user) return;

        setIsLoading(true);
        const unsubscribe = chatService.subscribeToUserChats(user.uid, async (chats) => {
            // Enhance chat data with participant info
            const enhancedChats = await Promise.all(chats.map(async (chat) => {
                const otherParticipantId = chat.participants.find(p => p !== user.uid);
                let contactName = "Unknown";
                let photoURL = "";

                if (otherParticipantId) {
                    try {
                        const userDoc = await getDoc(doc(db, "users", otherParticipantId));
                        if (userDoc.exists()) {
                            contactName = userDoc.data().displayName || userDoc.data().email.split('@')[0];
                            photoURL = userDoc.data().photoURL;
                        }
                    } catch (e) { console.error("Error fetching participant:", e); }
                }

                return {
                    ...chat,
                    name: chat.type === 'group' ? chat.groupName : contactName,
                    photoURL: chat.type === 'group' ? chat.groupAvatar : photoURL,
                    lastMessageDate: chat.lastMessageAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || ''
                };
            }));

            setConversations(enhancedChats);
            setIsLoading(false);
        }, (err) => {
            setError(err);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // Subscribe to messages when a chat is selected
    useEffect(() => {
        if (!activeChatId) {
            setMessages([]);
            setActiveContact(null);
            return;
        }

        // Set active contact info
        const activeChat = conversations.find(c => c.id === activeChatId);
        if (activeChat) {
            setActiveContact({
                displayName: activeChat.name,
                photoURL: activeChat.photoURL,
                uid: activeChat.participants?.find(p => p !== user.uid),
                status: 'online' // Simplified for now
            });
        }

        const unsubscribe = chatService.subscribeToMessages(activeChatId, (msgs) => {
            setMessages(msgs.map(m => ({
                ...m,
                timestamp: m.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || ''
            })));
        });

        // Mark all as read when entering chat
        chatService.markAllAsRead(activeChatId, user.uid);

        return () => unsubscribe();
    }, [activeChatId, user, conversations]);

    const sendMessage = async (text) => {
        if (!activeChatId || !user) return;
        try {
            await chatService.sendMessage(activeChatId, user.uid, text);
        } catch (e) {
            console.error("Error sending message:", e);
            throw e;
        }
    };

    const sendAttachment = async (file) => {
        if (!activeChatId || !user) return;
        try {
            await chatService.sendMessage(activeChatId, user.uid, "", "image", file);
        } catch (e) {
            console.error("Error sending attachment:", e);
            throw e;
        }
    };

    const selectChat = (chatId) => {
        setActiveChatId(chatId);
    };

    return {
        conversations,
        messages,
        activeChatId,
        activeContact,
        isLoading,
        error,
        sendMessage,
        sendAttachment,
        selectChat
    };
};
