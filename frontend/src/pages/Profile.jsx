import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { User, Award, TrendingUp, Mail, Building, BookOpen, Calendar } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

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
              <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-3xl">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-dark">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-muted-dark">{user?.email}</p>
                
                {/* Points and Level */}
                <div className="mt-4">
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center space-x-2 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-full">
                      <Award className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      <span className="font-semibold text-yellow-900 dark:text-yellow-400">
                        {user?.points || 0} pts
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-full">
                      <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="font-semibold text-purple-900 dark:text-purple-400">
                        Level {user?.level || 1}
                      </span>
                    </div>
                  </div>

                  {/* Level Progress Bar */}
                  <div className="mt-3">
                    {(() => {
                      const currentPoints = user?.points || 0;
                      const currentLevel = user?.level || 1;
                      const pointsForNextLevel = currentLevel * 500;
                      const pointsInCurrentLevel = currentPoints % 500;
                      const pointsNeeded = pointsForNextLevel - currentPoints;
                      const progressPercent = (pointsInCurrentLevel / 500) * 100;

                      return (
                        <>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-muted-dark">Progress to Level {currentLevel + 1}</span>
                            <span className="font-semibold text-purple-600 dark:text-purple-400">
                              {pointsNeeded > 0 ? `${pointsNeeded} pts to go` : 'Level capped!'}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-dark-border rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
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
                  <span>Student ID</span>
                </label>
                <p className="text-dark font-semibold">{user?.studentId || '—'}</p>
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
                      className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 rounded-full text-sm font-medium"
                    >
                      🏆 {badge}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Edit Button */}
            <div className="mt-8 pt-8 border-t border-dark">
              <button className="px-6 py-3 btn-primary-dark rounded-lg font-semibold transition">
                Edit Profile (Coming Soon)
              </button>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default Profile;