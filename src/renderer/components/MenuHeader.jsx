export default function MenuHeader({ activeTab, onTabChange, onClose }) {
  const tabs = ['Chat', 'Panel LUCA'];

  return (
    <div className="menu-header">
      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            onClick={() => onTabChange(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <button className="close-button" onClick={onClose}>
        ✕
      </button>
    </div>
  );
}
