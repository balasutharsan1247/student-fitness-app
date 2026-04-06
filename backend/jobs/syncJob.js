const cron = require('node-cron');
const User = require('../models/User');
const FitnessLog = require('../models/FitnessLog');
const googleFitService = require('../services/googleFitService');

/**
 * Background Sync Job
 * Runs every day at 1:00 AM to sync Google Fit data for all connected users.
 */
const initGoogleFitSyncJob = () => {
  // Cron expression: 0 1 * * * (1:00 AM every day)
  // For testing in dev, you might want to run it more frequently (e.g., every hour: 0 * * * *)
  cron.schedule('0 1 * * *', async () => {
    console.log('🔄 Starting daily Google Fit background sync...');

    try {
      const users = await User.find({
        isGoogleFitConnected: true,
        googleFitSyncEnabled: true,
        googleRefreshToken: { $exists: true, $ne: null }
      });

      console.log(`📡 Found ${users.length} users to sync.`);

      for (const user of users) {
        try {
          await syncUserFitnessData(user);
        } catch (err) {
          console.error(`❌ Failed to sync data for user ${user._id}:`, err.message);
        }
      }

      console.log('✅ Daily Google Fit sync completed.');
    } catch (error) {
      console.error('❌ Error in Google Fit sync job:', error);
    }
  });
};

/**
 * Syncs fitness data for a single user for the current day
 */
const syncUserFitnessData = async (user) => {
  const fitnessData = await googleFitService.getDailyData(user);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find or create today's log
  let log = await FitnessLog.findOne({
    user: user._id,
    date: today
  });

  if (log) {
    // Update existing log (only if system/auto data is better or same)
    log.steps = Math.max(log.steps, fitnessData.steps);
    log.distance = Math.max(log.distance, fitnessData.distance);
    log.activeMinutes = Math.max(log.activeMinutes, fitnessData.activeMinutes);
    log.caloriesBurned = Math.max(log.caloriesBurned, fitnessData.calories);
    log.source = 'imported';
    log.verificationStatus = 'system_verified';

    await log.calculateLifestyleScore();
    await log.save();
    console.log(`  - Updated log for user ${user.email}`);
  } else {
    // Create new log for today
    log = await FitnessLog.create({
      user: user._id,
      date: today,
      steps: fitnessData.steps,
      distance: fitnessData.distance,
      activeMinutes: fitnessData.activeMinutes,
      caloriesBurned: fitnessData.calories,
      source: 'imported',
      verificationStatus: 'system_verified'
    });

    await log.calculateLifestyleScore();
    await log.save();
    console.log(`  - Created new log for user ${user.email}`);
  }
};

module.exports = { initGoogleFitSyncJob, syncUserFitnessData };
