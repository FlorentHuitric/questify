// src/pages/CharacterCreation.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { archetypes, Archetype } from '../data/Archetypes';
import { useGame } from '../contexts/GameContext';
import '../styles/Profile.css';


const questions = [
  {
    id: 'routine',
    text: 'Comment gères-tu tes routines quotidiennes ?',
    options: [
      { value: 'discipline', label: 'Je suis très discipliné(e), j’aime la structure.' },
      { value: 'créatif', label: 'Je préfère improviser selon l’inspiration.' },
      { value: 'efficace', label: 'J’optimise tout pour gagner du temps.' },
    ],
  },
  {
    id: 'motivation',
    text: 'Qu’est-ce qui te motive le plus à progresser ?',
    options: [
      { value: 'défi', label: 'Le challenge, repousser mes limites.' },
      { value: 'apprendre', label: 'Découvrir, apprendre de nouvelles choses.' },
      { value: 'récompense', label: 'Voir des résultats concrets, être récompensé.' },
    ],
  },
  {
    id: 'stress',
    text: 'Face au stress ou à la fatigue, tu…',
    options: [
      { value: 'fonce', label: 'Je fonce, je transforme la pression en énergie.' },
      { value: 'analyse', label: 'Je prends du recul, j’analyse la situation.' },
      { value: 'détourne', label: 'Je cherche à m’évader, à me distraire.' },
    ],
  },
];


// Logique de recommandation plus subtile
const getRecommendedArchetype = (answers: Record<string, string>): Archetype => {
  // Score par archétype
  const scores: Record<string, number> = { warrior: 0, mage: 0, thief: 0 };
  // Routine
  if (answers.routine === 'discipline') scores.warrior += 2;
  if (answers.routine === 'créatif') scores.mage += 2;
  if (answers.routine === 'efficace') scores.thief += 2;
  // Motivation
  if (answers.motivation === 'défi') scores.warrior += 2;
  if (answers.motivation === 'apprendre') scores.mage += 2;
  if (answers.motivation === 'récompense') scores.thief += 2;
  // Stress
  if (answers.stress === 'fonce') scores.warrior += 2;
  if (answers.stress === 'analyse') scores.mage += 2;
  if (answers.stress === 'détourne') scores.thief += 2;
  // Trouver l'archétype avec le score max
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  return archetypes.find(a => a.id === best)!;
};

const CharacterCreation: React.FC = () => {
  const { startNewGame } = useGame();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [playerName, setPlayerName] = useState('');
  const [step, setStep] = useState(0);
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype | null>(null);
  const [showAllChoices, setShowAllChoices] = useState(false);

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    setStep(step + 1);
  };

  React.useEffect(() => {
    if (step === questions.length) {
      setSelectedArchetype(getRecommendedArchetype(answers));
    }
  }, [step, answers]);

  const handleArchetypeSelect = (archetype: Archetype) => {
    setSelectedArchetype(archetype);
    setShowAllChoices(false);
  };


  // Calcul des stats dérivées à partir des stats principales de l'archétype
  const { calculateDerivedStats } = useGame() as any;
  const getFullStats = (arch: Archetype) => {
    // On part des stats principales, on complète avec le reste par défaut
    return calculateDerivedStats({
      ...arch.baseStats,
      level: 5, // Pour affichage preview sphérier
      xp: 0,
      maxXp: 100,
      hp: 0,
      maxHp: 0,
      mp: 0,
      maxMp: 0,
      archetype: arch.id // Pour scaling
    });
  };

  const navigate = useNavigate();
  const handleStart = () => {
    if (selectedArchetype && playerName) {
      startNewGame(playerName, {
        baseStats: {
          ...selectedArchetype.baseStats,
          level: 1, // Commence au niveau 1
          xp: 0,
          maxXp: 100,
          hp: 0,
          maxHp: 0,
          mp: 0,
          maxMp: 0,
          attack: 0,
          defense: 0,
          magicAttack: 0,
          magicDefense: 0,
          speed: 0,
          hitRate: 0,
          criticalRate: 0,
          evadeRate: 0,
        },
        id: selectedArchetype.id
      });
      // Redirection React
      navigate('/');
    }
  };


  return (
    <div className="inventory-container" style={{ minHeight: '100vh' }}>
      <div className="stats-panel" style={{ maxWidth: 420, margin: '0 auto', background: 'rgba(0,0,0,0.7)' }}>
        <h2 style={{ textAlign: 'center', fontFamily: 'Press Start 2P, cursive', color: '#F1C40F', marginBottom: 24 }}>Création de personnage</h2>
        {step < questions.length && (
          <div className="question-block" style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 18, fontFamily: 'Roboto, sans-serif', marginBottom: 18 }}>{questions[step].text}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {questions[step].options.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleAnswer(questions[step].id, opt.value)}
                  className="btn-primary"
                  style={{
                    background: 'linear-gradient(90deg, #F1C40F 0%, #E67E22 100%)',
                    color: '#222',
                    fontWeight: 700,
                    fontFamily: 'Press Start 2P, cursive',
                    border: 'none',
                    borderRadius: 8,
                    padding: '12px 0',
                    fontSize: 16,
                    marginBottom: 4,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    cursor: 'pointer',
                    transition: 'transform 0.1s',
                  }}
                  onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
                  onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
        {step === questions.length && selectedArchetype && !showAllChoices && (
          <div className="archetype-recommendation" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#F1C40F', fontFamily: 'Press Start 2P, cursive', marginBottom: 8 }}>Nous te recommandons&nbsp;: {selectedArchetype.name}</h3>
            <p style={{ fontSize: 16, marginBottom: 16 }}>{selectedArchetype.description}</p>
            <div className="archetype-stats" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 18 }}>
              {Object.entries(getFullStats(selectedArchetype)).map(([key, value]) => (
                <div key={key} className="stat-item" style={{ minWidth: 90, background: '#222', borderRadius: 6, padding: 8, color: '#F1C40F', fontFamily: 'Roboto, sans-serif', fontSize: 14 }}>
                  <span className="stat-label" style={{ fontWeight: 700 }}>{key}</span>
                <span className="stat-value" style={{ marginLeft: 6 }}>{Number(value)}</span>
                </div>
              ))}
            </div>
            <input
              type="text"
              placeholder="Nom du personnage"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              style={{
                width: '80%',
                margin: '12px auto',
                display: 'block',
                padding: 10,
                borderRadius: 6,
                border: '1px solid #F1C40F',
                fontFamily: 'Roboto, sans-serif',
                fontSize: 16,
                background: '#181818',
                color: '#F1C40F',
              }}
            />
            <button
              onClick={handleStart}
              disabled={!playerName}
              className="btn-primary"
              style={{
                background: 'linear-gradient(90deg, #F1C40F 0%, #E67E22 100%)',
                color: '#222',
                fontWeight: 700,
                fontFamily: 'Press Start 2P, cursive',
                border: 'none',
                borderRadius: 8,
                padding: '12px 32px',
                fontSize: 18,
                margin: '16px 0 8px 0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                cursor: playerName ? 'pointer' : 'not-allowed',
                opacity: playerName ? 1 : 0.6,
              }}
            >
              Valider ce personnage
            </button>
            <button
              onClick={() => setShowAllChoices(true)}
              className="btn-secondary"
              style={{
                background: 'none',
                color: '#F1C40F',
                fontFamily: 'Press Start 2P, cursive',
                border: '1px solid #F1C40F',
                borderRadius: 8,
                padding: '10px 24px',
                fontSize: 14,
                margin: '8px 0',
                cursor: 'pointer',
              }}
            >
              Voir d'autres archétypes
            </button>
          </div>
        )}
        {showAllChoices && (
          <div className="archetype-choices" style={{ marginTop: 24 }}>
            <h3 style={{ color: '#F1C40F', fontFamily: 'Press Start 2P, cursive', marginBottom: 16 }}>Choisis ton archétype</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, justifyContent: 'center' }}>
              {archetypes.map(arch => (
                <div key={arch.id} className="archetype-card" style={{ background: '#222', borderRadius: 10, padding: 18, minWidth: 180, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                  <h4 style={{ color: '#F1C40F', fontFamily: 'Press Start 2P, cursive', marginBottom: 6 }}>{arch.name}</h4>
                  <p style={{ fontSize: 14, marginBottom: 10 }}>{arch.description}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    {Object.entries(getFullStats(arch)).map(([key, value]) => (
                      <div key={key} style={{ background: '#181818', borderRadius: 4, padding: '2px 6px', color: '#F1C40F', fontSize: 12 }}>{key}: {Number(value)}</div>
                    ))}
                  </div>
                  <button
                    onClick={() => handleArchetypeSelect(arch)}
                    className="btn-primary"
                    style={{
                      background: 'linear-gradient(90deg, #F1C40F 0%, #E67E22 100%)',
                      color: '#222',
                      fontWeight: 700,
                      fontFamily: 'Press Start 2P, cursive',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 0',
                      fontSize: 14,
                      marginTop: 8,
                      cursor: 'pointer',
                    }}
                  >
                    Choisir
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterCreation;
