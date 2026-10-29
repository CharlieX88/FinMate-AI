import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['emi-due', 'budget-limit', 'loan-rate', 'ai-insight', 'system'],
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // Metadata — kis loan/budget se related hai (optional)
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Query fast: user ke unread alerts
alertSchema.index({ user: 1, isRead: 1, createdAt: -1 });

const Alert = mongoose.model('Alert', alertSchema);
export default Alert;