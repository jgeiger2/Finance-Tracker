import React, { useState, useEffect } from "react";
import { FaCog, FaSun, FaMoon } from "react-icons/fa";
import "../styles/Header.css";

const Header = () => {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    console.log("Theme is light:", isLight);
    if (isLight) {
      document.body.classList.add("light");
    } else {
      document.body.classList.remove("light");
    }
  }, [isLight]);

  const handleToggle = () => {
    setIsLight((prev) => !prev);
  };

  return (
    <header className="header">
      <div className="header-left">
        <span className="user-name">James</span>
      </div>

      <div className="header-center">
        <h1 className="app-title">Finance Tracker</h1>
      </div>

      <div className="header-right">
        <button className="toggle-theme-button" onClick={handleToggle}>
          {isLight ? (
            <FaSun className="theme-icon" />
          ) : (
            <FaMoon className="theme-icon" />
          )}
        </button>
        <button className="settings-button">
          <FaCog className="settings-icon" />
        </button>
      </div>
    </header>
  );
};

export default Header;
