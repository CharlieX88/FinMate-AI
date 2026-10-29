import mongoose from 'mongoose';

const mcqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswerIndex: { type: Number, required: true },
});

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    module: { type: String, required: true }, // 👈 Ye field add hona bahut zaroori hai
    category: { type: String, required: true, enum: ['basics', 'loans', 'budgeting', 'investing', 'credit', 'savings'] },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    duration: { type: Number, default: 5 },
    description: { type: String, required: true },
    content: { type: String, required: true },
    coins: { type: Number, default: 10 },
    xp: { type: Number, default: 20 },
    keyTakeaways: { type: [String], default: [] },
    mcqs: [mcqSchema],
    externalLinks: { type: [{ title: String, url: String, source: String }], default: [] },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Lesson = mongoose.model('Lesson', lessonSchema);
export default Lesson;