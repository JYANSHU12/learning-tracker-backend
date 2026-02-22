require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');
};

const seed = async () => {
  await connectDB();

  // Clear existing data
  await mongoose.connection.dropDatabase();
  console.log('🗑️  Cleared database');

  const User = require('./models/User');
  const Goal = require('./models/Goal');
  const StudySession = require('./models/StudySession');
  const Feedback = require('./models/Feedback');

  // Create admin
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@demo.com',
    password: 'password123',
    role: 'admin'
  });

  // Create tutor
  const tutor = await User.create({
    name: 'Sarah Johnson',
    email: 'tutor@demo.com',
    password: 'password123',
    role: 'tutor'
  });

  // Create student
  const student = await User.create({
    name: 'Alex Smith',
    email: 'student@demo.com',
    password: 'password123',
    role: 'student'
  });

  console.log('👥 Created users');

  // Create goals for student
  const goals = await Goal.insertMany([
    { studentId: student._id, title: 'Master JavaScript ES6+', subject: 'JavaScript', description: 'Learn modern JS features', targetDate: new Date('2025-06-30'), progress: 65, status: 'active' },
    { studentId: student._id, title: 'Complete React Course', subject: 'React', description: 'Build 5 projects', targetDate: new Date('2025-04-30'), progress: 40, status: 'active' },
    { studentId: student._id, title: 'Learn Node.js Basics', subject: 'Node.js', description: 'Backend fundamentals', targetDate: new Date('2025-03-31'), progress: 100, status: 'completed' },
    { studentId: student._id, title: 'MongoDB Mastery', subject: 'Database', description: 'Aggregations, indexes', targetDate: new Date('2025-07-31'), progress: 20, status: 'active' }
  ]);

  console.log('🎯 Created goals');

  // Create study sessions for past 30 days
  const subjects = ['JavaScript', 'React', 'Node.js', 'Database', 'CSS'];
  const sessions = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    if (Math.random() > 0.3) { // 70% chance of study each day
      sessions.push({
        studentId: student._id,
        date,
        duration: Math.floor(Math.random() * 120) + 30,
        subject: subjects[Math.floor(Math.random() * subjects.length)]
      });
    }
  }
  await StudySession.insertMany(sessions);

  console.log('⏱️  Created study sessions');

  // Create feedback
  await Feedback.insertMany([
    { tutorId: tutor._id, studentId: student._id, comment: 'Alex is making excellent progress! The consistency in study sessions is really paying off. Keep it up!', rating: 5 },
    { tutorId: tutor._id, studentId: student._id, comment: 'Good understanding of core concepts. Would recommend spending more time on advanced React patterns.', rating: 4 }
  ]);

  console.log('💬 Created feedback');

  console.log('\n✅ Seed complete!\n');
  console.log('Demo Credentials:');
  console.log('  Admin:   admin@demo.com   / password123');
  console.log('  Tutor:   tutor@demo.com   / password123');
  console.log('  Student: student@demo.com / password123');

  process.exit(0);
};

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
