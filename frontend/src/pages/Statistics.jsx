import Layout from '../components/Layout';
import { TrendingUp } from 'lucide-react';

const Statistics = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Statistics</h1>
            <p className="text-gray-600 mt-1">
              Detailed analytics and trends
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <TrendingUp className="w-16 h-16 text-primary-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Coming Soon!
            </h2>
            <p className="text-gray-600">
              Detailed statistics and analytics will be available here.
            </p>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default Statistics;