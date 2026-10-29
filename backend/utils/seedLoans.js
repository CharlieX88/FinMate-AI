import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Loan from '../models/Loan.js';
import seedLoans from '../data/loans.js';

dotenv.config();

const importData = async () => {
  try {
    await connectDB();

    // Purana data clear (fresh seed ke liye)
    await Loan.deleteMany();
    console.log('🗑️  Existing loans cleared');

    // Naya data insert
    const createdLoans = await Loan.insertMany(seedLoans);
    console.log(`✅ ${createdLoans.length} loans seeded successfully!`);

    process.exit(0);
  } catch (error) {
    console.error(`❌ Seed Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await Loan.deleteMany();
    console.log('🗑️  All loans destroyed!');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

// CLI args: node utils/seedLoans.js        → import
//            node utils/seedLoans.js -d     → destroy
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}