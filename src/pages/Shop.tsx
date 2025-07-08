// src/pages/Shop.tsx
import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { shopItems } from '../data/GameData';
import { ShopItem } from '../types/GameTypes';
import '../styles/Shop.css';

const Shop: React.FC = () => {
  const { currency, buyItem, playerStats } = useGame();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredItems = selectedCategory === 'all' 
    ? shopItems 
    : shopItems.filter(item => item.category === selectedCategory);

  const handlePurchase = (item: ShopItem, usePremium: boolean = false) => {
    const cost = usePremium ? item.premiumPrice : item.price;
    const currencyType = usePremium ? 'gems' : 'gold';
    
    if (!cost) return;
    
    // Vérifier si le joueur a le niveau requis
    if (playerStats.level < item.levelRequired) {
      alert(`Niveau ${item.levelRequired} requis pour acheter cet objet !`);
      return;
    }
    
    // Vérifier si le joueur a assez de monnaie
    if (currency[currencyType] < cost) {
      alert(`Pas assez de ${currencyType === 'gold' ? 'pièces d\'or' : 'gemmes'} !`);
      return;
    }
    
    // Utiliser la fonction buyItem du contexte
    const success = buyItem(item.id, cost, currencyType);
    
    if (success) {
      alert(`${item.name} acheté avec succès !`);
    } else {
      alert(`Erreur lors de l'achat de ${item.name}`);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#8c8c8c';
      case 'rare': return '#0066cc';
      case 'epic': return '#9933cc';
      case 'legendary': return '#ff6600';
      default: return '#8c8c8c';
    }
  };

  const categories = [
    { id: 'all', name: 'Tout', icon: '🛍️' },
    { id: 'weapon', name: 'Armes', icon: '⚔️' },
    { id: 'armor', name: 'Armures', icon: '🛡️' },
    { id: 'accessory', name: 'Accessoires', icon: '💍' },
    { id: 'consumable', name: 'Consommables', icon: '🧪' }
  ];

  return (
    <div className="shop-container">
      <div className="shop-header">
        <h1>🏪 Boutique de l'Aventurier</h1>
        <div className="currency-display">
          <div className="currency gold">
            <span className="currency-icon">🪙</span>
            <span className="currency-amount">{currency.gold}</span>
          </div>
          <div className="currency gems">
            <span className="currency-icon">💎</span>
            <span className="currency-amount">{currency.gems}</span>
          </div>
        </div>
      </div>

      <div className="shop-content">
        <div className="category-sidebar">
          <h3>Catégories</h3>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`category-button ${selectedCategory === category.id ? 'active' : ''}`}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
            </button>
          ))}
        </div>

        <div className="items-grid">
          {filteredItems.map(item => (
            <div 
              key={item.id} 
              className={`shop-item ${item.rarity}`}
              style={{ borderColor: getRarityColor(item.rarity) }}
            >
              <div className="item-header">
                <span className="item-sprite">{item.sprite}</span>
                <h3 className="item-name">{item.name}</h3>
                <span className="item-rarity" style={{ color: getRarityColor(item.rarity) }}>
                  {item.rarity.toUpperCase()}
                </span>
              </div>
              
              <p className="item-description">{item.description}</p>
              
              {item.stats && (
                <div className="item-stats">
                  <h4>Statistiques:</h4>
                  {Object.entries(item.stats).map(([stat, value]) => (
                    <div key={stat} className="stat-bonus">
                      {stat}: +{value}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="item-footer">
                <div className="level-requirement">
                  Niveau requis: {item.levelRequired}
                </div>
                
                <div className="purchase-options">
                  {item.price && (
                    <button
                      onClick={() => handlePurchase(item, false)}
                      className="purchase-button gold"
                      disabled={currency.gold < item.price}
                    >
                      🪙 {item.price}
                    </button>
                  )}
                  
                  {item.premiumPrice && (
                    <button
                      onClick={() => handlePurchase(item, true)}
                      className="purchase-button gems"
                      disabled={currency.gems < item.premiumPrice}
                    >
                      💎 {item.premiumPrice}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shop;
