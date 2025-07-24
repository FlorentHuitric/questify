// src/components/Header.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import '../styles/Header.css';

const Header: React.FC = () => {
  const [menuActive, setMenuActive] = useState(false);
  const { currency } = useGame();

  const toggleMenu = () => {
    setMenuActive(!menuActive);
  };

  return (
    <header className="header">
      <div className="logo">Questify</div>
      <div className="currency-display">
        <div className="currency gold">
          <span className="currency-icon">🪙</span>
          <span className="currency-amount">{currency.gold}</span>
        </div>
        <div className="currency gems">
          <span className="currency-icon">💎</span>
          <span className="currency-amount">{currency.gems}</span>
        </div>
      </div>
      <div className="menu-toggle" onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <nav className={`menu ${menuActive ? 'active' : ''}`}>
        <Link to="/" onClick={() => setMenuActive(false)}>🏠 Accueil</Link>
        <Link to="/quests" onClick={() => setMenuActive(false)}>📋 Quêtes</Link>
        <Link to="/map" onClick={() => setMenuActive(false)}>🗺️ Carte</Link>
        <Link to="/shop" onClick={() => setMenuActive(false)}>🏪 Boutique</Link>
        <Link to="/profile" onClick={() => setMenuActive(false)}>👤 Profil</Link>
        <Link to="/gatcha" onClick={() => setMenuActive(false)}>🎲 Gatcha</Link>
      </nav>
    </header>
  );
};

export default Header;
