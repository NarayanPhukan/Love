import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api'

export default function Profile({ onNavigate }) {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState({ totalEntries: 0, daysTogether: 0, photos: 0 })

  useEffect(() => {
    api.get('/profile/stats')
      .then(res => setStats(res.data))
      .catch(e => console.error('Stats load error:', e))
  }, [])

  const handleLogout = () => {
    if (confirm('Sign out of your diary?')) {
      logout()
    }
  }

  return (
    <div id="profile-view" className="dashboard-container" style={{ textAlign: 'center' }}>
      <div className="profile-header">
        <div className="profile-avatar-large">
          <div className="status-dot"></div>
        </div>
        <h2 className="profile-name headline">{user?.fullName || 'Gardener'}</h2>
        <p className="profile-role handwriting">Head Botanist</p>
        <p className="profile-member-since label-text" style={{ color: 'var(--pressed-sage)', marginTop: 8, textTransform: 'none' }}>
          Member since {new Date(user?.createdAt || Date.now()).getFullYear()}
        </p>
        <button className="hero-btn" style={{ marginTop: 24 }} onClick={() => onNavigate('profile-setup')}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>edit</span> Edit Garden Profile
        </button>
      </div>

      <div className="profile-divider"><span>Garden Stats</span></div>

      <div className="action-grid profile-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="action-card">
          <div className="action-icon-wrap" style={{ background: 'transparent', color: 'var(--ink-forest)', marginBottom: 0 }}>
            <span className="material-symbols-outlined">menu_book</span>
          </div>
          <div className="stat-number headline">{stats.totalEntries}</div>
          <div className="action-label" style={{ textTransform: 'none', fontWeight: 700 }}>Memories Planted</div>
        </div>
        <div className="action-card">
          <div className="action-icon-wrap" style={{ background: 'transparent', color: 'var(--ink-forest)', marginBottom: 0 }}>
            <span className="material-symbols-outlined">calendar_today</span>
          </div>
          <div className="stat-number headline">{stats.daysTogether || 0}</div>
          <div className="action-label" style={{ textTransform: 'none', fontWeight: 700 }}>Days Tending</div>
        </div>
        <div className="action-card">
          <div className="action-icon-wrap" style={{ background: 'transparent', color: 'var(--ink-forest)', marginBottom: 0 }}>
            <span className="material-symbols-outlined">eco</span>
          </div>
          <div className="stat-number headline">{stats.photos}</div>
          <div className="action-label" style={{ textTransform: 'none', fontWeight: 700 }}>Shared Blooms</div>
        </div>
      </div>

      <div className="profile-divider"><span>Personal Flora</span></div>
      <div className="flora-tags">
        <span className="flora-tag">Gratitude</span>
        <span className="flora-tag">Midnight Thoughts</span>
        <span className="flora-tag">Sunday Walks</span>
        <span className="flora-tag">Rainy Afternoons</span>
        <span className="flora-tag">Seedlings</span>
        <span className="flora-tag">Wanderlust</span>
      </div>

      <div className="profile-divider"><span>Recent Bloom</span></div>
      <div className="recent-bloom-card">
        <div className="rb-pin"><span className="material-symbols-outlined">push_pin</span></div>
        <div className="rb-photo"></div>
      </div>

      <button className="btn-secondary" style={{ marginTop: 64, borderColor: 'var(--petal-dust)', color: 'var(--pressed-sage)' }} onClick={handleLogout}>Sign Out</button>
    </div>
  )
}
