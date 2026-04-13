const User = require('../models/User');
const { calcBurnout } = require('../services/algorithmService');

// GET /api/user/profile
exports.getProfile = async (req, res) => {
  try {
    res.json(req.user.toSafeObject());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/user/update
exports.updateProfile = async (req, res) => {
  try {
    const allowed = ['name','goal','level','dailyHours','mode','onboarded'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true, runValidators: true }).select('-password');
    res.json(user.toSafeObject ? user.toSafeObject() : user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/user/weekly-hours
exports.updateWeeklyHours = async (req, res) => {
  try {
    const { dayIndex, hours } = req.body;
    const user = await User.findById(req.user._id);
    user.weeklyHours[dayIndex] = hours;
    user.burnoutLevel = calcBurnout(user.weeklyHours, Object.fromEntries(user.scores));
    user.updateStreak();
    await user.save();
    res.json({ weeklyHours: user.weeklyHours, burnoutLevel: user.burnoutLevel, streak: user.streak });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
