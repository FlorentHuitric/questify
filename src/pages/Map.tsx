// src/pages/Map.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapZone } from '../types/GameTypes';
import { mapZones } from '../data/GameData';
import { useGame } from '../contexts/GameContext';
import '../styles/Map.css';

const Map: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { playerStats, updatePlayerStats } = useGame();
  const [selectedZone, setSelectedZone] = useState<MapZone | null>(null);
  const [zones, setZones] = useState<MapZone[]>(mapZones);
  const [notification, setNotification] = useState<string | null>(null);

  // Gérer les retours de combat - une seule fois
  useEffect(() => {
    if (location.state) {
      const { victory, rewards, message } = location.state;
      
      if (victory && rewards) {
        const newXp = playerStats.xp + rewards.xp;
        const newLevel = Math.floor(newXp / 100) + 1;
        
        updatePlayerStats({
          xp: newXp,
          level: newLevel,
          maxXp: newLevel * 100
        });
      }
      
      if (message) {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
      }
      
      // Nettoyer le state pour éviter les re-renders
      window.history.replaceState({}, document.title);
    }
  }, [location.state, updatePlayerStats]); // Retirer playerStats.xp des dépendances

  // Débloquer les zones selon le niveau
  useEffect(() => {
    setZones(prevZones => prevZones.map(zone => ({
      ...zone,
      unlocked: playerStats.level >= zone.requiredLevel
    })));
  }, [playerStats.level]); // Utiliser seulement playerStats.level

  const handleZoneClick = (zone: MapZone) => {
    if (!zone.unlocked) {
      alert(`Vous devez être niveau ${zone.requiredLevel} pour accéder à cette zone !`);
      return;
    }
    setSelectedZone(zone);
  };

  const startCombat = (enemy: any) => {
    navigate('/combat', { 
      state: { 
        enemy 
      } 
    });
  };

  const goToShop = () => {
    navigate('/shop');
  };

  const handleRest = () => {
    if (playerStats.hp === playerStats.maxHp && playerStats.mp === playerStats.maxMp) {
      alert('Vous êtes déjà en pleine forme !');
      return;
    }
    
    if (confirm('Voulez-vous vous reposer ? Cela restaurera tous vos PV et MP.')) {
      updatePlayerStats({
        hp: playerStats.maxHp,
        mp: playerStats.maxMp
      });
      setNotification('🛌 Vous vous êtes reposé et avez récupéré toute votre énergie !');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className="map-container">
      <div className="map-header">
        <h1>🗺️ Carte du Monde</h1>
        <div className="header-actions">
          <button className="shop-button" onClick={goToShop}>
            🏪 Boutique
          </button>
          <button className="rest-button" onClick={handleRest}>
            🛌 Se reposer
          </button>
          <div className="player-info">
            <span>Niveau {playerStats.level}</span>
            <span>❤️ {playerStats.hp}/{playerStats.maxHp}</span>
            <span>💙 {playerStats.mp}/{playerStats.maxMp}</span>
            <span>⭐ {playerStats.xp}/{playerStats.maxXp}</span>
          </div>
        </div>
      </div>

      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}

      <div className="map-world">
        {zones.map((zone) => (
          <div
            key={zone.id}
            className={`zone ${zone.unlocked ? 'unlocked' : 'locked'}`}
            style={{
              left: zone.position.x,
              top: zone.position.y
            }}
            onClick={() => handleZoneClick(zone)}
          >
            <div className="zone-icon">{zone.backgroundImage}</div>
            <div className="zone-name">{zone.name}</div>
            {!zone.unlocked && (
              <div className="zone-lock">🔒 Niv. {zone.requiredLevel}</div>
            )}
          </div>
        ))}
      </div>

      {selectedZone && (
        <div className="zone-modal">
          <div className="modal-content">
            <h2>{selectedZone.name}</h2>
            <p>{selectedZone.description}</p>
            <div className="enemies-list">
              <h3>Ennemis disponibles :</h3>
              {selectedZone.enemies.map((enemy) => (
                <div key={enemy.id} className="enemy-card">
                  <span className="enemy-sprite">{enemy.sprite}</span>
                  <div className="enemy-info">
                    <strong>{enemy.name}</strong>
                    <small>Niveau {enemy.level} | ❤️ {enemy.hp} | ⭐ {enemy.xpReward} XP | 🪙 {enemy.goldReward} Or</small>
                  </div>
                  <button 
                    className="fight-button"
                    onClick={() => startCombat(enemy)}
                  >
                    ⚔️ Combattre
                  </button>
                </div>
              ))}
            </div>
            <button 
              className="close-button"
              onClick={() => setSelectedZone(null)}
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      <div className="map-legend">
        <h3>🎮 Contrôles</h3>
        <div className="legend-item">
          <span className="legend-icon">🗺️</span>
          <span>Cliquez sur une zone pour explorer</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon">⚔️</span>
          <span>Choisissez un ennemi pour combattre</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon">🏪</span>
          <span>Visitez la boutique pour améliorer votre équipement</span>
        </div>
      </div>
    </div>
  );
};

export default Map;
