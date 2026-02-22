const User = require('../models/User');
const StudySession = require('../models/StudySession');
const Goal = require('../models/Goal');

// @desc    Get all users (admin)
// @route   GET /api/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.name = { $regex: search, $options: 'i' };

    const skip = (page - 1) * limit;
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, count: users.length, total, totalPages: Math.ceil(total / limit), data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Block/unblock user (admin)
// @route   PUT /api/users/:id/toggle-block
// @access  Private (Admin)
exports.toggleBlock = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot block admin' });

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({ success: true, message: `User ${user.isBlocked ? 'blocked' : 'unblocked'}`, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (admin)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot delete admin' });

    await user.deleteOne();
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all students (tutor)
// @route   GET /api/users/students
// @access  Private (Tutor, Admin)
exports.getStudents = async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: students.length, data: students });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student detail with stats (tutor)
// @route   GET /api/users/students/:id
// @access  Private (Tutor, Admin)
exports.getStudentDetail = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id).select('-password');
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const goals = await Goal.find({ studentId: student._id });
    const sessions = await StudySession.find({ studentId: student._id });
    const totalStudyMinutes = sessions.reduce((acc, s) => acc + s.duration, 0);
    const completedGoals = goals.filter(g => g.status === 'completed').length;

    res.json({
      success: true,
      data: {
        student,
        stats: {
          totalGoals: goals.length,
          completedGoals,
          totalStudyMinutes,
          totalStudyHours: Math.round(totalStudyMinutes / 60 * 10) / 10
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
