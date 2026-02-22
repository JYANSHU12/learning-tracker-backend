const express = require('express');
const {
  getFeedback,
  createFeedback,
  getTutorStudents,
  getStudentStats
} = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorize('student', 'tutor'), getFeedback)
  .post(authorize('tutor'), createFeedback);

router.get('/students', authorize('tutor'), getTutorStudents);
router.get('/students/:studentId/stats', authorize('tutor'), getStudentStats);

module.exports = router;
