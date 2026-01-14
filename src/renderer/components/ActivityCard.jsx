export default function ActivityCard({ captures, mostUsedApp, lastQuestion, activeTime }) {
  return (
    <div className="activity-card">
      <div className="activity-header">
        <span className="activity-icon">📊</span>
        <span className="activity-title">Actividad</span>
      </div>

      <div className="activity-list">
        <div className="activity-item">
          <span className="activity-bullet">•</span>
          <span className="activity-text">
            <strong>{captures}</strong> capturas hoy
          </span>
        </div>

        {mostUsedApp && (
          <div className="activity-item">
            <span className="activity-bullet">•</span>
            <span className="activity-text">
              App mas usada: <strong>{mostUsedApp}</strong>
            </span>
          </div>
        )}

        {lastQuestion && (
          <div className="activity-item">
            <span className="activity-bullet">•</span>
            <div className="activity-text">
              <span>Ultima pregunta:</span>
              <span className="activity-question">"{lastQuestion}"</span>
            </div>
          </div>
        )}

        {activeTime && (
          <div className="activity-item">
            <span className="activity-bullet">•</span>
            <span className="activity-text">
              Tiempo activo: <strong>{activeTime}</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
