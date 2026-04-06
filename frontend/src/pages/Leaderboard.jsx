import { useState, useEffect } from 'react';
import { leaderboardService } from '../services/api';
import Layout from '../components/Layout';
import { Trophy, Flame, Award, Medal } from 'lucide-react';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState({ topStreaks: [], topPoints: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    try {
      setLoading(true);
      const response = await leaderboardService.getLeaderboard();
      if (response.success) {
        setLeaderboardData(response.data);
      }
    } catch (err) {
      setError('Failed to load campus leaderboards');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRankMedal = (index) => {
    switch(index) {
      case 0: return <Medal className="w-6 h-6 text-yellow-500 drop-shadow-sm" />; // Gold
      case 1: return <Medal className="w-6 h-6 text-gray-400 drop-shadow-sm" />; // Silver
      case 2: return <Medal className="w-6 h-6 text-amber-700 drop-shadow-sm" />; // Bronze
      default: return <span className="text-muted-dark font-bold w-6 text-center">{index + 1}</span>;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-4 sm:p-6 lg:p-8">
         <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-10 text-center">
               <div className="inline-flex p-4 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                 <Trophy className="w-12 h-12 text-green-600 dark:text-green-400" />
               </div>
               <h1 className="text-4xl font-black text-dark tracking-tight mb-2">Campus Leaderboard</h1>
               <p className="text-muted-dark text-lg max-w-2xl mx-auto">
                 Compete with your peers! Climb the ranks by maintaining your daily logging streak and completing health goals.
               </p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg text-center">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Streaks Column */}
              <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-green-100 dark:border-green-900/30 overflow-hidden">
                 <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-center relative overflow-hidden">
                    <Flame className="absolute -left-4 -bottom-4 w-32 h-32 text-green-400 opacity-20" />
                    <h2 className="text-2xl font-bold text-white relative z-10 flex items-center justify-center">
                       <Flame className="w-6 h-6 mr-2" />
                       Consistency Kings
                    </h2>
                    <p className="text-green-100 mt-1 text-sm relative z-10">Longest Active Streaks</p>
                 </div>
                 <div className="p-2">
                    {leaderboardData.topStreaks.length === 0 ? (
                      <p className="p-8 text-center text-muted-dark">No active streaks yet.</p>
                    ) : (
                      leaderboardData.topStreaks.map((student, index) => (
                        <div key={student._id} className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-dark-border last:border-0 hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors rounded-lg">
                           <div className="flex items-center space-x-4">
                              <div className="w-8 flex justify-center">
                                 {getRankMedal(index)}
                              </div>
                              <span className="font-bold text-dark text-lg">{student.name}</span>
                           </div>
                           <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full border border-green-100 dark:border-green-800">
                             <span className="font-black text-green-600 dark:text-green-400 text-xl">{student.streak}</span>
                             <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase">Days</span>
                           </div>
                        </div>
                      ))
                    )}
                 </div>
              </div>

              {/* Points Column */}
              <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-green-100 dark:border-green-900/30 overflow-hidden">
                 <div className="bg-gradient-to-r from-green-500 to-green-500 p-6 text-center relative overflow-hidden">
                    <Award className="absolute -right-4 -top-4 w-32 h-32 text-green-400 opacity-20" />
                    <h2 className="text-2xl font-bold text-white relative z-10 flex items-center justify-center">
                       <Award className="w-6 h-6 mr-2" />
                       All-Time Leaders
                    </h2>
                    <p className="text-green-100 mt-1 text-sm relative z-10">Highest Total Points</p>
                 </div>
                 <div className="p-2">
                    {leaderboardData.topPoints.length === 0 ? (
                      <p className="p-8 text-center text-muted-dark">No points awarded yet.</p>
                    ) : (
                      leaderboardData.topPoints.map((student, index) => (
                        <div key={student._id} className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-dark-border last:border-0 hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors rounded-lg">
                           <div className="flex items-center space-x-4">
                              <div className="w-8 flex justify-center">
                                 {getRankMedal(index)}
                              </div>
                              <span className="font-bold text-dark text-lg">{student.name}</span>
                           </div>
                           <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full border border-green-100 dark:border-green-900/50">
                             <span>{student.points.toLocaleString()}</span>
                             <span className="text-xs uppercase">Pts</span>
                           </div>
                        </div>
                      ))
                    )}
                 </div>
              </div>

            </div>
         </div>
      </div>
    </Layout>
  );
};

export default Leaderboard;
