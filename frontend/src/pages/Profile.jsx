import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { User, Award, TrendingUp, Mail, Building, BookOpen, Calendar } from 'lucide-react';

const HEALTH_CONSIDERATIONS_OPTIONS = [
  { value: 'breathing_issues', label: 'Breathing issues' },
  { value: 'heart_restriction', label: 'Heart restriction' },
  { value: 'joint_pain', label: 'Joint pain' },
  { value: 'diabetes_concern', label: 'Diabetes concern' },
  { value: 'doctor_exercise_limit', label: 'Doctor exercise limit' },
  { value: 'dietary_restriction', label: 'Dietary restriction' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
];

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [selectedConsiderations, setSelectedConsiderations] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const isStudent = user?.role === 'student';
  const profileIdLabel =
    user?.role === 'admin'
      ? 'Admin ID'
      : user?.role === 'mentor'
      ? 'Mentor ID'
      : 'Student ID';
  const profileIdValue =
    user?.studentId || user?.mentorId || user?.adminId || '—';

  useEffect(() => {
    setSelectedConsiderations(user?.healthConsiderations || []);
  }, [user]);

  const handleCheckboxChange = (value) => {
    setSelectedConsiderations((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSaving(true);

    try {
      const response = await authService.updateProfile({
        healthConsiderations: selectedConsiderations,
      });
      updateUser(response.user);
      setSuccessMessage('Health considerations saved successfully.');
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || 'Unable to save health considerations.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-dark">My Profile</h1>
            <p className="text-muted-dark mt-1">
              View and manage your account information
            </p>
          </div>

          {/* Profile Card */}
          <div className="card-dark rounded-xl shadow-dark p-8">
            {/* User Avatar */}
            <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-dark">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-3xl">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-dark">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-muted-dark">{user?.email}</p>
                
                {isStudent && (
                  <div className="mt-4">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                        <Award className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="font-semibold text-green-900 dark:text-green-400">
                          {user?.points || 0} pts
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                        <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="font-semibold text-green-900 dark:text-green-400">
                          Level {user?.level || Math.floor((user?.points || 0) / 500) + 1}
                        </span>
                      </div>
                    </div>

                    {/* Level Progress Bar */}
                    <div className="mt-3">
                      {(() => {
                        const currentPoints = user?.points || 0;
                        const currentLevel = user?.level || Math.floor(currentPoints / 500) + 1;
                        const pointsForNextLevel = currentLevel * 500;
                        const pointsInCurrentLevel = currentPoints % 500;
                        const pointsNeeded = pointsForNextLevel - currentPoints;
                        const progressPercent = (pointsInCurrentLevel / 500) * 100;

                        return (
                          <>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-muted-dark">Progress to Level {currentLevel + 1}</span>
                              <span className="font-semibold text-green-600 dark:text-green-400">
                                {pointsNeeded > 0 ? `${pointsNeeded} pts to go` : 'Level capped!'}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-dark-border rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(progressPercent, 100)}%` }}
                              ></div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-dark mt-1">
                              <span>{pointsInCurrentLevel} pts in current level</span>
                              <span>500 pts per level</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-muted-dark mb-2">
                  <User className="w-4 h-4" />
                  <span>Full Name</span>
                </label>
                <p className="text-dark font-semibold">
                  {user?.firstName} {user?.lastName}
                </p>
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-muted-dark mb-2">
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </label>
                <p className="text-dark font-semibold">{user?.email}</p>
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-muted-dark mb-2">
                  <Building className="w-4 h-4" />
                  <span>University</span>
                </label>
                <p className="text-dark font-semibold">{user?.university || '—'}</p>
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-muted-dark mb-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{profileIdLabel}</span>
                </label>
                <p className="text-dark font-semibold">{profileIdValue}</p>
              </div>

              {/* Department */}
              {user?.department && (
                <div>
                  <label className="block text-sm font-medium text-muted-dark mb-2">
                    Department
                  </label>
                  <p className="text-dark font-semibold">{user.department}</p>
                </div>
              )}

              {/* Graduate Type */}
              {user?.graduateType && (
                <div>
                  <label className="block text-sm font-medium text-muted-dark mb-2">
                    Graduate Type
                  </label>
                  <p className="text-dark font-semibold">{user.graduateType}</p>
                </div>
              )}

              {/* Year */}
              {user?.year && (
                <div>
                  <label className="block text-sm font-medium text-muted-dark mb-2">
                    Year
                  </label>
                  <p className="text-dark font-semibold">Year {user.year}</p>
                </div>
              )}

              {/* Date of Birth */}
              {user?.dateOfBirth && (
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-muted-dark mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>Date of Birth</span>
                  </label>
                  <p className="text-dark font-semibold">
                    {new Date(user.dateOfBirth).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}

              {/* Age */}
              {user?.age && (
                <div>
                  <label className="block text-sm font-medium text-muted-dark mb-2">
                    Age
                  </label>
                  <p className="text-dark font-semibold">{user.age} years</p>
                </div>
              )}

              {/* Gender */}
              {user?.gender && (
                <div>
                  <label className="block text-sm font-medium text-muted-dark mb-2">
                    Gender
                  </label>
                  <p className="text-dark font-semibold">{user.gender}</p>
                </div>
              )}
            </div>

            {/* Badges Section */}
            {user?.badges && user.badges.length > 0 && (
              <div className="mt-8 pt-8 border-t border-dark">
                <h3 className="text-lg font-semibold text-dark mb-4">
                  Badges Earned
                </h3>
                <div className="flex flex-wrap gap-3">
                  {user.badges.map((badge, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-sm font-medium"
                    >
                      🏆 {badge}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {isStudent && (
              <div className="mt-8 pt-8 border-t border-dark">
              <h3 className="text-lg font-semibold text-dark mb-4">
                Health Considerations
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {HEALTH_CONSIDERATIONS_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-secondary cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedConsiderations.includes(option.value)}
                        onChange={() => handleCheckboxChange(option.value)}
                        className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm text-dark">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-sm text-muted-dark">
                  Select all that apply to receive general wellness guidance.
                </p>

                {successMessage && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {successMessage}
                  </p>
                )}
                {errorMessage && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errorMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Health Considerations'}
                </button>
              </form>
            </div>
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default Profile;