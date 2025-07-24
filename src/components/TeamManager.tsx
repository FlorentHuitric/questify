// Gestion de l'équipe avec drag & drop

import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import '../styles/TeamManager.css';

const TeamManager: React.FC = () => {
  const { gatchaCharactersOwned, team, setTeam, addCharacterToTeam, removeCharacterFromTeam, playerName, playerAvatar, playerStats } = useGame();
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Slot 0 = joueur principal (toujours présent)
  const playerChar = {
    id: 'player',
    name: playerName || 'Joueur',
    sprite: playerAvatar || '🧑',
    level: playerStats.level,
    rarity: 'SSR',
  };

  // Drag & drop handlers
  const onDragStart = (id: string) => setDraggedId(id);
  const onDropTeam = (slot: number) => {
    if (!draggedId) return;
    const char = gatchaCharactersOwned.find(c => c.id === draggedId);
    if (!char) return;
    const newTeam = [...team];
    newTeam[slot] = char;
    setTeam(newTeam.slice(0, 3));
    setDraggedId(null);
  };
  const onDropCollection = () => setDraggedId(null);

  // Permet d'intervertir deux persos dans l'équipe
  const onSwap = (from: number, to: number) => {
    const newTeam = [...team];
    [newTeam[from], newTeam[to]] = [newTeam[to], newTeam[from]];
    setTeam(newTeam);
  };

  return (
    <div className="team-manager">
      <h2>Équipe (drag & drop)</h2>
      <div className="team-slots">
        {/* Slot 0: Joueur principal, non retirable */}
        <div className="team-slot filled main-player">
          <div className="team-char" style={{ background: '#F1C40F', color: '#232946', cursor: 'default' }}>
            <span className="char-sprite">{playerChar.sprite}</span>
            <span className="char-name">{playerChar.name}</span>
            <span className="char-level">Lv.{playerChar.level}</span>
            <span className="char-rarity">{playerChar.rarity}</span>
            <span style={{ fontSize: 10, color: '#888' }}>(Joueur)</span>
          </div>
        </div>
        {/* Slots 1 et 2: équipiers */}
        {[0,1].map(i => (
          <div
            key={i+1}
            className={`team-slot${team[i] ? ' filled' : ''}`}
            onDragOver={e => e.preventDefault()}
            onDrop={() => onDropTeam(i)}
          >
            {team[i] ? (
              <div
                className="team-char"
                draggable
                onDragStart={() => onDragStart(team[i].id)}
                onDoubleClick={() => removeCharacterFromTeam(team[i].id)}
              >
                <span className="char-sprite">{team[i].sprite}</span>
                <span className="char-name">{team[i].name}</span>
                <span className="char-level">Lv.{team[i].level ?? 1}</span>
                <span className="char-rarity">{team[i].rarity}</span>
              </div>
            ) : (
              <span className="empty-slot">Glisser ici</span>
            )}
          </div>
        ))}
      </div>
      <h2>Collection</h2>
      <div className="collection-list">
        {gatchaCharactersOwned.map(char => (
          <div
            key={char.id}
            className="collection-char"
            draggable
            onDragStart={() => onDragStart(char.id)}
            onDoubleClick={() => addCharacterToTeam(char.id)}
            onDragEnd={onDropCollection}
          >
            <span className="char-sprite">{char.sprite}</span>
            <span className="char-name">{char.name}</span>
            <span className="char-level">Lv.{char.level ?? 1}</span>
            <span className="char-rarity">{char.rarity}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamManager;
