const r    = require('express').Router();
const auth = require('../middleware/auth');
const c    = require('../controllers/progressController');
r.post('/complete-topic', auth, c.completeTopic);
r.post('/log-hours',      auth, c.logHours);
r.get('/revisions',       auth, c.getRevisions);
module.exports = r;
