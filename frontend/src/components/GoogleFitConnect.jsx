import { useState, useEffect } from 'react';
import { Activity, Check, X, AlertCircle } from 'lucide-react';
import googleFit from '../services/googleFit';

const GoogleFitConnect = ({ onDataFetched }) => {
  const [connected, setConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [error, setError] = useState(null);
  const [syncedData, setSyncedData] = useState(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      await googleFit.initialize();
      setConnected(googleFit.isConnected());
    } catch (error) {
      console.error('Initialization error:', error);
    }
  };

  const handleConnect = async () => {
    setError(null);
    try {
      await googleFit.requestAuthorization();
      setConnected(true);
      // Auto-sync after connection
      setTimeout(() => handleSync(), 1000);
    } catch (error) {
      console.error('Connection failed:', error);
      setError('Failed to connect. Please try again.');
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    try {
      const data = await googleFit.getTodayData();
      setLastSync(new Date());
      setSyncedData(data);
      
      // Pass data to parent component
      if (onDataFetched) {
        onDataFetched(data);
      }
    } catch (error) {
      console.error('Sync failed:', error);
      setError(error.message || 'Failed to sync data');
      
      // If session expired, disconnect
      if (error.message?.includes('expired') || error.message?.includes('reconnect')) {
        setConnected(false);
      }
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = () => {
    googleFit.disconnect();
    setConnected(false);
    setLastSync(null);
    setSyncedData(null);
    setError(null);
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800 p-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-dark">Google Fit Auto-Sync</h4>
            <p className="text-sm text-muted-dark">
              {connected ? '✓ Connected' : 'Import steps, calories & distance automatically'}
            </p>
          </div>
        </div>

        {connected ? (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
            >
              {syncing ? (
                <>
                  <span className="inline-block animate-spin mr-2">⟳</span>
                  Syncing...
                </>
              ) : (
                'Sync Now'
              )}
            </button>
            <button
              onClick={handleDisconnect}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
              title="Disconnect"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
          >
            Connect Google Fit
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-3 flex items-start space-x-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Last sync info */}
      {connected && lastSync && (
        <div className="mt-3 flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2 text-green-600">
            <Check className="w-4 h-4" />
            <span>Last synced: {lastSync.toLocaleTimeString()}</span>
          </div>
          
          {/* Synced data preview */}
          {syncedData && (
            <div className="flex items-center space-x-4 text-muted-dark">
              <span>🚶 {syncedData.steps.toLocaleString()} steps</span>
              <span>🔥 {syncedData.calories} cal</span>
              <span>📍 {syncedData.distance} km</span>
            </div>
          )}
        </div>
      )}

      {/* First-time instructions */}
      {!connected && (
        <div className="mt-4 text-xs text-muted-dark card-dark p-3 rounded-lg">
          <p className="font-medium mb-1">📱 How it works:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Click "Connect Google Fit"</li>
            <li>Sign in with your Google account</li>
            <li>Allow fitness data access (read-only)</li>
            <li>Click "Sync Now" to import today's data</li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default GoogleFitConnect;