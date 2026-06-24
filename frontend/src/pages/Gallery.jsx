import { useState, useEffect } from 'react'
import api, { API_URL } from '../api'

export default function Gallery() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMedia()
  }, [])

  const loadMedia = async () => {
    try {
      const { data } = await api.get('/media/all')
      // Only show photos
      const images = data.filter(m => m.fileType === 'photo' || m.fileType === 'screenshot')
      setPhotos(images.map((m, i) => ({
        ...m,
        rotate: `${(i % 2 === 0 ? 1 : -1) * (1 + (i % 3))}deg` // alternate slight rotations
      })))
    } catch (e) {
      console.error('Failed to load media:', e)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'UNKNOWN'
    return new Date(dateStr).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }).toUpperCase()
  }

  return (
    <div id="gallery-view" className="dashboard-container" style={{ background: 'var(--linen-surface)', minHeight: '100vh', paddingBottom: 120, overflowX: 'hidden', position: 'relative' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', paddingTop: 40, marginBottom: 48 }}>
        <div style={{ display: 'inline-block', background: 'var(--blush-light, #F4E8E1)', color: '#8C6A66', fontFamily: 'var(--font-label)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', padding: '6px 16px', borderRadius: 16, marginBottom: 16 }}>
          A LIVING HEIRLOOM
        </div>
        <h1 className="headline" style={{ fontSize: '3rem', color: 'var(--ink-forest)', marginBottom: 16, lineHeight: 1.1 }}>Memories<br />Gallery</h1>
        <p style={{ fontFamily: 'var(--font-headline)', fontStyle: 'italic', fontSize: '1.1rem', color: 'var(--ink-forest)', opacity: 0.8, maxWidth: '80%', margin: '0 auto', lineHeight: 1.4 }}>
          "In every pressed petal and captured light, a fragment of the soul resides."
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 24, opacity: 0.6 }}>
          <div style={{ height: 1, width: 60, background: 'rgba(47,79,62,0.3)' }}></div>
          <span className="material-symbols-outlined" style={{ color: 'var(--ink-forest)', fontSize: '1.2rem' }}>local_florist</span>
          <div style={{ height: 1, width: 60, background: 'rgba(47,79,62,0.3)' }}></div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center' }} className="handwriting">Gathering memories...</div>
      ) : photos.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#8C6A66' }} className="handwriting">Your gallery is empty. Plant a memory first.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>
          {photos.map((photo, i) => {
            const url = photo.fileUrl.startsWith('/') ? `${API_URL}${photo.fileUrl}` : photo.fileUrl
            const dateStr = photo.entryId?.entryDate || photo.createdAt
            const caption = photo.caption || photo.entryId?.title || photo.entryId?.diaryText?.substring(0, 40) + '...' || 'A tender moment'
            return (
              <div key={photo._id || i} className="polaroid-card" style={{ background: '#fff', padding: '12px 12px 32px 12px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)', width: '85%', maxWidth: 320, textAlign: 'center', position: 'relative', transform: `rotate(${photo.rotate})`, transition: 'transform 0.3s ease' }}>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '1', marginBottom: 16 }}>
                  <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Memory" />
                  <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', color: '#fff', fontFamily: 'var(--font-label)', fontSize: '0.6rem', letterSpacing: '0.1em', padding: '4px 8px', borderRadius: 12 }}>{formatDate(dateStr)}</div>
                </div>
                <div className="handwriting" style={{ fontSize: '1.4rem', color: 'var(--ink-forest)', lineHeight: 1.4 }}>{caption}</div>
              </div>
            )
          })}
        </div>
      )}

      {/* FAB */}
      <button className="icon-btn" style={{ position: 'fixed', bottom: 100, right: 24, background: 'var(--ink-forest)', color: '#fff', width: 56, height: 56, boxShadow: '0 8px 24px rgba(47,79,62,0.3)', zIndex: 100, borderRadius: '50%' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '1.8rem' }}>add</span>
      </button>
    </div>
  )
}
