// src/pages/Profile.tsx
import React from 'react';
import '../styles/Profile.css';

const Profile: React.FC = () => {
  return (
    <div className="profile-container">
      <h1>Mon Profil</h1>
      <div className="profile-header">
        <div className="avatar">
          <img src="/src/assets/avatar.png" alt="Avatar" />
        </div>
        <div className="info">
          <h2>Niveau 5</h2>
          <p>XP: 120/200</p>
          <p>Compétences:</p>
          <ul>
            <li>Force : 10</li>
            <li>Agilité : 8</li>
            <li>Sagesse : 12</li>
          </ul>
        </div>
      </div>
      <div className="inventory">
        <h3>Inventaire</h3>
        <div className="inventory-grid">
          <div className="inventory-item">
            <img src="/src/assets/sword.png" alt="Épée" />
          </div>
          <div className="inventory-item">
            <img src="/src/assets/shield.png" alt="Bouclier" />
          </div>
          {/* Ajoutez d'autres éléments d'inventaire si nécessaire */}
        </div>
      </div>
      <div className="quest-history">
        <h3>Historique des Quêtes</h3>
        <ul>
          <li>Quête 1 : +10 XP</li>
          <li>Quête 2 : +15 XP</li>
        </ul>
      </div>
    </div>
  );
};

export default Profile;
