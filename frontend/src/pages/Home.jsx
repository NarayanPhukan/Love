import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api, { API_URL } from '../api'

export default function Home({ onNavigate }) {
  const { user } = useAuth()
  const [recentEntry, setRecentEntry] = useState(null)
  const [recentMedia, setRecentMedia] = useState(null)

  const displayName = user?.fullName || user?.email?.split('@')[0] || 'Gardener'

  useEffect(() => {
    // Fetch recent entry
    api.get('/entries')
      .then(res => {
        if (res.data.length > 0) {
          setRecentEntry(res.data[0])
          // Try to fetch media for this entry
          api.get(`/media/entry/${res.data[0]._id}`)
            .then(mediaRes => {
              const photos = mediaRes.data.filter(m => m.fileType === 'photo' || m.fileType === 'screenshot')
              if (photos.length > 0) setRecentMedia(photos[0])
            })
            .catch(() => {})
        }
      })
      .catch(e => console.error('Failed to load recent entry', e))
  }, [])

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good Morning'
    if (h < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  return (
    <div id="home-view" className="dashboard-container">
      <div className="dash-header">
        <div className="dash-welcome">Welcome Back</div>
        <div className="dash-name">{getGreeting()}, {displayName}</div>
      </div>

      <div className="hero-card">
        <span className="material-symbols-outlined hero-flower-mark">local_florist</span>
        <div className="hero-quote">"The heart is a secret garden, and today, it yearns to speak."</div>
        <div className="hero-question">What bloom captured your heart today?</div>
        <button className="hero-btn" onClick={() => onNavigate('entry-form')}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>edit_note</span> Tend your story
        </button>
      </div>

      <div className="section-header">
        <div className="section-title">Quick Tending</div>
      </div>
      <div className="action-grid">
        <div className="action-card" onClick={() => onNavigate('entry-form')}>
          <div className="action-icon-wrap"><span className="material-symbols-outlined">photo_camera</span></div>
          <div className="action-label">Plant A Memory</div>
        </div>
        <div className="action-card" onClick={() => onNavigate('chat')}>
          <div className="action-icon-wrap"><span className="material-symbols-outlined">menu_book</span></div>
          <div className="action-label">Whisper</div>
        </div>
        <div className="action-card" onClick={() => onNavigate('chat')}>
          <div className="action-icon-wrap"><span className="material-symbols-outlined">water_drop</span></div>
          <div className="action-label">Water Greenhouse</div>
        </div>
        <div className="action-card" onClick={() => onNavigate('join')}>
          <div className="action-icon-wrap"><span className="material-symbols-outlined">groups</span></div>
          <div className="action-label">Shared Roots</div>
        </div>
      </div>

      <div className="section-header" style={{ marginTop: 48 }}>
        <div className="section-title">Recent Petals</div>
        <a href="#" className="section-link" onClick={(e) => { e.preventDefault(); onNavigate('gallery') }}>
          View Garden <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_forward</span>
        </a>
      </div>
      
      {recentEntry ? (
        <div className="recent-petals-grid" onClick={() => onNavigate('garden')} style={{ cursor: 'pointer' }}>
          <div className="petal-photo-card">
            {recentMedia ? (
              <img className="petal-photo" src={recentMedia.fileUrl.startsWith('/') ? `${API_URL}${recentMedia.fileUrl}` : recentMedia.fileUrl} alt="Recent petal" />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'var(--blush-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--pressed-sage)', opacity: 0.5 }}>local_florist</span>
              </div>
            )}
          </div>
          <div className="petal-quote-card">
            <div className="quote-mark">"</div>
            <div className="quote-text">{recentEntry.diaryText.substring(0, 150)}{recentEntry.diaryText.length > 150 ? '...' : ''}</div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#8C6A66' }}>
          <p className="handwriting" style={{ fontSize: '1.2rem' }}>No memories planted yet.</p>
        </div>
      )}
    </div>
  )
}
