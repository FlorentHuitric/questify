// src/pages/Quests.tsx
import React from 'react';
import '../styles/Quests.css';

const Quests: React.FC = () => {
  return (
    <div className="quests-container">
      <h1>Quêtes</h1>
      <div className="filter">
        <button>Quotidiennes</button>
        <button>Hebdomadaires</button>
        <button>Événements</button>
      </div>
      <div className="quest-list">
        <div className="quest-card">
          <img
            src="/src/assets/quest-icon.png"
            alt="Icône de quête"
            className="quest-icon"
          />
          <div className="quest-info">
            <h2>Quête 1</h2>
            <p>XP: +10</p>
            <div className="progress-bar">
              <div className="progress" style={{ width: '50%' }}></div>
            </div>
          </div>
        </div>
        <div className="quest-card">
          <img
            src="/src/assets/quest-icon.png"
            alt="Icône de quête"
            className="quest-icon"
          />
          <div className="quest-info">
            <h2>Quête 2</h2>
            <p>XP: +25</p>
            <div className="progress-bar">
              <div className="progress" style={{ width: '75%' }}></div>
            </div>
          </div>
        </div>
        {/* Ajoutez d'autres cartes de quête si besoin */}
      </div>
    </div>
  );
};

export default Quests;
