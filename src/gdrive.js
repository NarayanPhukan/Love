// Google Drive upload module
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY
const SCOPES = 'https://www.googleapis.com/auth/drive.file'

let tokenClient = null
let accessToken = null
let gisLoaded = false

// Load Google Identity Services script
export function loadGoogleAuth() {
  return new Promise((resolve) => {
    if (gisLoaded) { resolve(); return }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.onload = () => { gisLoaded = true; resolve() }
    document.head.appendChild(script)
  })
}

// Prompt user to sign in with Google (for Drive access)
export function authorizeGoogle() {
  return new Promise((resolve, reject) => {
    if (accessToken) { resolve(accessToken); return }
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (resp) => {
        if (resp.error) { reject(resp); return }
        accessToken = resp.access_token
        resolve(accessToken)
      }
    })
    tokenClient.requestAccessToken()
  })
}

export function isGoogleAuthed() { return !!accessToken }

// Upload a file to Google Drive, returns { id, webViewLink }
export async function uploadToDrive(file, folderName = 'BotanicalDiary') {
  const token = await authorizeGoogle()

  // Find or create the folder
  const folderId = await getOrCreateFolder(token, folderName)

  // Upload file using multipart upload
  const metadata = {
    name: `${Date.now()}_${file.name}`,
    parents: [folderId]
  }

  const form = new FormData()
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
  form.append('file', file)

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink,webContentLink', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form
  })

  if (!res.ok) throw new Error('Drive upload failed: ' + await res.text())
  const data = await res.json()

  // Make file viewable by anyone with the link
  await fetch(`https://www.googleapis.com/drive/v3/files/${data.id}/permissions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'reader', type: 'anyone' })
  })

  return {
    id: data.id,
    viewUrl: `https://drive.google.com/file/d/${data.id}/view`,
    directUrl: `https://drive.google.com/uc?id=${data.id}&export=view`
  }
}

// Find or create a folder in Drive
async function getOrCreateFolder(token, name) {
  // Search for existing folder
  const q = encodeURIComponent(`name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`)
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id)`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  const searchData = await searchRes.json()
  if (searchData.files?.length) return searchData.files[0].id

  // Create folder
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, mimeType: 'application/vnd.google-apps.folder' })
  })
  const folder = await createRes.json()
  return folder.id
}
