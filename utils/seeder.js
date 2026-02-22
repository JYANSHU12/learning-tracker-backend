const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Goal = require('../models/Goal');
const StudySession = require('../models/StudySession');
const Feedback = require('../models/Feedback');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/learning-tracker');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([User.deleteMany(), Goal.deleteMany(), StudySession.deleteMany(), Feedback.deleteMany()]);
    console.log('Cleared existing data');

    // Create users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@tracker.com',
      password: 'admin123',
      role: 'admin'
    });

    const tutor = await User.create({
      name: 'John Tutor',
      email: 'tutor@tracker.com',
      password: 'tutor123',
      role: 'tutor'
    });

    const student = await User.create({
      name: 'Jane Student',
      email: 'student@tracker.com',
      password: 'student123',
      role: 'student'
    });

    // Create goals
    await Goal.insertMany([
      {
        studentId: student._id,
        title: 'Master React Hooks',
        description: 'Complete all React hooks documentation and build 5 projects',
        subject: 'React',
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        progress: 65,
        status: 'active'
      },
      {
        studentId: student._id,
        title: 'Learn Node.js',
        description: 'Build a REST API with Node and Express',
        subject: 'Node.js',
        targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        progress: 40,
        status: 'active'
      },
      {
        studentId: student._id,
        title: 'JavaScript Fundamentals',
        description: 'Complete JS basics course',
        subject: 'JavaScript',
        targetDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        progress: 100,
        status: 'completed'
      }
    ]);

    // Create study sessions for last 30 days
    const subjects = ['React', 'Node.js', 'JavaScript', 'MongoDB', 'CSS'];
    const sessions = [];
    for (let i = 29; i >= 0; i--) {
      if (Math.random() > 0.3) { // 70% chance of studying each day
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        sessions.push({
          studentId: student._id,
          date,
          duration: Math.floor(Math.random() * 120) + 30,
          subject: subjects[Math.floor(Math.random() * subjects.length)]
        });
      }
    }
    await StudySession.insertMany(sessions);

    // Create feedback
    await Feedback.create({
      tutorId: tutor._id,
      studentId: student._id,
      comment: 'Great progress on React! Keep focusing on useEffect and custom hooks.',
      rating: 4
    });

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('Admin:   admin@tracker.com   / admin123');
    console.log('Tutor:   tutor@tracker.com   / tutor123');
    console.log('Student: student@tracker.com / student123');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
