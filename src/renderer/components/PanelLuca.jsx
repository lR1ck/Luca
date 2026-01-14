import { useState } from 'react';
import StatusIndicator from './StatusIndicator';
import ActivityCard from './ActivityCard';
import QuickSettings from './QuickSettings';

export default function PanelLuca() {
  // Estados mock (después se conectarán al backend)
  const [status, setStatus] = useState('active'); // active, paused, error
  const [captureInterval, setCaptureInterval] = useState(3);
  const [observerMode, setObserverMode] = useState('silent'); // silent, proactive
  const [excludedApps, setExcludedApps] = useState([]);

  // Datos de actividad mock
  const activityData = {
    captures: 5,
    mostUsedApp: 'VSCode',
    lastQuestion: 'como hacer un for',
    activeTime: '2h 15m',
  };

  const handleTogglePause = () => {
    setStatus((prev) => (prev === 'active' ? 'paused' : 'active'));
  };

  const handleAddExcludedApp = (app) => {
    if (!excludedApps.includes(app)) {
      setExcludedApps([...excludedApps, app]);
    }
  };

  const handleRemoveExcludedApp = (app) => {
    setExcludedApps(excludedApps.filter((a) => a !== app));
  };

  const getStatusDescription = () => {
    switch (status) {
      case 'active':
        return 'Observando pantalla...';
      case 'paused':
        return 'Capturas en pausa';
      case 'error':
        return 'Error en el sistema';
      default:
        return 'Estado desconocido';
    }
  };

  return (
    <div className="panel-luca">
      <div className="panel-luca-content">
        {/* Estado */}
        <StatusIndicator
          status={status}
          description={getStatusDescription()}
          activeApp={status === 'active' ? activityData.mostUsedApp : null}
        />

        {/* Actividad */}
        <ActivityCard
          captures={activityData.captures}
          mostUsedApp={activityData.mostUsedApp}
          lastQuestion={activityData.lastQuestion}
          activeTime={activityData.activeTime}
        />

        {/* Configuración */}
        <QuickSettings
          captureInterval={captureInterval}
          onIntervalChange={setCaptureInterval}
          observerMode={observerMode}
          onModeChange={setObserverMode}
          excludedApps={excludedApps}
          onAddExcludedApp={handleAddExcludedApp}
          onRemoveExcludedApp={handleRemoveExcludedApp}
        />
      </div>

      {/* Botón de acción principal */}
      <div className="panel-luca-footer">
        <button
          className={`action-button ${status === 'active' ? 'pause' : 'resume'}`}
          onClick={handleTogglePause}
        >
          {status === 'active' ? 'Pausar capturas' : 'Reanudar capturas'}
        </button>
      </div>
    </div>
  );
}
