import { useEffect, useState } from 'react';
import MenuHeader from './MenuHeader';

export default function MenuPanel({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('Chat');
  const [isAnimating, setIsAnimating] = useState(false);

  // Animacion de entrada/salida
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  // No renderizar si no esta abierto y termino la animacion
  if (!isOpen && !isAnimating) return null;

  return (
    <div
      className={`menu-panel ${isOpen ? 'open' : 'closing'}`}
      onAnimationEnd={() => {
        if (!isOpen) setIsAnimating(false);
      }}
    >
      <MenuHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onClose={onClose}
      />

      <div className="panel-content">
        {activeTab === 'Chat' ? (
          <div className="placeholder">
            <p>Vista Chat</p>
            <span>Proximamente...</span>
          </div>
        ) : (
          <div className="placeholder">
            <p>Panel LUCA</p>
            <span>Proximamente...</span>
          </div>
        )}
      </div>
    </div>
  );
}
