import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    university: '',
    department: '',
    graduateType: '',
    year: '',
    dateOfBirth: '',
    age: '',
    gender: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'role') {
      setFormData((prev) => ({
        ...prev,
        role: value,
        university: '',
        department: '',
        graduateType: '',
        year: '',
        dateOfBirth: '',
        age: '',
        gender: '',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const { confirmPassword, ...registerData } = formData;

    if (registerData.age) {
      registerData.age = parseInt(registerData.age, 10);
    }

    if (registerData.dateOfBirth) {
      try {
        registerData.dateOfBirth = new Date(registerData.dateOfBirth).toISOString();
      } catch (err) {
        console.error("Invalid Date Format");
      }
    }

    if (registerData.role !== 'student') {
      const keysToRemove = ['university', 'department', 'graduateType', 'year', 'age', 'gender', 'dateOfBirth'];
      keysToRemove.forEach(key => delete registerData[key]);
    }

    try {
      const result = await register(registerData);
      if (result.success) {
        const uRole = result.data?.user?.role;
        if (uRole === 'admin') navigate('/admin');
        else if (uRole === 'mentor') navigate('/mentor');
        else navigate('/dashboard');
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reusable Tailwind Class Strings for consistency
  const inputClasses = "w-full px-4 py-3 border border-gray-400 dark:border-gray-600 rounded-lg outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 transition-all";
  const selectClasses = "w-full px-4 py-3 border border-gray-400 dark:border-gray-600 rounded-lg outline-none bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary-500 appearance-none transition-all";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 dark:from-dark-bg dark:via-dark-bg dark:to-dark-bg flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary-500 p-3 rounded-full">
              <Activity className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Your Account</h1>
          <p className="text-gray-600 dark:text-gray-400">Start your fitness journey today</p>
        </div>

        <div className="rounded-2xl shadow-xl p-8 bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800">
          {error && (
            <div className="mb-6 bg-green- dark:bg-green-/20 border border-green- dark:border-green- text-green- dark:text-green- px-4 py-3 rounded-lg">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">I am registering as *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-green-200 dark:border-green-900 rounded-lg outline-none bg-green-50 dark:bg-slate-800 text-green-900 dark:text-green-100 font-bold focus:ring-2 focus:ring-primary-500"
              >
                <option value="student" className="bg-white dark:bg-slate-800 text-black dark:text-white">Student</option>
                <option value="mentor" className="bg-white dark:bg-slate-800 text-black dark:text-white">Mentor</option>
                <option value="admin" className="bg-white dark:bg-slate-800 text-black dark:text-white">Admin</option>
              </select>
            </div>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className={inputClasses}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className={inputClasses}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john.doe@university.edu"
                    className={inputClasses}
                    required
                  />
                </div>
              </div>
            </section>

            {formData.role === 'student' && (
              <section className="space-y-4 animate-in fade-in duration-500">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">
                  Academic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">University *</label>
                    <input
                      type="text"
                      name="university"
                      value={formData.university}
                      onChange={handleChange}
                      placeholder="Tech University"
                      className={inputClasses}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="Computer Science"
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Graduate Type</label>
                    <select name="graduateType" value={formData.graduateType} onChange={handleChange} className={selectClasses}>
                      <option value="" className="text-gray-400">Select Type</option>
                      <option value="Under-graduate">Under-graduate</option>
                      <option value="Post-graduate">Post-graduate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Year</label>
                    <select name="year" value={formData.year} onChange={handleChange} className={selectClasses}>
                      <option value="">Select Year</option>
                      <option value="I">I</option>
                      <option value="II">II</option>
                      <option value="III">III</option>
                      <option value="IV">IV</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      max={new Date().toISOString().split('T')[0]}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Age</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      placeholder="21"
                      className={inputClasses}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className={selectClasses}>
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
              </section>
            )}

            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">
                Security
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={inputClasses}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={inputClasses}
                    required
                  />
                </div>
              </div>
            </section>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 px-4 rounded-lg shadow-lg hover:shadow-primary-500/20 transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:underline font-bold">
                Sign in instead →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;