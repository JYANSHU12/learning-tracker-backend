const Feedback = require('../models/Feedback');
const User = require('../models/User');

exports.getFeedback = async (req, res, next) => {
  try {
    const query = req.user.role === 'student'
      ? { studentId: req.user._id }
      : { tutorId: req.user._id };

    const feedback = await Feedback.find(query)
      .populate('tutorId', 'name email')
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: feedback });
  } catch (error) {
    next(error);
  }
};

exports.createFeedback = async (req, res, next) => {
  try {
    const { studentId, comment, rating } = req.body;

    const student = await User.findOne({ _id: studentId, role: 'student' });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const feedback = await Feedback.create({
      tutorId: req.user._id,
      studentId,
      comment,
      rating
    });

    const populated = await feedback.populate(['tutorId', 'studentId'], 'name email');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

exports.getTutorStudents = async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student', isBlocked: false })
      .select('name email createdAt lastActivity');
    res.json({ success: true, data: students });
  } catch (error) {
    next(error);
  }
};

exports.getStudentStats = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const StudySession = require('../models/StudySession');
    const Goal = require('../models/Goal');

    const [sessions, goals] = await Promise.all([
      StudySession.find({ studentId }).sort({ date: -1 }).limit(10),
      Goal.find({ studentId })
    ]);

    const totalMinutes = sessions.reduce((acc, s) => acc + s.duration, 0);
    const completedGoals = goals.filter(g => g.status === 'completed').length;

    res.json({
      success: true,
      data: {
        totalStudyMinutes: totalMinutes,
        totalGoals: goals.length,
        completedGoals,
        recentSessions: sessions
      }
    });
  } catch (error) {
    next(error);
  }
};
