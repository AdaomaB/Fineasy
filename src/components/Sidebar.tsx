import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Calculator,
  FileText,
  PieChart,
  TrendingUp,
  Upload,
  Receipt,
  Menu,
  X,
  Home
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Trial Balance', href: '/trial-balance', icon: Calculator },
    { name: 'Income Statement', href: '/income-statement', icon: FileText },
    { name: 'Balance Sheet', href: '/balance-sheet', icon: PieChart },
    { name: 'Cash Flow', href: '/cash-flow', icon: TrendingUp },
    { name: 'Documents', href: '/documents', icon: Upload },
    { name: 'Invoices', href: '/invoices', icon: Receipt },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: isCollapsed ? 80 : 256 }}
        className="hidden lg:flex lg:flex-shrink-0"
      >
        <div className="flex flex-col w-full">
          <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
              {!isCollapsed && (
                <Link to="/" className="flex items-center space-x-2">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
                    <Home className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    FinEasy
                  </span>
                </Link>
              )}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
              </button>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                      ${isActive(item.href)
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="ml-3">{item.name}</span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </motion.div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <nav className="flex justify-around py-2">
          {navigation.slice(0, 5).map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex flex-col items-center px-3 py-2 text-xs font-medium
                  ${isActive(item.href)
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                  }
                `}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="hidden sm:block">{item.name.split(' ')[0]}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;