import React from "react";
import { FaLinkedinIn } from "react-icons/fa";
import "../App.css";

const Footer = () => {
  return (
    <footer className="footer-glass">
      <span className="footer-gradient">
        Vibe Coded with <span className="footer-love">LOVE</span>
      </span>
      <span className="footer-separator">|</span>
      <span className="footer-author">James Geiger</span>
      <span className="footer-separator">|</span>
      <span className="footer-year">2025</span>
      <span className="footer-separator">|</span>
      <a
        href="https://www.linkedin.com/in/jamesgeiger/"
        className="footer-linkedin"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn"
      >
        <FaLinkedinIn />
      </a>
    </footer>
  );
};

export default Footer;
