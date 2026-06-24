import express from 'express'
import Connection from '../models/Connection.js'
import protect from '../middleware/auth.js'

const router = express.Router()

// GET /api/connections — get user's connection
router.get('/', protect, async (req, res) => {
  try {
    const conn = await Connection.findOne({
      $or: [{ userA: req.user._id }, { userB: req.user._id }]
    }).sort({ createdAt: -1 })

    res.json(conn)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/connections — create a connection (generate invite code)
router.post('/', protect, async (req, res) => {
  try {
    // Check if already has a connection
    const existing = await Connection.findOne({
      $or: [{ userA: req.user._id }, { userB: req.user._id }]
    })
    if (existing) return res.json(existing)

    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase()

    const conn = await Connection.create({
      userA: req.user._id,
      inviteCode
    })

    res.status(201).json(conn)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/connections/accept — accept invite code
router.post('/accept', protect, async (req, res) => {
  try {
    const { inviteCode } = req.body
    if (!inviteCode) return res.status(400).json({ message: 'Invite code is required' })

    const conn = await Connection.findOne({
      inviteCode: inviteCode.toUpperCase(),
      status: 'pending'
    })

    if (!conn) return res.status(404).json({ message: 'Invalid or expired invite code' })
    if (conn.userA.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot connect with yourself' })
    }

    conn.userB = req.user._id
    conn.status = 'connected'
    await conn.save()

    res.json(conn)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
