import { useState, useRef } from 'react'
import api from '../api'

export default function JoinView({ onNavigate, onConnected }) {
  const [status, setStatus] = useState('')
  const [connecting, setConnecting] = useState(false)
  const codeRefs = useRef([])

  const handleKeyUp = (e, i) => {
    const val = e.target.value
    if (e.key !== 'Backspace' && val !== '') {
      if (i < 7) codeRefs.current[i + 1]?.focus()
    } else if (e.key === 'Backspace' && i > 0) {
      codeRefs.current[i - 1]?.focus()
    }
  }

  const handleConnect = async () => {
    const code = codeRefs.current.map(r => r?.value || '').join('')
    if (code.length < 8) { setStatus('Enter 8-character code'); return }
    setConnecting(true); setStatus('')
    try {
      await api.post('/connections/accept', { inviteCode: code })
      setStatus('Connected!')
      setTimeout(() => { if (onConnected) onConnected(); else onNavigate('chat') }, 1000)
    } catch (e) {
      setStatus(e.response?.data?.message || e.message)
    } finally { setConnecting(false) }
  }

  return (
    <div id="join-view" className="dashboard-container" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden', minHeight: '100vh', paddingBottom: 120 }}>
      <span className="material-symbols-outlined" style={{ position: 'absolute', top: '20%', left: -50, fontSize: 300, color: 'var(--ink-forest)', opacity: 0.04, pointerEvents: 'none', transform: 'rotate(15deg)' }}>eco</span>

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 48, position: 'relative', zIndex: 1 }}>
        <button className="icon-btn" onClick={() => onNavigate('home')}><span className="material-symbols-outlined">arrow_back</span></button>
        <h2 className="handwriting" style={{ fontSize: '1.8rem', margin: 0, flex: 1 }}>Botanical Diary</h2>
        <div style={{ width: 24 }}></div>
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="join-code-card">
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--ink-forest)', marginBottom: 16 }}>home</span>
          <h1 className="headline" style={{ fontSize: '2rem', marginBottom: 16 }}>Join a Greenhouse</h1>
          <p className="handwriting" style={{ fontSize: '1.4rem', color: '#5C6B61', lineHeight: 1.4, marginBottom: 32, maxWidth: 280, marginLeft: 'auto', marginRight: 'auto' }}>
            Enter the code shared with you to start growing your story together.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
            {[0,1,2,3,4,5,6,7].map(i => (
              <input key={i} type="text" maxLength="1" className="code-box" placeholder="•"
                ref={el => codeRefs.current[i] = el} onKeyUp={e => handleKeyUp(e, i)} />
            ))}
          </div>

          <p className="label-text" style={{ color: '#8C6A66', marginBottom: 32, letterSpacing: '0.05em', textTransform: 'none' }}>
            Codes are 8 characters long and expire after 24 hours
          </p>

          {status && <div className="label-text" style={{ color: status === 'Connected!' ? 'var(--ink-forest)' : '#c45c5c', marginBottom: 16 }}>{status}</div>}

          <button className="btn-primary" onClick={handleConnect} disabled={connecting} style={{ width: '100%', borderRadius: 8, padding: 16, marginBottom: 16 }}>
            {connecting ? 'Connecting...' : 'Connect'}
          </button>
        </div>
      </div>

      <div style={{ marginTop: 64, position: 'relative', zIndex: 1 }}>
        <div className="handwriting" style={{ fontSize: '1.6rem', marginBottom: 16 }}>Botanical Diary</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 24, fontFamily: 'var(--font-label)', fontWeight: 700, fontSize: '0.85rem', color: '#5C6B61' }}>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</a>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Security</a>
          <a href="#" style={{ color: 'inherit', textDecoration: 'underline' }}>Our Story</a>
        </div>
        <div style={{ color: '#8C6A66', fontSize: '0.75rem', fontFamily: 'var(--font-label)', fontWeight: 700, letterSpacing: '0.05em' }}>© 2024 Botanical Diary. A Living Heirloom.</div>
      </div>
    </div>
  )
}
