import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Clock, Award, Target } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../utils/translations';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard: React.FC = () => {
  const { currentLanguage, currentUser } = useStore();
  const t = useTranslation(currentLanguage);

  // Mock dashboard data
  const dashboardStats = {
    totalLent: 25000,
    totalBorrowed: 8000,
    activeLoans: 3,
    completedLoans: 7,
    averageReturn: 4.2,
    creditScore: 750
  };

  const loanPerformanceData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Amount Lent',
        data: [2000, 3500, 4000, 2800, 5200, 7500],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      },
      {
        label: 'Amount Borrowed',
        data: [1000, 0, 2500, 0, 3000, 1500],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4
      }
    ]
  };

  const repaymentData = {
    labels: ['On Time', 'Late', 'Pending'],
    datasets: [
      {
        data: [85, 10, 5],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
    <motion.div
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span className="ml-1">{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
            <p className="text-gray-600 mt-1">Welcome back, {currentUser?.name}!</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Credit Score</div>
              <div className="text-xl font-bold text-green-600">{dashboardStats.creditScore}</div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <Award className="text-white" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Amount Lent"
          value={`₹${dashboardStats.totalLent.toLocaleString()}`}
          change={12}
          icon={TrendingUp}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Amount Borrowed"
          value={`₹${dashboardStats.totalBorrowed.toLocaleString()}`}
          change={-5}
          icon={DollarSign}
          color="bg-green-500"
        />
        <StatCard
          title="Active Loans"
          value={dashboardStats.activeLoans}
          icon={Clock}
          color="bg-orange-500"
        />
        <StatCard
          title="Average Return"
          value={`${dashboardStats.averageReturn}%`}
          change={0.3}
          icon={Target}
          color="bg-purple-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loan Performance Chart */}
        <motion.div
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Activity Over Time</h3>
          <Line
            data={loanPerformanceData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value) {
                      return '₹' + value;
                    }
                  }
                }
              }
            }}
          />
        </motion.div>

        {/* Repayment Status */}
        <motion.div
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Repayment Status</h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut
              data={repaymentData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {[
            { type: 'lent', amount: 1500, user: 'Priya Sharma', time: '2 hours ago', status: 'completed' },
            { type: 'repaid', amount: 2000, user: 'Medical Loan', time: '1 day ago', status: 'completed' },
            { type: 'lent', amount: 3500, user: 'Rahul Kumar', time: '3 days ago', status: 'pending' }
          ].map((activity, index) => (
            <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'lent' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {activity.type === 'lent' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {activity.type === 'lent' ? 'Lent to' : 'Repaid'} {activity.user}
                    </p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₹{activity.amount.toLocaleString()}</p>
                  <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    activity.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {activity.status}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        className="bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl p-6 text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-left transition-all">
            <div className="font-medium">Find Loans to Fund</div>
            <div className="text-sm opacity-90 mt-1">Browse active loan requests</div>
          </button>
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-left transition-all">
            <div className="font-medium">Post a Loan Request</div>
            <div className="text-sm opacity-90 mt-1">Get funding for your needs</div>
          </button>
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-left transition-all">
            <div className="font-medium">View Blockchain Transactions</div>
            <div className="text-sm opacity-90 mt-1">Track your secure transactions</div>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;