import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, Download, Save, Send, Eye, Calculator } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceForm {
  // Invoice Details
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  
  // Company Details
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyPhone: string;
  companyEmail: string;
  
  // Client Details
  clientName: string;
  clientAddress: string;
  clientCity: string;
  clientEmail: string;
  
  // Invoice Items
  items: InvoiceItem[];
  
  // Additional Details
  notes: string;
  terms: string;
  taxRate: number;
}

const InvoiceCreator: React.FC = () => {
  const [previewMode, setPreviewMode] = useState(false);
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<InvoiceForm>({
    defaultValues: {
      invoiceNumber: `INV-${Date.now()}`,
      invoiceDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      companyName: '',
      companyAddress: '',
      companyCity: '',
      companyPhone: '',
      companyEmail: '',
      clientName: '',
      clientAddress: '',
      clientCity: '',
      clientEmail: '',
      items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
      notes: '',
      terms: 'Payment is due within 30 days of invoice date.',
      taxRate: 0
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const watchedItems = watch('items');
  const taxRate = watch('taxRate') || 0;

  // Calculate totals
  const subtotal = watchedItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  // Update item amount when quantity or rate changes
  React.useEffect(() => {
    watchedItems.forEach((item, index) => {
      const newAmount = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
      if (newAmount !== item.amount) {
        setValue(`items.${index}.amount`, newAmount);
      }
    });
  }, [watchedItems, setValue]);

  const addItem = () => {
    append({ description: '', quantity: 1, rate: 0, amount: 0 });
  };

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onSubmit = (data: InvoiceForm) => {
    console.log('Invoice Data:', data);
    toast.success('Invoice saved successfully!');
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const formData = watch();

    // Header
    doc.setFontSize(24);
    doc.text('INVOICE', 20, 30);
    
    // Company Info
    doc.setFontSize(12);
    doc.text(formData.companyName || 'Your Company', 20, 50);
    doc.setFontSize(10);
    doc.text(formData.companyAddress || 'Company Address', 20, 60);
    doc.text(formData.companyCity || 'City, State ZIP', 20, 70);
    doc.text(formData.companyPhone || 'Phone', 20, 80);
    doc.text(formData.companyEmail || 'Email', 20, 90);

    // Invoice Details
    doc.setFontSize(10);
    doc.text(`Invoice #: ${formData.invoiceNumber}`, 120, 50);
    doc.text(`Date: ${formData.invoiceDate}`, 120, 60);
    doc.text(`Due Date: ${formData.dueDate}`, 120, 70);

    // Bill To
    doc.setFontSize(12);
    doc.text('BILL TO:', 20, 110);
    doc.setFontSize(10);
    doc.text(formData.clientName || 'Client Name', 20, 120);
    doc.text(formData.clientAddress || 'Client Address', 20, 130);
    doc.text(formData.clientCity || 'City, State ZIP', 20, 140);
    doc.text(formData.clientEmail || 'Email', 20, 150);

    // Table Headers
    let yPosition = 170;
    doc.setFontSize(10);
    doc.text('Description', 20, yPosition);
    doc.text('Qty', 120, yPosition);
    doc.text('Rate', 140, yPosition);
    doc.text('Amount', 170, yPosition);
    
    doc.line(20, yPosition + 5, 190, yPosition + 5);
    yPosition += 15;

    // Items
    watchedItems.forEach((item) => {
      if (item.description) {
        doc.text(item.description, 20, yPosition);
        doc.text(item.quantity.toString(), 120, yPosition);
        doc.text(`$${item.rate.toFixed(2)}`, 140, yPosition);
        doc.text(`$${item.amount.toFixed(2)}`, 170, yPosition);
        yPosition += 10;
      }
    });

    // Totals
    yPosition += 10;
    doc.line(120, yPosition, 190, yPosition);
    yPosition += 10;
    
    doc.text('Subtotal:', 140, yPosition);
    doc.text(`$${subtotal.toFixed(2)}`, 170, yPosition);
    yPosition += 10;
    
    if (taxRate > 0) {
      doc.text(`Tax (${taxRate}%):`, 140, yPosition);
      doc.text(`$${taxAmount.toFixed(2)}`, 170, yPosition);
      yPosition += 10;
    }
    
    doc.setFontSize(12);
    doc.text('Total:', 140, yPosition);
    doc.text(`$${total.toFixed(2)}`, 170, yPosition);

    // Notes and Terms
    if (formData.notes) {
      yPosition += 20;
      doc.setFontSize(10);
      doc.text('Notes:', 20, yPosition);
      doc.text(formData.notes, 20, yPosition + 10);
    }

    if (formData.terms) {
      yPosition += 30;
      doc.text('Terms:', 20, yPosition);
      doc.text(formData.terms, 20, yPosition + 10);
    }

    doc.save(`invoice-${formData.invoiceNumber}.pdf`);
    toast.success('Invoice PDF generated successfully!');
  };

  const sendInvoice = () => {
    // In a real app, this would send the invoice via email
    toast.success('Invoice sent successfully!');
  };

  if (previewMode) {
    const formData = watch();
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Invoice Preview
              </h1>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setPreviewMode(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={generatePDF}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </button>
                <button
                  onClick={sendInvoice}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Invoice
                </button>
              </div>
            </div>
          </header>

          {/* Invoice Preview */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              {/* Invoice Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">INVOICE</h1>
                  <div className="text-gray-600 dark:text-gray-400">
                    <p className="font-semibold text-lg text-gray-900 dark:text-white">{formData.companyName}</p>
                    <p>{formData.companyAddress}</p>
                    <p>{formData.companyCity}</p>
                    <p>{formData.companyPhone}</p>
                    <p>{formData.companyEmail}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-gray-600 dark:text-gray-400 space-y-1">
                    <p><span className="font-medium">Invoice #:</span> {formData.invoiceNumber}</p>
                    <p><span className="font-medium">Date:</span> {formData.invoiceDate}</p>
                    <p><span className="font-medium">Due Date:</span> {formData.dueDate}</p>
                  </div>
                </div>
              </div>

              {/* Bill To */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">BILL TO:</h3>
                <div className="text-gray-600 dark:text-gray-400">
                  <p className="font-medium text-gray-900 dark:text-white">{formData.clientName}</p>
                  <p>{formData.clientAddress}</p>
                  <p>{formData.clientCity}</p>
                  <p>{formData.clientEmail}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-8">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-200 dark:border-gray-600">
                      <th className="text-left py-3 text-gray-900 dark:text-white font-semibold">Description</th>
                      <th className="text-center py-3 text-gray-900 dark:text-white font-semibold">Qty</th>
                      <th className="text-right py-3 text-gray-900 dark:text-white font-semibold">Rate</th>
                      <th className="text-right py-3 text-gray-900 dark:text-white font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {watchedItems.map((item, index) => (
                      item.description && (
                        <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                          <td className="py-3 text-gray-900 dark:text-white">{item.description}</td>
                          <td className="py-3 text-center text-gray-600 dark:text-gray-400">{item.quantity}</td>
                          <td className="py-3 text-right text-gray-600 dark:text-gray-400">${item.rate.toFixed(2)}</td>
                          <td className="py-3 text-right text-gray-900 dark:text-white font-medium">${item.amount.toFixed(2)}</td>
                        </tr>
                      )
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-8">
                <div className="w-64">
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                    <span className="text-gray-900 dark:text-white font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  {taxRate > 0 && (
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
                      <span className="text-gray-600 dark:text-gray-400">Tax ({taxRate}%):</span>
                      <span className="text-gray-900 dark:text-white font-medium">${taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-3 border-b-2 border-gray-300 dark:border-gray-600">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Notes and Terms */}
              {formData.notes && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Notes:</h4>
                  <p className="text-gray-600 dark:text-gray-400">{formData.notes}</p>
                </div>
              )}

              {formData.terms && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Terms:</h4>
                  <p className="text-gray-600 dark:text-gray-400">{formData.terms}</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Invoice Creator
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Create professional invoices for your clients
              </p>
            </div>
            
            {/* Total Display */}
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">Invoice Total</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${total.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 pb-20 lg:pb-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Invoice Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Invoice Details
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    {...register('invoiceNumber', { required: 'Invoice number is required' })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="INV-001"
                  />
                  {errors.invoiceNumber && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.invoiceNumber.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Invoice Date
                  </label>
                  <input
                    type="date"
                    {...register('invoiceDate', { required: 'Invoice date is required' })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.invoiceDate && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.invoiceDate.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    {...register('dueDate', { required: 'Due date is required' })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.dueDate && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.dueDate.message}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Company and Client Info */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Company Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  From (Your Company)
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      {...register('companyName', { required: 'Company name is required' })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your Company Name"
                    />
                    {errors.companyName && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.companyName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      {...register('companyAddress')}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="123 Business St"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      City, State ZIP
                    </label>
                    <input
                      type="text"
                      {...register('companyCity')}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="City, State 12345"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        {...register('companyPhone')}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        {...register('companyEmail')}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="hello@company.com"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Client Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Bill To (Client)
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Client Name
                    </label>
                    <input
                      type="text"
                      {...register('clientName', { required: 'Client name is required' })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Client Company Name"
                    />
                    {errors.clientName && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.clientName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      {...register('clientAddress')}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="456 Client Ave"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      City, State ZIP
                    </label>
                    <input
                      type="text"
                      {...register('clientCity')}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="City, State 12345"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      {...register('clientEmail')}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="client@company.com"
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Invoice Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Invoice Items
                </h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </button>
              </div>

              {/* Table Header */}
              <div className="hidden md:grid md:grid-cols-12 gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="col-span-5 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </div>
                <div className="col-span-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Quantity
                </div>
                <div className="col-span-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Rate
                </div>
                <div className="col-span-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Amount
                </div>
                <div className="col-span-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Actions
                </div>
              </div>

              {/* Items */}
              <div className="space-y-4">
                {fields.map((field, index) => (
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
                        {...register(`items.${index}.description` as const, {
                          required: 'Description is required'
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Item description"
                      />
                    </div>

                    {/* Quantity */}
                    <div className="md:col-span-2">
                      <label className="block md:hidden text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        {...register(`items.${index}.quantity` as const, {
                          valueAsNumber: true,
                          min: 1
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="1"
                      />
                    </div>

                    {/* Rate */}
                    <div className="md:col-span-2">
                      <label className="block md:hidden text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Rate
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        {...register(`items.${index}.rate` as const, {
                          valueAsNumber: true,
                          min: 0
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                    </div>

                    {/* Amount */}
                    <div className="md:col-span-2">
                      <label className="block md:hidden text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Amount
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        {...register(`items.${index}.amount` as const, {
                          valueAsNumber: true
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
                        placeholder="0.00"
                        readOnly
                      />
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-1 flex items-end">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
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
              <div className="mt-6 flex justify-end">
                <div className="w-full md:w-80 space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                    <span className="text-lg font-medium text-gray-900 dark:text-white">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600 dark:text-gray-400">Tax Rate (%):</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        {...register('taxRate', { valueAsNumber: true })}
                        className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        placeholder="0"
                      />
                    </div>
                    <span className="text-lg font-medium text-gray-900 dark:text-white">
                      ${taxAmount.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Notes and Terms */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Additional Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    rows={4}
                    {...register('notes')}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Additional notes or comments..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Terms & Conditions
                  </label>
                  <textarea
                    rows={4}
                    {...register('terms')}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Payment terms and conditions..."
                  />
                </div>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-end"
            >
              <button
                type="button"
                onClick={() => setPreviewMode(true)}
                className="flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </button>
              <button
                type="button"
                onClick={generatePDF}
                className="flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </button>
              <button
                type="submit"
                className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Invoice
              </button>
            </motion.div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default InvoiceCreator;