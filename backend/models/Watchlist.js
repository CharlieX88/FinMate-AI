import mongoose from 'mongoose';

const watchlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    loan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Loan',
      required: true,
    },
    note: {
      type: String,
      default: '',
      maxlength: 500,
    },
    // User ne is loan pe kitne amount/tenure ka soch rakha hai (preview ke liye)
    plannedAmount: {
      type: Number,
      default: 0,
    },
    plannedTenure: {
      type: Number, // months
      default: 0,
    },
  },
  { timestamps: true }
);

// Ek user ek loan ko ek hi baar save kar sake
watchlistSchema.index({ user: 1, loan: 1 }, { unique: true });

const Watchlist = mongoose.model('Watchlist', watchlistSchema);
export default Watchlist;