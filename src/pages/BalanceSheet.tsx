import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, Download, Save, AlertCircle, CheckCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';

interface BalanceSheetEntry {
  accountName: string;
  amount: number;
}

interface BalanceSheetForm {
  companyName: string;
  asOfDate: string;
  assets: {
    currentAssets: BalanceSheetEntry[];
    nonCurrentAssets: BalanceSheetEntry[];
  };
  liabilities: {
    currentLiabilities: BalanceSheetEntry[];
    nonCurrentLiabilities: BalanceSheetEntry[];
  };
  equity: BalanceSheetEntry[];
}

const BalanceSheet: React.FC = () => {
  const [isBalanced, setIsBalanced] = useState(false);
  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<BalanceSheetForm>({
    defaultValues: {
      companyName: '',
      asOfDate: new Date().toISOString().slice(0, 10),
      assets: {
        currentAssets: [{ accountName: '', amount: 0 }],
        nonCurrentAssets: [{ accountName: '', amount: 0 }]
      },
      liabilities: {
        currentLiabilities: [{ accountName: '', amount: 0 }],
        nonCurrentLiabilities: [{ accountName: '', amount: 0 }]
      },
      equity: [{ accountName: '', amount: 0 }]
    }
  });

  const { fields: currentAssetsFields, append: appendCurrentAsset, remove: removeCurrentAsset } = useFieldArray({
    control,
    name: 'assets.currentAssets'
  });

  const { fields: nonCurrentAssetsFields, append: appendNonCurrentAsset, remove: removeNonCurrentAsset } = useFieldArray({
    control,
    name: 'assets.nonCurrentAssets'
  });

  const { fields: currentLiabilitiesFields, append: appendCurrentLiability, remove: removeCurrentLiability } = useFieldArray({
    control,
    name: 'liabilities.currentLiabilities'
  });

  const { fields: nonCurrentLiabilitiesFields, append: appendNonCurrentLiability, remove: removeNonCurrentLiability } = useFieldArray({
    control,
    name: 'liabilities.nonCurrentLiabilities'
  });

  const { fields: equityFields, append: appendEquity, remove: removeEquity } = useFieldArray({
    control,
    name: 'equity'
  });

  const watchedData = watch();

  // Calculate totals
  const totalCurrentAssets = watchedData.assets?.currentAssets?.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0) || 0;
  const totalNonCurrentAssets = watchedData.assets?.nonCurrentAssets?.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0) || 0;
  const totalAssets = totalCurrentAssets + totalNonCurrentAssets;

  const totalCurrentLiabilities = watchedData.liabilities?.currentLiabilities?.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0) || 0;
  const totalNonCurrentLiabilities = watchedData.liabilities?.nonCurrentLiabilities?.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0) || 0;
  const totalLiabilities = totalCurrentLiabilities + totalNonCurrentLiabilities;

  const totalEquity = watchedData.equity?.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0) || 0;
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  const difference = Math.abs(totalAssets - totalLiabilitiesAndEquity);

  React.useEffect(() => {
    setIsBalanced(totalAssets > 0 && totalLiabilitiesAndEquity > 0 && difference < 0.01);
  }, [totalAssets, totalLiabilitiesAndEquity, difference]);

  const onSubmit = (data: BalanceSheetForm) => {
    if (!isBalanced) {
      toast.error('Balance sheet must be balanced before saving!');
      return;
    }
    
    console.log('Balance Sheet Data:', data);
    toast.success('Balance sheet saved successfully!');
  };

  const exportToPDF = () => {
    if (!isBalanced) {
      toast.error('Please balance the balance sheet before exporting!');
      return;
    }

    const doc = new jsPDF();
    const companyName = watch('companyName') || 'Company Name';
    const asOfDate = watch('asOfDate');

    // Header
    doc.setFontSize(20);
    doc.text(companyName, 105, 20, { align: 'center' });
    doc.setFontSize(16);
    doc.text('Balance Sheet', 105, 30, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`As of ${asOfDate}`, 105, 40, { align: 'center' });

    let yPosition = 60;

    // Assets
    doc.setFontSize(14);
    doc.text('ASSETS', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.text('Current Assets:', 20, yPosition);
    yPosition += 8;

    watchedData.assets?.currentAssets?.forEach((asset) => {
      if (asset.accountName) {
        doc.setFontSize(10);
        doc.text(`  ${asset.accountName}`, 25, yPosition);
        doc.text(asset.amount ? asset.amount.toFixed(2) : '0.00', 150, yPosition);
        yPosition += 6;
      }
    });

    doc.setFontSize(11);
    doc.text('Total Current Assets:', 25, yPosition);
    doc.text(totalCurrentAssets.toFixed(2), 150, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.text('Non-Current Assets:', 20, yPosition);
    yPosition += 8;

    watchedData.assets?.nonCurrentAssets?.forEach((asset) => {
      if (asset.accountName) {
        doc.setFontSize(10);
        doc.text(`  ${asset.accountName}`, 25, yPosition);
        doc.text(asset.amount ? asset.amount.toFixed(2) : '0.00', 150, yPosition);
        yPosition += 6;
      }
    });

    doc.setFontSize(11);
    doc.text('Total Non-Current Assets:', 25, yPosition);
    doc.text(totalNonCurrentAssets.toFixed(2), 150, yPosition);
    yPosition += 8;

    doc.setFontSize(12);
    doc.text('TOTAL ASSETS:', 20, yPosition);
    doc.text(totalAssets.toFixed(2), 150, yPosition);
    yPosition += 15;

    // Liabilities
    doc.setFontSize(14);
    doc.text('LIABILITIES', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.text('Current Liabilities:', 20, yPosition);
    yPosition += 8;

    watchedData.liabilities?.currentLiabilities?.forEach((liability) => {
      if (liability.accountName) {
        doc.setFontSize(10);
        doc.text(`  ${liability.accountName}`, 25, yPosition);
        doc.text(liability.amount ? liability.amount.toFixed(2) : '0.00', 150, yPosition);
        yPosition += 6;
      }
    });

    doc.setFontSize(11);
    doc.text('Total Current Liabilities:', 25, yPosition);
    doc.text(totalCurrentLiabilities.toFixed(2), 150, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.text('Non-Current Liabilities:', 20, yPosition);
    yPosition += 8;

    watchedData.liabilities?.nonCurrentLiabilities?.forEach((liability) => {
      if (liability.accountName) {
        doc.setFontSize(10);
        doc.text(`  ${liability.accountName}`, 25, yPosition);
        doc.text(liability.amount ? liability.amount.toFixed(2) : '0.00', 150, yPosition);
        yPosition += 6;
      }
    });

    doc.setFontSize(11);
    doc.text('Total Non-Current Liabilities:', 25, yPosition);
    doc.text(totalNonCurrentLiabilities.toFixed(2), 150, yPosition);
    yPosition += 8;

    doc.setFontSize(12);
    doc.text('TOTAL LIABILITIES:', 20, yPosition);
    doc.text(totalLiabilities.toFixed(2), 150, yPosition);
    yPosition += 15;

    // Equity
    doc.setFontSize(14);
    doc.text('EQUITY', 20, yPosition);
    yPosition += 10;

    watchedData.equity?.forEach((equity) => {
      if (equity.accountName) {
        doc.setFontSize(10);
        doc.text(`  ${equity.accountName}`, 25, yPosition);
        doc.text(equity.amount ? equity.amount.toFixed(2) : '0.00', 150, yPosition);
        yPosition += 6;
      }
    });

    doc.setFontSize(12);
    doc.text('TOTAL EQUITY:', 20, yPosition);
    doc.text(totalEquity.toFixed(2), 150, yPosition);
    yPosition += 8;

    doc.text('TOTAL LIABILITIES & EQUITY:', 20, yPosition);
    doc.text(totalLiabilitiesAndEquity.toFixed(2), 150, yPosition);

    doc.save(`balance-sheet-${asOfDate}.pdf`);
    toast.success('Balance sheet exported to PDF!');
  };

  const renderSection = (
    title: string,
    fields: any[],
    register: any,
    append: () => void,
    remove: (index: number) => void,
    fieldName: string
  ) => (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white">{title}</h4>
        <button
          type="button"
          onClick={append}
          className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add
        </button>
      </div>
      
      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-3">
            <input
              type="text"
              {...register(`${fieldName}.${index}.accountName` as const)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Account name"
            />
            <input
              type="number"
              step="0.01"
              {...register(`${fieldName}.${index}.amount` as const, {
                valueAsNumber: true,
                min: 0
              })}
              className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="0.00"
            />
            <button
              type="button"
              onClick={() => remove(index)}
              disabled={fields.length === 1}
              className="px-2 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Balance Sheet
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Create and validate your balance sheet
              </p>
            </div>
            
            {/* Balance Status */}
            <div className="flex items-center space-x-4">
              <div className={`flex items-center px-4 py-2 rounded-lg ${
                isBalanced 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              }`}>
                {isBalanced ? (
                  <CheckCircle className="w-5 h-5 mr-2" />
                ) : (
                  <AlertCircle className="w-5 h-5 mr-2" />
                )}
                <span className="font-medium">
                  {isBalanced ? 'Balanced' : `Difference: $${difference.toFixed(2)}`}
                </span>
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
                    As of Date
                  </label>
                  <input
                    type="date"
                    {...register('asOfDate', { required: 'Date is required' })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.asOfDate && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.asOfDate.message}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Balance Sheet Sections */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Assets */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Assets
                </h3>
                
                <div className="space-y-6">
                  {renderSection(
                    'Current Assets',
                    currentAssetsFields,
                    register,
                    () => appendCurrentAsset({ accountName: '', amount: 0 }),
                    removeCurrentAsset,
                    'assets.currentAssets'
                  )}
                  
                  {renderSection(
                    'Non-Current Assets',
                    nonCurrentAssetsFields,
                    register,
                    () => appendNonCurrentAsset({ accountName: '', amount: 0 }),
                    removeNonCurrentAsset,
                    'assets.nonCurrentAssets'
                  )}
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900 dark:text-white">Total Assets</span>
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        ${totalAssets.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Liabilities & Equity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Liabilities & Equity
                </h3>
                
                <div className="space-y-6">
                  {renderSection(
                    'Current Liabilities',
                    currentLiabilitiesFields,
                    register,
                    () => appendCurrentLiability({ accountName: '', amount: 0 }),
                    removeCurrentLiability,
                    'liabilities.currentLiabilities'
                  )}
                  
                  {renderSection(
                    'Non-Current Liabilities',
                    nonCurrentLiabilitiesFields,
                    register,
                    () => appendNonCurrentLiability({ accountName: '', amount: 0 }),
                    removeNonCurrentLiability,
                    'liabilities.nonCurrentLiabilities'
                  )}
                  
                  {renderSection(
                    'Equity',
                    equityFields,
                    register,
                    () => appendEquity({ accountName: '', amount: 0 }),
                    removeEquity,
                    'equity'
                  )}
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900 dark:text-white">Total Liabilities & Equity</span>
                      <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                        ${totalLiabilitiesAndEquity.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-end"
            >
              <button
                type="button"
                onClick={exportToPDF}
                disabled={!isBalanced}
                className="flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </button>
              <button
                type="submit"
                disabled={!isBalanced}
                className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Balance Sheet
              </button>
            </motion.div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default BalanceSheet;