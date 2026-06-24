import mongoose from 'mongoose'

const connectionSchema = new mongoose.Schema({
  inviteCode: {
    type: String,
    unique: true,
    required: true
  },
  userA: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userB: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'connected'],
    default: 'pending'
  }
}, { timestamps: true })

const Connection = mongoose.model('Connection', connectionSchema)
export default Connection
