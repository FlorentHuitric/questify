// src/components/Header.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';

const Header: React.FC = () => {
  const [menuActive, setMenuActive] = useState(false);

  const toggleMenu = () => {
    setMenuActive(!menuActive);
  };

  return (
    <header className="header">
      <div className="logo">Questify</div>
      <div className="menu-toggle" onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <nav className={`menu ${menuActive ? 'active' : ''}`}>
        <Link to="/" onClick={() => setMenuActive(false)}>Accueil</Link>
        <Link to="/quests" onClick={() => setMenuActive(false)}>Quêtes</Link>
        <Link to="/profile" onClick={() => setMenuActive(false)}>Profil</Link>
      </nav>
    </header>
  );
};

export default Header;
