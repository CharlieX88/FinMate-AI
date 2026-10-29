import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Lesson from '../models/Lesson.js';
import seedLessons from '../data/lessons.js';

dotenv.config();

const importData = async () => {
  try {
    await connectDB();
    await Lesson.deleteMany();
    console.log('🗑️  Existing lessons cleared');

    const created = await Lesson.insertMany(seedLessons);
    console.log(`✅ ${created.length} lessons seeded successfully!`);

    process.exit(0);
  } catch (error) {
    console.error(`❌ Seed Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await Lesson.deleteMany();
    console.log('🗑️  All lessons destroyed!');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') destroyData();
else importData();