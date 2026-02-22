const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 minute']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  notes: {
    type: String,
    maxlength: [300, 'Notes cannot exceed 300 characters']
  }
}, { timestamps: true });

studySessionSchema.index({ studentId: 1, date: -1 });
studySessionSchema.index({ studentId: 1, subject: 1 });

module.exports = mongoose.model('StudySession', studySessionSchema);
