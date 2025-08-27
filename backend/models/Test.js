const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Test title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  class: {
    type: String,
    required: [true, 'Class is required'],
    enum: ['9th Grade', '10th Grade', '11th Grade', '12th Grade']
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty is required'],
    enum: ['easy', 'medium', 'hard']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  }],
  timeLimit: {
    type: Number,
    required: [true, 'Time limit is required'],
    min: [5, 'Time limit must be at least 5 minutes'],
    max: [180, 'Time limit cannot exceed 180 minutes']
  },
  totalPoints: {
    type: Number,
    required: [true, 'Total points is required'],
    min: [1, 'Total points must be at least 1']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  settings: {
    shuffleQuestions: {
      type: Boolean,
      default: false
    },
    shuffleOptions: {
      type: Boolean,
      default: false
    },
    showResults: {
      type: Boolean,
      default: true
    },
    allowReview: {
      type: Boolean,
      default: true
    },
    maxAttempts: {
      type: Number,
      default: 3,
      min: 3
    }
  },
  schedule: {
    startDate: Date,
    endDate: Date,
    timezone: {
      type: String,
      default: 'UTC'
    }
  }
}, {
  timestamps: true
});

// Indexes
testSchema.index({ subject: 1, class: 1, isActive: 1 });
testSchema.index({ createdBy: 1 });
testSchema.index({ 'schedule.startDate': 1, 'schedule.endDate': 1 });

// Virtual for question count
testSchema.virtual('questionCount').get(function() {
  return this.questions.length;
});

// Calculate total points from questions
testSchema.pre('save', async function(next) {
  if (this.isModified('questions')) {
    try {
      const Question = mongoose.model('Question');
      const questions = await Question.find({ _id: { $in: this.questions } });
      this.totalPoints = questions.reduce((total, q) => total + q.points, 0);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Test', testSchema);