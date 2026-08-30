import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { auth } from "../../config/firebase";
import { signOut } from "firebase/auth";
import { presenceService } from "../../services/presenceService";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Compass,
  Film,
  Trophy,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Award,
  Zap,
  GraduationCap,
  Sparkles
} from "lucide-react";

export default function Sidebar({
  collapsed,
  setCollapsed,
  userType = "user", // "user" | "admin" | "instructor" | "student"
  customLinks = null
}) {
  const { user, role, siteSettings } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      if (user) await presenceService.setOffline(user.uid);
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const defaultUserLinks = [
    { label: "Dashboard", icon: <LayoutDashboard size={19} />, path: "/dashboard" },
    { label: "Enrolled Missions", icon: <BookOpen size={19} />, path: "/dashboard/enrolled" },
    { label: "My Debriefs", icon: <MessageSquare size={19} />, path: "/dashboard/my-posts" },
    { label: "Operative Dossier", icon: <Settings size={19} />, path: "/dashboard/profile" },
    { label: "Explore Catalog", icon: <Compass size={19} />, path: "/courses" },
    { label: "Tactical Reels", icon: <Film size={19} />, path: "/reels" },
    { label: "Leaderboard", icon: <Trophy size={19} />, path: "/leaderboard" },
    { label: "Live Comms Hub", icon: <MessageSquare size={19} />, path: "/chat" }
  ];

  const adminLinks = [
    { label: "Command Center", icon: <LayoutDashboard size={19} />, path: "/admin" },
    { label: "Manage Operatives", icon: <Users size={19} />, path: "/admin/users" },
    { label: "Manage Instructors", icon: <GraduationCap size={19} />, path: "/admin/instructors" },
    { label: "Manage Missions (Prices)", icon: <BookOpen size={19} />, path: "/admin/manage-courses" },
    { label: "Manage Transmissions", icon: <MessageSquare size={19} />, path: "/admin/manage-posts" },
    { label: "Economy & Vault", icon: <Zap size={19} />, path: "/admin/economy" },
    { label: "Manage Quizzes", icon: <Award size={19} />, path: "/admin/manage-quizzes" },
    { label: "Site Content Editor", icon: <Settings size={19} />, path: "/admin/site-editor" },
    { label: "System Matrix", icon: <Settings size={19} />, path: "/admin/settings" }
  ];

  const instructorLinks = [
    { label: "Instructor Hub", icon: <LayoutDashboard size={19} />, path: "/instructor" },
    { label: "My Missions", icon: <BookOpen size={19} />, path: "/instructor" },
    { label: "Course Catalog", icon: <Compass size={19} />, path: "/courses" },
    { label: "Comms Channel", icon: <MessageSquare size={19} />, path: "/chat" }
  ];

  const links = customLinks || (userType === "admin" ? adminLinks : userType === "instructor" ? instructorLinks : defaultUserLinks);

  const isActive = (path) => {
    if (path === "/dashboard" || path === "/admin" || path === "/instructor") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 bg-slate-950/85 backdrop-blur-2xl border-r border-white/10 transition-all duration-300 flex flex-col justify-between shadow-2xl ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Top Brand */}
      <div>
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-slate-950/40">
          <Link to="/home" className="flex items-center gap-3 overflow-hidden">
            <img
              src="/GlobixTech-logo.png"
              alt="GlobixTech"
              className="w-9 h-9 object-contain rounded-xl flex-shrink-0 border border-white/15 shadow-md shadow-blue-600/20"
              onError={(e) => { e.target.style.display = "none"; }}
            />
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-black text-white tracking-tight truncate">
                  {siteSettings?.siteName || "GTE PLATFORM"}
                </span>
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  {role ? role.toUpperCase() : "OPERATIVE"}
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-210px)] custom-scrollbar">
          {links.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
                title={collapsed ? link.label : undefined}
              >
                <span className={`flex-shrink-0 ${active ? "text-white" : "text-slate-400"}`}>
                  {link.icon}
                </span>
                {!collapsed && <span className="truncate">{link.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer & Logout */}
      <div className="p-3 border-t border-white/5 bg-slate-950/40 space-y-2">
        {user && !collapsed && (
          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-900/60 border border-white/5 backdrop-blur-md">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 border border-blue-400/40 flex items-center justify-center font-bold text-xs text-white shadow-md flex-shrink-0">
              {user.displayName ? user.displayName[0].toUpperCase() : "O"}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-white truncate">
                {user.displayName || "Operative"}
              </span>
              <span className="text-[10px] text-slate-400 truncate">{user.email}</span>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-2xl font-bold text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
          title="Log Out"
        >
          <LogOut size={17} />
          {!collapsed && <span>TERMINATE SESSION</span>}
        </button>
      </div>
    </aside>
  );
}
