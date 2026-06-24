import { useState, useEffect } from 'react'
import api from '../api'

const FLOWERS = {
  rose: { emoji: '🌹', label: 'Rose · Romantic day' },
  sunflower: { emoji: '🌻', label: 'Sunflower · Joyful day' },
  lily: { emoji: '🪷', label: 'Lily · Peaceful day' },
  orchid: { emoji: '🌺', label: 'Orchid · Special memory' },
  jasmine: { emoji: '🌸', label: 'Jasmine · Late-night talk' },
}

export default function Garden() {
  const [entries, setEntries] = useState([])
  const [currentEntry, setCurrentEntry] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadEntries() }, [])

  const loadEntries = async () => {
    try {
      const { data } = await api.get('/entries')
      setEntries(data)
      if (data.length > 0) setCurrentEntry(data[0])
    } catch (e) {
      console.error('Failed to load entries:', e)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  if (loading) {
    return (
      <div className="dashboard-container" style={{ textAlign: 'center', paddingTop: 80 }}>
        <div className="handwriting" style={{ fontSize: '1.4rem' }}>🌿 Loading your garden...</div>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div id="diary-view" className="dashboard-container" style={{ background: 'var(--linen-surface)', minHeight: '100vh', paddingBottom: 120 }}>
        <div style={{ textAlign: 'center', paddingTop: 80 }}>
          <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: 'var(--pressed-sage)', marginBottom: 16 }}>local_florist</span>
          <h2 className="headline" style={{ fontSize: '2rem', marginBottom: 16 }}>Your Garden Awaits</h2>
          <p className="handwriting" style={{ fontSize: '1.4rem', color: '#8C6A66' }}>Plant your first memory to watch it bloom.</p>
        </div>
      </div>
    )
  }

  const entry = currentEntry || entries[0]
  const fl = FLOWERS[entry.flowerType] || { emoji: '🌿', label: 'A day to remember' }

  return (
    <div id="diary-view" className="dashboard-container" style={{ background: 'var(--linen-surface)', minHeight: '100vh', paddingBottom: 120, overflowX: 'hidden', position: 'relative' }}>
      <img src="https://images.unsplash.com/photo-1603531046184-a1df1649f872?q=80&w=300&auto=format&fit=crop" style={{ position: 'absolute', top: -20, right: -40, width: 180, height: 240, objectFit: 'cover', opacity: 0.8, transform: 'rotate(10deg)', filter: 'sepia(0.3) saturate(0.6)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', zIndex: 0, pointerEvents: 'none', border: '4px solid #fff', borderBottom: '24px solid #fff', mixBlendMode: 'multiply' }} alt="" />

      <div style={{ position: 'relative', zIndex: 1, paddingTop: 24 }}>
        <h1 className="headline" style={{ fontSize: '2.4rem', color: 'var(--ink-forest)', marginBottom: 8, lineHeight: 1.2, borderBottom: '1px solid rgba(47,79,62,0.15)', paddingBottom: 12, marginRight: 100 }}>
          {formatDate(entry.entryDate)} {entry.title ? `- ${entry.title}` : '- A Day in Bloom'}
        </h1>
        <p className="handwriting" style={{ fontSize: '1.4rem', color: '#8C6A66', lineHeight: 1.5, marginTop: 16, maxWidth: '90%' }}>
          {entry.diaryText || 'A collection of whispers, light, and the quiet moments between us.'}
        </p>

        {/* Flower Badge */}
        <div style={{ textAlign: 'center', margin: '32px 0' }}>
          <span style={{ fontSize: '3rem' }}>{fl.emoji}</span>
          <div className="label-text" style={{ color: '#8C6A66', marginTop: 8 }}>{fl.label}</div>
          {entry.mood && (
            <span style={{ background: 'var(--blush-light, #F4E8E1)', color: '#8C6A66', fontFamily: 'var(--font-label)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', padding: '6px 12px', borderRadius: 12, marginTop: 8, display: 'inline-block', textTransform: 'uppercase' }}>
              {entry.mood}
            </span>
          )}
        </div>

        {/* Sentiment Card */}
        <div style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderRadius: 16, padding: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.03)', marginBottom: 24, position: 'relative', border: '1px solid rgba(47,79,62,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span className="label-text" style={{ color: '#8C6A66', letterSpacing: '0.1em', fontSize: '0.75rem' }}>TOP SHARED SENTIMENT</span>
            <span className="material-symbols-outlined" style={{ color: 'rgba(140,106,102,0.2)', fontSize: '2rem' }}>favorite</span>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <span className="headline" style={{ fontSize: '3rem', color: 'var(--ink-forest)', opacity: 0.6, lineHeight: 0.8 }}>"</span>
            <p style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem', color: 'var(--ink-forest)', lineHeight: 1.5 }}>
              "There's a specific kind of peace in the way we talk about the future—like it's a garden we're already planting together."
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 24, gap: 16 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(47,79,62,0.1)' }}></div>
            <span style={{ background: 'var(--blush-light, #F4E8E1)', color: '#8C6A66', fontFamily: 'var(--font-label)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', padding: '6px 12px', borderRadius: 12 }}>NOSTALGIC & HOPEFUL</span>
          </div>
        </div>

        {/* Entry list */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <span className="material-symbols-outlined" style={{ color: '#8C6A66', fontSize: '1.4rem' }}>menu_book</span>
          <span className="label-text" style={{ color: 'var(--ink-forest)', letterSpacing: '0.1em' }}>ALL ENTRIES</span>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: 16, border: '1px solid rgba(47,79,62,0.05)', padding: 24, marginBottom: 32 }}>
          {entries.slice(0, 10).map((e, i) => (
            <div key={e._id} style={{ marginBottom: i < entries.length - 1 ? 24 : 0, cursor: 'pointer' }} onClick={() => setCurrentEntry(e)}>
              <div style={{ fontSize: '0.6rem', color: '#8C6A66', fontFamily: 'var(--font-label)', letterSpacing: '0.1em', marginBottom: 8 }}>
                {formatDate(e.entryDate)} {e.mood ? `• ${e.mood.toUpperCase()}` : ''}
              </div>
              <p className="handwriting" style={{ fontSize: '1.3rem', color: currentEntry?._id === e._id ? 'var(--ink-forest)' : '#8C6A66', lineHeight: 1.4, margin: 0 }}>
                {(FLOWERS[e.flowerType]?.emoji || '🌿') + ' '}{e.title || e.diaryText?.substring(0, 80) || 'Untitled entry'}
              </p>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 48 }}>
          <span style={{ background: 'rgba(47,79,62,0.06)', color: 'var(--ink-forest)', fontFamily: 'var(--font-label)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', padding: '8px 16px', borderRadius: 16 }}>#BOTANICALS</span>
          <span style={{ background: 'rgba(47,79,62,0.06)', color: 'var(--ink-forest)', fontFamily: 'var(--font-label)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', padding: '8px 16px', borderRadius: 16 }}>#AFTERNOON_LIGHT</span>
          <span style={{ background: 'rgba(47,79,62,0.06)', color: 'var(--ink-forest)', fontFamily: 'var(--font-label)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', padding: '8px 16px', borderRadius: 16 }}>#WHISPERS</span>
        </div>
      </div>
    </div>
  )
}
