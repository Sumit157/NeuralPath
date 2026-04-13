const r    = require('express').Router();
const auth = require('../middleware/auth');
const c    = require('../controllers/quizController');
r.get('/questions/:topicId', auth, c.getQuiz);
r.post('/submit',            auth, c.submitQuiz);
module.exports = r;
