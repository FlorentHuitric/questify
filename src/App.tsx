// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './contexts/GameContext';

import Dashboard from './pages/Dashboard';
import Quests from './pages/Quests';
import Profile from './pages/Profile';
import Map from './pages/Map';
import Combat from './pages/Combat';
import Shop from './pages/Shop';
import CharacterCreation from './pages/CharacterCreation';
import SphereGrid from './pages/SphereGrid';
import Header from './components/Header';
import Footer from './components/Footer';
import LevelUpModal from './components/LevelUpModal';
import { useGame } from './contexts/GameContext';


const AppContent: React.FC = () => {
  const { showLevelUpModal, oldLevelStats, newLevelStats, closeLevelUpModal } = useGame();
  return (
    <>
      <Router>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/quests" element={<Quests />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/map" element={<Map />} />
            <Route path="/combat" element={<Combat />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/character-creation" element={<CharacterCreation />} />
            <Route path="/spheregrid" element={<SphereGrid />} />
          </Routes>
        </main>
        <Footer />
      </Router>
      <LevelUpModal
        show={showLevelUpModal}
        onClose={closeLevelUpModal}
        oldStats={(oldLevelStats || {}) as Record<string, number>}
        newStats={(newLevelStats || {}) as Record<string, number>}
        level={newLevelStats?.level || 0}
      />
    </>
  );
};

const App: React.FC = () => {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
};

export default App;
