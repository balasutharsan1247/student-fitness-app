import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  const { refreshUser } = useAuth();

  // Refresh user data whenever layout mounts
  useEffect(() => {
    console.log('📄 Page loaded - refreshing user data...');
    refreshUser();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-200">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="lg:pl-64 transition-colors duration-200">
        {children}
      </main>
    </div>
  );
};

export default Layout;