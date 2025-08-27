const express = require("express");
const Joi = require("joi");
const Test = require("../models/Test");
const Question = require("../models/Question");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const { gradeEnum } = require("../utils");

const router = express.Router();

// Validation schema
const testSchema = Joi.object({
  title: Joi.string().max(100).required(),
  subject: Joi.string().required(),
  class: Joi.string()
    .valid(...gradeEnum)
    .required(),
  difficulty: Joi.string().valid("easy", "medium", "hard").required(),
  description: Joi.string().max(500).required(),
  questions: Joi.array().items(Joi.string()).min(1).required(),
  timeLimit: Joi.number().min(5).max(180).required(),
  settings: Joi.object({
    shuffleQuestions: Joi.boolean().default(false),
    shuffleOptions: Joi.boolean().default(false),
    showResults: Joi.boolean().default(true),
    allowReview: Joi.boolean().default(true),
    maxAttempts: Joi.number().min(1).default(1),
  }).optional(),
  schedule: Joi.object({
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    timezone: Joi.string().default("UTC"),
  }).optional(),
});

// @route   GET /api/tests
// @desc    Get all active tests
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const {
      subject,
      class: testClass,
      difficulty,
      page = 1,
      limit = 20,
    } = req.query;

    // Build filter
    const filter = { isActive: true };
    if (subject) filter.subject = subject;
    if (testClass) filter.class = testClass;
    if (difficulty) filter.difficulty = difficulty;

    // Check schedule if dates are set
    const now = new Date();
    filter.$or = [
      { "schedule.startDate": { $exists: false } },
      { "schedule.startDate": { $lte: now } },
    ];

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tests = await Test.find(filter)
      .populate("questions", "question type points")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Test.countDocuments(filter);

    res.json({
      tests,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
      },
    });
  } catch (error) {
    console.error("Tests fetch error:", error);
    res.status(500).json({ message: "Server error fetching tests" });
  }
});

// @route   GET /api/tests/:id
// @desc    Get single test with questions
// @access  Private
router.get("/:testId", auth, async (req, res) => {
  try {
    const test = await Test.findById(req.params.testId)
      .populate("questions")
      .populate("createdBy", "name");

    if (!test || !test.isActive) {
      return res.status(404).json({ message: "Test not found" });
    }

    // Check if test is scheduled and available
    if (test.schedule?.startDate && new Date() < test.schedule.startDate) {
      return res.status(403).json({
        message: "Test is not yet available",
        startDate: test.schedule.startDate,
      });
    }

    if (test.schedule?.endDate && new Date() > test.schedule.endDate) {
      return res.status(403).json({
        message: "Test has ended",
        endDate: test.schedule.endDate,
      });
    }

    res.json(test);
  } catch (error) {
    console.error("Test fetch error:", error);
    res.status(500).json({ message: "Server error fetching test" });
  }
});

// @route   POST /api/tests
// @desc    Create new test
// @access  Admin only
router.post("/", auth, adminAuth, async (req, res) => {
  try {
    const { error, value } = testSchema.validate(req.body, {
      allowUnknown: true,
    });
    if (error) {
      return res.status(400).json({
        message: "Validation error",
        details: error.details[0].message,
      });
    }

    // Verify all questions exist
    const questions = await Question.find({
      _id: { $in: value.questions },
      // isActive: true
    });

    if (questions.length !== value.questions.length) {
      return res.status(400).json({
        message: "Some questions not found or inactive",
      });
    }

    // Calculate total points
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

    const test = new Test({
      ...value,
      totalPoints,
      createdBy: req.user.userId,
    });

    await test.save();
    await test.populate("questions");

    res.status(201).json({
      message: "Test created successfully",
      test,
    });
  } catch (error) {
    console.error("Test creation error:", error);
    res.status(500).json({ message: "Server error creating test" });
  }
});

// @route   PUT /api/tests/:id
// @desc    Update test
// @access  Admin only
router.put("/:id", auth, adminAuth, async (req, res) => {
  try {
    const { error, value } = testSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: "Validation error",
        details: error.details[0].message,
      });
    }

    // Verify all questions exist if questions are being updated
    if (value.questions) {
      const questions = await Question.find({
        _id: { $in: value.questions },
        // isActive: true
      });

      if (questions.length !== value.questions.length) {
        return res.status(400).json({
          message: "Some questions not found or inactive",
        });
      }

      // Recalculate total points
      value.totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    }

    const test = await Test.findByIdAndUpdate(
      req.params.id,
      { $set: value },
      { new: true, runValidators: true }
    ).populate("questions");

    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    res.json({
      message: "Test updated successfully",
      test,
    });
  } catch (error) {
    console.error("Test update error:", error);
    res.status(500).json({ message: "Server error updating test" });
  }
});

// @route   DELETE /api/tests/:id
// @desc    Delete test (soft delete)
// @access  Admin only
router.delete("/:id", auth, adminAuth, async (req, res) => {
  try {
    const test = await Test.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    res.json({ message: "Test deleted successfully" });
  } catch (error) {
    console.error("Test deletion error:", error);
    res.status(500).json({ message: "Server error deleting test" });
  }
});

// @route   POST /api/tests/:id/duplicate
// @desc    Duplicate a test
// @access  Admin only
router.post("/:id/duplicate", auth, adminAuth, async (req, res) => {
  try {
    const originalTest = await Test.findById(req.params.id);
    if (!originalTest) {
      return res.status(404).json({ message: "Test not found" });
    }

    const duplicatedTest = new Test({
      title: `${originalTest.title} (Copy)`,
      subject: originalTest.subject,
      class: originalTest.class,
      difficulty: originalTest.difficulty,
      description: originalTest.description,
      questions: originalTest.questions,
      timeLimit: originalTest.timeLimit,
      totalPoints: originalTest.totalPoints,
      settings: originalTest.settings,
      createdBy: req.user.userId,
    });

    await duplicatedTest.save();
    await duplicatedTest.populate("questions");

    res.status(201).json({
      message: "Test duplicated successfully",
      test: duplicatedTest,
    });
  } catch (error) {
    console.error("Test duplication error:", error);
    res.status(500).json({ message: "Server error duplicating test" });
  }
});

module.exports = router;
