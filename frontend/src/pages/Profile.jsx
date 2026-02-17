import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { User, Award, TrendingUp, Mail, Building, BookOpen } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-1">
              View and manage your account information
            </p>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-md p-8">
            {/* User Avatar */}
            <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-gray-200">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-3xl">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-gray-600">{user?.email}</p>
                <div className="flex items-center space-x-4 mt-3">
                  <div className="flex items-center space-x-2 bg-yellow-50 px-3 py-1 rounded-full">
                    <Award className="w-4 h-4 text-yellow-600" />
                    <span className="font-semibold text-yellow-900">
                      {user?.points || 0} pts
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 bg-purple-50 px-3 py-1 rounded-full">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <span className="font-semibold text-purple-900">
                      Level {user?.level || 1}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-600 mb-2">
                <User className="w-4 h-4" />
                <span>Full Name</span>
                </label>
                <p className="text-gray-900 font-semibold">
                {user?.firstName} {user?.lastName}
                </p>
            </div>

            <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-600 mb-2">
                <Mail className="w-4 h-4" />
                <span>Email</span>
                </label>
                <p className="text-gray-900 font-semibold">{user?.email}</p>
            </div>

            <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-600 mb-2">
                <Building className="w-4 h-4" />
                <span>University</span>
                </label>
                <p className="text-gray-900 font-semibold">{user?.university || '—'}</p>
            </div>

            <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-600 mb-2">
                <BookOpen className="w-4 h-4" />
                <span>Student ID</span>
                </label>
                <p className="text-gray-900 font-semibold">{user?.studentId || '—'}</p>
            </div>

            {/* Department (was Major) */}
            <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                Department
                </label>
                <p className="text-gray-900 font-semibold">{user?.department || '—'}</p>
            </div>

            {/* Graduate Type */}
            <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                Graduate Type
                </label>
                <p className="text-gray-900 font-semibold">{user?.graduateType || '—'}</p>
            </div>

            {/* Year */}
            <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                Year
                </label>
                <p className="text-gray-900 font-semibold">
                {user?.year ? `${user.year}` : '—'}
                </p>
            </div>

            {/* Date of Birth */}
            <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                Date of Birth
                </label>
                <p className="text-gray-900 font-semibold">
                {user?.dateOfBirth
                    ? new Date(user.dateOfBirth).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })
                    : '—'}
                </p>
            </div>

            {/* Age */}
            {user?.age && (
                <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                    Age
                </label>
                <p className="text-gray-900 font-semibold">{user.age} years</p>
                </div>
            )}

            {/* Gender */}
            {user?.gender && (
                <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                    Gender
                </label>
                <p className="text-gray-900 font-semibold">{user.gender}</p>
                </div>
            )}
            </div>

            {/* Badges Section */}
            {user?.badges && user.badges.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Badges Earned
                </h3>
                <div className="flex flex-wrap gap-3">
                  {user.badges.map((badge, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"
                    >
                      🏆 {badge}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Edit Button */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <button className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold transition">
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