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
import Header from './components/Header';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <GameProvider>
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
          </Routes>
        </main>
        <Footer />
      </Router>
    </GameProvider>
  );
};

export default App;
