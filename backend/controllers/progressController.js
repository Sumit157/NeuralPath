const User = require('../models/User');
const { buildRevisionSchedule, calcBurnout } = require('../services/algorithmService');

// POST /api/progress/complete-topic
exports.completeTopic = async (req, res) => {
  try {
    const { topicId } = req.body;
    const user = await User.findById(req.user._id);

    if (!user.completedTopics.includes(topicId)) {
      user.completedTopics.push(topicId);
    }

    // Award badge for first topic
    if (user.completedTopics.length === 1 && !user.badges.includes('first_step')) {
      user.badges.push('first_step');
    }

    user.updateStreak();
    if (user.streak >= 7 && !user.badges.includes('streak_master')) {
      user.badges.push('streak_master');
    }

    await user.save();
    res.json({ completedTopics: user.completedTopics, streak: user.streak, badges: user.badges });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/progress/log-hours
exports.logHours = async (req, res) => {
  try {
    const { dayIndex, hours } = req.body;
    const user = await User.findById(req.user._id);
    if (dayIndex >= 0 && dayIndex <= 6) user.weeklyHours[dayIndex] = hours;
    user.burnoutLevel = calcBurnout(user.weeklyHours, Object.fromEntries(user.scores));
    user.updateStreak();
    await user.save();
    res.json({ weeklyHours: user.weeklyHours, burnoutLevel: user.burnoutLevel, streak: user.streak });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/progress/revisions
exports.getRevisions = async (req, res) => {
  try {
    const user      = req.user;
    const scoresObj = Object.fromEntries(user.scores || new Map());
    const revisions = buildRevisionSchedule(user.completedTopics, scoresObj);
    res.json({ revisions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
