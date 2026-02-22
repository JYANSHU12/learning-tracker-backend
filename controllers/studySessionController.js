const StudySession = require('../models/StudySession');
const User = require('../models/User');

exports.getSessions = async (req, res, next) => {
  try {
    const { startDate, endDate, subject, page = 1, limit = 20 } = req.query;
    const query = { studentId: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (subject) query.subject = { $regex: subject, $options: 'i' };

    const total = await StudySession.countDocuments(query);
    const sessions = await StudySession.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, total, data: sessions });
  } catch (error) {
    next(error);
  }
};

exports.createSession = async (req, res, next) => {
  try {
    const session = await StudySession.create({ ...req.body, studentId: req.user._id });
    
    // Update last activity
    await User.findByIdAndUpdate(req.user._id, { lastActivity: Date.now() });

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const now = new Date();

    // Weekly study hours (last 7 days)
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const weeklyData = await StudySession.aggregate([
      { $match: { studentId, date: { $gte: weekAgo } } },
      {
        $group: {
          _id: { $dayOfWeek: '$date' },
          totalMinutes: { $sum: '$duration' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Monthly trend (last 30 days)
    const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const monthlyData = await StudySession.aggregate([
      { $match: { studentId, date: { $gte: monthAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalMinutes: { $sum: '$duration' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

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

    res.json({
      success: true,
      data: { weeklyData, monthlyData, subjectData }
    });
  } catch (error) {
    next(error);
  }
};
