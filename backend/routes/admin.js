const express = require('express');
const User = require('../models/User');
const Test = require('../models/Test');
const Question = require('../models/Question');
const TestAttempt = require('../models/TestAttempt');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// @route   GET /api/admin/students
// @desc    Get all students
// @access  Admin only
router.get('/students', auth, adminAuth, async (req, res) => {
  try {
    const {
      class: studentClass,
      subject,
      search,
      page = 1,
      limit = 20
    } = req.query;

    // Build filter
    const filter = { role: 'student', isActive: true };
    if (studentClass) filter.class = studentClass;
    if (subject) filter.subjects = { $in: [subject] };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const students = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    // Get attempt counts for each student
    const studentsWithStats = await Promise.all(
      students.map(async (student) => {
        const attemptCount = await TestAttempt.countDocuments({
          userId: student._id,
          isCompleted: true
        });

        const avgScore = await TestAttempt.aggregate([
          { $match: { userId: student._id, isCompleted: true } },
          { $group: { _id: null, avgPercentage: { $avg: '$percentage' } } }
        ]);

        return {
          ...student.toObject(),
          stats: {
            totalAttempts: attemptCount,
            averageScore: avgScore[0]?.avgPercentage || 0
          }
        };
      })
    );

    res.json({
      students: studentsWithStats,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Students fetch error:', error);
    res.status(500).json({ message: 'Server error fetching students' });
  }
});

// @route   PUT /api/admin/students/:id
// @desc    Update student
// @access  Admin only
router.put('/students/:id', auth, adminAuth, async (req, res) => {
  try {
    const { name, email, class: studentClass, subjects, isActive } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (studentClass) updateData.class = studentClass;
    if (subjects) updateData.subjects = subjects;
    if (isActive !== undefined) updateData.isActive = isActive;

    const student = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({
      message: 'Student updated successfully',
      student
    });
  } catch (error) {
    console.error('Student update error:', error);
    res.status(500).json({ message: 'Server error updating student' });
  }
});

// @route   DELETE /api/admin/students/:id
// @desc    Delete student (soft delete)
// @access  Admin only
router.delete('/students/:id', auth, adminAuth, async (req, res) => {
  try {
    const student = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Student deletion error:', error);
    res.status(500).json({ message: 'Server error deleting student' });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get platform analytics
// @access  Admin only
router.get('/analytics', auth, adminAuth, async (req, res) => {
  try {
    // Basic counts
    const [
      totalStudents,
      totalTests,
      totalQuestions,
      totalAttempts
    ] = await Promise.all([
      User.countDocuments({ role: 'student', isActive: true }),
      Test.countDocuments({ isActive: true }),
      Question.countDocuments({ isActive: true }),
      TestAttempt.countDocuments({ isCompleted: true })
    ]);

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = await TestAttempt.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          isCompleted: true
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          attempts: { $sum: 1 },
          avgScore: { $avg: '$percentage' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Subject performance
    const subjectPerformance = await TestAttempt.aggregate([
      { $match: { isCompleted: true } },
      {
        $lookup: {
          from: 'tests',
          localField: 'testId',
          foreignField: '_id',
          as: 'test'
        }
      },
      { $unwind: '$test' },
      {
        $group: {
          _id: '$test.subject',
          totalAttempts: { $sum: 1 },
          avgScore: { $avg: '$percentage' },
          maxScore: { $max: '$percentage' },
          minScore: { $min: '$percentage' }
        }
      },
      { $sort: { avgScore: -1 } }
    ]);

    // Top performers
    const topPerformers = await TestAttempt.aggregate([
      { $match: { isCompleted: true } },
      {
        $group: {
          _id: '$userId',
          totalAttempts: { $sum: 1 },
          avgScore: { $avg: '$percentage' },
          totalScore: { $sum: '$score' }
        }
      },
      { $sort: { avgScore: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          name: '$user.name',
          class: '$user.class',
          totalAttempts: 1,
          avgScore: { $round: ['$avgScore', 2] },
          totalScore: 1
        }
      }
    ]);

    // Question difficulty distribution
    const questionStats = await Question.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 }
        }
      }
    ]);

    // Test completion rates
    const testStats = await Test.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'testattempts',
          localField: '_id',
          foreignField: 'testId',
          as: 'attempts'
        }
      },
      {
        $project: {
          title: 1,
          subject: 1,
          totalAttempts: { $size: '$attempts' },
          avgScore: {
            $avg: {
              $map: {
                input: '$attempts',
                as: 'attempt',
                in: '$$attempt.percentage'
              }
            }
          }
        }
      },
      { $sort: { totalAttempts: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      overview: {
        totalStudents,
        totalTests,
        totalQuestions,
        totalAttempts
      },
      recentActivity,
      subjectPerformance,
      topPerformers,
      questionStats,
      testStats
    });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
});

// @route   GET /api/admin/reports/student/:id
// @desc    Get detailed student report
// @access  Admin only
router.get('/reports/student/:id', auth, adminAuth, async (req, res) => {
  try {
    const studentId = req.params.id;

    // Get student info
    const student = await User.findById(studentId).select('-password');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get all attempts
    const attempts = await TestAttempt.find({
      userId: studentId,
      isCompleted: true
    })
      .populate('testId', 'title subject difficulty')
      .sort({ createdAt: -1 });

    // Calculate statistics
    const stats = {
      totalAttempts: attempts.length,
      avgScore: attempts.length > 0 ? 
        attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length : 0,
      bestScore: attempts.length > 0 ? Math.max(...attempts.map(a => a.percentage)) : 0,
      totalTimeSpent: attempts.reduce((sum, a) => sum + a.timeSpent, 0),
      subjectBreakdown: {}
    };

    // Subject-wise performance
    attempts.forEach(attempt => {
      const subject = attempt.testId.subject;
      if (!stats.subjectBreakdown[subject]) {
        stats.subjectBreakdown[subject] = {
          attempts: 0,
          totalScore: 0,
          avgScore: 0
        };
      }
      stats.subjectBreakdown[subject].attempts++;
      stats.subjectBreakdown[subject].totalScore += attempt.percentage;
    });

    // Calculate averages
    Object.keys(stats.subjectBreakdown).forEach(subject => {
      const subjectData = stats.subjectBreakdown[subject];
      subjectData.avgScore = subjectData.totalScore / subjectData.attempts;
    });

    res.json({
      student,
      stats,
      attempts: attempts.slice(0, 20) // Latest 20 attempts
    });
  } catch (error) {
    console.error('Student report error:', error);
    res.status(500).json({ message: 'Server error generating student report' });
  }
});

// @route   GET /api/admin/reports/test/:id
// @desc    Get detailed test report
// @access  Admin only
router.get('/reports/test/:id', auth, adminAuth, async (req, res) => {
  try {
    const testId = req.params.id;

    // Get test info
    const test = await Test.findById(testId).populate('questions');
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    // Get all attempts for this test
    const attempts = await TestAttempt.find({
      testId,
      isCompleted: true
    })
      .populate('userId', 'name class')
      .sort({ score: -1 });

    // Calculate statistics
    const stats = {
      totalAttempts: attempts.length,
      avgScore: attempts.length > 0 ? 
        attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length : 0,
      highestScore: attempts.length > 0 ? Math.max(...attempts.map(a => a.percentage)) : 0,
      lowestScore: attempts.length > 0 ? Math.min(...attempts.map(a => a.percentage)) : 0,
      avgTimeSpent: attempts.length > 0 ? 
        attempts.reduce((sum, a) => sum + a.timeSpent, 0) / attempts.length : 0,
      categoryDistribution: {
        Expert: attempts.filter(a => a.category === 'Expert').length,
        Advanced: attempts.filter(a => a.category === 'Advanced').length,
        Intermediate: attempts.filter(a => a.category === 'Intermediate').length,
        Beginner: attempts.filter(a => a.category === 'Beginner').length
      }
    };

    res.json({
      test,
      stats,
      attempts: attempts.slice(0, 50) // Top 50 attempts
    });
  } catch (error) {
    console.error('Test report error:', error);
    res.status(500).json({ message: 'Server error generating test report' });
  }
});

module.exports = router;