import mongoose from 'mongoose';

const creditProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // 1. Payment History: Are you paying bills on time?
    onTimePaymentPercentage: {
      type: Number,
      default: 100, // 0 to 100
    },
    // 2. Credit Utilization: How much of your limit do you use?
    creditUtilizationPercentage: {
      type: Number,
      default: 0, // 0 to 100
    },
    // 3. Credit History Length: How old is your oldest account?
    creditHistoryMonths: {
      type: Number,
      default: 0,
    },
    // 4. Credit Mix: Do you have a mix of loans and cards?
    hasCreditCard: {
      type: Boolean,
      default: false,
    },
    hasActiveLoan: {
      type: Boolean,
      default: false,
    },
    // 5. New Inquiries: How many new loans/cards applied in last 6 months?
    recentInquiries: {
      type: Number,
      default: 0,
    },
    // Final Calculated Score
    calculatedScore: {
      type: Number,
      default: 300, // Range 300 to 900
    }
  },
  { timestamps: true }
);

const CreditProfile = mongoose.model('CreditProfile', creditProfileSchema);
export default CreditProfile;