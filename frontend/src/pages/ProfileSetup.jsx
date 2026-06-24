import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api'

export default function ProfileSetup({ onDone }) {
  const { user, updateUser } = useAuth()
  const [name, setName] = useState(user?.fullName || '')
  const [location, setLocation] = useState(user?.location || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data } = await api.put('/profile', { fullName: name, location })
      updateUser(data)
      onDone()
    } catch (e) {
      alert('Failed to save profile.')
    } finally { setSaving(false) }
  }

  return (
    <div id="profile-setup-view" className="dashboard-container" style={{ background: 'var(--linen-surface)', minHeight: '100vh', paddingTop: 40, paddingBottom: 80, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 className="headline" style={{ fontSize: '2rem', color: 'var(--ink-forest)', marginBottom: 24 }}>Botanical Diary</h1>
        <h2 className="headline" style={{ fontSize: '1.8rem', marginBottom: 8 }}>Tending Your Profile</h2>
        <p className="handwriting" style={{ fontSize: '1.4rem', lineHeight: 1.4 }}>Every gardener leaves a unique mark upon the earth...</p>
      </div>

      <div style={{ background: '#fff', borderRadius: 24, padding: '40px 32px', width: '90%', maxWidth: 400, boxShadow: '0 12px 48px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden' }}>
        <span className="material-symbols-outlined" style={{ position: 'absolute', top: -24, right: -24, fontSize: '8rem', color: 'var(--pressed-sage)', opacity: 0.15, transform: 'rotate(45deg)', pointerEvents: 'none' }}>energy_savings_leaf</span>

        <div style={{ textAlign: 'center', marginBottom: 32, zIndex: 1, position: 'relative' }}>
          <div style={{ width: 120, height: 120, borderRadius: '50%', border: '2px dashed rgba(166,180,161,0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: 'var(--pressed-sage)' }}>local_florist</span>
            <span style={{ fontFamily: 'var(--font-label)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--pressed-sage)' }}>Plant a Photo</span>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 32 }}>
          <label className="headline" style={{ fontSize: '1.4rem', display: 'block', marginBottom: 8 }}>How shall we call you?</label>
          <input type="text" className="input-field" style={{ border: 'none', borderBottom: '1px solid rgba(47,79,62,0.3)', borderRadius: 0, padding: '12px 0', background: 'transparent' }} placeholder="E.g. Clara Thorne" value={name} onChange={e => setName(e.target.value)} />
        </div>

        <div className="form-group" style={{ marginBottom: 40 }}>
          <label className="headline" style={{ fontSize: '1.4rem', display: 'block', marginBottom: 8 }}>Your Rooted Location</label>
          <input type="text" className="input-field" style={{ border: 'none', borderBottom: '1px solid rgba(47,79,62,0.3)', borderRadius: 0, padding: '12px 0', background: 'transparent' }} placeholder="London, United Kingdom" value={location} onChange={e => setLocation(e.target.value)} />
        </div>

        <div style={{ textAlign: 'center' }}>
          <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ width: '100%', borderRadius: 24, padding: 16, marginBottom: 16 }}>
            {saving ? 'Planting...' : 'Enter the Garden'}
          </button>
          <button className="btn-secondary" onClick={onDone} style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>Skip for now</button>
        </div>
      </div>
    </div>
  )
}
