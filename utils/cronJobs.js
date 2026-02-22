const cron = require('node-cron');
const User = require('../models/User');
const StudySession = require('../models/StudySession');
const { sendInactivityEmail } = require('./emailService');

const startCronJobs = () => {
  // Run daily at 9 AM - check for inactive students (no activity in 3 days)
  cron.schedule('0 9 * * *', async () => {
    try {
      console.log('Running inactivity check...');
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

      const inactiveStudents = await User.find({
        role: 'student',
        isBlocked: false,
        lastActivity: { $lt: threeDaysAgo }
      });

      for (const student of inactiveStudents) {
        await sendInactivityEmail(student.email, student.name);
      }

      console.log(`Inactivity emails sent to ${inactiveStudents.length} students`);
    } catch (error) {
      console.error('Cron job error:', error);
    }
  });
};

module.exports = { startCronJobs };
