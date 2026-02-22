const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  targetDate: {
    type: Date,
    required: [true, 'Target date is required']
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused'],
    default: 'active'
  }
}, { timestamps: true });

goalSchema.index({ studentId: 1, status: 1 });
goalSchema.index({ studentId: 1, subject: 1 });

module.exports = mongoose.model('Goal', goalSchema);
