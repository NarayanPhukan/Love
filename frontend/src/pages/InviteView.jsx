import { useState, useEffect } from 'react'
import api from '../api'

export default function InviteView({ onNavigate }) {
  const [code, setCode] = useState('BLOOM-1234')

  useEffect(() => { loadCode() }, [])

  const loadCode = async () => {
    try {
      let { data: conn } = await api.get('/connections')
      if (!conn) {
        const res = await api.post('/connections')
        conn = res.data
      }
      setCode(conn.inviteCode || 'BLOOM-1234')
    } catch (e) { console.error(e) }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    alert('Code copied!')
  }

  const shareCode = () => {
    if (navigator.share) {
      navigator.share({ title: 'Join my Botanical Diary', text: `Join my garden with code: ${code}` }).catch(() => {})
    } else { alert(`Share this code: ${code}`) }
  }

  return (
    <div id="invite-view" className="dashboard-container" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <span className="material-symbols-outlined" style={{ position: 'absolute', top: -50, left: -100, fontSize: 400, color: 'var(--ink-forest)', opacity: 0.05, pointerEvents: 'none' }}>local_florist</span>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 48, position: 'relative', zIndex: 1 }}>
        <button className="icon-btn" onClick={() => onNavigate('home')}><span className="material-symbols-outlined">arrow_back</span></button>
        <h2 className="headline" style={{ fontSize: '1.5rem', margin: 0, flex: 1 }}>Invite to Your Garden</h2>
        <div style={{ width: 32 }}></div>
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <h1 className="headline" style={{ fontSize: '1.8rem', marginBottom: 16 }}>Share Your Sanctuary</h1>
        <p style={{ color: '#5C6B61', lineHeight: 1.6, marginBottom: 48, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
          Invite a trusted companion to witness the growth of your memories.
        </p>

        <div className="invite-code-card">
          <div className="label-text" style={{ color: '#8C6A66', marginBottom: 24, letterSpacing: '0.1em' }}>UNIQUE GARDEN CODE</div>
          <div className="headline" style={{ fontSize: '1.8rem', letterSpacing: '0.2em', marginBottom: 32 }}>{code}</div>
          <button className="btn-secondary" onClick={copyCode} style={{ borderRadius: 24, padding: '12px 32px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>content_copy</span> Copy Code
          </button>
        </div>

        <div style={{ marginTop: 48, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
          <button className="btn-primary" onClick={shareCode} style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, borderRadius: 8, padding: 16, marginBottom: 16 }}>
            <span className="material-symbols-outlined">share</span> SHARE INVITE LINK
          </button>
          <button onClick={() => onNavigate('join')} style={{ marginTop: 24, background: 'transparent', border: 'none', color: 'var(--ink-forest)', fontFamily: 'var(--font-label)', letterSpacing: '0.1em', fontSize: '0.85rem', textDecoration: 'underline', cursor: 'pointer' }}>HAVE A CODE?</button>
        </div>
      </div>
    </div>
  )
}
