const User = require('../models/User');
const Goal = require('../models/Goal');
const StudySession = require('../models/StudySession');
const Feedback = require('../models/Feedback');

exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, total, data: users });
  } catch (error) {
    next(error);
  }
};

exports.toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot block admin users' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      data: { isBlocked: user.isBlocked }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete admin users' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getPlatformAnalytics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalTutors,
      totalGoals,
      totalSessions,
      blockedUsers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'tutor' }),
      Goal.countDocuments(),
      StudySession.countDocuments(),
      User.countDocuments({ isBlocked: true })
    ]);

    // Study sessions over last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dailyActivity = await StudySession.aggregate([
      { $match: { date: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          sessions: { $sum: 1 },
          totalMinutes: { $sum: '$duration' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top subjects
    const topSubjects = await StudySession.aggregate([
      {
        $group: {
          _id: '$subject',
          totalMinutes: { $sum: '$duration' },
          sessionCount: { $sum: 1 }
        }
      },
      { $sort: { totalMinutes: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        stats: { totalUsers, totalStudents, totalTutors, totalGoals, totalSessions, blockedUsers },
        dailyActivity,
        topSubjects
      }
    });
  } catch (error) {
    next(error);
  }
};
