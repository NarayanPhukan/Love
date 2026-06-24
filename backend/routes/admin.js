import express from 'express'
import User from '../models/User.js'
import DiaryEntry from '../models/DiaryEntry.js'
import MediaAttachment from '../models/MediaAttachment.js'
import FutureLetter from '../models/FutureLetter.js'
import ConnectionCode from '../models/ConnectionCode.js'
import protect from '../middleware/auth.js'

const router = express.Router()

const adminOnly = (req, res, next) => {
  if (req.user && req.user.email === 'developeruserr30@gmail.com') {
    next()
  } else {
    res.status(403).json({ message: 'Access denied: Developer Admin Only' })
  }
}

// GET /api/admin/stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const verifiedUsers = await User.countDocuments({ isVerified: true })
    const totalEntries = await DiaryEntry.countDocuments()
    const totalMedia = await MediaAttachment.countDocuments()
    const totalLetters = await FutureLetter.countDocuments()
    const totalConnections = await ConnectionCode.countDocuments()

    res.json({
      totalUsers,
      verifiedUsers,
      totalEntries,
      totalMedia,
      totalLetters,
      totalConnections
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// GET /api/admin/users
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password -verificationToken -resetToken').sort({ createdAt: -1 })
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
