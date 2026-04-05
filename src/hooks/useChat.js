import { useState, useEffect, useCallback } from 'react';
import { chatService } from '../services/chatService';

export const useChat = (chatId, userId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!chatId) return;

    setLoading(true);
    const unsubscribe = chatService.subscribeToMessages(chatId, (msgs) => {
      setMessages(msgs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = useCallback(async (text, file = null) => {
    if (!chatId || !userId) return;
    try {
      await chatService.sendMessage(chatId, userId, text, file ? 'image' : 'text', file);
    } catch (err) {
      setError(err.message);
    }
  }, [chatId, userId]);

  const editMessage = useCallback(async (messageId, newText) => {
    if (!chatId) return;
    try {
      await chatService.editMessage(chatId, messageId, newText);
    } catch (err) {
      setError(err.message);
    }
  }, [chatId]);

  const deleteMessage = useCallback(async (messageId) => {
    if (!chatId) return;
    try {
      await chatService.deleteMessage(chatId, messageId);
    } catch (err) {
      setError(err.message);
    }
  }, [chatId]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    editMessage,
    deleteMessage
  };
};

export default useChat;