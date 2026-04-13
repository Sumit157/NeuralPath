const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const RevisionSchema = new mongoose.Schema({
  topicId:  { type: String, required: true },
  name:     { type: String, required: true },
  daysLeft: { type: Number, default: 7 },
  score:    { type: Number, default: 0 },
  scheduledAt: { type: Date, default: Date.now },
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },

  // Onboarding / preferences
  goal:       { type: String, default: '' },
  level:      { type: String, enum: ['beginner','intermediate','advanced'], default: 'beginner' },
  dailyHours: { type: Number, default: 2, min: 0.5, max: 12 },
  mode:       { type: String, enum: ['fast','balanced','deep'], default: 'balanced' },
  onboarded:  { type: Boolean, default: false },

  // Progress
  completedTopics: { type: [String], default: [] },
  scores:          { type: Map, of: Number, default: {} },
  streak:          { type: Number, default: 0 },
  lastStudiedAt:   { type: Date },
  weeklyHours:     { type: [Number], default: [0,0,0,0,0,0,0] },
  revisions:       { type: [RevisionSchema], default: [] },
  burnoutLevel:    { type: Number, default: 0, min: 0, max: 100 },

  // Gamification
  badges: { type: [String], default: [] },
}, {
  timestamps: true,
});

// Hash password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
UserSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

// Strip password from toJSON
UserSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Update streak
UserSchema.methods.updateStreak = function () {
  const now   = new Date();
  const last  = this.lastStudiedAt;
  if (last) {
    const diff = Math.floor((now - last) / 86400000);
    if (diff === 1) this.streak += 1;
    else if (diff > 1) this.streak = 1;
    // diff === 0 → same day, no change
  } else {
    this.streak = 1;
  }
  this.lastStudiedAt = now;
};

module.exports = mongoose.model('User', UserSchema);
