import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, Download, Save, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';

interface CashFlowEntry {
  description: string;
  amount: number;
  category: 'operating' | 'investing' | 'financing';
  type: 'inflow' | 'outflow';
}

interface CashFlowForm {
  companyName: string;
  period: string;
  startingCash: number;
  entries: CashFlowEntry[];
}

const CashFlow: React.FC = () => {
  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<CashFlowForm>({
    defaultValues: {
      companyName: '',
      period: new Date().toISOString().slice(0, 7),
      startingCash: 0,
      entries: [
        { description: '', amount: 0, category: 'operating', type: 'inflow' }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'entries'
  });

  const watchedEntries = watch('entries');
  const startingCash = watch('startingCash') || 0;

  // Calculate totals by category
  const calculateCategoryTotal = (category: 'operating' | 'investing' | 'financing') => {
    return watchedEntries
      .filter(entry => entry.category === category)
      .reduce((sum, entry) => {
        const amount = Number(entry.amount) || 0;
        return entry.type === 'inflow' ? sum + amount : sum - amount;
      }, 0);
  };

  const operatingCashFlow = calculateCategoryTotal('operating');
  const investingCashFlow = calculateCategoryTotal('investing');
  const financingCashFlow = calculateCategoryTotal('financing');
  const netCashFlow = operatingCashFlow + investingCashFlow + financingCashFlow;
  const endingCash = startingCash + netCashFlow;

  const addEntry = (category: 'operating' | 'investing' | 'financing') => {
    append({ description: '', amount: 0, category, type: 'inflow' });
  };

  const removeEntry = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onSubmit = (data: CashFlowForm) => {
    console.log('Cash Flow Data:', data);
    toast.success('Cash flow statement saved successfully!');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const companyName = watch('companyName') || 'Company Name';
    const period = watch('period');

    // Header
    doc.setFontSize(20);
    doc.text(companyName, 105, 20, { align: 'center' });
    doc.setFontSize(16);
    doc.text('Cash Flow Statement', 105, 30, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Period: ${period}`, 105, 40, { align: 'center' });

    let yPosition = 60;

    // Starting Cash
    doc.setFontSize(12);
    doc.text('Beginning Cash Balance', 20, yPosition);
    doc.text(startingCash.toFixed(2), 160, yPosition);
    yPosition += 15;

    // Operating Activities
    doc.setFontSize(14);
    doc.text('OPERATING ACTIVITIES', 20, yPosition);
    yPosition += 10;
    
    watchedEntries
      .filter(entry => entry.category === 'operating' && entry.description)
      .forEach(entry => {
        doc.setFontSize(10);
        doc.text(entry.description, 25, yPosition);
        const amount = entry.type === 'inflow' ? entry.amount : -entry.amount;
        doc.text(amount.toFixed(2), 160, yPosition);
        yPosition += 8;
      });

    doc.text('Net Cash from Operating Activities', 25, yPosition);
    doc.text(operatingCashFlow.toFixed(2), 160, yPosition);
    yPosition += 15;

    // Investing Activities
    doc.setFontSize(14);
    doc.text('INVESTING ACTIVITIES', 20, yPosition);
    yPosition += 10;
    
    watchedEntries
      .filter(entry => entry.category === 'investing' && entry.description)
      .forEach(entry => {
        doc.setFontSize(10);
        doc.text(entry.description, 25, yPosition);
        const amount = entry.type === 'inflow' ? entry.amount : -entry.amount;
        doc.text(amount.toFixed(2), 160, yPosition);
        yPosition += 8;
      });

    doc.text('Net Cash from Investing Activities', 25, yPosition);
    doc.text(investingCashFlow.toFixed(2), 160, yPosition);
    yPosition += 15;

    // Financing Activities
    doc.setFontSize(14);
    doc.text('FINANCING ACTIVITIES', 20, yPosition);
    yPosition += 10;
    
    watchedEntries
      .filter(entry => entry.category === 'financing' && entry.description)
      .forEach(entry => {
        doc.setFontSize(10);
        doc.text(entry.description, 25, yPosition);
        const amount = entry.type === 'inflow' ? entry.amount : -entry.amount;
        doc.text(amount.toFixed(2), 160, yPosition);
        yPosition += 8;
      });

    doc.text('Net Cash from Financing Activities', 25, yPosition);
    doc.text(financingCashFlow.toFixed(2), 160, yPosition);
    yPosition += 15;

    // Net Change and Ending Cash
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 8;
    doc.setFontSize(12);
    doc.text('Net Change in Cash', 20, yPosition);
    doc.text(netCashFlow.toFixed(2), 160, yPosition);
    yPosition += 10;
    doc.text('Ending Cash Balance', 20, yPosition);
    doc.text(endingCash.toFixed(2), 160, yPosition);

    doc.save(`cash-flow-statement-${period}.pdf`);
    toast.success('Cash flow statement exported to PDF!');
  };

  const categories = [
    { value: 'operating', label: 'Operating Activities', icon: DollarSign, color: 'blue' },
    { value: 'investing', label: 'Investing Activities', icon: TrendingUp, color: 'green' },
    { value: 'financing', label: 'Financing Activities', icon: TrendingDown, color: 'purple' }
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Cash Flow Statement
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track cash inflows and outflows across business activities
              </p>
            </div>
            
            {/* Summary Cards */}
            <div className="hidden lg:flex space-x-4">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                <div className="text-sm text-blue-600 dark:text-blue-400">Net Cash Flow</div>
                <div className={`text-lg font-bold ${
                  netCashFlow >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  ${netCashFlow.toFixed(2)}
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
                <div className="text-sm text-green-600 dark:text-green-400">Ending Cash</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  ${endingCash.toFixed(2)}
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
              <div className="grid md:grid-cols-3 gap-6">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Starting Cash Balance
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('startingCash', { 
                      required: 'Starting cash is required',
                      valueAsNumber: true 
                    })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                  {errors.startingCash && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.startingCash.message}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Cash Flow Categories */}
            {categories.map((category, categoryIndex) => {
              const Icon = category.icon;
              const categoryEntries = watchedEntries.filter(entry => entry.category === category.value);
              const categoryTotal = calculateCategoryTotal(category.value as any);

              return (
                <motion.div
                  key={category.value}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className={`p-3 rounded-lg mr-4 ${
                        category.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        category.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                        'bg-purple-100 dark:bg-purple-900/30'
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          category.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                          category.color === 'green' ? 'text-green-600 dark:text-green-400' :
                          'text-purple-600 dark:text-purple-400'
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {category.label}
                        </h3>
                        <p className={`text-sm font-medium ${
                          categoryTotal >= 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          Net: ${categoryTotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => addEntry(category.value as any)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Entry
                    </button>
                  </div>

                  {/* Entries for this category */}
                  <div className="space-y-4">
                    {fields.map((field, index) => {
                      if (watchedEntries[index]?.category !== category.value) return null;
                      
                      return (
                        <motion.div
                          key={field.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                          className="grid md:grid-cols-12 gap-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
                        >
                          {/* Description */}
                          <div className="md:col-span-5">
                            <label className="block md:hidden text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Description
                            </label>
                            <input
                              type="text"
                              {...register(`entries.${index}.description` as const, {
                                required: 'Description is required'
                              })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter description"
                            />
                          </div>

                          {/* Type */}
                          <div className="md:col-span-2">
                            <label className="block md:hidden text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Type
                            </label>
                            <select
                              {...register(`entries.${index}.type` as const)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="inflow">Cash Inflow</option>
                              <option value="outflow">Cash Outflow</option>
                            </select>
                          </div>

                          {/* Amount */}
                          <div className="md:col-span-3">
                            <label className="block md:hidden text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Amount
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              {...register(`entries.${index}.amount` as const, {
                                valueAsNumber: true,
                                min: 0
                              })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="0.00"
                            />
                          </div>

                          {/* Actions */}
                          <div className="md:col-span-2 flex items-end">
                            <button
                              type="button"
                              onClick={() => removeEntry(index)}
                              disabled={fields.length === 1}
                              className="w-full md:w-auto px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="w-4 h-4 mx-auto" />
                            </button>
                          </div>

                          {/* Hidden category field */}
                          <input
                            type="hidden"
                            {...register(`entries.${index}.category` as const)}
                            value={category.value}
                          />
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}

            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Cash Flow Summary
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Beginning Cash Balance</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${startingCash.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Operating Activities</span>
                    <span className={`font-medium ${
                      operatingCashFlow >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      ${operatingCashFlow.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Investing Activities</span>
                    <span className={`font-medium ${
                      investingCashFlow >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      ${investingCashFlow.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Financing Activities</span>
                    <span className={`font-medium ${
                      financingCashFlow >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      ${financingCashFlow.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-600">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      Net Change in Cash
                    </span>
                    <span className={`text-lg font-bold ${
                      netCashFlow >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      ${netCashFlow.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-600">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      Ending Cash Balance
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ${endingCash.toFixed(2)}
                    </span>
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
                Save Cash Flow Statement
              </button>
            </motion.div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default CashFlow;