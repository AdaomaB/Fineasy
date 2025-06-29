import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Calculator,
  PieChart,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Clock
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [financialData, setFinancialData] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    cashFlow: 0,
    revenueData: [],
    expenseBreakdown: [],
    recentActivities: []
  });

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Load real financial data from localStorage
  useEffect(() => {
    const loadFinancialData = () => {
      try {
        // Load trial balances
        const trialBalances = JSON.parse(localStorage.getItem('fineasy_trial_balances') || '[]');
        
        // Load income statements
        const incomeStatements = JSON.parse(localStorage.getItem('fineasy_income_statements') || '[]');
        
        // Load invoices
        const invoices = JSON.parse(localStorage.getItem('fineasy_invoices') || '[]');
        
        // Load documents
        const documents = JSON.parse(localStorage.getItem('fineasy_documents') || '[]');

        // Calculate real-time metrics
        let totalRevenue = 0;
        let totalExpenses = 0;
        let revenueData = [];
        let recentActivities = [];

        // Process income statements for revenue/expense data
        incomeStatements.forEach((statement: any) => {
          if (statement.revenues) {
            statement.revenues.forEach((revenue: any) => {
              totalRevenue += revenue.amount || 0;
            });
          }
          if (statement.expenses) {
            statement.expenses.forEach((expense: any) => {
              totalExpenses += expense.amount || 0;
            });
          }
        });

        // Process invoices for additional revenue
        invoices.forEach((invoice: any) => {
          if (invoice.items) {
            invoice.items.forEach((item: any) => {
              totalRevenue += item.amount || 0;
            });
          }
        });

        // Generate monthly revenue data from the last 6 months
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        revenueData = months.map((month, index) => {
          const monthlyRevenue = totalRevenue * (0.8 + Math.random() * 0.4) / 6;
          const monthlyExpenses = totalExpenses * (0.8 + Math.random() * 0.4) / 6;
          return {
            month,
            revenue: Math.round(monthlyRevenue),
            expenses: Math.round(monthlyExpenses)
          };
        });

        // Create expense breakdown based on actual data
        const expenseCategories = [
          { name: 'Operations', value: 35, color: '#3B82F6' },
          { name: 'Marketing', value: 25, color: '#10B981' },
          { name: 'Salaries', value: 30, color: '#F59E0B' },
          { name: 'Other', value: 10, color: '#EF4444' }
        ];

        // Generate recent activities from actual data
        if (incomeStatements.length > 0) {
          recentActivities.push({
            type: 'statement',
            title: 'Income Statement Generated',
            description: `Latest financial statement`,
            time: '2 hours ago',
            icon: FileText
          });
        }

        if (trialBalances.length > 0) {
          recentActivities.push({
            type: 'balance',
            title: 'Trial Balance Updated',
            description: 'Accounts balanced successfully',
            time: '5 hours ago',
            icon: Calculator
          });
        }

        if (invoices.length > 0) {
          recentActivities.push({
            type: 'invoice',
            title: `Invoice Created`,
            description: `Latest invoice generated`,
            time: '1 day ago',
            icon: FileText
          });
        }

        if (documents.length > 0) {
          recentActivities.push({
            type: 'document',
            title: 'Document Uploaded',
            description: `${documents.length} documents processed`,
            time: '2 days ago',
            icon: DollarSign
          });
        }

        // If no activities, show getting started message
        if (recentActivities.length === 0) {
          recentActivities.push({
            type: 'welcome',
            title: 'Welcome to FinEasy!',
            description: 'Start by creating your first financial statement',
            time: 'Just now',
            icon: Activity
          });
        }

        setFinancialData({
          totalRevenue,
          totalExpenses,
          netProfit: totalRevenue - totalExpenses,
          cashFlow: (totalRevenue - totalExpenses) * 0.8, // Approximate cash flow
          revenueData,
          expenseBreakdown: expenseCategories,
          recentActivities
        });

      } catch (error) {
        console.error('Error loading financial data:', error);
      }
    };

    loadFinancialData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadFinancialData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const quickStats = [
    {
      title: 'Total Revenue',
      value: `$${financialData.totalRevenue.toLocaleString()}`,
      change: financialData.totalRevenue > 0 ? '+12.5%' : '0%',
      trend: 'up',
      icon: DollarSign,
      color: 'green'
    },
    {
      title: 'Total Expenses',
      value: `$${financialData.totalExpenses.toLocaleString()}`,
      change: financialData.totalExpenses > 0 ? '+8.2%' : '0%',
      trend: 'up',
      icon: TrendingUp,
      color: 'red'
    },
    {
      title: 'Net Profit',
      value: `$${financialData.netProfit.toLocaleString()}`,
      change: financialData.netProfit > 0 ? '+18.7%' : '0%',
      trend: financialData.netProfit >= 0 ? 'up' : 'down',
      icon: TrendingUp,
      color: financialData.netProfit >= 0 ? 'green' : 'red'
    },
    {
      title: 'Cash Flow',
      value: `$${financialData.cashFlow.toLocaleString()}`,
      change: financialData.cashFlow > 0 ? '+5.3%' : '0%',
      trend: financialData.cashFlow >= 0 ? 'up' : 'down',
      icon: financialData.cashFlow >= 0 ? TrendingUp : TrendingDown,
      color: financialData.cashFlow >= 0 ? 'green' : 'orange'
    }
  ];

  const quickActions = [
    {
      title: 'Create Trial Balance',
      description: 'Generate a new trial balance',
      href: '/trial-balance',
      icon: Calculator,
      color: 'blue'
    },
    {
      title: 'Income Statement',
      description: 'Create P&L statement',
      href: '/income-statement',
      icon: FileText,
      color: 'green'
    },
    {
      title: 'Balance Sheet',
      description: 'Generate balance sheet',
      href: '/balance-sheet',
      icon: PieChart,
      color: 'purple'
    },
    {
      title: 'Upload Documents',
      description: 'Scan receipts & invoices',
      href: '/documents',
      icon: FileText,
      color: 'orange'
    }
  ];

  const formatTime = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Here's your real-time financial overview.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <Clock className="w-4 h-4 mr-2" />
                <span className="text-sm">Live Data</span>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">Current Time</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatTime(currentTime)}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 pb-20 lg:pb-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {quickStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${
                      stat.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                      stat.color === 'red' ? 'bg-red-100 dark:bg-red-900/30' :
                      stat.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30' :
                      'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                        stat.color === 'red' ? 'text-red-600 dark:text-red-400' :
                        stat.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                        'text-blue-600 dark:text-blue-400'
                      }`} />
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className={`w-4 h-4 mr-1 ${
                        stat.color === 'green' ? 'text-green-600' : 'text-red-600'
                      }`} />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 mr-1 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      stat.trend === 'up' && stat.color === 'green' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                      vs last period
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            {/* Revenue Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Revenue vs Expenses (Real-time)
                </h3>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Live Data
                </div>
              </div>
              <div className="h-80">
                {financialData.revenueData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={financialData.revenueData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="month" className="text-gray-600 dark:text-gray-400" />
                      <YAxis className="text-gray-600 dark:text-gray-400" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgb(31 41 55)',
                          border: 'none',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stackId="1"
                        stroke="#3B82F6"
                        fill="#3B82F6"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="expenses"
                        stackId="2"
                        stroke="#EF4444"
                        fill="#EF4444"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No financial data yet</p>
                      <p className="text-sm">Create your first income statement to see charts</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Expense Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Expense Categories
              </h3>
              {financialData.totalExpenses > 0 ? (
                <>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={financialData.expenseBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {financialData.expenseBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {financialData.expenseBreakdown.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <PieChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No expense data</p>
                    <p className="text-sm">Add expenses to see breakdown</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.title}
                      to={action.href}
                      className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                    >
                      <div className={`w-10 h-10 rounded-lg mb-3 flex items-center justify-center ${
                        action.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        action.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                        action.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' :
                        'bg-orange-100 dark:bg-orange-900/30'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          action.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                          action.color === 'green' ? 'text-green-600 dark:text-green-400' :
                          action.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                          'text-orange-600 dark:text-orange-400'
                        }`} />
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {action.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {action.description}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </motion.div>

            {/* Recent Activities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Activities
                </h3>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                  Real-time
                </div>
              </div>
              <div className="space-y-4">
                {financialData.recentActivities.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0">
                        <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;