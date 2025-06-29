import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How does FinEasy help with financial statement generation?',
      answer: 'FinEasy automates the creation of professional financial statements including Trial Balance, Income Statement, Balance Sheet, and Cash Flow Statement. Simply input your financial data, and our platform handles all calculations, formatting, and validation to ensure accuracy and compliance with accounting standards.'
    },
    {
      question: 'Is my financial data secure with FinEasy?',
      answer: 'Absolutely. We use bank-level encryption (256-bit SSL) to protect your data both in transit and at rest. All data is stored in secure, SOC 2 compliant data centers with daily backups. We never share your financial information with third parties, and you maintain complete ownership of your data.'
    },
    {
      question: 'Can I export my financial statements to PDF or Excel?',
      answer: 'Yes! All financial statements can be exported to both PDF and Excel formats. PDF exports are professionally formatted and ready for sharing with accountants, investors, or banks. Excel exports allow for further customization and analysis.'
    },
    {
      question: 'How does the OCR document upload feature work?',
      answer: 'Our advanced OCR (Optical Character Recognition) technology automatically extracts key information from uploaded receipts, invoices, and bank statements. The system recognizes dates, amounts, vendor names, and categories, then auto-populates your financial records, saving you hours of manual data entry.'
    },
    {
      question: 'Can multiple team members access the same account?',
      answer: 'Yes, FinEasy supports team collaboration with role-based access controls. You can invite team members with different permission levels: Owner (full access), Admin (most features), Accountant (financial tools), or Viewer (read-only). The number of team members varies by plan.'
    },
    {
      question: 'Do I need accounting knowledge to use FinEasy?',
      answer: 'Not at all! FinEasy is designed for users of all skill levels. We provide guided workflows, helpful tooltips, and automatic error checking to ensure accuracy. However, the platform is also powerful enough for professional accountants and advanced users.'
    },
    {
      question: 'How does the trial balance validation work?',
      answer: 'Our trial balance feature includes real-time validation that checks if debits equal credits as you enter data. It highlights any discrepancies and provides suggestions for common errors. This helps catch mistakes before they affect your financial statements.'
    },
    {
      question: 'Can I integrate FinEasy with my bank or other financial tools?',
      answer: 'Our Professional and Enterprise plans include bank CSV upload functionality for easy reconciliation. We also offer API access for Enterprise customers to integrate with other business tools. We\'re continuously adding new integrations based on customer feedback.'
    },
    {
      question: 'What happens to my data if I cancel my subscription?',
      answer: 'You can export all your data at any time, including during a grace period after cancellation. We provide 30 days to download your information before account deletion. You always own your financial data and can take it with you.'
    },
    {
      question: 'Is there a mobile app for FinEasy?',
      answer: 'Yes! FinEasy is fully responsive and works great on mobile devices through your web browser. We also have dedicated mobile apps for iOS and Android that allow you to scan receipts, create invoices, and view financial dashboards on the go.'
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {" "}Questions
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Get answers to common questions about FinEasy's features, security, and pricing.
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-8">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <Minus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Plus className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6">
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16 p-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Still have questions?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Our support team is here to help you get started with FinEasy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@fineasy.com"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Contact Support
            </a>
            <a
              href="#"
              className="inline-flex items-center px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              Schedule Demo
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;