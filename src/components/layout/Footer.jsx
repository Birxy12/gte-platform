import { useLocation, Link } from "react-router-dom";
import {
  Github,
  Twitter,
  Linkedin,
  Facebook,
  Mail,
  Phone,
  MapPin,
  ExternalLink
} from "lucide-react";
import "./Footer.css";

export default function Footer() {
  const location = useLocation();

  // Hide footer on specific paths where it might interfere with the UI (Chat, Reels, Admin)
  const hiddenPaths = ["/chat", "/reels", "/login", "/register", "/forgot-password"];
  const isHidden = hiddenPaths.includes(location.pathname) || 
                   location.pathname.startsWith("/admin") || 
                   location.pathname.startsWith("/dashboard");

  if (isHidden) return null;

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-container">
      <div className="footer-content">

        {/* BRAND & SOCIALS */}
        <div className="footer-brand-section">
          <Link to="/home" className="footer-logo">
            <img src="/GlobixTech-logo.png" alt="GlobixTech Logo" />
            <div className="logo-text">
              <h3>GlobixTech <span>Ent</span></h3>
              <p>Excellence in Digital Learning</p>
            </div>
          </Link>

          <p className="footer-description">
            Empowering tech enthusiasts with premium courses, real-time community engagement, and expert-led mentorship. Join the mission to innovate.
          </p>

          <div className="footer-social-grid">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-pill">
              <Github size={18} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-pill">
              <Twitter size={18} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-pill">
              <Linkedin size={18} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-pill">
              <Facebook size={18} />
            </a>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <div className="footer-links-container">
          <div className="links-group">
            <h5>Platform</h5>
            <Link to="/courses">Explore Courses</Link>
            <Link to="/reels">Discovery Reels</Link>
            <Link to="/blog">Insight Blog</Link>
            <Link to="/leaderboard">Rankings</Link>
          </div>

          <div className="links-group">
            <h5>Community</h5>
            <Link to="/chat">GTE Messenger</Link>
            <Link to="/discover">Find Members</Link>
            <Link to="/pricing">Pro Membership</Link>
            <Link to="/contact">Support Center</Link>
          </div>

          <div className="links-group">
            <h5>Legal</h5>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/about">About GTE</Link>
          </div>
        </div>

        {/* NEWSLETTER SECTION */}
        <div className="footer-newsletter-section">
          <h5>Intelligence Briefing</h5>
          <p>Get the latest tech updates and mission reports delivered to your inbox.</p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <div className="input-group">
              <Mail size={18} className="input-icon" />
              <input type="email" placeholder="Your Email Address" required />
            </div>
            <button type="submit">Subscribe</button>
          </form>
          
          <div className="direct-contact mt-4">
             <div className="flex items-center gap-2 text-msger-text-dim text-sm mb-1">
                <Phone size={14} /> <span>+234 09066202949</span>
             </div>
             <div className="flex items-center gap-2 text-msger-text-dim text-sm">
                <Mail size={14} /> <span>globixtechinc@gmail.com</span>
             </div>
          </div>
        </div>

      </div>

      {/* BOTTOM COPYRIGHT */}
      <div className="footer-bottom-bar">
        <div className="bottom-inner">
          <p>© {currentYear} <span>GlobixTech Enterprises</span>. All internal protocols secured.</p>
          <div className="bottom-links">
             <span>v1.0.4 Premium</span>
             <div className="status-indicator">
                <span className="dot"></span> System Online
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
}