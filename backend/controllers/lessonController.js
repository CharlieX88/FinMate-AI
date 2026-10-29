import Lesson from '../models/Lesson.js';
import LessonProgress from '../models/LessonProgress.js';

// @desc    List all lessons (with optional category/difficulty filter)
// @route   GET /api/lessons
// @access  Public
export const getLessons = async (req, res, next) => {
  try {
    const { category, difficulty } = req.query;

    const query = {};
    if (category) query.category = category.toLowerCase();
    if (difficulty) query.difficulty = difficulty.toLowerCase();

    const lessons = await Lesson.find(query)
      .select('-content')
      .sort({ category: 1, order: 1 });

    res.status(200).json({ success: true, count: lessons.length, lessons });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single lesson by slug (full content)
// @route   GET /api/lessons/:slug
// @access  Public
export const getLessonBySlug = async (req, res, next) => {
  try {
    const lesson = await Lesson.findOne({ slug: req.params.slug });
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }
    res.status(200).json({ success: true, lesson });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark lesson as complete
// @route   POST /api/lessons/:slug/complete
// @access  Private
export const markLessonComplete = async (req, res, next) => {
  try {
    const lesson = await Lesson.findOne({ slug: req.params.slug });
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    const existing = await LessonProgress.findOne({
      user: req.user._id,
      lesson: lesson._id,
    });

    if (existing && existing.completed) {
      return res.status(200).json({
        success: true,
        message: 'Lesson already marked complete',
        progress: existing,
      });
    }

    let progress;
    if (existing) {
      existing.completed = true;
      existing.completedAt = new Date();
      progress = await existing.save();
    } else {
      progress = await LessonProgress.create({
        user: req.user._id,
        lesson: lesson._id,
        completed: true,
        completedAt: new Date(),
      });
    }

    res.status(200).json({ success: true, progress });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's learning progress + stats
// @route   GET /api/lessons/progress/me
// @access  Private
export const getMyProgress = async (req, res, next) => {
  try {
    const [totalLessons, userProgress, allLessons] = await Promise.all([
      Lesson.countDocuments(),
      LessonProgress.find({ user: req.user._id, completed: true }).populate('lesson'),
      Lesson.find().select('slug category'),
    ]);

    const completedSlugs = new Set(userProgress.map((p) => p.lesson?.slug));
    const completedCount = completedSlugs.size;

    // Per-category stats
    const byCategory = {};
    for (const l of allLessons) {
      if (!byCategory[l.category]) {
        byCategory[l.category] = { total: 0, completed: 0 };
      }
      byCategory[l.category].total += 1;
      if (completedSlugs.has(l.slug)) byCategory[l.category].completed += 1;
    }

    const categoryStats = Object.entries(byCategory).map(([category, v]) => ({
      category,
      total: v.total,
      completed: v.completed,
      percent: v.total > 0 ? Math.round((v.completed / v.total) * 100) : 0,
    }));

    const percent =
      totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    res.status(200).json({
      success: true,
      totalLessons,
      completedCount,
      percent,
      completedSlugs: Array.from(completedSlugs),
      categoryStats,
    });
  } catch (error) {
    next(error);
  }
};