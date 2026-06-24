import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import api, { API_URL } from '../api'
import { io } from 'socket.io-client'

let socket = null

export default function Chat({ onNavigate }) {
  const { user } = useAuth()
  const [connection, setConnection] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const galleryInputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    loadChat()
    return () => {
      if (socket) { socket.disconnect(); socket = null }
    }
  }, [])

  useEffect(() => { scrollToBottom() }, [messages])

  const loadChat = async () => {
    try {
      const { data: conn } = await api.get('/connections')
      if (conn && conn.status === 'connected') {
        setConnection(conn)
        const { data: msgs } = await api.get(`/messages/${conn._id}?limit=100`)
        setMessages(msgs)

        // Connect socket
        if (!socket) {
          socket = io(API_URL)
          socket.emit('joinConnection', conn._id)
          socket.on('newMessage', (msg) => {
            setMessages(prev => {
              if (prev.some(m => m._id === msg._id)) return prev
              return [...prev, msg]
            })
          })
        }
      }
    } catch (e) {
      console.error('Chat load error:', e)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (content, mediaUrl = null, mediaType = null) => {
    if (!connection) return
    try {
      await api.post('/messages', {
        connectionId: connection._id,
        content,
        mediaUrl,
        mediaType
      })
    } catch (e) {
      console.error('Send error:', e)
    }
  }

  const handleSend = () => {
    const text = inputText.trim()
    if (!text) {
      sendMessage('❤️')
      return
    }
    setInputText('')
    sendMessage(text)
  }

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0]
    if (!file || !connection) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const { data } = await api.post('/media/chat-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      await sendMessage(null, data.fileUrl, data.fileType)
    } catch (err) {
      console.error('Media send error:', err)
      alert('Failed to send: ' + (err.response?.data?.message || err.message))
    }
    e.target.value = ''
  }

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr).toLocaleDateString()
    const today = new Date().toLocaleDateString()
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString()
    if (d === today) return 'Today'
    if (d === yesterday) return 'Yesterday'
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  // If not connected, show setup
  if (!loading && (!connection || connection.status !== 'connected')) {
    return (
      <div id="chat-view">
        <div className="connect-setup">
          <div className="connect-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('join')}>
            <div className="connect-icon" style={{ fontSize: '3rem', marginBottom: 16 }}>🌿</div>
            <h2 className="connect-title" style={{ fontFamily: 'var(--font-headline)', color: 'var(--ink-forest)', fontSize: '1.8rem', marginBottom: 8 }}>You haven't connected yet</h2>
            <p className="connect-sub" style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', color: '#8C6A66', textDecoration: 'underline', fontWeight: 600 }}>Click here to connect</p>
          </div>
        </div>
      </div>
    )
  }

  // Render messages grouped by date
  let lastDate = ''

  return (
    <div id="chat-view">
      <div id="chat-connected">
        <div className="chat-container">
          <div className="chat-header">
            <div className="chat-header-avatar"></div>
            <div className="chat-header-info">
              <span className="chat-header-name">{user?.partnerName || 'The Greenhouse'}</span>
              <span className="chat-header-status">GROWING SINCE MAY '24</span>
            </div>
            <button className="chat-header-action" title="Disappearing messages">
              <span className="material-symbols-outlined" style={{ fontSize: '1.3rem' }}>timer</span>
            </button>
            <button className="chat-header-action" title="More">
              <span className="material-symbols-outlined" style={{ fontSize: '1.3rem' }}>more_vert</span>
            </button>
          </div>

          <div className="chat-messages" id="chat-messages">
            {messages.length === 0 && (
              <div className="chat-empty">
                <div className="chat-empty-icon">💕</div>
                <p>No messages yet</p>
                <p className="chat-empty-sub">Say something beautiful to start your story</p>
              </div>
            )}
            {messages.map((msg, i) => {
              const msgDate = new Date(msg.createdAt).toLocaleDateString()
              let dateSep = null
              if (msgDate !== lastDate) {
                lastDate = msgDate
                dateSep = <div className="chat-date-sep" key={`date-${i}`}>{formatDate(msg.createdAt)}</div>
              }

              const isMine = msg.userId === user?._id
              const isHeart = msg.content === '❤️' && !msg.mediaUrl
              let mediaHtml = null
              if (msg.mediaUrl) {
                const url = msg.mediaUrl.startsWith('/') ? `${API_URL}${msg.mediaUrl}` : msg.mediaUrl
                if (msg.mediaType === 'photo') mediaHtml = <img src={url} className="chat-media-img" alt="photo" onClick={() => window.open(url, '_blank')} />
                else if (msg.mediaType === 'video') mediaHtml = <video src={url} className="chat-media-img" controls />
                else if (msg.mediaType === 'audio') mediaHtml = <audio src={url} controls style={{ maxWidth: 220 }} />
                else mediaHtml = <a href={url} target="_blank" rel="noreferrer" className="chat-file-link">📎 File</a>
              }

              return (
                <div key={msg._id || i}>
                  {dateSep}
                  <div className={`chat-row ${isMine ? 'mine' : 'theirs'}`}>
                    {!isMine && <div className="chat-avatar-sm"></div>}
                    <div className={`chat-bubble ${isMine ? 'mine' : 'theirs'} ${isHeart ? 'heart-msg' : ''} ${msg.mediaUrl ? 'has-media' : ''}`}>
                      {mediaHtml}
                      {msg.content && (
                        <p className="chat-text">
                          {isHeart ? <span className="big-heart">❤️</span> : msg.content}
                        </p>
                      )}
                      <span className="chat-time">{formatTime(msg.createdAt)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-bar">
            <button className="chat-icon-btn" title="Attach" onClick={() => fileInputRef.current?.click()}>
              <span className="material-symbols-outlined">add</span>
            </button>
            <input type="file" ref={fileInputRef} accept="image/*,video/*,audio/*" hidden onChange={handleMediaUpload} />
            <div className="chat-input-wrap">
              <input
                type="text"
                className="chat-text-input"
                placeholder="Whisper something..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && inputText.trim()) handleSend() }}
              />
              <button className="chat-icon-btn" title="Camera" onClick={() => galleryInputRef.current?.click()}>
                <span className="material-symbols-outlined">photo_camera</span>
              </button>
              <input type="file" ref={galleryInputRef} accept="image/*,video/*" hidden onChange={handleMediaUpload} />
              <button className="chat-icon-btn" title="Voice note">
                <span className="material-symbols-outlined">mic</span>
              </button>
            </div>
            <button className={`chat-send-btn ${inputText.trim() ? 'has-text' : ''}`} onClick={handleSend}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>
                {inputText.trim() ? 'send' : 'favorite'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
