const mongoose = require('mongoose');

const testAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: [true, 'Test ID is required']
  },
  answers: {
    type: Map,
    of: String,
    default: new Map()
  },
  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: [0, 'Score cannot be negative']
  },
  totalPoints: {
    type: Number,
    required: [true, 'Total points is required'],
    min: [1, 'Total points must be at least 1']
  },
  percentage: {
    type: Number,
    required: [true, 'Percentage is required'],
    min: [0, 'Percentage cannot be negative'],
    max: [100, 'Percentage cannot exceed 100']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
  },
  timeSpent: {
    type: Number,
    required: [true, 'Time spent is required'],
    min: [0, 'Time spent cannot be negative']
  },
  tabSwitchCount: {
    type: Number,
    default: 0,
    min: [0, 'Tab switch count cannot be negative']
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  submittedAt: {
    type: Date
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  flagged: {
    type: Boolean,
    default: false
  },
  flagReason: {
    type: String
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  feedback: {
    type: String,
    maxlength: [1000, 'Feedback cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Indexes
testAttemptSchema.index({ userId: 1, testId: 1 });
testAttemptSchema.index({ testId: 1, createdAt: -1 });
testAttemptSchema.index({ userId: 1, createdAt: -1 });
testAttemptSchema.index({ percentage: -1 });

// Compound index for leaderboards
testAttemptSchema.index({ testId: 1, score: -1, timeSpent: 1 });

// Virtual for duration
testAttemptSchema.virtual('duration').get(function() {
  if (this.submittedAt && this.startedAt) {
    return Math.round((this.submittedAt - this.startedAt) / 1000); // in seconds
  }
  return null;
});

// Pre-save middleware to set submittedAt when completed
testAttemptSchema.pre('save', function(next) {
  if (this.isModified('isCompleted') && this.isCompleted && !this.submittedAt) {
    this.submittedAt = new Date();
  }
  next();
});

// Static method to get user's best attempt for a test
testAttemptSchema.statics.getBestAttempt = function(userId, testId) {
  return this.findOne({ userId, testId, isCompleted: true })
    .sort({ score: -1, timeSpent: 1 })
    .populate('testId', 'title subject');
};

// Static method to get leaderboard for a test
testAttemptSchema.statics.getLeaderboard = function(testId, limit = 10) {
  return this.find({ testId, isCompleted: true })
    .sort({ score: -1, timeSpent: 1 })
    .limit(limit)
    .populate('userId', 'name class')
    .populate('testId', 'title subject');
};

module.exports = mongoose.model('TestAttempt', testAttemptSchema);