import express from 'express'
import Message from '../models/Message.js'
import Connection from '../models/Connection.js'
import protect from '../middleware/auth.js'

const router = express.Router()

// GET /api/messages/:connectionId — get messages for a connection
router.get('/:connectionId', protect, async (req, res) => {
  try {
    // Verify user is part of this connection
    const conn = await Connection.findOne({
      _id: req.params.connectionId,
      $or: [{ userA: req.user._id }, { userB: req.user._id }],
      status: 'connected'
    })
    if (!conn) return res.status(403).json({ message: 'Not part of this connection' })

    const limit = parseInt(req.query.limit) || 100
    const messages = await Message.find({ connectionId: conn._id })
      .sort({ createdAt: 1 })
      .limit(limit)

    res.json(messages)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/messages — send a message (also emitted via Socket.IO in server.js)
router.post('/', protect, async (req, res) => {
  try {
    const { connectionId, content, mediaUrl, mediaType } = req.body

    // Verify user is part of this connection
    const conn = await Connection.findOne({
      _id: connectionId,
      $or: [{ userA: req.user._id }, { userB: req.user._id }],
      status: 'connected'
    })
    if (!conn) return res.status(403).json({ message: 'Not part of this connection' })

    const message = await Message.create({
      userId: req.user._id,
      senderName: req.user.fullName || req.user.email.split('@')[0],
      content: content || null,
      mediaUrl: mediaUrl || null,
      mediaType: mediaType || null,
      connectionId: conn._id
    })

    // Emit via Socket.IO (attached to req.app)
    const io = req.app.get('io')
    if (io) {
      io.to(`connection:${conn._id}`).emit('newMessage', message)
    }

    res.status(201).json(message)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
