// Page dédiée à l'invocation gatcha
import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import '../styles/Gatcha.css';

const Gatcha: React.FC = () => {
  const {
    gatchaTickets,
    invokeGatchaSingle,
    invokeGatchaMulti,
    gatchaCharactersOwned,
    addGatchaTicket
  } = useGame();
  const [showModal, setShowModal] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [isMulti, setIsMulti] = useState(false);

  // Pour test : donner 10 tickets
  const giveTickets = () => addGatchaTicket(10);

  const handleSingle = () => {
    try {
      const res = invokeGatchaSingle(true);
      setResults([res]);
      setIsMulti(false);
      setShowModal(true);
    } catch (e) {
      alert(e);
    }
  };
  const handleMulti = () => {
    try {
      const res = invokeGatchaMulti(true);
      setResults(res);
      setIsMulti(true);
      setShowModal(true);
    } catch (e) {
      alert(e);
    }
  };

  return (
    <div className="gatcha-page">
      <h1>Invocation Gatcha</h1>
      <div className="gatcha-actions">
        <button onClick={handleSingle} disabled={gatchaTickets < 1}>Invocation x1 (1 ticket)</button>
        <button onClick={handleMulti} disabled={gatchaTickets < 10}>Invocation x10 (10 tickets)</button>
        <button onClick={giveTickets}>+10 tickets (debug)</button>
        <div>Tickets : {gatchaTickets}</div>
      </div>
      <div className="gatcha-owned">
        <h2>Personnages possédés</h2>
        <div className="gatcha-list">
          {gatchaCharactersOwned.length === 0 && <div>Aucun personnage pour l'instant.</div>}
          {gatchaCharactersOwned.map(char => (
            <div key={char.id} className={`gatcha-char rarity-${char.rarity.toLowerCase()}`}> 
              <span className="gatcha-sprite">{char.sprite}</span>
              <span className="gatcha-name">{char.name}</span>
              <span className="gatcha-rarity">{char.rarity}</span>
              <span className="gatcha-dupes">Dupes: {char.dupes} / Débridage: {char.unbindLevel}</span>
            </div>
          ))}
        </div>
      </div>
      {showModal && (
        <div className="gatcha-modal-overlay">
          <div className="gatcha-modal">
            <h2>Résultat Invocation {isMulti ? 'x10' : 'x1'}</h2>
            <div className="gatcha-results">
              {results.map((char, i) => (
                <div key={i} className={`gatcha-result rarity-${char.rarity.toLowerCase()}`}>
                  <span className="gatcha-sprite-large">{char.sprite}</span>
                  <span className="gatcha-name">{char.name}</span>
                  <span className="gatcha-rarity">{char.rarity}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setShowModal(false)}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gatcha;
