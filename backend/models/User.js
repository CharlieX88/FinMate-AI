import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },

    // ---- Onboarding data (AI personalization ke liye) ----
    monthlyIncome: { type: Number, default: 0 },
    monthlyExpenses: { type: Number, default: 0 },
    existingEMIs: { type: Number, default: 0 },
    financialGoal: {
      type: String,
      enum: ['save', 'debt-free', 'buy-house', 'buy-car', 'invest', 'other'],
      default: 'save',
    },
    riskAppetite: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    isOnboarded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;