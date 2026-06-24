import mongoose from 'mongoose'

const mediaAttachmentSchema = new mongoose.Schema({
  entryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DiaryEntry',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['photo', 'video', 'audio', 'screenshot'],
    required: true
  },
  caption: {
    type: String,
    default: ''
  }
}, { timestamps: true })

const MediaAttachment = mongoose.model('MediaAttachment', mediaAttachmentSchema)
export default MediaAttachment
