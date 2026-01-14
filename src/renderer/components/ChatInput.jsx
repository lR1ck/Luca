import { useState, useRef, useEffect } from 'react';

export default function ChatInput({ onSend }) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize del textarea (max 5 lineas)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const maxHeight = 5 * 24; // 5 lineas * 24px aprox por linea
      const newHeight = Math.min(textareaRef.current.scrollHeight, maxHeight);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    // Enter sin Shift: enviar mensaje
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // Shift+Enter: permitir nueva linea (comportamiento por defecto)
  };

  const hasText = message.trim().length > 0;

  return (
    <div className="chat-input-container">
      <button className="input-button attach-button" disabled title="Adjuntar archivo (proximamente)">
        📎
      </button>

      <textarea
        ref={textareaRef}
        className="chat-textarea"
        placeholder="Escribe tu mensaje..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
      />

      <button
        className={`input-button send-button ${hasText ? 'active' : ''}`}
        onClick={handleSend}
        disabled={!hasText}
        title="Enviar mensaje"
      >
        ⚡
      </button>
    </div>
  );
}
