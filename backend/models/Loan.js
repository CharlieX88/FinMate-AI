import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema(
  {
    bankName: {
      type: String,
      required: [true, 'Bank name is required'],
      trim: true,
    },
    loanType: {
      type: String,
      required: true,
      enum: ['personal', 'home', 'car', 'education', 'business'],
      lowercase: true,
    },
    interestRate: {
      type: Number, // annual % (e.g., 10.5)
      required: true,
      min: 0,
    },
    minAmount: {
      type: Number, // in INR
      required: true,
    },
    maxAmount: {
      type: Number,
      required: true,
    },
    minTenure: {
      type: Number, // in months
      required: true,
    },
    maxTenure: {
      type: Number,
      required: true,
    },
    processingFeePercent: {
      type: Number, // e.g., 1.5 (means 1.5%)
      default: 0,
    },
    minIncome: {
      type: Number, // monthly income eligibility (INR)
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    features: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Text search index (search by bank name & description)
loanSchema.index({ bankName: 'text', description: 'text' });

const Loan = mongoose.model('Loan', loanSchema);
export default Loan;