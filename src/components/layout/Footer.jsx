import React from 'react';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-brand">
        <img src="/GlobixTech-logo.png" alt="Logo" className="footer-logo" />
      </div>
      <div className="footer-links-group">
        <div className="footer-links">
          <h4>Platform</h4>
          <a href="/dashboard">Dashboard</a>
          <a href="/courses">Courses</a>
          <a href="/blog">Blog</a>
        </div>
        <div className="footer-links">
          <h4>Company</h4>
          <a href="/about-us">About Us</a>
          <a href="/contact">Contact</a>
          <a href="/register">Register</a>
        </div>
        <div className="footer-links">
          <h4>Legal</h4>
          <a href="/privacy-policy">Privacy Policy</a>
          <a href="/terms-of-service">Terms of Service</a>
          <a href="/cookie-guidelines">Cookie Guidelines</a>
        </div>
      </div>
      <div className="footer-contact">
        <p>
          Contact us at <a href="mailto:support@example.com">support@example.com</a>
        </p>
      </div>
      <div className="footer-socials">
        <h4>Follow Us</h4>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
          <img src="/icons/facebook.svg" alt="Facebook" className="social-icon" />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
          <img src="/icons/twitter.svg" alt="Twitter" className="social-icon" />
        </a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
          <img src="/icons/linkedin.svg" alt="LinkedIn" className="social-icon" />
        </a>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Your Company. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
