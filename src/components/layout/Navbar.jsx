import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { auth } from "../../config/firebase";
import { signOut } from "firebase/auth";
import "./Navbar.css";

export default function Navbar() {
    const { user, isAdmin } = useAuth();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    // Hide navbar on auth pages, Chat, and Dashboards
    const hiddenPaths = ["/login", "/register", "/forgot-password", "/chat"];
    if (hiddenPaths.includes(location.pathname) || location.pathname.startsWith("/dashboard") || location.pathname.startsWith("/admin")) return null;

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    const isActive = (path) => location.pathname === path ? "nav-link active" : "nav-link";

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/home" className="navbar-logo">
                    <img src="/GlobixTech-logo.png" alt="Globix Tech" />
                    <h5>GTE Portal</h5>
                </Link>

                <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                    {menuOpen ? "✕" : "☰"}
                </button>

                <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
                    <Link to="/home" className={isActive("/home")} onClick={() => setMenuOpen(false)}>Home</Link>
                    <Link to="/courses" className={isActive("/courses")} onClick={() => setMenuOpen(false)}>Courses</Link>
                    <Link to="/blog" className={isActive("/blog")} onClick={() => setMenuOpen(false)}>Blog</Link>
                    <Link to="/about" className={isActive("/about")} onClick={() => setMenuOpen(false)}>About</Link>
                    <Link to="/contact" className={isActive("/contact")} onClick={() => setMenuOpen(false)}>Contact</Link>
                    {user && (
                        <Link to="/dashboard" className={isActive("/dashboard")} onClick={() => setMenuOpen(false)}>Dashboard</Link>
                    )}
                    {isAdmin && (
                        <Link to="/admin" className={isActive("/admin")} onClick={() => setMenuOpen(false)}>Admin</Link>
                    )}
                </div>

                <div className="navbar-actions">
                    {user ? (
                        <div className="user-menu">
                            <span className="user-email">{user.email.split("@")[0]}</span>
                            <button onClick={handleLogout} className="btn-nav-outline">Sign Out</button>
                        </div>
                    ) : (
                        <Link to="/login" className="btn-nav-primary">Sign In</Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
