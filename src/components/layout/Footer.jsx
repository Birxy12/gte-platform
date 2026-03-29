import { useLocation, Link } from "react-router-dom";
import {
  Github,
  Twitter,
  Linkedin,
  Facebook,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import "./Footer.css";

export default function Footer() {
  const location = useLocation();

  // Hide footer on auth, chat, admin, dashboard
  const hiddenPaths = ["/login", "/register", "/forgot-password", "/chat"];
  if (
    hiddenPaths.includes(location.pathname) ||
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/admin")
  ) return null;

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-container">
      <div className="footer-content">

        {/* BRAND */}
        <div className="footer-brand">
          <div className="footer-logo">
            <img src="/GlobixTech-logo.png" alt="GlobixTech Ent Logo" />
            <h3>GlobixTech <span>Ent</span></h3>
          </div>

          <p className="footer-tagline">
            Empowering education through premium digital experiences.
            Learn, build, and connect with a global tech community.
          </p>

          <div className="footer-socials">
            <a href="#"><Github size={20} /></a>
            <a href="#"><Twitter size={20} /></a>
            <a href="#"><Linkedin size={20} /></a>
            <a href="#"><Facebook size={20} /></a>
          </div>
        </div>

        {/* PLATFORM */}
        <div className="footer-links-group">
          <h4>Platform</h4>
          <Link to="/home">Dashboard</Link>
          <Link to="/courses">Courses</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/chat">Community</Link>
        </div>

        {/* COMPANY */}
        <div className="footer-links-group">
          <h4>Company</h4>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/register">Join Us</Link>
        </div>

        {/* LEGAL */}
        <div className="footer-links-group">
          <h4>Legal</h4>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Cookies</a>
        </div>

        {/* CONTACT + NEWSLETTER */}
        <div className="footer-contact">
          <h4>Stay Updated</h4>

          <p><Mail size={16} /> globixtechinc@gmail.com</p>
          <p><Phone size={16} /> +234 09066202949</p>
          <p><MapPin size={16} /> Nigeria</p>

          <div className="newsletter">
            <input type="email" placeholder="Enter your email" />
            <button>Subscribe</button>
          </div>
        </div>

      </div>

      {/* BOTTOM */}
      <div className="footer-bottom">
        <p>
          © {currentYear} <strong>GlobixTech Ent</strong>. All rights reserved.
        </p>
      </div>
    </footer>
  );
}