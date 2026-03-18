import { useLocation, Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
    const location = useLocation();

    // Hide footer on auth pages, Chat, and Dashboards
    const hiddenPaths = ["/login", "/register", "/forgot-password", "/chat"];
    if (hiddenPaths.includes(location.pathname) || location.pathname.startsWith("/dashboard") || location.pathname.startsWith("/admin")) return null;

    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer-container">
            <div className="footer-content">

                <div className="footer-brand">
                    <div className="footer-logo">
                        <img src="/GlobixTech-logo.png" alt="Globix Tech" />
                        <h5>GTE Portal</h5>
                    </div>
                    <p className="footer-tagline">
                        Empowering education through premium digital experiences. Learn, grow, and interact with the community.
                    </p>
                </div>

                <div className="footer-links-group">
                    <h4>Platform</h4>
                    <Link to="/home">Dashboard</Link>
                    <Link to="/courses">Courses</Link>
                    <Link to="/blog">Blog</Link>
                </div>

                <div className="footer-links-group">
                    <h4>Company</h4>
                    <Link to="/about">About Us</Link>
                    <Link to="/contact">Contact</Link>
                    <Link to="/register">Register</Link>
                </div>

                <div className="footer-links-group">
                    <h4>Legal</h4>
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                    <a href="#">Cookie Guidelines</a>
                </div>

                <div className="footer-contact">
                    <h4>Contact Us</h4>
                    <p>support@gteportal.edu</p>
                    <p>1-800-GTE-LEARN</p>
                    <p>Lagos, Nigeria</p>
                </div>

            </div>

            <div className="footer-bottom">
                <p>&copy; {currentYear} Globix Tech Enterprise. All rights reserved.</p>
            </div>
        </footer>
    );
}
