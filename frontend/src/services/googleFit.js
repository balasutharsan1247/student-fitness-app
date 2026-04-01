// Google Fit API integration (100% free, no API key needed for basic fitness data)

class GoogleFitService {
  constructor() {
    this.CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    this.SCOPES = [
      'https://www.googleapis.com/auth/fitness.activity.read',
      'https://www.googleapis.com/auth/fitness.body.read',
      'https://www.googleapis.com/auth/fitness.location.read'
    ];
    this.isInitialized = false;
    this.tokenClient = null;
  }

  async initialize() {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.isInitialized = true;
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Google Sign-In'));
      document.head.appendChild(script);
    });
  }

  async requestAuthorization() {
    await this.initialize();

    return new Promise((resolve, reject) => {
      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: this.CLIENT_ID,
        scope: this.SCOPES.join(' '),
        callback: (response) => {
          if (response.error) {
            console.error('Auth error:', response);
            reject(new Error(response.error));
            return;
          }
          
          if (response.access_token) {
            localStorage.setItem('google_fit_token', response.access_token);
            // Store expiry time (tokens last 1 hour)
            const expiryTime = new Date().getTime() + (response.expires_in * 1000);
            localStorage.setItem('google_fit_token_expiry', expiryTime);
            resolve(response);
          }
        },
      });

      this.tokenClient.requestAccessToken();
    });
  }

  async getTodayData() {
    const token = this.getValidToken();
    if (!token) {
      throw new Error('Not authorized. Please connect Google Fit first.');
    }

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).getTime();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).getTime();

    try {
      // Fetch steps
      const stepsData = await this.fetchDataType(
        'com.google.step_count.delta',
        startOfDay,
        endOfDay,
        token
      );
      const steps = this.extractValue(stepsData, 'intVal') || 0;

      // Fetch calories
      const caloriesData = await this.fetchDataType(
        'com.google.calories.expended',
        startOfDay,
        endOfDay,
        token
      );
      const calories = Math.round(this.extractValue(caloriesData, 'fpVal') || 0);

      // Fetch distance
      const distanceData = await this.fetchDataType(
        'com.google.distance.delta',
        startOfDay,
        endOfDay,
        token
      );
      const distanceMeters = this.extractValue(distanceData, 'fpVal') || 0;
      const distance = parseFloat((distanceMeters / 1000).toFixed(2)); // Convert to km

      // Fetch active minutes (move minutes)
      const activeMinsData = await this.fetchDataType(
        'com.google.active_minutes',
        startOfDay,
        endOfDay,
        token
      );
      const activeMinutes = Math.round(this.extractValue(activeMinsData, 'intVal') || 0);

      return {
        steps,
        calories,
        distance,
        activeMinutes,
        syncedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Google Fit API Error:', error);
      
      // If token expired, clear it
      if (error.message?.includes('401') || error.message?.includes('403')) {
        this.disconnect();
        throw new Error('Session expired. Please reconnect Google Fit.');
      }
      
      throw error;
    }
  }

  async fetchDataType(dataTypeName, startTime, endTime, token) {
    const response = await fetch(
      'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aggregateBy: [{ dataTypeName }],
          bucketByTime: { durationMillis: endTime - startTime },
          startTimeMillis: startTime,
          endTimeMillis: endTime
        })
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  extractValue(data, valueType) {
    try {
      const points = data.bucket?.[0]?.dataset?.[0]?.point || [];
      if (points.length === 0) return 0;
      
      // Sum all values if multiple points
      return points.reduce((sum, point) => {
        return sum + (point.value?.[0]?.[valueType] || 0);
      }, 0);
    } catch (error) {
      console.error('Error extracting value:', error);
      return 0;
    }
  }

  getValidToken() {
    const token = localStorage.getItem('google_fit_token');
    const expiry = localStorage.getItem('google_fit_token_expiry');
    
    if (!token || !expiry) return null;
    
    // Check if token expired
    if (new Date().getTime() > parseInt(expiry)) {
      this.disconnect();
      return null;
    }
    
    return token;
  }

  disconnect() {
    localStorage.removeItem('google_fit_token');
    localStorage.removeItem('google_fit_token_expiry');
  }

  isConnected() {
    return !!this.getValidToken();
  }
}

export default new GoogleFitService();