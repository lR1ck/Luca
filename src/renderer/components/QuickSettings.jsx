import { useState } from 'react';

export default function QuickSettings({
  captureInterval,
  onIntervalChange,
  observerMode,
  onModeChange,
  excludedApps,
  onAddExcludedApp,
  onRemoveExcludedApp,
}) {
  const [showAddApp, setShowAddApp] = useState(false);
  const [newApp, setNewApp] = useState('');

  const handleAddApp = () => {
    if (newApp.trim()) {
      onAddExcludedApp(newApp.trim());
      setNewApp('');
      setShowAddApp(false);
    }
  };

  return (
    <div className="quick-settings">
      <div className="settings-header">
        <span className="settings-icon">⚙️</span>
        <span className="settings-title">Configuracion Rapida</span>
      </div>

      {/* Slider - Intervalo de capturas */}
      <div className="setting-group">
        <label className="setting-label">Captura automatica</label>
        <div className="slider-container">
          <input
            type="range"
            min="1"
            max="10"
            value={captureInterval}
            onChange={(e) => onIntervalChange(Number(e.target.value))}
            className="slider"
          />
          <div className="slider-value">{captureInterval}s</div>
        </div>
        <div className="slider-track-fill" style={{ width: `${(captureInterval / 10) * 100}%` }} />
      </div>

      {/* Radio buttons - Modo observador */}
      <div className="setting-group">
        <label className="setting-label">Modo observador</label>
        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              name="mode"
              value="silent"
              checked={observerMode === 'silent'}
              onChange={(e) => onModeChange(e.target.value)}
            />
            <span className="radio-checkmark">
              {observerMode === 'silent' ? '✓' : ''}
            </span>
            <span className="radio-label">Silencioso</span>
          </label>

          <label className="radio-option">
            <input
              type="radio"
              name="mode"
              value="proactive"
              checked={observerMode === 'proactive'}
              onChange={(e) => onModeChange(e.target.value)}
            />
            <span className="radio-checkmark">
              {observerMode === 'proactive' ? '✓' : ''}
            </span>
            <span className="radio-label">Proactivo</span>
          </label>
        </div>
      </div>

      {/* Lista de apps excluidas */}
      <div className="setting-group">
        <label className="setting-label">Apps excluidas</label>
        <div className="excluded-apps-list">
          {excludedApps.length === 0 ? (
            <div className="no-excluded-apps">Ninguna app excluida</div>
          ) : (
            excludedApps.map((app, index) => (
              <div key={index} className="excluded-app-item">
                <span>{app}</span>
                <button
                  className="remove-app-btn"
                  onClick={() => onRemoveExcludedApp(app)}
                  title="Eliminar"
                >
                  ✕
                </button>
              </div>
            ))
          )}

          {showAddApp ? (
            <div className="add-app-input-container">
              <input
                type="text"
                className="add-app-input"
                placeholder="Nombre de la app..."
                value={newApp}
                onChange={(e) => setNewApp(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddApp();
                  if (e.key === 'Escape') {
                    setShowAddApp(false);
                    setNewApp('');
                  }
                }}
                autoFocus
              />
              <button className="add-app-confirm" onClick={handleAddApp}>
                ✓
              </button>
            </div>
          ) : (
            <button className="add-app-btn" onClick={() => setShowAddApp(true)}>
              + Agregar app...
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
