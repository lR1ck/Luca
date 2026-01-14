import { useEffect, useState } from 'react';

export default function Message({ message, isUser, timestamp }) {
  const [isVisible, setIsVisible] = useState(false);

  // Animacion fade-in + slide-up al montar
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  return (
    <div className={`message-wrapper ${isUser ? 'user' : 'ai'} ${isVisible ? 'visible' : ''}`}>
      <div className="message-content">
        {!isUser && <span className="message-avatar">🤖</span>}

        <div className={`message-bubble ${isUser ? 'user-bubble' : 'ai-bubble'}`}>
          {message}
        </div>

        {isUser && <span className="message-avatar">👤</span>}
      </div>

      {timestamp && (
        <div className={`message-timestamp ${isUser ? 'user-timestamp' : 'ai-timestamp'}`}>
          {timestamp}
        </div>
      )}
    </div>
  );
}
