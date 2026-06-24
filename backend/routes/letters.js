import express from 'express'
import FutureLetter from '../models/FutureLetter.js'
import protect from '../middleware/auth.js'

const router = express.Router()

// GET /api/letters
router.get('/', protect, async (req, res) => {
  try {
    const letters = await FutureLetter.find({ userId: req.user._id })
      .sort({ deliverDate: 1 })
    res.json(letters)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/letters
router.post('/', protect, async (req, res) => {
  try {
    const { message, deliverDate } = req.body
    if (!message || !deliverDate) {
      return res.status(400).json({ message: 'Message and deliver date are required' })
    }

    const letter = await FutureLetter.create({
      userId: req.user._id,
      message,
      deliverDate
    })

    res.status(201).json(letter)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// PUT /api/letters/:id/open — open a letter
router.put('/:id/open', protect, async (req, res) => {
  try {
    const letter = await FutureLetter.findOne({ _id: req.params.id, userId: req.user._id })
    if (!letter) return res.status(404).json({ message: 'Letter not found' })

    letter.isOpened = true
    await letter.save()
    res.json(letter)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// DELETE /api/letters/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const letter = await FutureLetter.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
    if (!letter) return res.status(404).json({ message: 'Letter not found' })
    res.json({ message: 'Letter deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
