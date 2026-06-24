import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const MOODS = ['romantic', 'joyful', 'peaceful', 'special', 'emotional']
const FLOWERS = {
  rose: { emoji: '🌹', label: 'Rose · Romantic day' },
  sunflower: { emoji: '🌻', label: 'Sunflower · Joyful day' },
  lily: { emoji: '🪷', label: 'Lily · Peaceful day' },
  orchid: { emoji: '🌺', label: 'Orchid · Special memory' },
  jasmine: { emoji: '🌸', label: 'Jasmine · Late-night talk' },
}

export default function EntryForm({ editEntry, onDone }) {
  const [date, setDate] = useState(editEntry?.entryDate?.split('T')[0] || new Date().toISOString().split('T')[0])
  const [mood, setMood] = useState(editEntry?.mood || '')
  const [flower, setFlower] = useState(editEntry?.flowerType || '')
  const [title, setTitle] = useState(editEntry?.title || '')
  const [text, setText] = useState(editEntry?.diaryText || '')
  const [files, setFiles] = useState(null)
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!date || !text) { setStatus('Date and text required'); return }
    setSaving(true); setStatus('')
    try {
      const payload = {
        entryDate: date,
        mood: mood || null,
        flowerType: flower || null,
        title,
        diaryText: text
      }

      let entry
      if (editEntry?._id) {
        const { data } = await api.put(`/entries/${editEntry._id}`, payload)
        entry = data
      } else {
        const { data } = await api.post('/entries', payload)
        entry = data
      }

      // Upload media files
      if (files && files.length > 0) {
        for (const file of files) {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('entryId', entry._id)
          await api.post('/media/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        }
      }

      onDone()
    } catch (e) {
      setStatus(e.response?.data?.message || e.message)
    } finally { setSaving(false) }
  }

  return (
    <div id="entry-form-view">
      <div className="entry-form glass-form">
        <h2 className="auth-title headline">{editEntry ? 'Edit Entry' : 'New Entry'}</h2>
        <p className="auth-subtitle handwriting">Chronicle a new memory...</p>

        <div className="form-group">
          <div className="form-label-row"><label className="label-text">Date</label></div>
          <input type="date" className="input-field" value={date} onChange={e => setDate(e.target.value)} />
        </div>

        <div className="form-group" style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div className="form-label-row"><label className="label-text">Mood</label></div>
            <select className="input-field" value={mood} onChange={e => setMood(e.target.value)}>
              <option value="">Mood...</option>
              {MOODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <div className="form-label-row"><label className="label-text">Flower</label></div>
            <select className="input-field" value={flower} onChange={e => setFlower(e.target.value)}>
              <option value="">Flower...</option>
              {Object.entries(FLOWERS).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <div className="form-label-row"><label className="label-text">Title</label></div>
          <input type="text" className="input-field" placeholder="A day to remember" value={title} onChange={e => setTitle(e.target.value)} />
        </div>

        <div className="form-group">
          <div className="form-label-row"><label className="label-text">Story</label></div>
          <textarea className="input-field textarea" placeholder="Write your heart out..." rows="6" value={text} onChange={e => setText(e.target.value)}></textarea>
        </div>

        <div className="form-group">
          <div className="form-label-row"><label className="label-text">Media</label></div>
          <input type="file" className="input-field" accept="image/*,video/*,audio/*" multiple onChange={e => setFiles(e.target.files)} />
        </div>

        <div className="form-actions">
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Entry'}
          </button>
          <button className="btn-secondary" onClick={onDone}>Cancel</button>
        </div>
        {status && <div className="auth-status" style={{ marginTop: 12, color: '#c45c5c' }}>{status}</div>}
      </div>
    </div>
  )
}
