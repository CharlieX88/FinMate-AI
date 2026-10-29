import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
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
      enum: ['income', 'expense'],
      lowercase: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      // e.g., "food", "transport", "salary", "rent", "entertainment", etc.
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be positive'],
    },
    description: {
      type: String,
      default: '',
      maxlength: 300,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Performance: user + date pe query fast ho
budgetSchema.index({ user: 1, date: -1 });
budgetSchema.index({ user: 1, type: 1, category: 1 });

const Budget = mongoose.model('Budget', budgetSchema);
export default Budget;