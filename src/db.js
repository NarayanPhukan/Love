import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null

// ========== AUTH ==========

export async function signUp(email, password, phone) {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { phone } }
  })
  if (error) throw error
  // If session exists, user was auto-confirmed (no email confirmation needed)
  return { ...data, autoConfirmed: !!data.session }
}

export async function verifyOtp(email, token) {
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' })
  if (error) throw error
  return data
}

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin
  })
  if (error) throw error
}

export async function logout() {
  await supabase.auth.signOut()
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function updateProfile(metadata) {
  const { data, error } = await supabase.auth.updateUser({
    data: metadata
  })
  if (error) throw error
  return data.user
}

// ========== RELATIONSHIP INFO ==========

export async function getRelationshipInfo() {
  const { data, error } = await supabase
    .from('relationship_info')
    .select('*')
    .maybeSingle()
  if (error) throw error
  return data
}

export async function saveRelationshipInfo(partnerName, startDate) {
  const user = await getUser()
  const { data, error } = await supabase
    .from('relationship_info')
    .upsert({ user_id: user.id, partner_name: partnerName, start_date: startDate }, { onConflict: 'user_id' })
    .select()
    .single()
  if (error) throw error
  return data
}

// ========== DIARY ENTRIES ==========

export async function getEntries() {
  const { data, error } = await supabase
    .from('diary_entries')
    .select('*')
    .order('entry_date', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getEntry(id) {
  const { data, error } = await supabase
    .from('diary_entries')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createEntry({ entry_date, mood, flower_type, title, diary_text }) {
  const user = await getUser()
  const { data, error } = await supabase
    .from('diary_entries')
    .insert({ user_id: user.id, entry_date, mood, flower_type, title, diary_text })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateEntry(id, fields) {
  const { data, error } = await supabase
    .from('diary_entries')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteEntry(id) {
  const { error } = await supabase
    .from('diary_entries')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ========== MEDIA ==========

export async function uploadMedia(file, entryId) {
  const { uploadToDrive } = await import('./gdrive.js')
  const user = await getUser()

  // Upload to Google Drive
  const driveResult = await uploadToDrive(file)

  const fileType = file.type.startsWith('image') ? 'photo'
    : file.type.startsWith('video') ? 'video'
    : file.type.startsWith('audio') ? 'audio'
    : 'screenshot'

  // Store metadata in Supabase
  const { data, error } = await supabase
    .from('media_attachments')
    .insert({
      entry_id: entryId,
      user_id: user.id,
      file_url: driveResult.directUrl,
      file_type: fileType,
      caption: driveResult.id  // store Drive file ID for reference
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getMediaForEntry(entryId) {
  const { data, error } = await supabase
    .from('media_attachments')
    .select('*')
    .eq('entry_id', entryId)
    .order('created_at')
  if (error) throw error
  return data || []
}

// ========== FUTURE LETTERS ==========

export async function getLetters() {
  const { data, error } = await supabase
    .from('future_letters')
    .select('*')
    .order('deliver_date')
  if (error) throw error
  return data || []
}

export async function createLetter(message, deliverDate) {
  const user = await getUser()
  const { data, error } = await supabase
    .from('future_letters')
    .insert({ user_id: user.id, message, deliver_date: deliverDate })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function openLetter(id) {
  const { data, error } = await supabase
    .from('future_letters')
    .update({ is_opened: true })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteLetter(id) {
  const { error } = await supabase
    .from('future_letters')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ========== STATS ==========

export async function getStats() {
  const entries = await getEntries()

  const { count: photoCount } = await supabase
    .from('media_attachments')
    .select('*', { count: 'exact', head: true })
    .eq('file_type', 'photo')

  const { count: videoCount } = await supabase
    .from('media_attachments')
    .select('*', { count: 'exact', head: true })
    .eq('file_type', 'video')

  const { count: audioCount } = await supabase
    .from('media_attachments')
    .select('*', { count: 'exact', head: true })
    .eq('file_type', 'audio')

  const { count: letterCount } = await supabase
    .from('future_letters')
    .select('*', { count: 'exact', head: true })

  const rel = await getRelationshipInfo()
  let daysTogether = 0
  if (rel?.start_date) {
    daysTogether = Math.floor((Date.now() - new Date(rel.start_date).getTime()) / 86400000)
  }

  return {
    daysTogether,
    totalEntries: entries.length,
    photos: photoCount || 0,
    videos: videoCount || 0,
    voiceNotes: audioCount || 0,
    letters: letterCount || 0
  }
}

// ========== CHAT ==========

// ========== CONNECTIONS ==========

export async function createConnection() {
  const user = await getUser()
  // Check if already has a connection
  const existing = await getConnection()
  if (existing) return existing

  const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase()
  const { data, error } = await supabase
    .from('connections')
    .insert({ user_a: user.id, invite_code: inviteCode })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function acceptConnection(inviteCode) {
  const user = await getUser()
  // Find the pending connection
  const { data: conn, error: findErr } = await supabase
    .from('connections')
    .select('*')
    .eq('invite_code', inviteCode.toUpperCase())
    .eq('status', 'pending')
    .maybeSingle()
  if (findErr) throw findErr
  if (!conn) throw new Error('Invalid or expired invite code')
  if (conn.user_a === user.id) throw new Error('Cannot connect with yourself')

  // Update connection to connected
  const { data, error } = await supabase
    .from('connections')
    .update({ user_b: user.id, status: 'connected' })
    .eq('id', conn.id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getConnection() {
  const user = await getUser()
  if (!user) return null
  const { data, error } = await supabase
    .from('connections')
    .select('*')
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .order('created_at', { ascending: false })
    .maybeSingle()
  if (error) throw error
  return data
}

export function getInviteLink(code) {
  return `${window.location.origin}?connect=${code}`
}

// ========== CHAT ==========

export async function getMessages(connectionId, limit = 50) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('connection_id', connectionId)
    .order('created_at', { ascending: true })
    .limit(limit)
  if (error) throw error
  return data || []
}

export async function sendMessage(connectionId, content, mediaUrl = null, mediaType = null) {
  const user = await getUser()
  const name = user.user_metadata?.phone ? user.email.split('@')[0] : user.email
  const { data, error } = await supabase
    .from('messages')
    .insert({
      user_id: user.id,
      sender_name: name,
      content,
      media_url: mediaUrl,
      media_type: mediaType,
      connection_id: connectionId
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function sendMediaMessage(connectionId, file) {
  const { uploadToDrive } = await import('./gdrive.js')
  const driveResult = await uploadToDrive(file)
  const type = file.type.startsWith('image') ? 'photo'
    : file.type.startsWith('video') ? 'video'
    : file.type.startsWith('audio') ? 'audio' : 'file'
  return sendMessage(connectionId, null, driveResult.directUrl, type)
}

export function subscribeToMessages(connectionId, callback) {
  return supabase
    .channel('messages')
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'messages',
      filter: `connection_id=eq.${connectionId}`
    }, payload => {
      callback(payload.new)
    })
    .subscribe()
}

export function unsubscribeFromMessages(channel) {
  supabase.removeChannel(channel)
}
