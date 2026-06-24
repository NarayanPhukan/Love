import { useState, useEffect } from 'react'
import api from '../api'

export default function Letters() {
  const [letters, setLetters] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')
  const [deliverDate, setDeliverDate] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadLetters() }, [])

  const loadLetters = async () => {
    try {
      const { data } = await api.get('/letters')
      setLetters(data)
    } catch (e) {
      console.error('Failed to load letters:', e)
    } finally { setLoading(false) }
  }

  const handleSave = async () => {
    if (!message || !deliverDate) return
    try {
      await api.post('/letters', { message, deliverDate })
      setMessage(''); setDeliverDate(''); setShowForm(false)
      loadLetters()
    } catch (e) {
      console.error('Failed to create letter:', e)
    }
  }

  const handleOpen = async (id) => {
    try {
      await api.put(`/letters/${id}/open`)
      loadLetters()
    } catch (e) {
      console.error('Failed to open letter:', e)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this letter?')) return
    try {
      await api.delete(`/letters/${id}`)
      loadLetters()
    } catch (e) {
      console.error('Failed to delete letter:', e)
    }
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const today = new Date().toISOString().split('T')[0]

  return (
    <div id="letters-view" className="dashboard-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h2 className="headline">Future Letters <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', fontSize: '1.8rem', color: 'var(--petal-dust)' }}>mail</span></h2>
        <button className="btn-primary" style={{ width: 'auto', margin: 0, padding: '12px 24px' }} onClick={() => setShowForm(!showForm)}>+ Write Letter</button>
      </div>

      {showForm && (
        <div className="entry-form glass-form" style={{ marginBottom: 24 }}>
          <div className="form-group">
            <div className="form-label-row"><label className="label-text">Message</label></div>
            <textarea className="input-field textarea" placeholder="Write a letter to the future..." rows="4" value={message} onChange={e => setMessage(e.target.value)}></textarea>
          </div>
          <div className="form-group">
            <div className="form-label-row"><label className="label-text">Delivery Date</label></div>
            <input type="date" className="input-field" value={deliverDate} onChange={e => setDeliverDate(e.target.value)} />
          </div>
          <div className="form-actions">
            <button className="btn-primary" onClick={handleSave}>Seal & Send</button>
            <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div id="letters-list">
        {loading && <p className="handwriting" style={{ textAlign: 'center', fontSize: '1.2rem' }}>Loading letters...</p>}
        {!loading && letters.length === 0 && <p className="handwriting" style={{ textAlign: 'center', fontSize: '1.2rem', color: '#8C6A66' }}>No future letters yet. Write one to your future self!</p>}
        {letters.map(l => {
          const canOpen = l.deliverDate?.split('T')[0] <= today
          return (
            <div key={l._id} className={`letter-card ${l.isOpened ? 'opened' : 'sealed'}`} style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 16, padding: 24, marginBottom: 16, backdropFilter: 'blur(8px)', border: '1px solid rgba(47,79,62,0.05)' }}>
              <div style={{ fontFamily: 'var(--font-label)', fontSize: '0.75rem', color: '#8C6A66', marginBottom: 8 }}>📅 {formatDate(l.deliverDate)}</div>
              {l.isOpened ? (
                <p className="handwriting" style={{ fontSize: '1.2rem', color: 'var(--ink-forest)' }}>{l.message}</p>
              ) : (
                <p className="handwriting" style={{ fontSize: '1.2rem', color: '#8C6A66' }}>🔒 Sealed until {formatDate(l.deliverDate)}</p>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                {canOpen && !l.isOpened && (
                  <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', fontSize: '0.75rem' }} onClick={() => handleOpen(l._id)}>Open Letter</button>
                )}
                <button className="btn-secondary" style={{ width: 'auto', padding: '8px 16px', fontSize: '0.75rem', color: '#c45c5c', borderColor: '#c45c5c' }} onClick={() => handleDelete(l._id)}>🗑️ Delete</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
