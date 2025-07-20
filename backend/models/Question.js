const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
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
  type: {
    type: String,
    required: [true, 'Question type is required'],
    enum: ['objective', 'subjective']
  },
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
    maxlength: [1000, 'Question cannot exceed 1000 characters']
  },
  options: [{
    type: String,
    trim: true,
    maxlength: [200, 'Option cannot exceed 200 characters']
  }],
  correctAnswer: {
    type: String,
    required: [true, 'Correct answer is required'],
    trim: true,
    maxlength: [500, 'Answer cannot exceed 500 characters']
  },
  explanation: {
    type: String,
    trim: true,
    maxlength: [1000, 'Explanation cannot exceed 1000 characters']
  },
  points: {
    type: Number,
    required: [true, 'Points are required'],
    min: [1, 'Points must be at least 1'],
    max: [100, 'Points cannot exceed 100']
  },
  createdBy: {
    type: String,
    required: [true, 'Creator is required'],
    enum: ['ai', 'manual']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  aiMetadata: {
    model: String,
    prompt: String,
    generatedAt: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
questionSchema.index({ subject: 1, class: 1, difficulty: 1 });
questionSchema.index({ type: 1, isActive: 1 });
questionSchema.index({ createdBy: 1 });

// Validation for objective questions
questionSchema.pre('save', function(next) {
  if (this.type === 'objective') {
    if (!this.options || this.options.length < 2) {
      return next(new Error('Objective questions must have at least 2 options'));
    }
    if (!this.options.includes(this.correctAnswer)) {
      return next(new Error('Correct answer must be one of the provided options'));
    }
  }
  next();
});

module.exports = mongoose.model('Question', questionSchema);