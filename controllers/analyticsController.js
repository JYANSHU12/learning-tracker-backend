const StudySession = require('../models/StudySession');
const Goal = require('../models/Goal');
const User = require('../models/User');

// @desc    Get student analytics
// @route   GET /api/analytics/student
// @access  Private (Student)
exports.getStudentAnalytics = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const now = new Date();

    // Weekly study hours (last 7 days)
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const weeklySessions = await StudySession.aggregate([
      { $match: { studentId, date: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dayOfWeek: '$date' },
          totalMinutes: { $sum: '$duration' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData = days.map((day, i) => {
      const found = weeklySessions.find(s => s._id === i + 1);
      return { day, minutes: found ? found.totalMinutes : 0, hours: found ? Math.round(found.totalMinutes / 60 * 10) / 10 : 0 };
    });

    // Monthly progress (last 6 months)
    const sixMonthsAgo = new Date(now - 180 * 24 * 60 * 60 * 1000);
    const monthlySessions = await StudySession.aggregate([
      { $match: { studentId, date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: '$date' }, year: { $year: '$date' } },
          totalMinutes: { $sum: '$duration' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = monthlySessions.map(s => ({
      month: months[s._id.month - 1],
      year: s._id.year,
      hours: Math.round(s.totalMinutes / 60 * 10) / 10
    }));

    // Subject distribution
    const subjectData = await StudySession.aggregate([
      { $match: { studentId } },
      {
        $group: {
          _id: '$subject',
          totalMinutes: { $sum: '$duration' }
        }
      },
      { $sort: { totalMinutes: -1 } }
    ]);

    // Goal stats
    const goals = await Goal.find({ studentId });
    const goalStats = {
      total: goals.length,
      active: goals.filter(g => g.status === 'active').length,
      completed: goals.filter(g => g.status === 'completed').length,
      avgProgress: goals.length ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length) : 0
    };

    // Total stats
    const allSessions = await StudySession.find({ studentId });
    const totalMinutes = allSessions.reduce((acc, s) => acc + s.duration, 0);

    res.json({
      success: true,
      data: {
        weeklyData,
        monthlyData,
        subjectDistribution: subjectData.map(s => ({ subject: s._id, minutes: s.totalMinutes })),
        goalStats,
        totalStudyMinutes: totalMinutes,
        totalStudyHours: Math.round(totalMinutes / 60 * 10) / 10,
        totalSessions: allSessions.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get platform analytics (admin)
// @route   GET /api/analytics/admin
// @access  Private (Admin)
exports.getAdminAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTutors = await User.countDocuments({ role: 'tutor' });
    const totalGoals = await Goal.countDocuments();
    const completedGoals = await Goal.countDocuments({ status: 'completed' });
    const totalSessions = await StudySession.countDocuments();

    // New users last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    // Platform study hours by month (last 6 months)
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
    const platformMonthly = await StudySession.aggregate([
      { $match: { date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: '$date' }, year: { $year: '$date' } },
          totalMinutes: { $sum: '$duration' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    res.json({
      success: true,
      data: {
        totalUsers,
        totalStudents,
        totalTutors,
        totalGoals,
        completedGoals,
        totalSessions,
        newUsers,
        platformMonthly: platformMonthly.map(s => ({
          month: months[s._id.month - 1],
          year: s._id.year,
          hours: Math.round(s.totalMinutes / 60 * 10) / 10
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};
