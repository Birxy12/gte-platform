import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Smile, Paperclip, X, Image, CornerUpLeft, Sparkles, StopCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EMOJI_CATEGORIES = {
  Reactions: ['👍', '❤️', '🔥', '😂', '😮', '😢', '🙏', '👏', '🎉', '🚀', '💯', '✨'],
  Tactical: ['⚡', '🎯', '🛡️', '⚔️', '🛰️', '📡', '💡', '🔒', '🔑', '🚨', '⭐', '🏆'],
  Smileys: ['😀', '😎', '🥳', '🤔', '🤫', '🫡', '💪', '👀', '🤝', '🙌', '🌟', '💥']
};

const ChatInput = ({ 
  onSendMessage, 
  onTyping, 
  editingMessageId, 
  editingText, 
  onCancelEdit,
  replyingToMessage,
  onCancelReply,
  chatId 
}) => {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const prevEditIdRef = useRef(null);

  // Sync editing text
  useEffect(() => {
    if (editingMessageId && prevEditIdRef.current !== editingMessageId) {
      prevEditIdRef.current = editingMessageId;
      const timeoutId = setTimeout(() => {
        setMessage(editingText || '');
        inputRef.current?.focus();
      }, 0);
      return () => clearTimeout(timeoutId);
    } else if (!editingMessageId) {
      prevEditIdRef.current = null;
    }
  }, [editingMessageId, editingText]);

  // Voice recording timer simulation
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleTyping = () => {
    if (!chatId || !onTyping) return;
    onTyping('typing');
    
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onTyping('none');
    }, 2000);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!message.trim() && !selectedFile && !isRecording) return;

    try {
      if (isRecording) {
        setIsRecording(false);
        await onSendMessage(`🎙️ Voice transmission (${recordingSeconds}s)`, null, replyingToMessage);
      } else {
        await onSendMessage(message, selectedFile, replyingToMessage);
        setMessage('');
        setSelectedFile(null);
        if (onCancelReply) onCancelReply();
      }

      if (onTyping) onTyping('none');
      clearTimeout(typingTimeoutRef.current);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const toggleRecording = () => {
    if (isRecording) {
      handleSubmit();
    } else {
      setIsRecording(true);
      if (onTyping) onTyping('recording');
    }
  };

  return (
    <div className="chat-input-area relative px-4 md:px-6 py-4">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*,video/*,.pdf,.doc,.docx"
        onChange={handleFileSelect}
      />

      {/* ── File Attachment Preview Pill ── */}
      <AnimatePresence>
        {selectedFile && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute -top-16 left-6 right-6 bg-slate-900/95 border border-white/10 p-3 rounded-2xl shadow-2xl flex items-center gap-3 z-40 backdrop-blur-xl"
          >
            <div className="w-10 h-10 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center shrink-0">
              <Image size={20} />
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-xs font-bold text-white truncate">{selectedFile.name}</p>
               <p className="text-[10px] text-slate-400">Ready to transmit ({(selectedFile.size / 1024).toFixed(1)} KB)</p>
            </div>
            <button 
              onClick={() => setSelectedFile(null)}
              className="p-1.5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Reply Quote Banner ── */}
      <AnimatePresence>
        {replyingToMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute -top-14 left-6 right-6 bg-slate-900/90 border border-blue-500/30 px-4 py-2 rounded-2xl flex items-center justify-between z-20 backdrop-blur-xl shadow-lg"
          >
            <div className="flex items-center gap-2 overflow-hidden">
               <CornerUpLeft size={16} className="text-blue-400 shrink-0" />
               <div className="truncate text-xs">
                 <span className="font-bold text-blue-400">Replying to message: </span>
                 <span className="text-slate-300">{replyingToMessage.text}</span>
               </div>
            </div>
            <button 
              onClick={onCancelReply}
              className="text-slate-400 hover:text-white p-1"
            >
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Editing Message Banner ── */}
      <AnimatePresence>
        {editingMessageId && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute -top-12 left-6 right-6 bg-slate-900/90 border border-amber-500/30 px-4 py-2 rounded-2xl flex items-center justify-between z-20 backdrop-blur-xl shadow-lg"
          >
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
               <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Editing Transmission</span>
            </div>
            <button 
              onClick={onCancelEdit}
              className="text-slate-400 hover:text-rose-400 transition-colors p-1"
            >
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Capsule Input Bar ── */}
      <div className="enterprise-pill">
        <button 
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          onClick={() => fileInputRef.current?.click()}
          title="Transmit file / media"
        >
          <Paperclip size={19} />
        </button>

        <div className="flex-1 flex items-center relative">
          <button 
            className="text-slate-400 hover:text-white mr-2.5 transition-colors p-1 rounded-lg hover:bg-white/10"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="Emoji drawer"
          >
            <Smile size={19} />
          </button>

          {/* Emoji Drawer Dropdown */}
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute bottom-full left-0 mb-3 bg-slate-900/98 p-4 rounded-3xl shadow-2xl border border-white/10 z-50 backdrop-blur-2xl w-72"
              >
                <div className="space-y-3">
                  {Object.entries(EMOJI_CATEGORIES).map(([cat, emojis]) => (
                    <div key={cat}>
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5">
                        {cat}
                      </span>
                      <div className="grid grid-cols-6 gap-1.5">
                        {emojis.map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => {
                              setMessage(prev => prev + emoji);
                              inputRef.current?.focus();
                            }}
                            className="text-lg hover:scale-130 hover:bg-white/10 p-1.5 rounded-xl transition-all"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isRecording ? (
            <div className="flex-1 flex items-center gap-3 py-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-bold text-rose-400">
                Recording audio frequency... ({recordingSeconds}s)
              </span>
              <button 
                onClick={() => setIsRecording(false)} 
                className="ml-auto text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          ) : (
            <input
              ref={inputRef}
              type="text"
              placeholder={editingMessageId ? "Update your message..." : "Type a mission debrief or transmission..."}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
                if (e.key === 'Escape') {
                  if (editingMessageId && onCancelEdit) onCancelEdit();
                  if (replyingToMessage && onCancelReply) onCancelReply();
                }
              }}
              className="enterprise-input text-xs md:text-sm"
            />
          )}
        </div>

        {/* Send or Voice Record Action Button */}
        {message.trim() || selectedFile ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            className="p-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/40 transition-all cursor-pointer"
            title="Send message"
          >
            <Send size={16} />
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleRecording}
            className={`p-2.5 rounded-2xl transition-all cursor-pointer ${
              isRecording 
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/50 animate-pulse' 
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title={isRecording ? "Stop and transmit audio" : "Record voice transmission"}
          >
            {isRecording ? <StopCircle size={16} /> : <Mic size={18} />}
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default ChatInput;