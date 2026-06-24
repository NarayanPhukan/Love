import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import MediaAttachment from '../models/MediaAttachment.js'
import protect from '../middleware/auth.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'))
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|mp4|webm|mov|mp3|wav|ogg|m4a/
    const ext = allowed.test(path.extname(file.originalname).toLowerCase())
    const mime = allowed.test(file.mimetype.split('/')[1])
    if (ext || mime) {
      cb(null, true)
    } else {
      cb(new Error('Unsupported file type'))
    }
  }
})

// POST /api/media/upload — upload media for an entry
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const { entryId, caption } = req.body
    if (!entryId) {
      return res.status(400).json({ message: 'Entry ID is required' })
    }

    const mime = req.file.mimetype
    let fileType = 'screenshot'
    if (mime.startsWith('image')) fileType = 'photo'
    else if (mime.startsWith('video')) fileType = 'video'
    else if (mime.startsWith('audio')) fileType = 'audio'

    const fileUrl = `/uploads/${req.file.filename}`

    const media = await MediaAttachment.create({
      entryId,
      userId: req.user._id,
      fileUrl,
      fileType,
      caption: caption || ''
    })

    res.status(201).json(media)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/media/chat-upload — upload media for chat
router.post('/chat-upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const mime = req.file.mimetype
    let fileType = 'file'
    if (mime.startsWith('image')) fileType = 'photo'
    else if (mime.startsWith('video')) fileType = 'video'
    else if (mime.startsWith('audio')) fileType = 'audio'

    const fileUrl = `/uploads/${req.file.filename}`

    res.status(201).json({ fileUrl, fileType })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// GET /api/media/all — get all media for the current user
router.get('/all', protect, async (req, res) => {
  try {
    const media = await MediaAttachment.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('entryId', 'entryDate diaryText')
    res.json(media)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// GET /api/media/entry/:entryId — get all media for an entry
router.get('/entry/:entryId', protect, async (req, res) => {
  try {
    const media = await MediaAttachment.find({
      entryId: req.params.entryId,
      userId: req.user._id
    }).sort({ createdAt: 1 })
    res.json(media)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// DELETE /api/media/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const media = await MediaAttachment.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    })
    if (!media) return res.status(404).json({ message: 'Media not found' })
    res.json({ message: 'Media deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
