import mongoose from 'mongoose';

const lessonProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Ek user ek lesson ko ek hi baar track kare
lessonProgressSchema.index({ user: 1, lesson: 1 }, { unique: true });

const LessonProgress = mongoose.model('LessonProgress', lessonProgressSchema);
export default LessonProgress;