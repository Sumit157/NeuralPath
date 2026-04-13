const r    = require('express').Router();
const auth = require('../middleware/auth');
const c    = require('../controllers/userController');
r.get('/profile',       auth, c.getProfile);
r.put('/update',        auth, c.updateProfile);
r.put('/weekly-hours',  auth, c.updateWeeklyHours);
module.exports = r;
