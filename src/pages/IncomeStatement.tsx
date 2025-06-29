import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, Download, Save, Calculator } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';

interface RevenueEntry {
  description: string;
  amount: number;
}

interface ExpenseEntry {
  description: string;
  amount: number;
}

interface IncomeStatementForm {
  companyName: string;
  period: string;
  revenues: RevenueEntry[];
  expenses: ExpenseEntry[];
}

const IncomeStatement: React.FC = () => {
  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<IncomeStatementForm>({
    defaultValues: {
      companyName: '',
      period: new Date().toISOString().slice(0, 7),
      revenues: [{ description: '', amount: 0 }],
      expenses: [{ description: '', amount: 0 }]
    }
  });

  const { fields: revenueFields, append: appendRevenue, remove: removeRevenue } = useFieldArray({
    control,
    name: 'revenues'
  });

  const { fields: expenseFields, append: appendExpense, remove: removeExpense } = useFieldArray({
    control,
    name: 'expenses'
  });

  const watchedRevenues = watch('revenues');
  const watchedExpenses = watch('expenses');

  // Calculate totals
  const totalRevenue = watchedRevenues.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
  const totalExpenses = watchedExpenses.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
  const netIncome = totalRevenue - totalExpenses;

  const addRevenue = () => {
    appendRevenue({ description: '', amount: 0 });
  };

  const addExpense = () => {
    appendExpense({ description: '', amount: 0 });
  };

  const removeRevenueEntry = (index: number) => {
    if (revenueFields.length > 1) {
      removeRevenue(index);
    }
  };

  const removeExpenseEntry = (index: number) => {
    if (expenseFields.length > 1) {
      removeExpense(index);
    }
  };

  const onSubmit = (data: IncomeStatementForm) => {
    console.log('Income Statement Data:', data);
    toast.success('Income statement saved successfully!');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const companyName = watch('companyName') || 'Company Name';
    const period = watch('period');

    // Header
    doc.setFontSize(20);
    doc.text(companyName, 105, 20, { align: 'center' });
    doc.setFontSize(16);
    doc.text('Income Statement', 105, 30, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Period: ${period}`, 105, 40, { align: 'center' });

    let yPosition = 60;

    // Revenue Section
    doc.setFontSize(14);
    doc.text('REVENUE', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    watchedRevenues.forEach((revenue) => {
      if (revenue.description) {
        doc.text(revenue.description, 25, yPosition);
        doc.text(revenue.amount.toFixed(2), 160, yPosition);
        yPosition += 8;
      }
    });

    doc.line(20, yPosition, 190, yPosition);
    yPosition += 8;
    doc.setFontSize(12);
    doc.text('Total Revenue', 25, yPosition);
    doc.text(totalRevenue.toFixed(2), 160, yPosition);
    yPosition += 15;

    // Expenses Section
    doc.setFontSize(14);
    doc.text('EXPENSES', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    watchedExpenses.forEach((expense) => {
      if (expense.description) {
        doc.text(expense.description, 25, yPosition);
        doc.text(expense.amount.toFixed(2), 160, yPosition);
        yPosition += 8;
      }
    });

    doc.line(20, yPosition, 190, yPosition);
    yPosition += 8;
    doc.setFontSize(12);
    doc.text('Total Expenses', 25, yPosition);
    doc.text(totalExpenses.toFixed(2), 160, yPosition);
    yPosition += 15;

    // Net Income
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 8;
    doc.setFontSize(14);
    doc.text('NET INCOME', 25, yPosition);
    doc.text(netIncome.toFixed(2), 160, yPosition);

    doc.save(`income-statement-${period}.pdf`);
    toast.success('Income statement exported to PDF!');
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
                Income Statement
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Create your profit and loss statement
              </p>
            </div>
            
            {/* Summary */}
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">Net Income</div>
                <div className={`text-xl font-bold ${
                  netIncome >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  ${netIncome.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 pb-20 lg:pb-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Company Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Company Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    {...register('companyName', { required: 'Company name is required' })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter company name"
                  />
                  {errors.companyName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.companyName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Period
                  </label>
                  <input
                    type="month"
                    {...register('period', { required: 'Period is required' })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.period && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.period.message}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Revenue Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Revenue
                </h3>
                <button
                  type="button"
                  onClick={addRevenue}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Revenue
                </button>
              </div>

              <div className="space-y-4">
                {revenueFields.map((field, index) => (
                  <div key={field.id} className="grid md:grid-cols-12 gap-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="md:col-span-8">
                      <label className="block md:hidden text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        {...register(`revenues.${index}.description` as const)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Revenue description"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block md:hidden text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Amount
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        {...register(`revenues.${index}.amount` as const, {
                          valueAsNumber: true,
                          min: 0
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="md:col-span-1 flex items-end">
                      <button
                        type="button"
                        onClick={() => removeRevenueEntry(index)}
                        disabled={revenueFields.length === 1}
                        className="w-full md:w-auto px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    Total Revenue
                  </span>
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">
                    ${totalRevenue.toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Expenses Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Expenses
                </h3>
                <button
                  type="button"
                  onClick={addExpense}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Expense
                </button>
              </div>

              <div className="space-y-4">
                {expenseFields.map((field, index) => (
                  <div key={field.id} className="grid md:grid-cols-12 gap-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="md:col-span-8">
                      <label className="block md:hidden text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        {...register(`expenses.${index}.description` as const)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Expense description"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block md:hidden text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Amount
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        {...register(`expenses.${index}.amount` as const, {
                          valueAsNumber: true,
                          min: 0
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="md:col-span-1 flex items-end">
                      <button
                        type="button"
                        onClick={() => removeExpenseEntry(index)}
                        disabled={expenseFields.length === 1}
                        className="w-full md:w-auto px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    Total Expenses
                  </span>
                  <span className="text-xl font-bold text-red-600 dark:text-red-400">
                    ${totalExpenses.toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Net Income Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Net Income Summary
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ${totalRevenue.toFixed(2)}
                    </div>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</div>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      ${totalExpenses.toFixed(2)}
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${
                    netIncome >= 0 
                      ? 'bg-blue-50 dark:bg-blue-900/20' 
                      : 'bg-orange-50 dark:bg-orange-900/20'
                  }`}>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Net Income</div>
                    <div className={`text-2xl font-bold ${
                      netIncome >= 0 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-orange-600 dark:text-orange-400'
                    }`}>
                      ${netIncome.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-end"
            >
              <button
                type="button"
                onClick={exportToPDF}
                className="flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </button>
              <button
                type="submit"
                className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Income Statement
              </button>
            </motion.div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default IncomeStatement;