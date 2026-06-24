import express from 'express'
import User from '../models/User.js'
import DiaryEntry from '../models/DiaryEntry.js'
import MediaAttachment from '../models/MediaAttachment.js'
import FutureLetter from '../models/FutureLetter.js'
import protect from '../middleware/auth.js'

const router = express.Router()

// PUT /api/profile — update profile
router.put('/', protect, async (req, res) => {
  try {
    const { fullName, location, avatarUrl, partnerName, relationshipStartDate } = req.body
    const user = await User.findById(req.user._id)

    if (fullName !== undefined) user.fullName = fullName
    if (location !== undefined) user.location = location
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl
    if (partnerName !== undefined) user.partnerName = partnerName
    if (relationshipStartDate !== undefined) user.relationshipStartDate = relationshipStartDate

    await user.save()

    res.json({
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      location: user.location,
      avatarUrl: user.avatarUrl,
      partnerName: user.partnerName,
      relationshipStartDate: user.relationshipStartDate
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// GET /api/profile/stats — get garden stats
router.get('/stats', protect, async (req, res) => {
  try {
    const totalEntries = await DiaryEntry.countDocuments({ userId: req.user._id })
    const photos = await MediaAttachment.countDocuments({ userId: req.user._id, fileType: 'photo' })
    const videos = await MediaAttachment.countDocuments({ userId: req.user._id, fileType: 'video' })
    const voiceNotes = await MediaAttachment.countDocuments({ userId: req.user._id, fileType: 'audio' })
    const letters = await FutureLetter.countDocuments({ userId: req.user._id })

    let daysTogether = 0
    if (req.user.relationshipStartDate) {
      daysTogether = Math.floor((Date.now() - new Date(req.user.relationshipStartDate).getTime()) / 86400000)
    }

    res.json({
      daysTogether,
      totalEntries,
      photos,
      videos,
      voiceNotes,
      letters
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
