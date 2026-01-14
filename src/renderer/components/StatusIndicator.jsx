export default function StatusIndicator({ status, description, activeApp }) {
  const statusConfig = {
    active: { icon: '🟢', text: 'LUCA Activo', color: '#10B981' },
    paused: { icon: '🟡', text: 'LUCA En Pausa', color: '#F59E0B' },
    error: { icon: '🔴', text: 'LUCA Error', color: '#EF4444' },
  };

  const config = statusConfig[status] || statusConfig.active;

  return (
    <div className="status-indicator">
      <div className="status-header">
        <span className="status-icon">{config.icon}</span>
        <span className="status-text" style={{ color: config.color }}>
          {config.text}
        </span>
      </div>
      <div className="status-description">{description}</div>
      {activeApp && (
        <div className="status-app">
          App activa: <strong>{activeApp}</strong>
        </div>
      )}
    </div>
  );
}
