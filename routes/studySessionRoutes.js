const express = require('express');
const { getSessions, createSession, getAnalytics } = require('../controllers/studySessionController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('student'));

router.route('/')
  .get(getSessions)
  .post(createSession);

router.get('/analytics', getAnalytics);

module.exports = router;
