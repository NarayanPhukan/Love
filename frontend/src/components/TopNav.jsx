import { useAuth } from '../context/AuthContext'

export default function TopNav({ onMenuClick, onAvatarClick }) {
  return (
    <div className="app-top-nav">
      <div className="app-top-left">
        <button className="app-menu-btn" id="app-menu-btn" onClick={onMenuClick}>
          <span className="material-symbols-outlined">menu</span>
        </button>
        <span className="app-title">Botanical Diary</span>
      </div>
      <div className="app-top-right">
        <button className="app-action-btn">
          <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>push_pin</span>
        </button>
        <div
          className="app-avatar"
          id="app-avatar-btn"
          title="Profile"
          style={{ cursor: 'pointer' }}
          onClick={onAvatarClick}
        ></div>
      </div>
    </div>
  )
}
