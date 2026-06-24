import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderName: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: null
  },
  mediaUrl: {
    type: String,
    default: null
  },
  mediaType: {
    type: String,
    enum: ['photo', 'video', 'audio', 'file', null],
    default: null
  },
  connectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Connection',
    required: true
  }
}, { timestamps: true })

const Message = mongoose.model('Message', messageSchema)
export default Message
