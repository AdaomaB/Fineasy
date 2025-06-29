import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, Download, Save, AlertCircle, CheckCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';

interface TrialBalanceEntry {
  accountName: string;
  accountCode: string;
  debit: number;
  credit: number;
}

interface TrialBalanceForm {
  companyName: string;
  period: string;
  entries: TrialBalanceEntry[];
}

const TrialBalance: React.FC = () => {
  const [isBalanced, setIsBalanced] = useState(false);
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<TrialBalanceForm>({
    defaultValues: {
      companyName: '',
      period: new Date().toISOString().slice(0, 7),
      entries: [
        { accountName: '', accountCode: '', debit: 0, credit: 0 }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'entries'
  });

  const watchedEntries = watch('entries');

  // Calculate totals
  const totalDebits = watchedEntries.reduce((sum, entry) => sum + (Number(entry.debit) || 0), 0);
  const totalCredits = watchedEntries.reduce((sum, entry) => sum + (Number(entry.credit) || 0), 0);
  const difference = Math.abs(totalDebits - totalCredits);

  React.useEffect(() => {
    setIsBalanced(totalDebits > 0 && totalCredits > 0 && difference < 0.01);
  }, [totalDebits, totalCredits, difference]);

  const addEntry = () => {
    append({ accountName: '', accountCode: '', debit: 0, credit: 0 });
  };

  const removeEntry = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onSubmit = (data: TrialBalanceForm) => {
    if (!isBalanced) {
      toast.error('Trial balance must be balanced before saving!');
      return;
    }
    
    console.log('Trial Balance Data:', data);
    toast.success('Trial balance saved successfully!');
  };

  const exportToPDF = () => {
    if (!isBalanced) {
      toast.error('Please balance the trial balance before exporting!');
      return;
    }

    const doc = new jsPDF();
    const companyName = watch('companyName') || 'Company Name';
    const period = watch('period');

    // Header
    doc.setFontSize(20);
    doc.text(companyName, 105, 20, { align: 'center' });
    doc.setFontSize(16);
    doc.text('Trial Balance', 105, 30, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Period: ${period}`, 105, 40, { align: 'center' });

    // Table headers
    doc.setFontSize(10);
    doc.text('Account Code', 20, 60);
    doc.text('Account Name', 50, 60);
    doc.text('Debit', 130, 60);
    doc.text('Credit', 160, 60);

    // Draw line under headers
    doc.line(20, 62, 190, 62);

    // Table data
    let yPosition = 70;
    watchedEntries.forEach((entry) => {
      if (entry.accountName) {
        doc.text(entry.accountCode, 20, yPosition);
        doc.text(entry.accountName, 50, yPosition);
        doc.text(entry.debit ? entry.debit.toFixed(2) : '', 130, yPosition);
        doc.text(entry.credit ? entry.credit.toFixed(2) : '', 160, yPosition);
        yPosition += 8;
      }
    });

    // Totals
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 8;
    doc.setFontSize(12);
    doc.text('TOTALS', 50, yPosition);
    doc.text(totalDebits.toFixed(2), 130, yPosition);
    doc.text(totalCredits.toFixed(2), 160, yPosition);

    doc.save(`trial-balance-${period}.pdf`);
    toast.success('Trial balance exported to PDF!');
  };

  const commonAccounts = [
    { code: '1000', name: 'Cash' },
    { code: '1100', name: 'Accounts Receivable' },
    { code: '1200', name: 'Inventory' },
    { code: '1500', name: 'Equipment' },
    { code: '2000', name: 'Accounts Payable' },
    { code: '2100', name: 'Notes Payable' },
    { code: '3000', name: 'Owner\'s Equity' },
    { code: '4000', name: 'Sales Revenue' },
    { code: '5000', name: 'Cost of Goods Sold' },
    { code: '6000', name: 'Operating Expenses' }
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
                Trial Balance
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Create and validate your trial balance
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

            {/* Trial Balance Entries */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Account Entries
                </h3>
                <button
                  type="button"
                  onClick={addEntry}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Entry
                </button>
              </div>

              {/* Table Header */}
              <div className="hidden md:grid md:grid-cols-12 gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="col-span-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Account Code
                </div>
                <div className="col-span-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Account Name
                </div>
                <div className="col-span-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Debit
                </div>
                <div className="col-span-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Credit
                </div>
                <div className="col-span-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Actions
                </div>
              </div>

              {/* Entries */}
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid md:grid-cols-12 gap-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
                  >
                    {/* Account Code */}
                    <div className="md:col-span-2">
                      <label className="block md:hidden text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Account Code
                      </label>
                      <select
                        {...register(`entries.${index}.accountCode` as const)}
                        onChange={(e) => {
                          const selectedAccount = commonAccounts.find(acc => acc.code === e.target.value);
                          if (selectedAccount) {
                            setValue(`entries.${index}.accountCode`, selectedAccount.code);
                            setValue(`entries.${index}.accountName`, selectedAccount.name);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select...</option>
                        {commonAccounts.map((account) => (
                          <option key={account.code} value={account.code}>
                            {account.code}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Account Name */}
                    <div className="md:col-span-4">
                      <label className="block md:hidden text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Account Name
                      </label>
                      <input
                        type="text"
                        {...register(`entries.${index}.accountName` as const, {
                          required: 'Account name is required'
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter account name"
                      />
                    </div>

                    {/* Debit */}
                    <div className="md:col-span-2">
                      <label className="block md:hidden text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Debit
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        {...register(`entries.${index}.debit` as const, {
                          valueAsNumber: true,
                          min: 0
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                    </div>

                    {/* Credit */}
                    <div className="md:col-span-2">
                      <label className="block md:hidden text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Credit
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        {...register(`entries.${index}.credit` as const, {
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
                  </motion.div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="grid md:grid-cols-12 gap-4">
                  <div className="md:col-span-6 flex items-center">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      TOTALS
                    </span>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Debits</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        ${totalDebits.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Credits</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        ${totalCredits.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Difference</div>
                      <div className={`text-lg font-bold ${
                        isBalanced 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        ${difference.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
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
                Save Trial Balance
              </button>
            </motion.div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default TrialBalance;