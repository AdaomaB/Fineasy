import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calculator,
  FileText,
  PieChart,
  TrendingUp,
  Upload,
  Receipt,
  BarChart3,
  Users,
  Shield,
  Smartphone,
  Clock,
  DollarSign
} from 'lucide-react';

const FeaturesSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const features = [
    {
      icon: Calculator,
      title: 'Trial Balance Generator',
      description: 'Create accurate trial balances with real-time validation and automatic balancing checks.',
      image: '/api/placeholder/600/400'
    },
    {
      icon: FileText,
      title: 'Financial Statements',
      description: 'Generate professional Income Statements, Balance Sheets, and Cash Flow statements instantly.',
      image: '/api/placeholder/600/400'
    },
    {
      icon: Upload,
      title: 'Document OCR',
      description: 'Upload receipts and invoices with automatic data extraction using advanced OCR technology.',
      image: '/api/placeholder/600/400'
    },
    {
      icon: Receipt,
      title: 'Invoice Creator',
      description: 'Create and send professional invoices with customizable templates and branding.',
      image: '/api/placeholder/600/400'
    }
  ];

  const additionalFeatures = [
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Visual insights into your financial performance with interactive charts and trends.'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work with your accountant or team members with role-based access controls.'
    },
    {
      icon: Shield,
      title: 'Bank-Level Security',
      description: 'Your financial data is protected with enterprise-grade encryption and security.'
    },
    {
      icon: Smartphone,
      title: 'Mobile Responsive',
      description: 'Access your financial tools on any device with our mobile-optimized interface.'
    },
    {
      icon: Clock,
      title: 'Real-Time Updates',
      description: 'Get instant updates and notifications as your financial data changes.'
    },
    {
      icon: DollarSign,
      title: 'Cost Tracking',
      description: 'Monitor expenses and revenue with detailed categorization and reporting.'
    }
  ];

  return (
    <section id="features" className="py-24 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Everything You Need for
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {" "}Financial Success
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            From basic bookkeeping to advanced financial reporting, FinEasy provides all the tools you need to manage your business finances professionally.
          </p>
        </motion.div>

        {/* Main Features Tabs */}
        <div className="mb-20">
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`
                    flex items-center px-6 py-3 rounded-lg transition-all duration-200 font-medium
                    ${activeTab === index
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {feature.title}
                </button>
              );
            })}
          </div>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {features[activeTab].title}
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                {features[activeTab].description}
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Real-time validation and error checking</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Professional PDF and Excel exports</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Automatic calculations and formatting</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white dark:bg-gray-700 rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-12 flex items-center px-6">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                    <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                    <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                  </div>
                  <div className="ml-4 text-white font-medium">{features[activeTab].title}</div>
                </div>
                <div className="p-6">
                  <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center">
                    {React.createElement(features[activeTab].icon, {
                      className: "w-24 h-24 text-blue-600 dark:text-blue-400"
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Additional Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {additionalFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4">
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;