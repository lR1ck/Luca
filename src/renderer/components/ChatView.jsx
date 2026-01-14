import { useState, useEffect, useRef } from 'react';
import Message from './Message';
import ChatInput from './ChatInput';

export default function ChatView() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll automatico al ultimo mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Mensajes de bienvenida al montar
  useEffect(() => {
    const welcomeMessages = [
      {
        id: 1,
        text: 'Hola, soy LUCA',
        isUser: false,
        timestamp: 'Hace 1 min',
      },
      {
        id: 2,
        text: '¿En que puedo ayudarte?',
        isUser: false,
        timestamp: 'Hace 1 min',
      },
    ];

    // Agregar mensajes con delay para animacion
    welcomeMessages.forEach((msg, index) => {
      setTimeout(() => {
        setMessages((prev) => [...prev, msg]);
      }, index * 300);
    });
  }, []);

  const handleSendMessage = (text) => {
    // Agregar mensaje del usuario
    const userMessage = {
      id: Date.now(),
      text,
      isUser: true,
      timestamp: 'Ahora',
    };

    setMessages((prev) => [...prev, userMessage]);

    // Simular respuesta de IA (typing indicator)
    setIsTyping(true);

    setTimeout(() => {
      const aiMessage = {
        id: Date.now() + 1,
        text: 'Entendido. Por ahora solo soy una UI de ejemplo, pero pronto podre ayudarte de verdad!',
        isUser: false,
        timestamp: 'Ahora',
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, aiMessage]);
    }, 1500);
  };

  return (
    <div className="chat-view">
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">💬</span>
            <p>Inicia una conversacion</p>
            <span className="empty-hint">LUCA esta listo para ayudarte</span>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <Message
                key={msg.id}
                message={msg.text}
                isUser={msg.isUser}
                timestamp={msg.timestamp}
              />
            ))}

            {isTyping && (
              <div className="typing-indicator">
                <span className="message-avatar">🤖</span>
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <ChatInput onSend={handleSendMessage} />
    </div>
  );
}
