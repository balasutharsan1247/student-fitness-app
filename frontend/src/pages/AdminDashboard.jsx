import { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import Layout from '../components/Layout';
import { Users, Activity, Target, Flame, UserCheck, UserX, ShieldCheck } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const response = await adminService.getAggregateStats();
        if (response.success) {
          setStats(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
        setError(err.response?.data?.message || 'Failed to open admin dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-muted-dark">Loading University Analytics...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-8">
          <div className="bg-green- text-green- p-4 rounded-lg border border-green-">
            <p className="font-semibold text-lg">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  const { engagement, mentorSummary, departmentStats, stressTimeseries } = stats;

  // ── Demo fallbacks (shown only when DB has no data yet) ──────────
  // 14 daily points: avgStress mean ≈ 4, avgSleep mean ≈ 7
  const DEMO_TIMESERIES = [
    { date: 'Mar 20', avgStress: 4.2, avgSleep: 6.8 },
    { date: 'Mar 21', avgStress: 3.8, avgSleep: 7.3 },
    { date: 'Mar 22', avgStress: 4.5, avgSleep: 6.5 },
    { date: 'Mar 23', avgStress: 3.6, avgSleep: 7.6 },
    { date: 'Mar 24', avgStress: 4.1, avgSleep: 7.0 },
    { date: 'Mar 25', avgStress: 4.8, avgSleep: 6.2 },
    { date: 'Mar 26', avgStress: 3.9, avgSleep: 7.4 },
    { date: 'Mar 27', avgStress: 4.0, avgSleep: 7.1 },
    { date: 'Mar 28', avgStress: 3.5, avgSleep: 7.8 },
    { date: 'Mar 29', avgStress: 4.3, avgSleep: 6.9 },
    { date: 'Mar 30', avgStress: 4.6, avgSleep: 6.6 },
    { date: 'Mar 31', avgStress: 3.7, avgSleep: 7.5 },
    { date: 'Apr 01', avgStress: 4.2, avgSleep: 7.0 },
    { date: 'Apr 02', avgStress: 3.8, avgSleep: 7.3 },
  ];

  // 5 departments: avgSleepHours mean ≈ 7, avgStressLevel mean ≈ 4
  const DEMO_DEPT_STATS = [
    { department: 'Computer Sci', avgSleepHours: 6.4, avgStressLevel: 4.8 },
    { department: 'Engineering',  avgSleepHours: 6.9, avgStressLevel: 4.2 },
    { department: 'Business',     avgSleepHours: 7.2, avgStressLevel: 3.8 },
    { department: 'Arts',         avgSleepHours: 7.6, avgStressLevel: 3.5 },
    { department: 'Sciences',     avgSleepHours: 6.9, avgStressLevel: 3.7 },
  ];

  const chartTimeseries  = stressTimeseries?.length  > 0 ? stressTimeseries  : DEMO_TIMESERIES;
  const chartDeptStats   = departmentStats?.length   > 0 ? departmentStats   : DEMO_DEPT_STATS;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-dark mb-2">Campus Analytics</h1>
            <p className="text-muted-dark">Aggregate, de-identified population wellness insights.</p>
          </div>

          {/* KPI Ticker Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-dark-border">
              <div className="flex items-center space-x-3 mb-2">
                <Users className="w-8 h-8 text-green-500" />
                <p className="text-sm font-semibold text-muted-dark uppercase">Registered Students</p>
              </div>
              <p className="text-3xl font-bold text-dark">{engagement?.totalStudents || 0}</p>
            </div>

            <div className="card-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-dark-border">
              <div className="flex items-center space-x-3 mb-2">
                <Activity className="w-8 h-8 text-green-500" />
                <p className="text-sm font-semibold text-muted-dark uppercase">Daily Active Users</p>
              </div>
              <p className="text-3xl font-bold text-dark">{engagement?.dailyActiveUsers || 0}</p>
            </div>

            <div className="card-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-dark-border">
              <div className="flex items-center space-x-3 mb-2">
                <Target className="w-8 h-8 text-green-500" />
                <p className="text-sm font-semibold text-muted-dark uppercase">Platform Engagement</p>
              </div>
              <p className="text-3xl font-bold text-dark">{engagement?.engagementRate || 0}%</p>
            </div>

            <div className="card-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-dark-border">
              <div className="flex items-center space-x-3 mb-2">
                <Flame className="w-8 h-8 text-green-" />
                <p className="text-sm font-semibold text-muted-dark uppercase">Avg Active Streak</p>
              </div>
              <p className="text-3xl font-bold text-dark">{engagement?.averageCurrentStreak || 0} days</p>
            </div>
          </div>

          {/* ── Mentor Assignment Overview ───────────────────────────── */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-dark mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              Mentor Assignment Overview
            </h2>

            {/* Unassigned students alert */}
            {mentorSummary?.unassignedStudents > 0 && (
              <div className="flex items-start gap-3 bg-green- dark:bg-green-/20 border border-green- dark:border-green- text-green- dark:text-green- rounded-xl px-4 py-3 mb-4 text-sm">
                <UserX className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>{mentorSummary.unassignedStudents}</strong>{' '}
                  student{mentorSummary.unassignedStudents !== 1 ? 's are' : ' is'} currently unassigned to a mentor.{' '}
                  <a
                    href="/admin/roles"
                    className="underline font-semibold hover:text-green- dark:hover:text-green- transition-colors"
                  >
                    Manage assignments →
                  </a>
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Summary KPI cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="card-dark p-5 rounded-xl shadow-sm border border-gray-100 dark:border-dark-border flex items-center gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-xl">
                    <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-dark">{mentorSummary?.totalMentors || 0}</p>
                    <p className="text-sm text-muted-dark">Total Mentors</p>
                  </div>
                </div>

                <div className="card-dark p-5 rounded-xl shadow-sm border border-gray-100 dark:border-dark-border flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl ${mentorSummary?.unassignedStudents > 0
                        ? 'bg-green- dark:bg-green-/40'
                        : 'bg-emerald-100 dark:bg-emerald-900/40'
                      }`}
                  >
                    <UserX
                      className={`w-6 h-6 ${mentorSummary?.unassignedStudents > 0
                          ? 'text-green- dark:text-green-'
                          : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                    />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-dark">{mentorSummary?.unassignedStudents || 0}</p>
                    <p className="text-sm text-muted-dark">Unassigned</p>
                  </div>
                </div>
              </div>

              {/* Per-mentor workload table */}
              <div className="card-dark rounded-xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-dark-border">
                  <p className="text-sm font-semibold text-dark">Mentor Workload</p>
                </div>
                {mentorSummary?.mentorLoad?.length > 0 ? (
                  <div className="overflow-y-auto max-h-40">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-dark-hover text-xs text-muted-dark uppercase tracking-wider">
                          <th className="text-left px-4 py-2">Mentor</th>
                          <th className="text-center px-4 py-2">Students</th>
                          <th className="text-center px-4 py-2">Load</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                        {mentorSummary.mentorLoad.map((m, i) => (
                          <tr key={i} className="hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors">
                            <td className="px-4 py-2 font-medium text-dark truncate max-w-[160px]">{m.name}</td>
                            <td className="px-4 py-2 text-center text-muted-dark">{m.studentCount}</td>
                            <td className="px-4 py-2 text-center">
                              {m.studentCount === 0 ? (
                                <span className="inline-block bg-gray-100 dark:bg-dark-hover text-gray-500 dark:text-gray-400 text-xs px-2 py-0.5 rounded-full">
                                  Idle
                                </span>
                              ) : m.studentCount >= 10 ? (
                                <span className="inline-block bg-green- dark:bg-green-/30 text-green- dark:text-green- text-xs px-2 py-0.5 rounded-full">
                                  High
                                </span>
                              ) : m.studentCount >= 5 ? (
                                <span className="inline-block bg-green- dark:bg-green-/30 text-green- dark:text-green- text-xs px-2 py-0.5 rounded-full">
                                  Medium
                                </span>
                              ) : (
                                <span className="inline-block bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs px-2 py-0.5 rounded-full">
                                  Low
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-dark text-center py-6">No mentors registered yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Stress + Sleep Timeseries Chart */}
            <div className="card-dark rounded-xl shadow-dark p-6">
              <h3 className="text-lg font-semibold text-dark mb-1 block">Campus Stress &amp; Sleep Trend (Past 14 Days)</h3>
              <p className="text-xs text-muted-dark mb-4">Avg daily stress level vs. avg sleep hours across all students</p>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartTimeseries} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="stress" orientation="right" stroke="#F59E0B" fontSize={12} tickLine={false} axisLine={false} domain={[0, 10]} />
                    <YAxis yAxisId="sleep" orientation="left" stroke="#6366F1" fontSize={12} tickLine={false} axisLine={false} domain={[0, 12]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F9FAFB' }}
                      itemStyle={{ color: '#F9FAFB' }}
                    />
                    <Legend />
                    <Line
                      yAxisId="sleep"
                      type="monotone"
                      dataKey="avgSleep"
                      stroke="#6366F1"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                      name="Avg Sleep (hrs)"
                    />
                    <Line
                      yAxisId="stress"
                      type="monotone"
                      dataKey="avgStress"
                      stroke="#F59E0B"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                      name="Avg Stress (0-10)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Department Comparison Chart */}
            <div className="card-dark rounded-xl shadow-dark p-6">
              <h3 className="text-lg font-semibold text-dark mb-4 block">Sleep vs. Stress by Department</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartDeptStats} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="department" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="left" stroke="#888888" fontSize={12} orientation="left" tickLine={false} axisLine={false} />
                    <YAxis yAxisId="right" stroke="#888888" fontSize={12} orientation="right" tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F9FAFB' }} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="avgSleepHours" fill="#6366F1" radius={[4, 4, 0, 0]} name="Avg Sleep (hrs)" />
                    <Bar yAxisId="right" dataKey="avgStressLevel" fill="#EF4444" radius={[4, 4, 0, 0]} name="Avg Stress (0-10)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Department Breakdown Table */}
          <div className="card-dark rounded-xl shadow-dark p-6 overflow-hidden">
            <h3 className="text-lg font-semibold text-dark mb-4 block">Department Wellness Breakdown (30 Days)</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg Sleep (hrs)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg Stress (0-10)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg Active Minutes</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Logs Submitted</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-dark-border">
                  {departmentStats && departmentStats.map((dept, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark">{dept.department}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-dark">{dept.avgSleepHours}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-dark">{dept.avgStressLevel}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-dark">{dept.avgActiveMinutes}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-dark">{dept.logCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
