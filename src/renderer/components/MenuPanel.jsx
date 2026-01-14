import { useEffect, useState } from 'react';
import MenuHeader from './MenuHeader';
import ChatView from './ChatView';
import PanelLuca from './PanelLuca';

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
        {activeTab === 'Chat' ? <ChatView /> : <PanelLuca />}
      </div>
    </div>
  );
}
