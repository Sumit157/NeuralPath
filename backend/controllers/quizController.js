const User  = require('../models/User');
const { buildRevisionSchedule } = require('../services/algorithmService');

const QUIZZES = {
  py:    [
    { q: 'What does `*args` allow in Python?', opts: ['Pass keyword args','Pass variable positional args','Multiply arguments','Create a list arg'], ans: 1 },
    { q: 'Which syntax creates a list comprehension?', opts: ['{}','()','[]','<>'], ans: 2 },
    { q: 'Output of `type({})`?', opts: ["<class 'dict'>",'dict','object','<>'], ans: 0 },
  ],
  math:  [
    { q: 'Dot product of [1,0] and [0,1]?', opts: ['0','1','-1','undefined'], ans: 0 },
    { q: 'What do eigenvalues represent?', opts: ['Matrix rank','Scaling factor of eigenvectors','Matrix inverse','Trace'], ans: 1 },
    { q: 'A matrix M is invertible when?', opts: ['det(M) = 0','det(M) ≠ 0','M is symmetric','Rank < n'], ans: 1 },
  ],
  stats: [
    { q: 'p-value < 0.05 typically means?', opts: ['Result is true','Reject null hypothesis','100% confident','Type II error'], ans: 1 },
    { q: 'Normal distribution is defined by?', opts: ['Mean & variance','Min & max','Median & IQR','Range & mode'], ans: 0 },
  ],
  ml:    [
    { q: 'Overfitting occurs when?', opts: ['Model underfits data','Model memorises training set','Loss is too high','Data is clean'], ans: 1 },
    { q: 'Which is NOT a supervised algorithm?', opts: ['SVM','K-Means','Linear Regression','Decision Tree'], ans: 1 },
    { q: 'Cross-validation purpose?', opts: ['Speed up training','Tune hyperparameters','Estimate generalisation','Reduce data'], ans: 2 },
  ],
  pandas: [
    { q: 'How to select a column in pandas?', opts: ['df[col]','df.col()','df->col','df::col'], ans: 0 },
    { q: 'What does `df.dropna()` do?', opts: ['Drops NaN rows','Fills NaN','Renames cols','Sorts values'], ans: 0 },
  ],
};

// GET /api/quiz/:topicId
exports.getQuiz = async (req, res) => {
  const { topicId } = req.params;
  const questions   = QUIZZES[topicId] || QUIZZES['py'];
  // Return without answers for security
  res.json({ questions: questions.map(({ q, opts }) => ({ q, opts })) });
};

// POST /api/quiz/submit
exports.submitQuiz = async (req, res) => {
  try {
    const { topicId, answers } = req.body;   // answers: array of selected option indices
    const questions = QUIZZES[topicId] || QUIZZES['py'];

    let correct = 0;
    answers.forEach((a, i) => { if (questions[i] && a === questions[i].ans) correct++; });
    const pct = Math.round((correct / questions.length) * 100);

    const user = await User.findById(req.user._id);
    user.scores.set(topicId, pct);

    if (pct >= 80 && !user.completedTopics.includes(topicId)) {
      user.completedTopics.push(topicId);
    }

    // Award quiz ace badge
    if (pct >= 90 && !user.badges.includes('quiz_ace')) {
      user.badges.push('quiz_ace');
    }

    user.updateStreak();
    await user.save();

    const scoresObj = Object.fromEntries(user.scores);
    const revisions = buildRevisionSchedule(user.completedTopics, scoresObj);

    res.json({
      score: pct,
      correct,
      total: questions.length,
      completedTopics: user.completedTopics,
      scores: scoresObj,
      revisions,
      badges: user.badges,
      adaptive: {
        action: pct >= 80 ? 'completed' : pct >= 60 ? 'revision_scheduled' : 'reinsertion_required',
        message:
          pct >= 80 ? `"${topicId}" marked complete. Revision in 14 days.` :
          pct >= 60 ? `Partial mastery. Revision scheduled in 7 days.` :
                      `Low score. Topic reinserted with extra resources.`,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
