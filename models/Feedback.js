const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comment: {
    type: String,
    required: [true, 'Comment is required'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  }
}, { timestamps: true });

feedbackSchema.index({ studentId: 1, createdAt: -1 });
feedbackSchema.index({ tutorId: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
