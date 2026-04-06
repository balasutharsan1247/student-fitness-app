import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login, logout } = useAuth();
  
  const [selectedRole, setSelectedRole] = useState('student');
  const roleOptions = [
    { key: 'student', label: 'Student' },
    { key: 'mentor', label: 'Mentor' },
    { key: 'admin', label: 'Admin' },
  ];

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const result = await login(formData.email, formData.password);

    if (result.success) {
      const uRole = result.data?.user?.role;
      if (uRole !== selectedRole) {
        logout();
        setError(
          `Invalid credentials`
        );
      } else if (uRole === 'admin') {
        navigate('/admin');
      } else if (uRole === 'mentor') {
        navigate('/mentor');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-green-600 p-3 rounded-full shadow-lg shadow-green-200/40 dark:shadow-none">
              <Activity className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-dark mb-2">
            {selectedRole === 'admin'
              ? 'Admin Sign In'
              : selectedRole === 'mentor'
              ? 'Mentor Sign In'
              : 'Student Sign In'}
          </h1>
          <p className="text-muted-dark">
            {selectedRole === 'admin'
              ? 'Enter your admin credentials to manage the platform.'
              : selectedRole === 'mentor'
              ? 'Enter your mentor credentials to access your dashboard.'
              : 'Enter your student credentials to continue your fitness journey.'}
          </p>
        </div>
        <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden mb-6">
          <div className="grid grid-cols-3 divide-x divide-gray-200 dark:divide-slate-700">
            {roleOptions.map((role) => (
              <button
                key={role.key}
                type="button"
                onClick={() => setSelectedRole(role.key)}
                className={`w-full py-2 text-sm font-medium transition duration-200 ${
                  selectedRole === role.key
                    ? 'bg-green-600 text-white'
                    : 'bg-white dark:bg-dark-card text-dark hover:bg-green-50 dark:hover:bg-slate-800'
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>

        <div className="card-dark rounded-2xl shadow-dark p-8 border border-gray-200 dark:border-slate-700">
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-dark mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={
                  selectedRole === 'admin'
                    ? 'admin@school.edu'
                    : selectedRole === 'mentor'
                    ? 'mentor@school.edu'
                    : 'student@school.edu'
                }
                className="w-full px-4 py-3 border border-gray-200 bg-white dark:border-slate-700 dark:bg-dark-card input-dark rounded-xl outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-dark mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-200 bg-white dark:border-slate-700 dark:bg-dark-card input-dark rounded-xl outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-500"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember"
                  className="ml-2 block text-sm text-dark"
                >
                  Remember me
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-green-600 dark:text-green-400 hover:text-green-700"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : `Sign in as ${selectedRole}`}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-dark-card text-muted-dark">
                  Don't have an account?
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/register"
              className="text-green-600 dark:text-green-400 hover:text-green-700 font-medium"
            >
              Create a new account →
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-muted-dark mt-8">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Login;