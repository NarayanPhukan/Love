import './style.css'
import * as db from './db.js'
import { loadGoogleAuth, authorizeGoogle, isGoogleAuthed } from './gdrive.js'

const FLOWERS = {
  rose: { emoji: '🌹', label: 'Rose · Romantic day' },
  sunflower: { emoji: '🌻', label: 'Sunflower · Joyful day' },
  lily: { emoji: '🪷', label: 'Lily · Peaceful day' },
  orchid: { emoji: '🌺', label: 'Orchid · Special memory' },
  jasmine: { emoji: '🌸', label: 'Jasmine · Late-night talk' },
}
const MOODS = ['romantic','joyful','peaceful','special','emotional']

let currentEntries = []
let currentEntry = null

// ===== RENDER =====
document.querySelector('#app').innerHTML = `
<div id="landing-page">
  <div class="flowers-bg" id="flowers-bg"></div>
  <div class="diary-card">
    <h1 class="diary-card-title">The Botanical Diary of Us</h1>
    <p class="diary-card-quote">"Some people preserve flowers in books. We preserved moments."</p>
    <div class="divider"></div>
    <div class="auth-toggle">
      <button class="toggle-btn active" id="toggle-login">Login</button>
      <button class="toggle-btn" id="toggle-signup">Sign Up</button>
    </div>
    <div class="auth-form" id="login-form">
      <input type="email" id="login-email" class="auth-input" placeholder="Email" />
      <div class="pw-wrap"><input type="password" id="login-password" class="auth-input" placeholder="Password" /><button type="button" class="pw-toggle" data-target="login-password">👁️</button></div>
      <button id="login-btn" class="auth-btn">Open Our Diary</button>
      <button class="auth-back" id="forgot-btn">Forgot password?</button>
      <div class="auth-status" id="login-status"></div>
    </div>
    <div class="auth-form hidden" id="forgot-form">
      <p class="otp-hint">Enter your email to reset password</p>
      <input type="email" id="forgot-email" class="auth-input" placeholder="Email" />
      <button id="reset-btn" class="auth-btn">Send Reset Link</button>
      <button class="auth-back" id="forgot-back-btn">← back to login</button>
      <div class="auth-status" id="forgot-status"></div>
    </div>
    <div class="auth-form hidden" id="signup-form">
      <input type="email" id="signup-email" class="auth-input" placeholder="Email" />
      <input type="tel" id="signup-phone" class="auth-input" placeholder="Phone number" />
      <div class="pw-wrap"><input type="password" id="signup-password" class="auth-input" placeholder="Create a password" /><button type="button" class="pw-toggle" data-target="signup-password">👁️</button></div>
      <button id="signup-btn" class="auth-btn">Create Account</button>
      <div class="auth-status" id="signup-status"></div>
    </div>
    <div class="auth-form hidden" id="otp-form">
      <p class="otp-hint">We sent a code to your email</p>
      <input type="text" id="otp-input" class="auth-input" placeholder="Enter code" maxlength="8" />
      <button id="verify-btn" class="auth-btn">Verify & Enter</button>
      <div class="auth-status" id="otp-status"></div>
      <button class="auth-back" id="back-btn">← back</button>
    </div>
  </div>
</div>

<div id="main-app">
  <div class="sidebar">
    <div class="sidebar-title">Our Journey</div>
    <div class="timeline-vine" id="timeline"></div>
    <button class="new-entry-btn" id="new-entry-btn">+ New Entry</button>
  </div>
  <div class="center-content">
    <div class="nav-tabs">
      <button class="nav-tab active" data-target="chat-view">Chat</button>
      <button class="nav-tab" data-target="diary-view">Diary</button>
      <button class="nav-tab" data-target="stats-view">Stats</button>
      <button class="nav-tab" data-target="letters-view">Letters</button>
      <button class="nav-tab" id="logout-tab">Logout</button>
    </div>

    <!-- Chat View -->
    <div id="chat-view">
      <!-- Connection Setup (shown when not connected) -->
      <div id="connect-setup" class="connect-setup">
        <div class="connect-card">
          <div class="connect-icon">💕</div>
          <h2 class="connect-title">Connect with your love</h2>
          <p class="connect-sub">Share a connection link or enter one to start chatting privately</p>
          
          <button class="auth-btn" id="generate-link-btn">✨ Generate Connection Link</button>
          <div id="invite-link-box" class="invite-link-box hidden">
            <p class="invite-label">Share this link with your love:</p>
            <div class="invite-link-row">
              <input type="text" id="invite-link" class="auth-input" readonly />
              <button class="auth-btn btn-sm" id="copy-link-btn">📋 Copy</button>
            </div>
            <p class="invite-waiting">⏳ Waiting for them to connect...</p>
          </div>

          <div class="connect-divider"><span>or</span></div>

          <p class="connect-sub">Got a connection link?</p>
          <div class="invite-link-row">
            <input type="text" id="invite-code-input" class="auth-input" placeholder="Enter invite code" />
            <button class="auth-btn btn-sm" id="accept-link-btn">Connect</button>
          </div>
          <div class="auth-status" id="connect-status"></div>
        </div>
      </div>

      <!-- Chat (shown when connected) -->
      <div id="chat-connected" class="hidden">
        <div class="chat-container">
          <div class="chat-header">
            <div class="chat-header-avatar">🌸</div>
            <div class="chat-header-info">
              <span class="chat-header-name" id="chat-partner-name">My Love</span>
              <span class="chat-header-status">Connected 💕</span>
            </div>
            <button class="chat-header-action" id="chat-call-btn" title="Video call">📹</button>
          </div>
          <div class="chat-messages" id="chat-messages"></div>
          <div class="chat-input-bar">
            <button class="chat-icon-btn" id="chat-camera-btn" title="Camera">📷</button>
            <input type="file" id="chat-media-input" accept="image/*,video/*,audio/*" hidden />
            <div class="chat-input-wrap">
              <input type="text" id="chat-input" class="chat-text-input" placeholder="Message..." />
              <button class="chat-icon-btn chat-gallery-btn" id="chat-gallery-btn" title="Gallery">🖼️</button>
              <input type="file" id="chat-gallery-input" accept="image/*,video/*" hidden />
              <button class="chat-icon-btn chat-mic-btn" id="chat-mic-btn" title="Voice message">🎙️</button>
            </div>
            <button class="chat-send-btn" id="chat-send-btn">❤️</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Diary View -->
    <div id="diary-view" class="hidden"><div id="diary-content" class="diary-spread"><p class="empty-msg">Select an entry or create a new one</p></div></div>

    <!-- New/Edit Entry Form -->
    <div id="entry-form-view" class="hidden">
      <div class="entry-form glass-form">
        <h2 class="form-title">New Entry</h2>
        <input type="date" id="ef-date" class="auth-input" />
        <select id="ef-mood" class="auth-input"><option value="">Mood...</option>${MOODS.map(m=>`<option value="${m}">${m}</option>`).join('')}</select>
        <select id="ef-flower" class="auth-input"><option value="">Flower...</option>${Object.entries(FLOWERS).map(([k,v])=>`<option value="${k}">${v.emoji} ${v.label}</option>`).join('')}</select>
        <input type="text" id="ef-title" class="auth-input" placeholder="Title" />
        <textarea id="ef-text" class="auth-input textarea" placeholder="Write your heart out..." rows="6"></textarea>
        <input type="file" id="ef-media" class="auth-input" accept="image/*,video/*,audio/*" multiple />
        <div class="form-actions">
          <button id="ef-save" class="auth-btn">Save Entry</button>
          <button id="ef-cancel" class="auth-btn btn-outline">Cancel</button>
        </div>
        <div class="auth-status" id="ef-status"></div>
      </div>
    </div>

    <!-- Stats View -->
    <div id="stats-view" class="hidden">
      <div class="stats-grid" id="stats-grid"></div>
      <div class="empty-pages">"These pages are empty because we haven't lived them yet."</div>
    </div>

    <!-- Letters View -->
    <div id="letters-view" class="hidden">
      <div class="letters-header">
        <h2>Future Letters 💌</h2>
        <button class="auth-btn btn-sm" id="new-letter-btn">+ Write Letter</button>
      </div>
      <div id="letter-form" class="hidden entry-form glass-form" style="margin-bottom:24px;">
        <textarea id="lf-msg" class="auth-input textarea" placeholder="Write a letter to the future..." rows="4"></textarea>
        <input type="date" id="lf-date" class="auth-input" />
        <div class="form-actions">
          <button id="lf-save" class="auth-btn btn-sm">Seal & Send</button>
          <button id="lf-cancel" class="auth-btn btn-outline btn-sm">Cancel</button>
        </div>
      </div>
      <div id="letters-list"></div>
    </div>
  </div>

  <div class="right-panel">
    <h3 class="sidebar-title">Media</h3>
    <div id="media-panel"><p class="empty-msg">Select an entry to see media</p></div>
  </div>
</div>
`

// ===== BG FLOWERS =====
const flowerEmojis = ['🌸','🌺','🌷','🌹','🌻','🌼','🪻','🌿','🍃','🪷']
const fbg = document.getElementById('flowers-bg')
for (let i = 0; i < 24; i++) {
  const s = document.createElement('span')
  s.className = 'bg-flower'
  s.textContent = flowerEmojis[Math.floor(Math.random() * flowerEmojis.length)]
  s.style.cssText = `font-size:${28+Math.random()*20}px;left:${Math.random()*100}%;top:${Math.random()*100}%;opacity:${0.12+Math.random()*0.18};transform:rotate(${Math.random()*360}deg);`
  fbg.appendChild(s)
}

// ===== HELPERS =====
const $ = id => document.getElementById(id)
const setStatus = (id, msg, err=false) => { const e=$(id); e.textContent=msg; e.style.color=err?'#c45c5c':'var(--sage)' }
const showForm = id => ['login-form','signup-form','otp-form','forgot-form'].forEach(f => $(f).classList.toggle('hidden', f!==id))
const showView = id => ['chat-view','diary-view','entry-form-view','stats-view','letters-view'].forEach(f => $(f).classList.toggle('hidden', f!==id))

function formatDate(d) { return new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }) }

function unlockDiary(instant = false) {
  const l = $('landing-page'), m = $('main-app')
  if (instant) {
    l.style.display = 'none'
    m.style.display = 'flex'
    m.style.opacity = '1'
    loadApp()
  } else {
    l.style.opacity = '0'
    setTimeout(() => { l.style.display='none'; m.style.display='flex'; requestAnimationFrame(()=>m.style.opacity='1'); loadApp() }, 1000)
  }
}

// Check for existing session on page load
if (db.supabase) {
  db.supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) unlockDiary(true)
  })
}

// ===== AUTH =====
$('toggle-login').onclick = () => { $('toggle-login').classList.add('active'); $('toggle-signup').classList.remove('active'); showForm('login-form') }
$('toggle-signup').onclick = () => { $('toggle-signup').classList.add('active'); $('toggle-login').classList.remove('active'); showForm('signup-form') }

let signupEmail = ''

$('login-btn').onclick = async () => {
  const email=$('login-email').value.trim(), pw=$('login-password').value
  if (!email||!pw) return setStatus('login-status','Fill in all fields',true)
  if (!db.supabase) { unlockDiary(); return }
  $('login-btn').disabled=true; $('login-btn').textContent='Opening...'
  try { await db.login(email,pw); unlockDiary() }
  catch(e) { setStatus('login-status',e.message,true) }
  finally { $('login-btn').disabled=false; $('login-btn').textContent='Open Our Diary' }
}

$('signup-btn').onclick = async () => {
  const email=$('signup-email').value.trim(), phone=$('signup-phone').value.trim(), pw=$('signup-password').value
  if (!email||!phone||!pw) return setStatus('signup-status','Fill in all fields',true)
  if (pw.length<6) return setStatus('signup-status','Password: 6+ characters',true)
  signupEmail = email
  if (!db.supabase) { showForm('otp-form'); setStatus('otp-status','Demo — enter any digits'); return }
  $('signup-btn').disabled=true; $('signup-btn').textContent='Sending...'
  try {
    const result = await db.signUp(email,pw,phone)
    if (result.autoConfirmed) { unlockDiary() }
    else { showForm('otp-form'); setStatus('otp-status',`Code sent to ${email}`) }
  }
  catch(e) { setStatus('signup-status',e.message,true) }
  finally { $('signup-btn').disabled=false; $('signup-btn').textContent='Create Account' }
}

// Forgot password
$('forgot-btn').onclick = () => showForm('forgot-form')
$('forgot-back-btn').onclick = () => showForm('login-form')
$('reset-btn').onclick = async () => {
  const email = $('forgot-email').value.trim()
  if (!email) return setStatus('forgot-status','Enter your email',true)
  if (!db.supabase) return setStatus('forgot-status','Demo mode',true)
  $('reset-btn').disabled=true; $('reset-btn').textContent='Sending...'
  try { await db.resetPassword(email); setStatus('forgot-status','Reset link sent! Check your email.') }
  catch(e) { setStatus('forgot-status',e.message,true) }
  finally { $('reset-btn').disabled=false; $('reset-btn').textContent='Send Reset Link' }
}

$('verify-btn').onclick = async () => {
  const token=$('otp-input').value.trim()
  if (!token) return setStatus('otp-status','Enter the code',true)
  if (!db.supabase) { unlockDiary(); return }
  try { await db.verifyOtp(signupEmail,token); unlockDiary() }
  catch(e) { setStatus('otp-status',e.message,true) }
}

$('back-btn').onclick = () => { showForm('signup-form'); $('otp-input').value='' }

// Password show/hide toggle
document.querySelectorAll('.pw-toggle').forEach(btn => {
  btn.onclick = () => {
    const input = $(btn.dataset.target)
    const isHidden = input.type === 'password'
    input.type = isHidden ? 'text' : 'password'
    btn.textContent = isHidden ? '🙈' : '👁️'
  }
})

// ===== TABS =====
document.querySelectorAll('.nav-tab[data-target]').forEach(t => {
  t.onclick = () => {
    document.querySelectorAll('.nav-tab').forEach(n=>n.classList.remove('active'))
    t.classList.add('active')
    showView(t.dataset.target)
    if (t.dataset.target === 'chat-view') loadChat()
    if (t.dataset.target === 'stats-view') loadStats()
    if (t.dataset.target === 'letters-view') loadLetters()
  }
})

$('logout-tab').onclick = async () => { if(db.supabase) await db.logout(); location.reload() }

// ===== LOAD APP =====
let chatChannel = null
async function loadApp() {
  loadGoogleAuth()
  if (!db.supabase) { renderEntries([]); return }
  try {
    currentEntries = await db.getEntries(); renderTimeline(); renderEntries(currentEntries)
    loadChat()
  }
  catch(e) { console.error(e) }
}

// ===== CHAT =====
let currentUserId = null
let currentConnectionId = null

async function loadChat() {
  if (!db.supabase) return
  try {
    const user = await db.getUser()
    currentUserId = user?.id

    // Check URL for invite code
    const urlParams = new URLSearchParams(window.location.search)
    const connectCode = urlParams.get('connect')
    if (connectCode) {
      // Remove code from URL
      window.history.replaceState({}, '', window.location.pathname)
      try {
        await db.acceptConnection(connectCode)
      } catch(e) {
        setStatus('connect-status', e.message, true)
      }
    }

    // Check for existing connection
    const conn = await db.getConnection()
    if (conn && conn.status === 'connected') {
      // Connected! Show chat
      currentConnectionId = conn.id
      $('connect-setup').classList.add('hidden')
      $('chat-connected').classList.remove('hidden')

      // Show partner name
      const rel = await db.getRelationshipInfo().catch(() => null)
      if (rel?.partner_name) $('chat-partner-name').textContent = rel.partner_name

      const messages = await db.getMessages(conn.id, 100)
      renderMessages(messages)
      if (chatChannel) db.unsubscribeFromMessages(chatChannel)
      chatChannel = db.subscribeToMessages(conn.id, msg => appendMessage(msg))
    } else if (conn && conn.status === 'pending') {
      // Waiting for partner
      $('connect-setup').classList.remove('hidden')
      $('chat-connected').classList.add('hidden')
      $('invite-link-box').classList.remove('hidden')
      $('invite-link').value = db.getInviteLink(conn.invite_code)
    } else {
      // No connection — show setup
      $('connect-setup').classList.remove('hidden')
      $('chat-connected').classList.add('hidden')
    }
  } catch(e) { console.error('Chat load error:', e) }
}

// Connection handlers
$('generate-link-btn').onclick = async () => {
  if (!db.supabase) return
  $('generate-link-btn').disabled = true
  $('generate-link-btn').textContent = 'Generating...'
  try {
    const conn = await db.createConnection()
    $('invite-link').value = db.getInviteLink(conn.invite_code)
    $('invite-link-box').classList.remove('hidden')
    $('generate-link-btn').classList.add('hidden')
  } catch(e) {
    setStatus('connect-status', e.message, true)
  } finally {
    $('generate-link-btn').disabled = false
    $('generate-link-btn').textContent = '✨ Generate Connection Link'
  }
}

$('copy-link-btn').onclick = () => {
  navigator.clipboard.writeText($('invite-link').value)
  $('copy-link-btn').textContent = '✅ Copied!'
  setTimeout(() => $('copy-link-btn').textContent = '📋 Copy', 2000)
}

$('accept-link-btn').onclick = async () => {
  let code = $('invite-code-input').value.trim()
  if (!code) return setStatus('connect-status', 'Enter an invite code', true)
  // Extract code from URL if pasted full link
  if (code.includes('connect=')) code = new URL(code).searchParams.get('connect')
  $('accept-link-btn').disabled = true
  $('accept-link-btn').textContent = 'Connecting...'
  try {
    await db.acceptConnection(code)
    setStatus('connect-status', '💕 Connected! Loading chat...')
    setTimeout(() => loadChat(), 1000)
  } catch(e) {
    setStatus('connect-status', e.message, true)
  } finally {
    $('accept-link-btn').disabled = false
    $('accept-link-btn').textContent = 'Connect'
  }
}

function renderMessages(messages) {
  const box = $('chat-messages')
  box.innerHTML = ''
  if (!messages.length) {
    box.innerHTML = '<div class="chat-empty"><div class="chat-empty-icon">💕</div><p>No messages yet</p><p class="chat-empty-sub">Say something beautiful to start your story</p></div>'
    return
  }
  let lastDate = ''
  messages.forEach((m, i) => {
    const msgDate = new Date(m.created_at).toLocaleDateString()
    if (msgDate !== lastDate) {
      lastDate = msgDate
      const sep = document.createElement('div')
      sep.className = 'chat-date-sep'
      const today = new Date().toLocaleDateString()
      const yesterday = new Date(Date.now() - 86400000).toLocaleDateString()
      sep.textContent = msgDate === today ? 'Today' : msgDate === yesterday ? 'Yesterday' : new Date(m.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      box.appendChild(sep)
    }
    appendMessage(m, false)
  })
  box.scrollTop = box.scrollHeight
}

function appendMessage(msg, scroll = true) {
  const box = $('chat-messages')
  const empty = box.querySelector('.chat-empty')
  if (empty) empty.remove()
  const isMine = msg.user_id === currentUserId
  
  const row = document.createElement('div')
  row.className = `chat-row ${isMine ? 'mine' : 'theirs'}`

  const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  let mediaHtml = ''
  if (msg.media_url) {
    if (msg.media_type === 'photo') mediaHtml = `<img src="${msg.media_url}" class="chat-media-img" alt="photo" onclick="window.open('${msg.media_url}','_blank')" />`
    else if (msg.media_type === 'video') mediaHtml = `<video src="${msg.media_url}" class="chat-media-img" controls></video>`
    else if (msg.media_type === 'audio') mediaHtml = `<audio src="${msg.media_url}" controls style="max-width:220px"></audio>`
    else mediaHtml = `<a href="${msg.media_url}" target="_blank" class="chat-file-link">📎 File</a>`
  }

  const isHeart = msg.content === '❤️' && !msg.media_url

  row.innerHTML = `
    ${!isMine ? '<div class="chat-avatar-sm">🌸</div>' : ''}
    <div class="chat-bubble ${isMine ? 'mine' : 'theirs'} ${isHeart ? 'heart-msg' : ''} ${msg.media_url ? 'has-media' : ''}">
      ${mediaHtml}
      ${msg.content ? `<p class="chat-text">${isHeart ? '<span class="big-heart">❤️</span>' : msg.content}</p>` : ''}
      <span class="chat-time">${time}</span>
    </div>
  `
  box.appendChild(row)
  if (scroll) box.scrollTop = box.scrollHeight
}

// Chat input — toggle send btn between heart and arrow
const chatInput = $('chat-input')
const chatSendBtn = $('chat-send-btn')
chatInput.oninput = () => {
  chatSendBtn.textContent = chatInput.value.trim() ? '➤' : '❤️'
  chatSendBtn.classList.toggle('has-text', !!chatInput.value.trim())
}

chatSendBtn.onclick = async () => {
  if (!currentConnectionId) return
  const text = chatInput.value.trim()
  if (!text) {
    try { await db.sendMessage(currentConnectionId, '❤️') } catch(e) { console.error(e) }
    return
  }
  chatInput.value = ''
  chatSendBtn.textContent = '❤️'
  chatSendBtn.classList.remove('has-text')
  try { await db.sendMessage(currentConnectionId, text) }
  catch(e) { console.error('Send error:', e) }
}

chatInput.onkeydown = (e) => { if (e.key === 'Enter' && chatInput.value.trim()) chatSendBtn.click() }

// Media handlers
$('chat-camera-btn').onclick = () => $('chat-media-input').click()
$('chat-gallery-btn').onclick = () => $('chat-gallery-input').click()

async function handleMediaUpload(e) {
  if (!currentConnectionId) return
  const file = e.target.files[0]
  if (!file) return
  const btn = e.target.previousElementSibling || $('chat-camera-btn')
  const origText = btn.textContent
  btn.textContent = '⏳'
  try { await db.sendMediaMessage(currentConnectionId, file) }
  catch(err) { console.error('Media send error:', err); alert('Failed to send: ' + err.message) }
  finally { btn.textContent = origText; e.target.value = '' }
}

$('chat-media-input').onchange = handleMediaUpload
$('chat-gallery-input').onchange = handleMediaUpload



// ===== TIMELINE =====
function renderTimeline() {
  const tl = $('timeline'); tl.innerHTML = ''
  currentEntries.slice(0, 12).forEach((entry, i) => {
    const node = document.createElement('div')
    node.className = 'timeline-node' + (i === 0 ? ' active' : '')
    node.style.top = i * 60 + 'px'
    const fl = FLOWERS[entry.flower_type]
    const label = document.createElement('div')
    label.className = 'timeline-label'
    label.textContent = (fl ? fl.emoji + ' ' : '') + formatDate(entry.entry_date)
    node.appendChild(label)
    node.onclick = () => viewEntry(entry.id)
    tl.appendChild(node)
  })
}

// ===== VIEW ENTRY =====
async function viewEntry(id) {
  const entry = currentEntries.find(e => e.id === id) || (db.supabase ? await db.getEntry(id) : null)
  if (!entry) return
  currentEntry = entry
  const fl = FLOWERS[entry.flower_type] || { emoji: '🌿', label: 'A day to remember' }
  const rel = db.supabase ? await db.getRelationshipInfo() : null
  let dayCount = ''
  if (rel?.start_date) { dayCount = `Day ${Math.floor((new Date(entry.entry_date) - new Date(rel.start_date)) / 86400000)} of Us` }

  $('diary-content').innerHTML = `
    <div class="diary-page left">
      <div class="diary-date">${formatDate(entry.entry_date)}</div>
      ${dayCount ? `<div class="diary-day-count">${dayCount}</div>` : ''}
      <div class="flower-badge">${fl.emoji}</div>
      <div class="flower-meaning">${fl.label}</div>
      ${entry.mood ? `<div class="mood-tag">${entry.mood}</div>` : ''}
    </div>
    <div class="diary-page right">
      ${entry.title ? `<h3 class="entry-title">${entry.title}</h3>` : ''}
      <p class="diary-text">${(entry.diary_text||'').replace(/\n/g,'<br>')}</p>
      <div class="entry-actions">
        <button class="btn-icon" id="edit-entry-btn">✏️ Edit</button>
        <button class="btn-icon danger" id="delete-entry-btn">🗑️ Delete</button>
      </div>
    </div>
  `
  showView('diary-view')
  $('edit-entry-btn').onclick = () => openEditForm(entry)
  $('delete-entry-btn').onclick = () => deleteEntryHandler(entry.id)

  // Load media
  if (db.supabase) {
    const media = await db.getMediaForEntry(entry.id)
    renderMedia(media)
  }
}

function renderMedia(media) {
  const mp = $('media-panel')
  if (!media.length) { mp.innerHTML = '<p class="empty-msg">No media yet</p>'; return }
  mp.innerHTML = media.map(m => {
    if (m.file_type === 'photo') return `<div class="polaroid"><img src="${m.file_url}" alt=""/>${m.caption?`<div class="polaroid-caption">${m.caption}</div>`:''}</div>`
    if (m.file_type === 'video') return `<video src="${m.file_url}" controls class="media-video"></video>`
    if (m.file_type === 'audio') return `<div class="audio-player"><div class="audio-flower-btn">▶</div><audio src="${m.file_url}" controls class="audio-el"></audio></div>`
    return ''
  }).join('')
}

function renderEntries(entries) {
  if (!entries.length) {
    $('diary-content').innerHTML = '<p class="empty-msg">Your diary is empty. Create your first entry! ✨</p>'
    return
  }
  viewEntry(entries[0].id)
}

// ===== NEW ENTRY =====
$('new-entry-btn').onclick = () => {
  $('ef-date').value = new Date().toISOString().split('T')[0]
  $('ef-mood').value = ''; $('ef-flower').value = ''; $('ef-title').value = ''; $('ef-text').value = ''
  $('ef-save').dataset.editId = ''
  document.querySelector('.form-title').textContent = 'New Entry'
  showView('entry-form-view')
}

function openEditForm(entry) {
  $('ef-date').value = entry.entry_date
  $('ef-mood').value = entry.mood || ''
  $('ef-flower').value = entry.flower_type || ''
  $('ef-title').value = entry.title || ''
  $('ef-text').value = entry.diary_text || ''
  $('ef-save').dataset.editId = entry.id
  document.querySelector('.form-title').textContent = 'Edit Entry'
  showView('entry-form-view')
}

$('ef-save').onclick = async () => {
  const data = { entry_date: $('ef-date').value, mood: $('ef-mood').value||null, flower_type: $('ef-flower').value||null, title: $('ef-title').value, diary_text: $('ef-text').value }
  if (!data.entry_date || !data.diary_text) return setStatus('ef-status','Date and text required',true)
  if (!db.supabase) { showView('diary-view'); return }
  $('ef-save').disabled = true
  try {
    const editId = $('ef-save').dataset.editId
    if (editId) { await db.updateEntry(editId, data) } else { const entry = await db.createEntry(data); const files = $('ef-media').files; for(const f of files) await db.uploadMedia(f, entry.id) }
    currentEntries = await db.getEntries(); renderTimeline(); renderEntries(currentEntries)
    showView('diary-view')
  } catch(e) { setStatus('ef-status', e.message, true) }
  finally { $('ef-save').disabled = false }
}

$('ef-cancel').onclick = () => showView('diary-view')

async function deleteEntryHandler(id) {
  if (!confirm('Delete this entry?')) return
  if (!db.supabase) return
  await db.deleteEntry(id)
  currentEntries = await db.getEntries(); renderTimeline(); renderEntries(currentEntries)
}

// ===== STATS =====
async function loadStats() {
  if (!db.supabase) { $('stats-grid').innerHTML = '<p class="empty-msg">Connect Supabase to see stats</p>'; return }
  const s = await db.getStats()
  $('stats-grid').innerHTML = [
    ['💕',s.daysTogether,'Days Together'], ['📖',s.totalEntries,'Diary Entries'], ['📸',s.photos,'Photos'],
    ['🎥',s.videos,'Videos'], ['🎙️',s.voiceNotes,'Voice Notes'], ['💌',s.letters,'Future Letters']
  ].map(([icon,val,label]) => `<div class="stat-card"><div class="stat-icon">${icon}</div><div class="stat-value">${val}</div><div class="stat-label">${label}</div></div>`).join('')
}

// ===== LETTERS =====
async function loadLetters() {
  if (!db.supabase) { $('letters-list').innerHTML = '<p class="empty-msg">Connect Supabase for letters</p>'; return }
  const letters = await db.getLetters()
  const today = new Date().toISOString().split('T')[0]
  $('letters-list').innerHTML = letters.length ? letters.map(l => {
    const canOpen = l.deliver_date <= today
    return `<div class="letter-card ${l.is_opened?'opened':'sealed'}">
      <div class="letter-date">📅 ${formatDate(l.deliver_date)}</div>
      ${l.is_opened ? `<p class="letter-msg">${l.message}</p>` : `<p class="letter-sealed">🔒 Sealed until ${formatDate(l.deliver_date)}</p>`}
      ${canOpen && !l.is_opened ? `<button class="auth-btn btn-sm open-letter-btn" data-id="${l.id}">Open Letter</button>` : ''}
      <button class="btn-icon danger delete-letter-btn" data-id="${l.id}">🗑️</button>
    </div>`
  }).join('') : '<p class="empty-msg">No future letters yet</p>'

  $('letters-list').querySelectorAll('.open-letter-btn').forEach(b => { b.onclick = async () => { await db.openLetter(b.dataset.id); loadLetters() } })
  $('letters-list').querySelectorAll('.delete-letter-btn').forEach(b => { b.onclick = async () => { if(confirm('Delete?')) { await db.deleteLetter(b.dataset.id); loadLetters() } } })
}

$('new-letter-btn').onclick = () => $('letter-form').classList.toggle('hidden')
$('lf-cancel').onclick = () => $('letter-form').classList.add('hidden')
$('lf-save').onclick = async () => {
  const msg=$('lf-msg').value, date=$('lf-date').value
  if (!msg||!date) return
  if (!db.supabase) return
  await db.createLetter(msg, date)
  $('lf-msg').value=''; $('lf-date').value=''; $('letter-form').classList.add('hidden')
  loadLetters()
}
