import React, { useState, useEffect } from "react";
import { db } from "../../config/firebase";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../context/AuthProvider";
import { X, Users, Search, Check, Shield, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Avatar from "../common/Avatar";

export default function GroupCreationView({ onClose, onCreated }) {
  const { user } = useAuth();
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snap = await getDocs(collection(db, "users"));
        const list = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(u => u.id !== user?.uid);
        setUsers(list);
      } catch (err) {
        console.error("Failed to load operatives:", err);
      } finally {
        setFetching(false);
      }
    };
    fetchUsers();
  }, [user]);

  const toggleSelectUser = (uId) => {
    if (selectedUsers.includes(uId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== uId));
    } else {
      setSelectedUsers([...selectedUsers, uId]);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim() || !user || loading) return;

    setLoading(true);
    try {
      const participants = [user.uid, ...selectedUsers];
      const newGroup = {
        groupName: groupName.trim(),
        description: description.trim(),
        type: "group",
        createdBy: user.uid,
        adminIds: [user.uid],
        participants,
        createdAt: serverTimestamp(),
        lastMessage: "Squad channel initialized.",
        lastMessageAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, "chats"), newGroup);
      if (onCreated) onCreated({ id: docRef.id, ...newGroup });
      onClose();
    } catch (err) {
      console.error("Failed to create squad channel:", err);
      alert("Failed to initialize squad channel. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter(u =>
    (u.displayName || u.username || u.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" 
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="w-full max-w-lg bg-slate-900/98 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5 backdrop-blur-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shadow-lg">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Create Squad Channel</h3>
              <p className="text-xs text-slate-400">Establish a secure tactical multi-user frequency</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleCreateGroup} className="space-y-4">
          <div>
            <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Squad Name / Call-Sign
            </label>
            <input
              type="text"
              required
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              placeholder="e.g. Alpha Cyber Squadron"
              className="w-full bg-slate-950/70 border border-white/10 rounded-2xl px-4 py-2.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Mission Directives / Topic
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Tactical coordination and mission debriefs"
              className="w-full bg-slate-950/70 border border-white/10 rounded-2xl px-4 py-2.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                Enlist Squad Members ({selectedUsers.length} Selected)
              </label>
            </div>

            <div className="relative mb-2.5">
              <Search size={15} className="absolute left-3.5 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search operatives..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {fetching ? (
                <div className="p-4 text-center text-xs text-slate-500">Scanning network for operatives...</div>
              ) : filtered.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">No operatives found matching search.</div>
              ) : (
                filtered.map(u => {
                  const isSelected = selectedUsers.includes(u.id);
                  return (
                    <div
                      key={u.id}
                      onClick={() => toggleSelectUser(u.id)}
                      className={`flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-all ${
                        isSelected 
                          ? "bg-blue-600/15 border border-blue-500/40 shadow-sm" 
                          : "bg-slate-950/40 hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar 
                          src={u.photoURL}
                          name={u.displayName || u.username}
                          size="small"
                        />
                        <div>
                          <div className="text-xs font-semibold text-white">{u.displayName || u.username || "Operative"}</div>
                          <div className="text-[10.5px] text-slate-400">{u.email}</div>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                        isSelected ? "bg-blue-600 border-blue-500 text-white" : "border-slate-700"
                      }`}>
                        {isSelected && <Check size={12} />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !groupName.trim()}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "INITIALIZING..." : "LAUNCH CHANNEL"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
