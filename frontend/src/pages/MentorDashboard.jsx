import { useState, useEffect, useCallback } from 'react';
import { mentorService } from '../services/api';
import Layout from '../components/Layout';
import {
  Users, Search, TrendingUp, Award, BarChart2, MessageSquare,
  Footprints, Moon, Activity, Star, CheckCircle, Target,
  ChevronRight, Send, AlertTriangle, Flame, Droplets, BookOpen, Shield
} from 'lucide-react';

// ─── Tiny sparkline component ──────────────────────────────────────
const Sparkline = ({ data, color = '#6366f1', height = 40 }) => {
  if (!data || data.length < 2) {
    return <div className="text-xs text-gray-400 italic">No trend data</div>;
  }
  const vals = data.map((d) => d.lifestyleScore ?? 0);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const w = 120, h = height;
  const pts = vals
    .map((v, i) => `${(i / (vals.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`)
    .join(' ');
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {vals.map((v, i) => (
        <circle key={i} cx={(i / (vals.length - 1)) * w} cy={h - ((v - min) / range) * (h - 4) - 2} r="2.5" fill={color} />
      ))}
    </svg>
  );
};

// ─── Stat card ─────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color = 'purple' }) => {
  const colors = {
    purple: 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400',
    blue: 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400',
    green: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
    orange: 'bg-green- text-green- dark:bg-green-/40 dark:text-green-',
  };
  return (
    <div className="card-dark p-5 rounded-xl border border-gray-100 dark:border-dark-border shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-dark">{value ?? '—'}</p>
        <p className="text-sm font-medium text-dark">{label}</p>
        {sub && <p className="text-xs text-muted-dark mt-0.5">{sub}</p>}
      </div>
    </div>
  );
};

// ─── Tab Button ────────────────────────────────────────────────────
const TabBtn = ({ id, active, onClick, icon: Icon, label }) => (
  <button
    id={`mentor-tab-${id}`}
    onClick={() => onClick(id)}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
      active
        ? 'bg-green-600 text-white shadow-md'
        : 'text-muted-dark hover:bg-gray-100 dark:hover:bg-dark-hover'
    }`}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

// ─── Main Component ─────────────────────────────────────────────────
const MentorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentSummary, setStudentSummary] = useState(null);
  const [batchTrends, setBatchTrends] = useState(null);
  const [topPerformers, setTopPerformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [msgText, setMsgText] = useState('');
  const [msgSending, setMsgSending] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState('');
  const [error, setError] = useState('');

  // Initial data fetch
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [studRes, batchRes, topRes] = await Promise.all([
          mentorService.getStudents(),
          mentorService.getBatchTrends(),
          mentorService.getTopPerformers(),
        ]);
        if (studRes.success) setStudents(studRes.data);
        if (batchRes.success) setBatchTrends(batchRes.data);
        if (topRes.success) setTopPerformers(topRes.data);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const loadStudentSummary = useCallback(async (student) => {
    try {
      setSummaryLoading(true);
      setSelectedStudent(student);
      setStudentSummary(null);
      setMsgText('');
      setMsgSuccess('');
      const res = await mentorService.getStudentSummary(student._id);
      if (res.success) setStudentSummary(res.data);
    } catch (err) {
      setError(`Failed to load summary for ${student.firstName}`);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const handleSendMessage = async () => {
    if (!msgText.trim() || !selectedStudent) return;
    try {
      setMsgSending(true);
      const res = await mentorService.sendMessage(selectedStudent._id, msgText);
      if (res.success) {
        setMsgSuccess('Message sent successfully! 🎉');
        setMsgText('');
        setTimeout(() => setMsgSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to send message');
    } finally {
      setMsgSending(false);
    }
  };

  // Derived overview stats
  const avgStreak = students.length
    ? Math.round(students.reduce((s, u) => s + (u.currentStreak || 0), 0) / students.length)
    : 0;
  const avgPoints = students.length
    ? Math.round(students.reduce((s, u) => s + (u.points || 0), 0) / students.length)
    : 0;

  const filteredStudents = students.filter((s) =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchText.toLowerCase()) ||
    (s.studentId || '').toLowerCase().includes(searchText.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-green-500 mx-auto mb-4" />
            <p className="text-muted-dark">Loading your mentor dashboard…</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-xl">
                <Shield className="w-7 h-7 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-dark">Mentor Dashboard</h1>
                <p className="text-sm text-muted-dark">
                  Read-only supervision · {students.length} assigned student{students.length !== 1 && 's'}
                </p>
              </div>
            </div>
            {/* Privacy badge */}
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-xs font-medium px-3 py-2 rounded-lg">
              <Shield className="w-3.5 h-3.5" />
              Privacy-protected view · No raw sensitive data
            </div>
          </div>

          {error && (
            <div className="bg-green- dark:bg-green-/20 text-green- dark:text-green- border border-green- dark:border-green- p-4 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 p-1 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl shadow-sm">
            <TabBtn id="overview" active={activeTab === 'overview'} onClick={setActiveTab} icon={BarChart2} label="Overview" />
            <TabBtn id="students" active={activeTab === 'students'} onClick={setActiveTab} icon={Users} label="My Students" />
            <TabBtn id="batch" active={activeTab === 'batch'} onClick={setActiveTab} icon={TrendingUp} label="Batch Insights" />
            <TabBtn id="top" active={activeTab === 'top'} onClick={setActiveTab} icon={Award} label="Top Performers" />
          </div>

          {/* ── TAB: OVERVIEW ─────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Users} label="Assigned Students" value={students.length} sub="in your cohort" color="purple" />
                <StatCard icon={Flame} label="Avg Streak" value={`${avgStreak} days`} sub="across cohort" color="orange" />
                <StatCard
                  icon={Activity}
                  label="Avg Wellness Score"
                  value={batchTrends?.overall?.avgWellnessScore ?? '—'}
                  sub="last 30 days"
                  color="blue"
                />
                <StatCard icon={Star} label="Avg Points" value={avgPoints} sub="per student" color="green" />
              </div>

              {/* Dept breakdown quick card */}
              {batchTrends?.byDepartment?.length > 0 && (
                <div className="card-dark rounded-xl border border-gray-100 dark:border-dark-border shadow-sm p-6">
                  <h2 className="text-lg font-bold text-dark mb-4 flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-green-500" /> Department Snapshot (Last 30 Days)
                  </h2>
                  <div className="space-y-3">
                    {batchTrends.byDepartment.map((dep) => (
                      <div key={dep.department} className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 dark:bg-dark-hover rounded-lg p-3 gap-2">
                        <div>
                          <p className="font-semibold text-dark">{dep.department || 'Unknown'}</p>
                          <p className="text-xs text-muted-dark">{dep.studentCount} student{dep.studentCount !== 1 && 's'} · {dep.logCount} logs</p>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                            <Moon className="w-3.5 h-3.5" /> {dep.avgSleepHours}h sleep
                          </span>
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                            <Footprints className="w-3.5 h-3.5" /> {dep.avgSteps?.toLocaleString()} steps
                          </span>
                          <span className={`flex items-center gap-1 font-bold ${dep.avgWellnessScore >= 70 ? 'text-emerald-600 dark:text-emerald-400' : dep.avgWellnessScore >= 50 ? 'text-green- dark:text-green-' : 'text-green- dark:text-green-'}`}>
                            <Activity className="w-3.5 h-3.5" /> {dep.avgWellnessScore} score
                          </span>
                          {dep.avgSleepHours < 5 && (
                            <span className="flex items-center gap-1 bg-green- dark:bg-green-/30 text-green- dark:text-green- text-xs px-2 py-0.5 rounded-full">
                              <AlertTriangle className="w-3 h-3" /> Low Sleep Alert
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {students.length === 0 && (
                <div className="card-dark rounded-xl border border-gray-100 dark:border-dark-border p-12 text-center shadow-sm">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-dark-muted" />
                  <h3 className="font-bold text-dark mb-1">No students assigned yet</h3>
                  <p className="text-muted-dark text-sm">Ask your admin to assign students to your mentor account.</p>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: MY STUDENTS ──────────────────────────────────── */}
          {activeTab === 'students' && (
            <div className="flex flex-col lg:flex-row gap-6">

              {/* Needs-attention cohort banner */}

              {/* Sidebar: student list */}
              <div className="w-full lg:w-72 flex-shrink-0">
                <div className="card-dark rounded-xl border border-gray-100 dark:border-dark-border shadow-sm overflow-hidden">
                  <div className="p-3 border-b border-gray-100 dark:border-dark-border">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search by name or ID…"
                        className="input-dark w-full pl-9 pr-3 py-2 text-sm"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto max-h-[600px] p-2 space-y-1">
                    {filteredStudents.length === 0 ? (
                      <p className="text-center text-muted-dark py-8 text-sm">No students found.</p>
                    ) : (
                      filteredStudents.map((s) => {
                        const needsAttention = s.currentStreak === 0;
                        return (
                        <button
                          key={s._id}
                          id={`student-btn-${s._id}`}
                          onClick={() => loadStudentSummary(s)}
                          className={`w-full text-left p-3 rounded-lg transition-all ${
                            selectedStudent?._id === s._id
                              ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800'
                              : needsAttention
                              ? 'hover:bg-green- dark:hover:bg-green-/10 border border-green- dark:border-green-/50'
                              : 'hover:bg-gray-50 dark:hover:bg-dark-hover border border-transparent'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="min-w-0">
                              <p className="font-semibold text-dark text-sm truncate">{s.firstName} {s.lastName}</p>
                              <p className="text-xs text-muted-dark">{s.studentId || 'No ID'} · {s.department || 'Dept N/A'}</p>
                              {needsAttention && (
                                <span className="inline-flex items-center gap-1 mt-1 bg-green- dark:bg-green-/40 text-green- dark:text-green- text-xs font-medium px-1.5 py-0.5 rounded">
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  Needs Attention
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                              <span className={`font-bold text-xs ${needsAttention ? 'text-green-' : 'text-green-'}`}>
                                🔥 {s.currentStreak}
                              </span>
                              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                            </div>
                          </div>
                        </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Main: student summary */}
              <div className="flex-1 min-w-0">
                {!selectedStudent ? (
                  <div className="card-dark rounded-xl border border-gray-100 dark:border-dark-border shadow-sm p-12 text-center">
                    <BookOpen className="w-14 h-14 mx-auto mb-4 text-gray-300 dark:text-dark-muted" />
                    <h3 className="text-lg font-bold text-dark mb-2">Select a Student</h3>
                    <p className="text-muted-dark text-sm max-w-xs mx-auto">
                      Choose a student from your roster to view their wellness summary and send encouragement.
                    </p>
                  </div>
                ) : summaryLoading ? (
                  <div className="card-dark rounded-xl border border-gray-100 dark:border-dark-border shadow-sm p-12 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500 mx-auto mb-3" />
                    <p className="text-muted-dark text-sm">Loading student summary…</p>
                  </div>
                ) : studentSummary ? (
                  <div className="space-y-4">

                    {/* Student header */}
                    <div className="card-dark rounded-xl border border-gray-100 dark:border-dark-border shadow-sm p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h2 className="text-xl font-bold text-dark">
                            {studentSummary.student.firstName} {studentSummary.student.lastName}
                          </h2>
                          <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-dark">
                            <span className="bg-gray-100 dark:bg-dark-hover px-2 py-0.5 rounded">{studentSummary.student.studentId || 'No ID'}</span>
                            <span className="bg-gray-100 dark:bg-dark-hover px-2 py-0.5 rounded">{studentSummary.student.department || 'Dept N/A'}</span>
                            <span className="bg-gray-100 dark:bg-dark-hover px-2 py-0.5 rounded">Year {studentSummary.student.year || '—'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 bg-green- dark:bg-green-/20 text-green- dark:text-green- font-bold px-3 py-1.5 rounded-lg text-sm">
                            🔥 {studentSummary.student.currentStreak} day streak
                          </span>
                        </div>
                      </div>

                      {/* Privacy notice */}
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 px-3 py-1.5 rounded-lg">
                        <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                        Showing aggregated wellness data only — raw logs, mood & stress data are not visible to mentors.
                      </div>
                    </div>

                    {/* Avg stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="card-dark rounded-xl border border-gray-100 dark:border-dark-border p-4 text-center">
                        <Activity className="w-5 h-5 mx-auto mb-1 text-green-500" />
                        <p className="text-lg font-bold text-dark">{studentSummary.averages.wellnessScore ?? '—'}</p>
                        <p className="text-xs text-muted-dark">Avg Wellness</p>
                      </div>
                      <div className="card-dark rounded-xl border border-gray-100 dark:border-dark-border p-4 text-center">
                        <Footprints className="w-5 h-5 mx-auto mb-1 text-green-500" />
                        <p className="text-lg font-bold text-dark">{studentSummary.averages.steps?.toLocaleString() ?? '—'}</p>
                        <p className="text-xs text-muted-dark">Avg Steps</p>
                      </div>
                      <div className="card-dark rounded-xl border border-gray-100 dark:border-dark-border p-4 text-center">
                        <Moon className="w-5 h-5 mx-auto mb-1 text-green-500" />
                        <p className="text-lg font-bold text-dark">{studentSummary.averages.sleepHours ?? '—'}h</p>
                        <p className="text-xs text-muted-dark">Avg Sleep</p>
                      </div>
                      <div className="card-dark rounded-xl border border-gray-100 dark:border-dark-border p-4 text-center">
                        <CheckCircle className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
                        <p className="text-lg font-bold text-dark">{studentSummary.consistency}%</p>
                        <p className="text-xs text-muted-dark">Consistency</p>
                      </div>
                    </div>

                    {/* Goal stats + weekly trend */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="card-dark rounded-xl border border-gray-100 dark:border-dark-border shadow-sm p-5">
                        <h3 className="font-bold text-dark mb-3 flex items-center gap-2">
                          <Target className="w-4 h-4 text-green-500" /> Goal Completion
                        </h3>
                        <div className="flex items-end gap-2 mb-3">
                          <span className="text-3xl font-black text-dark">
                            {studentSummary.goals.total > 0
                              ? Math.round((studentSummary.goals.completed / studentSummary.goals.total) * 100)
                              : 0}%
                          </span>
                          <span className="text-muted-dark text-sm mb-1">completed</span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-dark">Total Goals</span>
                            <span className="font-semibold text-dark">{studentSummary.goals.total}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-dark">Completed</span>
                            <span className="font-semibold text-emerald-600">{studentSummary.goals.completed}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-dark">Active</span>
                            <span className="font-semibold text-green-600">{studentSummary.goals.active}</span>
                          </div>
                        </div>
                      </div>

                      <div className="card-dark rounded-xl border border-gray-100 dark:border-dark-border shadow-sm p-5">
                        <h3 className="font-bold text-dark mb-3 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-500" /> 7-Day Wellness Trend
                        </h3>
                        {studentSummary.weeklyTrend.length > 0 ? (
                          <div>
                            <Sparkline data={studentSummary.weeklyTrend} color="#8b5cf6" height={50} />
                            <div className="flex justify-between text-xs text-muted-dark mt-2">
                              <span>{new Date(studentSummary.weeklyTrend[0].date).toLocaleDateString('en', { weekday: 'short' })}</span>
                              <span>{new Date(studentSummary.weeklyTrend[studentSummary.weeklyTrend.length - 1].date).toLocaleDateString('en', { weekday: 'short' })}</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-muted-dark text-sm">No data for the past 7 days.</p>
                        )}
                      </div>
                    </div>

                    {/* Encouragement message */}
                    <div className="card-dark rounded-xl border border-gray-100 dark:border-dark-border shadow-sm p-5">
                      <h3 className="font-bold text-dark mb-3 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-green-500" /> Send Feedback
                      </h3>
                      <p className="text-xs text-muted-dark mb-3">
                        Messages are stored and visible to the student. Keep it positive and motivating!
                      </p>
                      {msgSuccess && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 p-3 rounded-lg text-sm mb-3">
                          {msgSuccess}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <input
                          id="encouragement-input"
                          type="text"
                          placeholder={`e.g. "Great job on your 5-day streak, ${studentSummary.student.firstName}! 🎉"`}
                          className="input-dark flex-1 text-sm"
                          value={msgText}
                          onChange={(e) => setMsgText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <button
                          id="send-message-btn"
                          onClick={handleSendMessage}
                          disabled={msgSending || !msgText.trim()}
                          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                        >
                          <Send className="w-4 h-4" />
                          {msgSending ? 'Sending…' : 'Send'}
                        </button>
                      </div>
                    </div>

                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* ── TAB: BATCH INSIGHTS ───────────────────────────────── */}
          {activeTab === 'batch' && (
            <div className="space-y-5">
              {/* Overall cohort averages */}
              {batchTrends?.overall && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <StatCard icon={Activity} label="Avg Wellness Score" value={batchTrends.overall.avgWellnessScore} sub="cohort · last 30 days" color="purple" />
                  <StatCard icon={Footprints} label="Avg Daily Steps" value={batchTrends.overall.avgSteps?.toLocaleString()} sub="cohort · last 30 days" color="blue" />
                  <StatCard icon={Moon} label="Avg Sleep Hours" value={`${batchTrends.overall.avgSleepHours}h`} sub="cohort · last 30 days" color={batchTrends.overall.avgSleepHours < 5 ? 'orange' : 'green'} />
                </div>
              )}

              {/* Low sleep global alert */}
              {batchTrends?.overall?.avgSleepHours < 5 && (
                <div className="bg-green- dark:bg-green-/20 border border-green- dark:border-green- p-4 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-green- dark:text-green- flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green- dark:text-green-">Early Intervention Alert</p>
                    <p className="text-sm text-green- dark:text-green- mt-0.5">
                      Your cohort is averaging only {batchTrends.overall.avgSleepHours}h of sleep — below the healthy threshold of 5hrs. Consider reaching out to students.
                    </p>
                  </div>
                </div>
              )}

              {/* Dept table */}
              <div className="card-dark rounded-xl border border-gray-100 dark:border-dark-border shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 dark:border-dark-border">
                  <h2 className="font-bold text-dark flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" /> Department-Level Aggregate Trends
                  </h2>
                  <p className="text-xs text-muted-dark mt-1">Showing data for your assigned cohort only · Last 30 days</p>
                </div>
                {batchTrends?.byDepartment?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-dark-hover text-xs text-muted-dark uppercase tracking-wider">
                          <th className="text-left p-4">Department</th>
                          <th className="text-center p-4">Students</th>
                          <th className="text-center p-4">Avg Sleep</th>
                          <th className="text-center p-4">Avg Steps</th>
                          <th className="text-center p-4">Avg Wellness</th>
                          <th className="text-center p-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                        {batchTrends.byDepartment.map((dep) => (
                          <tr key={dep.department} className="hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors">
                            <td className="p-4 font-medium text-dark">{dep.department || 'Unknown'}</td>
                            <td className="p-4 text-center text-muted-dark">{dep.studentCount}</td>
                            <td className={`p-4 text-center font-semibold ${dep.avgSleepHours < 5 ? 'text-green- dark:text-green-' : dep.avgSleepHours < 7 ? 'text-green- dark:text-green-' : 'text-emerald-600 dark:text-emerald-400'}`}>
                              {dep.avgSleepHours}h
                            </td>
                            <td className="p-4 text-center text-muted-dark">{dep.avgSteps?.toLocaleString()}</td>
                            <td className={`p-4 text-center font-bold ${dep.avgWellnessScore >= 70 ? 'text-emerald-600 dark:text-emerald-400' : dep.avgWellnessScore >= 50 ? 'text-green- dark:text-green-' : 'text-green- dark:text-green-'}`}>
                              {dep.avgWellnessScore}
                            </td>
                            <td className="p-4 text-center">
                              {dep.avgSleepHours < 5 ? (
                                <span className="inline-flex items-center gap-1 bg-green- dark:bg-green-/30 text-green- dark:text-green- text-xs px-2 py-1 rounded-full">
                                  <AlertTriangle className="w-3 h-3" /> At-Risk
                                </span>
                              ) : dep.avgWellnessScore >= 70 ? (
                                <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs px-2 py-1 rounded-full">
                                  <CheckCircle className="w-3 h-3" /> Healthy
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-green- dark:bg-green-/30 text-green- dark:text-green- text-xs px-2 py-1 rounded-full">
                                  ⚠ Moderate
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center text-muted-dark">
                    <BarChart2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No trend data available yet for your cohort.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TAB: TOP PERFORMERS ───────────────────────────────── */}
          {activeTab === 'top' && (
            <div className="card-dark rounded-xl border border-gray-100 dark:border-dark-border shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 dark:border-dark-border flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-dark flex items-center gap-2">
                    <Award className="w-5 h-5 text-green-" /> Anonymized Top Performers
                  </h2>
                  <p className="text-xs text-muted-dark mt-1">Top 10% by habit consistency · Names are hidden to protect student privacy</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 px-3 py-1.5 rounded-lg">
                  <Shield className="w-3.5 h-3.5" /> Anonymized
                </div>
              </div>

              {topPerformers.length === 0 ? (
                <div className="p-12 text-center text-muted-dark">
                  <Award className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No performer data available yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-dark-hover text-xs text-muted-dark uppercase tracking-wider">
                        <th className="text-center p-4">Rank</th>
                        <th className="text-left p-4">Department</th>
                        <th className="text-center p-4">Year</th>
                        <th className="text-center p-4">Consistency</th>
                        <th className="text-center p-4">Streak</th>
                        <th className="text-center p-4">Avg Wellness</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                      {topPerformers.map((p) => (
                        <tr key={p.rank} className="hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors">
                          <td className="p-4 text-center">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                              p.rank === 1 ? 'bg-green- dark:bg-green-/30 text-green- dark:text-green-' :
                              p.rank === 2 ? 'bg-gray-100 dark:bg-dark-hover text-gray-600 dark:text-gray-300' :
                              p.rank === 3 ? 'bg-green- dark:bg-green-/30 text-green- dark:text-green-' :
                              'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                            }`}>
                              {p.rank === 1 ? '🥇' : p.rank === 2 ? '🥈' : p.rank === 3 ? '🥉' : `#${p.rank}`}
                            </span>
                          </td>
                          <td className="p-4 font-medium text-dark">{p.dept || 'Unknown'}</td>
                          <td className="p-4 text-center text-muted-dark">{p.year || '—'}</td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <div className="w-16 h-1.5 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${p.consistency}%` }} />
                              </div>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">{p.consistency}%</span>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className="font-bold text-green-">🔥 {p.streak}</span>
                          </td>
                          <td className="p-4 text-center font-bold text-green-600 dark:text-green-400">{p.avgWellnessScore}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
};

export default MentorDashboard;
