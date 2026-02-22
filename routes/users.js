const express = require('express');
const router = express.Router();
const { getAllUsers, toggleBlock, deleteUser, getStudents, getStudentDetail } = require('../controllers/usersController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', authorize('admin'), getAllUsers);
router.put('/:id/toggle-block', authorize('admin'), toggleBlock);
router.delete('/:id', authorize('admin'), deleteUser);
router.get('/students', authorize('tutor', 'admin'), getStudents);
router.get('/students/:id', authorize('tutor', 'admin'), getStudentDetail);

module.exports = router;
