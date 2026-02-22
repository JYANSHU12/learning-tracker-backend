const express = require('express');
const {
  getAllUsers,
  toggleBlockUser,
  deleteUser,
  getPlatformAnalytics
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/users', getAllUsers);
router.put('/users/:id/block', toggleBlockUser);
router.delete('/users/:id', deleteUser);
router.get('/analytics', getPlatformAnalytics);

module.exports = router;
