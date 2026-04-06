/**
 * Analytical Insight Engine
 * Generates behavioral correlations based on 30-day user fitness log data.
 */

export const generateInsights = (logs) => {
  if (!logs || logs.length < 5) {
    return [{
      type: 'neutral',
      message: "Keep logging! We need a few more days of data to generate your personalized wellness insights.",
      icon: 'sparkle'
    }];
  }

  const insights = [];

  // Insight 1: Activity vs Sleep
  // Compare average steps on days with < 6 hours sleep vs >= 6 hours sleep
  const lowSleepLogs = logs.filter(log => log.sleep && log.sleep.hours < 6);
  const goodSleepLogs = logs.filter(log => log.sleep && log.sleep.hours >= 6);

  if (lowSleepLogs.length >= 2 && goodSleepLogs.length >= 2) {
    const avgStepsLow = lowSleepLogs.reduce((acc, log) => acc + (log.steps || 0), 0) / lowSleepLogs.length;
    const avgStepsGood = goodSleepLogs.reduce((acc, log) => acc + (log.steps || 0), 0) / goodSleepLogs.length;
    
    if (avgStepsGood > avgStepsLow * 1.15) { // 15% better
      const diff = Math.round(avgStepsGood - avgStepsLow);
      insights.push({
        type: 'positive',
        title: 'Sleep Powers Your Activity',
        message: `You log an average of ${diff.toLocaleString()} more steps on days you get at least 6 hours of sleep.`,
        icon: 'moon'
      });
    }
  }

  // Insight 2: High Stress vs Low Sleep
  // Is stress higher on days with poor sleep?
  if (lowSleepLogs.length >= 2 && goodSleepLogs.length >= 2) {
    const avgStressLowSleep = lowSleepLogs.reduce((acc, log) => acc + (log.stressLevel || 0), 0) / lowSleepLogs.length;
    const avgStressGoodSleep = goodSleepLogs.reduce((acc, log) => acc + (log.stressLevel || 0), 0) / goodSleepLogs.length;
    
    if (avgStressLowSleep > avgStressGoodSleep + 1.5) {
      insights.push({
        type: 'warning',
        title: 'Stress and Sleep Correlation',
        message: `Your stress levels are significantly higher (${avgStressLowSleep.toFixed(1)}/10) on days you sleep less than 6 hours.`,
        icon: 'alert'
      });
    }
  }

  // Insight 3: Screen Time vs Sleep
  // Does high screen time affect sleep quality?
  const highScreenLogs = logs.filter(log => log.screenTime && log.screenTime > 4);
  const lowScreenLogs = logs.filter(log => log.screenTime && log.screenTime <= 4);

  if (highScreenLogs.length >= 2 && lowScreenLogs.length >= 2) {
    const avgSleepHighScreen = highScreenLogs.reduce((acc, log) => acc + (log.sleep?.hours || 0), 0) / highScreenLogs.length;
    const avgSleepLowScreen = lowScreenLogs.reduce((acc, log) => acc + (log.sleep?.hours || 0), 0) / lowScreenLogs.length;

    if (avgSleepLowScreen > avgSleepHighScreen + 0.8) {
      insights.push({
        type: 'warning',
        title: 'Screen Time Impact',
        message: `Reducing screen time below 4 hours correlates with nearly an extra hour of sleep!`,
        icon: 'monitor'
      });
    }
  }

  // Fallback insight if no strong correlations found, but user is active
  if (insights.length === 0) {
    insights.push({
      type: 'positive',
      title: 'Consistent Baseline',
      message: `Your metrics are remarkably stable! Keep up the daily logging to discover deeper patterns in your lifestyle.`,
      icon: 'sparkle'
    });
  }

  return insights;
};
