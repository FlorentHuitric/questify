// src/pages/Dashboard.tsx
import React from 'react';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-container">
      <div className="avatar-stats">
        <div className="avatar">
          {/* Remplacez le chemin par l'importation d'asset ou gardez l'URL relative */}
          <img src="/src/assets/avatar.png" alt="Avatar" />
        </div>
        <div className="stats">
          <h2 className="title">Niveau 5</h2>
          <p>XP: 120/200</p>
        </div>
      </div>
      <div className="notifications">
        <h3>Dernières Quêtes</h3>
        <ul>
          <li>
            Quête 1 : Marcher 5000 pas <span className="xp-gain">+10 XP</span>
          </li>
          <li>
            Quête 2 : Méditer 10 minutes <span className="xp-gain">+15 XP</span>
          </li>
        </ul>
      </div>
      <button className="start-quest-button">Commencer une quête</button>
    </div>
  );
};

export default Dashboard;
