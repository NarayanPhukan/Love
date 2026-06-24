import mongoose from 'mongoose'

const diaryEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  entryDate: {
    type: Date,
    required: true
  },
  mood: {
    type: String,
    enum: ['romantic', 'joyful', 'peaceful', 'special', 'emotional', null],
    default: null
  },
  flowerType: {
    type: String,
    enum: ['rose', 'sunflower', 'lily', 'orchid', 'jasmine', null],
    default: null
  },
  title: {
    type: String,
    default: ''
  },
  diaryText: {
    type: String,
    default: ''
  }
}, { timestamps: true })

const DiaryEntry = mongoose.model('DiaryEntry', diaryEntrySchema)
export default DiaryEntry
