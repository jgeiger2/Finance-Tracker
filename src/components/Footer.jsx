import React from "react";
import { FaLinkedinIn, FaInstagram } from "react-icons/fa";
import "../App.css";

const Footer = () => {
  return (
    <footer className="footer-glass">
      <div className="footer-socials">
        <a
          href="https://www.linkedin.com/in/jamesgeiger/"
          className="footer-social-icon footer-linkedin"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
        >
          <FaLinkedinIn />
        </a>
        <a
          href="#"
          className="footer-social-icon footer-instagram"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <FaInstagram />
        </a>
      </div>
      <div className="footer-text">
        <span className="footer-gradient">
          Vibe Coded with <span className="footer-love">LOVE</span>
        </span>
        <span className="footer-separator">|</span>
        <span className="footer-author">James Geiger</span>
        <span className="footer-separator">|</span>
        <span className="footer-year">2025</span>
      </div>
    </footer>
  );
};

export default Footer;
