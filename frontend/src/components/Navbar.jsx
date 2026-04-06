import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Activity, 
  LayoutDashboard, 
  PlusCircle, 
  Target, 
  TrendingUp,
  User,
  LogOut,
  Award,
  Menu,
  X,
  Moon,
  Sun,
  Users,
  ClipboardList,
  Trophy,
  ShieldCheck
} from 'lucide-react';
import { useState } from 'react';
import { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isStudent = user?.role === 'student';

  // Auto-refresh user data every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshUser();
    }, 5000); // Every 5 seconds

    return () => clearInterval(interval);
  }, [refreshUser]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [];

  if (user?.role === 'student') {
    navItems.push(
      {
        name: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        name: 'Log Activity',
        path: '/log-activity',
        icon: PlusCircle,
      },
      {
        name: 'Goals',
        path: '/goals',
        icon: Target,
      },
      {
        name: 'Statistics',
        path: '/statistics',
        icon: TrendingUp,
      }
    );
  }

  // Everyone sees Leaderboard and Profile
  navItems.push(
    {
      name: 'Leaderboard',
      path: '/leaderboard',
      icon: Trophy,
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: User,
    }
  );

  if (user?.role === 'admin' || user?.role === 'mentor') {
    navItems.push({
      name: 'Campus Analytics',
      path: '/admin',
      icon: Users,
    });
  }

  if (user?.role === 'admin') {
    navItems.push({
      name: 'Roles',
      path: '/admin/roles',
      icon: ShieldCheck,
    });
  }

  if (user?.role === 'mentor') {
    navItems.push({
      name: 'Mentorship',
      path: '/mentor',
      icon: ClipboardList,
    });
  }

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border sticky top-0 z-50 transition-colors duration-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="bg-green-500 dark:bg-green-600 p-2 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-dark-text">Fitness Tracker</h1>
              <p className="text-xs text-gray-600 dark:text-dark-muted">
                Hi, {user?.firstName}!
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors duration-200"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-green-" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors duration-200"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600 dark:text-dark-muted" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600 dark:text-dark-muted" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card">
            <nav className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                      active
                        ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : 'text-gray-700 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-hover'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}

              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-green- dark:text-green- hover:bg-green- dark:hover:bg-green-/20 transition-colors duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </nav>

            {/* User Stats (Mobile) */}
            {isStudent && (
              <div className="px-4 py-3 border-t border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg">
                <div className="flex items-center justify-around">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-green- dark:text-green- mb-1">
                      <Award className="w-4 h-4" />
                      <span className="font-bold">{user?.points || 0}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-dark-muted">Points</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-green-600 dark:text-green-400 mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-bold">{user?.level || 1}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-dark-muted">Level</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border transition-colors duration-200">
        {/* Logo */}
        <div className="flex items-center space-x-3 px-6 py-6 border-b border-gray-200 dark:border-dark-border">
          <div className="bg-green-500 dark:bg-green-600 p-2 rounded-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-dark-text">Fitness Tracker</h1>
            <p className="text-xs text-gray-600 dark:text-dark-muted">Track your journey</p>
          </div>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-border">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-dark-text truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-gray-600 dark:text-dark-muted truncate">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Points & Level */}
          {isStudent && (
            <div className="flex items-center justify-around mt-4 pt-4 border-t border-gray-200 dark:border-dark-border">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-green- dark:text-green- mb-1">
                  <Award className="w-4 h-4" />
                  <span className="font-bold text-lg">{user?.points || 0}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-dark-muted">Points</p>
              </div>
              <div className="h-8 w-px bg-gray-200 dark:bg-dark-border"></div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-green-600 dark:text-green-400 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-bold text-lg">{user?.level || 1}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-dark-muted">Level</p>
              </div>
            </div>
          )}

          {/* Dark Mode Toggle (Desktop) */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-border">
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-100 dark:bg-dark-hover hover:bg-gray-200 dark:hover:bg-dark-border rounded-lg transition-colors duration-200"
            >
              {darkMode ? (
                <>
                  <Sun className="w-4 h-4 text-green-" />
                  <span className="text-sm font-medium text-gray-900 dark:text-dark-text">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-gray-700" />
                  <span className="text-sm font-medium text-gray-900 dark:text-dark-text">Dark Mode</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  active
                    ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    : 'text-gray-700 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-hover'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="px-4 py-4 border-t border-gray-200 dark:border-dark-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-lg transition-colors duration-200 font-semibold"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Navbar;