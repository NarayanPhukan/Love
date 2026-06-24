import mongoose from 'mongoose'

const futureLetterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  deliverDate: {
    type: Date,
    required: true
  },
  isOpened: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

const FutureLetter = mongoose.model('FutureLetter', futureLetterSchema)
export default FutureLetter
