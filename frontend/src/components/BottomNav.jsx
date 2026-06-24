export default function BottomNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'home', icon: 'menu_book', label: 'JOURNAL' },
    { id: 'chat', icon: 'chat_bubble_outline', label: 'CHAT' },
    { id: 'garden', icon: 'local_florist', label: 'GARDEN' },
    { id: 'gallery', icon: 'collections', label: 'MEMORIES' },
  ]

  return (
    <div className="bottom-nav">
      {tabs.map(tab => (
        <div
          key={tab.id}
          className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="material-symbols-outlined nav-item-icon">{tab.icon}</span>
          <span className="nav-item-label">{tab.label}</span>
        </div>
      ))}
    </div>
  )
}
