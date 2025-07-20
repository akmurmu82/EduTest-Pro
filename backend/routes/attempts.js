const express = require('express');
const Joi = require('joi');
const TestAttempt = require('../models/TestAttempt');
const Test = require('../models/Test');
const Question = require('../models/Question');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Validation schema
const attemptSchema = Joi.object({
  testId: Joi.string().required(),
  answers: Joi.object().pattern(Joi.string(), Joi.string()).required(),
  timeSpent: Joi.number().min(0).required(),
  tabSwitchCount: Joi.number().min(0).default(0)
});

// @route   POST /api/attempts
// @desc    Submit test attempt
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { error, value } = attemptSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: error.details[0].message 
      });
    }

    const { testId, answers, timeSpent, tabSwitchCount } = value;

    // Get test with questions
    const test = await Test.findById(testId).populate('questions');
    if (!test || !test.isActive) {
      return res.status(404).json({ message: 'Test not found' });
    }

    // Check if user has already attempted this test (if maxAttempts is set)
    if (test.settings?.maxAttempts) {
      const existingAttempts = await TestAttempt.countDocuments({
        userId: req.user.userId,
        testId,
        isCompleted: true
      });

      if (existingAttempts >= test.settings.maxAttempts) {
        return res.status(400).json({ 
          message: `Maximum attempts (${test.settings.maxAttempts}) reached for this test` 
        });
      }
    }

    // Calculate score
    let score = 0;
    const questionResults = {};

    for (const question of test.questions) {
      const userAnswer = answers[question._id.toString()];
      const isCorrect = userAnswer && 
        userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
      
      questionResults[question._id.toString()] = {
        userAnswer: userAnswer || '',
        correctAnswer: question.correctAnswer,
        isCorrect,
        points: isCorrect ? question.points : 0
      };

      if (isCorrect) {
        score += question.points;
      }
    }

    // Calculate percentage and category
    const percentage = Math.round((score / test.totalPoints) * 100);
    let category = 'Beginner';
    if (percentage >= 90) category = 'Expert';
    else if (percentage >= 75) category = 'Advanced';
    else if (percentage >= 60) category = 'Intermediate';

    // Flag suspicious attempts
    const flagged = tabSwitchCount >= 3 || timeSpent < 30; // Less than 30 seconds
    const flagReason = tabSwitchCount >= 3 ? 'Excessive tab switching' : 
                      timeSpent < 30 ? 'Suspiciously fast completion' : null;

    // Create attempt record
    const attempt = new TestAttempt({
      userId: req.user.userId,
      testId,
      answers: new Map(Object.entries(answers)),
      score,
      totalPoints: test.totalPoints,
      percentage,
      category,
      timeSpent,
      tabSwitchCount,
      isCompleted: true,
      submittedAt: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      flagged,
      flagReason
    });

    await attempt.save();

    // Populate user and test info for response
    await attempt.populate('userId', 'name email class');
    await attempt.populate('testId', 'title subject');

    res.status(201).json({
      message: 'Test submitted successfully',
      attempt: {
        id: attempt._id,
        userId: attempt.userId._id,
        testId: attempt.testId._id,
        answers: Object.fromEntries(attempt.answers),
        score: attempt.score,
        totalPoints: attempt.totalPoints,
        percentage: attempt.percentage,
        category: attempt.category,
        timeSpent: attempt.timeSpent,
        tabSwitchCount: attempt.tabSwitchCount,
        completedAt: attempt.submittedAt,
        isCompleted: attempt.isCompleted
      },
      questionResults
    });
  } catch (error) {
    console.error('Attempt submission error:', error);
    res.status(500).json({ message: 'Server error submitting attempt' });
  }
});

// @route   GET /api/attempts/user/:userId
// @desc    Get user's test attempts
// @access  Private (own attempts) / Admin (any user)
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Check authorization
    if (req.user.userId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const attempts = await TestAttempt.find({ 
      userId, 
      isCompleted: true 
    })
      .populate('testId', 'title subject class difficulty')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await TestAttempt.countDocuments({ 
      userId, 
      isCompleted: true 
    });

    res.json({
      attempts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('User attempts fetch error:', error);
    res.status(500).json({ message: 'Server error fetching attempts' });
  }
});

// @route   GET /api/attempts/:id
// @desc    Get single attempt details
// @access  Private (own attempt) / Admin (any attempt)
router.get('/:id', auth, async (req, res) => {
  try {
    const attempt = await TestAttempt.findById(req.params.id)
      .populate('userId', 'name email class')
      .populate('testId', 'title subject questions');

    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    // Check authorization
    if (attempt.userId._id.toString() !== req.user.userId.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(attempt);
  } catch (error) {
    console.error('Attempt fetch error:', error);
    res.status(500).json({ message: 'Server error fetching attempt' });
  }
});

// @route   GET /api/attempts
// @desc    Get all attempts (Admin only)
// @access  Admin only
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const {
      testId,
      userId,
      flagged,
      page = 1,
      limit = 20
    } = req.query;

    // Build filter
    const filter = { isCompleted: true };
    if (testId) filter.testId = testId;
    if (userId) filter.userId = userId;
    if (flagged !== undefined) filter.flagged = flagged === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const attempts = await TestAttempt.find(filter)
      .populate('userId', 'name email class')
      .populate('testId', 'title subject')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await TestAttempt.countDocuments(filter);

    res.json({
      attempts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Attempts fetch error:', error);
    res.status(500).json({ message: 'Server error fetching attempts' });
  }
});

// @route   GET /api/attempts/test/:testId/leaderboard
// @desc    Get test leaderboard
// @access  Private
router.get('/test/:testId/leaderboard', auth, async (req, res) => {
  try {
    const { testId } = req.params;
    const { limit = 10 } = req.query;

    const leaderboard = await TestAttempt.getLeaderboard(testId, parseInt(limit));

    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    res.status(500).json({ message: 'Server error fetching leaderboard' });
  }
});

// @route   PUT /api/attempts/:id/review
// @desc    Review flagged attempt (Admin only)
// @access  Admin only
router.put('/:id/review', auth, adminAuth, async (req, res) => {
  try {
    const { feedback, unflag } = req.body;

    const updateData = {
      reviewedBy: req.user.userId,
      reviewedAt: new Date()
    };

    if (feedback) updateData.feedback = feedback;
    if (unflag) updateData.flagged = false;

    const attempt = await TestAttempt.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('userId', 'name email');

    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    res.json({
      message: 'Attempt reviewed successfully',
      attempt
    });
  } catch (error) {
    console.error('Attempt review error:', error);
    res.status(500).json({ message: 'Server error reviewing attempt' });
  }
});

// @route   GET /api/attempts/stats/overview
// @desc    Get attempt statistics (Admin only)
// @access  Admin only
router.get('/stats/overview', auth, adminAuth, async (req, res) => {
  try {
    const stats = await TestAttempt.aggregate([
      { $match: { isCompleted: true } },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          averageScore: { $avg: '$percentage' },
          flaggedAttempts: {
            $sum: { $cond: ['$flagged', 1, 0] }
          },
          categoryDistribution: {
            $push: '$category'
          }
        }
      }
    ]);

    const categoryStats = await TestAttempt.aggregate([
      { $match: { isCompleted: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      overview: stats[0] || { totalAttempts: 0, averageScore: 0, flaggedAttempts: 0 },
      categoryDistribution: categoryStats
    });
  } catch (error) {
    console.error('Attempt stats error:', error);
    res.status(500).json({ message: 'Server error fetching attempt statistics' });
  }
});

module.exports = router;