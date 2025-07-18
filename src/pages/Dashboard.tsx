// src/pages/Dashboard.tsx

import React, { useEffect } from 'react';
// import LevelUpModal from '../components/LevelUpModal';
import { useGame } from '../contexts/GameContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';


const Dashboard: React.FC = () => {
  const { playerName, playerAvatar, getTotalStats } = useGame();
  const playerStats = getTotalStats();
  const navigate = useNavigate();
  useEffect(() => {
    const savedData = localStorage.getItem('questify_save');
    if (!savedData) {
      navigate('/character-creation', { replace: true });
    }
  }, [navigate]);
  React.useEffect(() => {
    console.log('[Dashboard] Render', {
      playerName,
      playerAvatar,
      playerStats
    });
  });
  if (!playerAvatar) {
    return null;
  }
  return (
    <>
      <div className="dashboard-container">
        <div className="avatar-stats">
          <div className="avatar">
            <img src={playerAvatar} alt="Avatar" />
          </div>
          <div className="stats">
            <h2 className="title">{playerName ? playerName : 'Aventurier'} (Niveau {playerStats?.level ?? 1})</h2>
            <p>XP: {playerStats?.xp ?? 0}/{playerStats?.maxXp ?? 100}</p>
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
      {/* La modale de level up est maintenant globale, plus besoin ici */}
    </>
  );
};

export default Dashboard;
