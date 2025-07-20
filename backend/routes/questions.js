const express = require('express');
const Joi = require('joi');
const Question = require('../models/Question');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const aiService = require('../services/aiService');

const router = express.Router();

// Validation schema
const questionSchema = Joi.object({
  subject: Joi.string().required(),
  class: Joi.string().valid('9th Grade', '10th Grade', '11th Grade', '12th Grade').required(),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').required(),
  type: Joi.string().valid('objective', 'subjective').required(),
  question: Joi.string().max(1000).required(),
  options: Joi.array().items(Joi.string().max(200)).when('type', {
    is: 'objective',
    then: Joi.array().items(Joi.string().max(200)).min(2).required(),
    otherwise: Joi.forbidden()
  }),
  correctAnswer: Joi.string().max(500).required(),
  explanation: Joi.string().max(1000).optional(),
  points: Joi.number().min(1).max(100).required(),
  createdBy: Joi.string().valid('ai', 'manual').required(),
  tags: Joi.array().items(Joi.string()).optional()
});

const generateSchema = Joi.object({
  subject: Joi.string().required(),
  class: Joi.string().valid('9th Grade', '10th Grade', '11th Grade', '12th Grade').required(),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').required(),
  type: Joi.string().valid('objective', 'subjective', 'mixed').required(),
  count: Joi.number().min(1).max(20).required(),
  topic: Joi.string().optional()
});

// @route   GET /api/questions
// @desc    Get all questions with filtering
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      subject,
      class: questionClass,
      difficulty,
      type,
      createdBy,
      page = 1,
      limit = 20,
      search
    } = req.query;

    // Build filter object
    const filter = { isActive: true };
    if (subject) filter.subject = subject;
    if (questionClass) filter.class = questionClass;
    if (difficulty) filter.difficulty = difficulty;
    if (type) filter.type = type;
    if (createdBy) filter.createdBy = createdBy;
    if (search) {
      filter.$or = [
        { question: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const questions = await Question.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Question.countDocuments(filter);

    res.json({
      questions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Questions fetch error:', error);
    res.status(500).json({ message: 'Server error fetching questions' });
  }
});

// @route   GET /api/questions/:id
// @desc    Get single question
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question || !question.isActive) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json(question);
  } catch (error) {
    console.error('Question fetch error:', error);
    res.status(500).json({ message: 'Server error fetching question' });
  }
});

// @route   POST /api/questions
// @desc    Create new question
// @access  Admin only
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { error, value } = questionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details[0].message
      });
    }

    const question = new Question(value);
    await question.save();

    res.status(201).json({
      message: 'Question created successfully',
      question
    });
  } catch (error) {
    console.error('Question creation error:', error);
    res.status(500).json({ message: 'Server error creating question' });
  }
});

// @route   PUT /api/questions/:id
// @desc    Update question
// @access  Admin only
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { error, value } = questionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details[0].message
      });
    }

    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { $set: value },
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json({
      message: 'Question updated successfully',
      question
    });
  } catch (error) {
    console.error('Question update error:', error);
    res.status(500).json({ message: 'Server error updating question' });
  }
});

// @route   DELETE /api/questions/:id
// @desc    Delete question (soft delete)
// @access  Admin only
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Question deletion error:', error);
    res.status(500).json({ message: 'Server error deleting question' });
  }
});

// @route   POST /api/questions/generate
// @desc    Generate questions using AI
// @access  Admin only
router.post('/generate', auth, adminAuth, async (req, res) => {
  try {
    const { error, value } = generateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details[0].message
      });
    }

    const generatedQuestions = await aiService.generateQuestions(value);

    // Save generated questions to database
    const savedQuestions = await Question.insertMany(generatedQuestions);

    res.status(201).json({
      message: `Generated ${savedQuestions.length} questions successfully`,
      questions: savedQuestions
    });
  } catch (error) {
    console.error('Question generation error:', error);
    res.status(500).json({
      message: 'Server error generating questions',
      error: error.message
    });
  }
});

// @route   GET /api/questions/subjects/list
// @desc    Get list of available subjects
// @access  Private
router.get('/subjects/list', auth, async (req, res) => {
  try {
    const subjects = await Question.distinct('subject', { isActive: true });
    res.json(subjects);
  } catch (error) {
    console.error('Subjects fetch error:', error);
    res.status(500).json({ message: 'Server error fetching subjects' });
  }
});

// @route   GET /api/questions/stats
// @desc    Get question statistics
// @access  Admin only
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const stats = await Question.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          bySubject: {
            $push: {
              subject: '$subject',
              count: 1
            }
          },
          byDifficulty: {
            $push: {
              difficulty: '$difficulty',
              count: 1
            }
          },
          byType: {
            $push: {
              type: '$type',
              count: 1
            }
          },
          byCreator: {
            $push: {
              createdBy: '$createdBy',
              count: 1
            }
          }
        }
      }
    ]);

    res.json(stats[0] || { total: 0 });
  } catch (error) {
    console.error('Question stats error:', error);
    res.status(500).json({ message: 'Server error fetching question statistics' });
  }
});

module.exports = router;