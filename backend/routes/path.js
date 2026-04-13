const r    = require('express').Router();
const auth = require('../middleware/auth');
const c    = require('../controllers/pathController');
r.post('/generate',    auth, c.generatePath);
r.get('/topics',       auth, c.getAllTopics);
r.get('/topic/:id',    auth, c.getTopic);
module.exports = r;
