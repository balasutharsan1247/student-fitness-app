const axios = require('axios');
const { google } = require('googleapis');
const User = require('../models/User');

/**
 * Google Fit Background Sync Service
 * Handles OAuth2 token management and fitness data retrieval.
 */
class GoogleFitService {
  constructor() {
    this.clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
    this.clientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();
    this.redirectUri = (process.env.GOOGLE_REDIRECT_URI || '').trim();

    this.oauth2Client = new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      this.redirectUri
    );
    
    // Self-check for Render
    if (!this.clientId) console.error('🚫 MISSING: GOOGLE_CLIENT_ID on Render!');
    if (!this.clientSecret) console.error('🚫 MISSING: GOOGLE_CLIENT_SECRET on Render!');
    if (!this.redirectUri) console.error('🚫 MISSING: GOOGLE_REDIRECT_URI on Render!');
  }

  /**
   * Exchange single-use auth code for long-lived refresh token
   */
  async getTokensFromCode(code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      return tokens;
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw new Error('Failed to exchange Google authorization code');
    }
  }

  /**
   * Refresh the access token using the stored refresh token
   */
  async refreshAccessToken(refreshToken) {
    try {
      this.oauth2Client.setCredentials({ refresh_token: refreshToken });
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      return credentials.access_token;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw new Error('Failed to refresh Google access token');
    }
  }

  /**
   * Fetch daily fitness data for a user
   */
  async getDailyData(user) {
    try {
      if (!user.googleRefreshToken) {
        throw new Error('User does not have Google Fit linked');
      }

      // 1. Get a fresh access token
      const accessToken = await this.refreshAccessToken(user.googleRefreshToken);

      // 2. Define today's range
      const now = new Date();
      const startTimeMillis = new Date(now.setHours(0, 0, 0, 0)).getTime();
      const endTimeMillis = new Date(now.setHours(23, 59, 59, 999)).getTime();

      // 3. Fetch from Google Fitness API
      const response = await axios.post(
        'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
        {
          aggregateBy: [
            { dataTypeName: 'com.google.step_count.delta' },
            { dataTypeName: 'com.google.calories.expended' },
            { dataTypeName: 'com.google.distance.delta' },
            { dataTypeName: 'com.google.active_minutes' }
          ],
          bucketByTime: { durationMillis: endTimeMillis - startTimeMillis },
          startTimeMillis,
          endTimeMillis
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return this.parseFitnessData(response.data);
    } catch (error) {
      console.error(`Error fetching Fit data for user ${user._id}:`, error.message);
      throw error;
    }
  }

  /**
   * Parse the aggregate response from Google Fit
   */
  parseFitnessData(data) {
    const bucket = data.bucket?.[0] || {};
    const datasets = bucket.dataset || [];

    const result = {
      steps: 0,
      calories: 0,
      distance: 0,
      activeMinutes: 0
    };

    datasets.forEach(ds => {
      const point = ds.point?.[0];
      if (!point) return;

      const type = ds.dataSourceId || '';
      const value = point.value?.[0];

      if (type.includes('step_count')) result.steps = value?.intVal || 0;
      if (type.includes('calories')) result.calories = Math.round(value?.fpVal || 0);
      if (type.includes('distance')) result.distance = parseFloat(((value?.fpVal || 0) / 1000).toFixed(2));
      if (type.includes('active_minutes')) result.activeMinutes = value?.intVal || 0;
    });

    return result;
  }
}

module.exports = new GoogleFitService();
