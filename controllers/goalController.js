const Goal = require('../models/Goal');

exports.getGoals = async (req, res, next) => {
  try {
    const { status, subject, search, page = 1, limit = 10 } = req.query;
    const query = { studentId: req.user._id };

    if (status) query.status = status;
    if (subject) query.subject = { $regex: subject, $options: 'i' };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Goal.countDocuments(query);
    const goals = await Goal.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: goals
    });
  } catch (error) {
    next(error);
  }
};

exports.createGoal = async (req, res, next) => {
  try {
    const goal = await Goal.create({ ...req.body, studentId: req.user._id });
    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
};

exports.updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, studentId: req.user._id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    const updated = await Goal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

exports.deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, studentId: req.user._id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }
    res.json({ success: true, message: 'Goal deleted successfully' });
  } catch (error) {
    next(error);
  }
};
