import { useEffect, useState, useRef } from 'react';
import MenuPanel from './components/MenuPanel';
import './styles.css';

export default function App() {
  const [isHover, setIsHover] = useState(false);
  const [pulse, setPulse] = useState(1);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const appRef = useRef(null);

  // Animación idle: pulso suave cada 3 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((prev) => (prev === 1 ? 1.05 : 1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Resize de ventana cuando se abre/cierra el panel
  useEffect(() => {
    if (isPanelOpen) {
      // Panel abierto: 80px (bola) + 40px (padding) + 20px (gap) + 400px (panel) = 540px
      // Altura: 600px para el panel + 40px padding = 640px
      window.electron?.resizeWindow?.(540, 640);
    } else {
      // Panel cerrado: solo la bola (120x120px con padding)
      window.electron?.resizeWindow?.(120, 120);
    }
  }, [isPanelOpen]);

  // Click fuera del panel para cerrar
  useEffect(() => {
    if (!isPanelOpen) return;

    const handleClickOutside = (e) => {
      // Si el click es fuera del contenedor principal, cerrar panel
      if (appRef.current && !appRef.current.contains(e.target)) {
        setIsPanelOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPanelOpen]);

  // Calcular scale final: hover tiene prioridad sobre pulse
  const finalScale = isHover ? 1.1 : pulse;

  const handleBallClick = (e) => {
    e.stopPropagation();
    setIsPanelOpen(!isPanelOpen);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  return (
    <div className="app-container" ref={appRef}>
      <div
        className="ball"
        style={{ transform: `scale(${finalScale})` }}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        <span className="ball-icon" onClick={handleBallClick}>
          ⚡
        </span>
      </div>

      <MenuPanel isOpen={isPanelOpen} onClose={handleClosePanel} />
    </div>
  );
}
