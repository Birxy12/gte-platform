import React, { useState, useEffect } from "react";
import { db } from "../../config/firebase";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../context/AuthProvider";
import { X, Users, Search, Check, Shield } from "lucide-react";

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
      const members = [user.uid, ...selectedUsers];
      const newGroup = {
        name: groupName.trim(),
        description: description.trim(),
        isGroup: true,
        createdBy: user.uid,
        adminIds: [user.uid],
        members,
        createdAt: serverTimestamp(),
        lastMessage: "Channel established.",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Users size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Create Squad Channel</h3>
              <p className="text-xs text-slate-400">Establish a secure tactical multi-user channel</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleCreateGroup} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Channel Call-Sign / Name
            </label>
            <input
              type="text"
              required
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              placeholder="e.g. Alpha Cyber Squadron"
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Mission Directives / Topic
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Tactical coordination and mission debriefs"
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Enlist Squad Members ({selectedUsers.length} Selected)
              </label>
            </div>

            <div className="relative mb-3">
              <Search size={16} className="absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search operatives..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
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
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                        isSelected ? "bg-blue-600/20 border border-blue-500/40" : "bg-slate-950/40 hover:bg-slate-800/60 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-white">
                          {(u.displayName || u.email || "O")[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{u.displayName || u.username || "Operative"}</div>
                          <div className="text-[10px] text-slate-400">{u.email}</div>
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

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !groupName.trim()}
              className="px-5 py-2.5 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-900/30 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "INITIALIZING..." : "LAUNCH CHANNEL"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
