import express from 'express'
import DiaryEntry from '../models/DiaryEntry.js'
import protect from '../middleware/auth.js'

const router = express.Router()

// GET /api/entries — list all entries for current user
router.get('/', protect, async (req, res) => {
  try {
    const entries = await DiaryEntry.find({ userId: req.user._id })
      .sort({ entryDate: -1 })
    res.json(entries)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// GET /api/entries/:id — get single entry
router.get('/:id', protect, async (req, res) => {
  try {
    const entry = await DiaryEntry.findOne({ _id: req.params.id, userId: req.user._id })
    if (!entry) return res.status(404).json({ message: 'Entry not found' })
    res.json(entry)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/entries — create entry
router.post('/', protect, async (req, res) => {
  try {
    const { entryDate, mood, flowerType, title, diaryText } = req.body
    if (!entryDate || !diaryText) {
      return res.status(400).json({ message: 'Date and diary text are required' })
    }

    const entry = await DiaryEntry.create({
      userId: req.user._id,
      entryDate,
      mood: mood || null,
      flowerType: flowerType || null,
      title: title || '',
      diaryText
    })

    res.status(201).json(entry)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// PUT /api/entries/:id — update entry
router.put('/:id', protect, async (req, res) => {
  try {
    const entry = await DiaryEntry.findOne({ _id: req.params.id, userId: req.user._id })
    if (!entry) return res.status(404).json({ message: 'Entry not found' })

    const { entryDate, mood, flowerType, title, diaryText } = req.body
    if (entryDate) entry.entryDate = entryDate
    if (mood !== undefined) entry.mood = mood || null
    if (flowerType !== undefined) entry.flowerType = flowerType || null
    if (title !== undefined) entry.title = title
    if (diaryText !== undefined) entry.diaryText = diaryText

    await entry.save()
    res.json(entry)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// DELETE /api/entries/:id — delete entry
router.delete('/:id', protect, async (req, res) => {
  try {
    const entry = await DiaryEntry.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
    if (!entry) return res.status(404).json({ message: 'Entry not found' })
    res.json({ message: 'Entry deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
