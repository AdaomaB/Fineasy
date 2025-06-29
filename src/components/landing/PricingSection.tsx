import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const PricingSection: React.FC = () => {
  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      period: 'forever',
      description: 'Perfect for individuals and small startups',
      features: [
        'Up to 3 financial statements per month',
        'Basic trial balance generator',
        'PDF exports',
        'Email support',
        'Mobile app access',
        '1 team member'
      ],
      limitations: [
        'Limited document uploads (10/month)',
        'Basic templates only'
      ],
      cta: 'Get Started Free',
      popular: false,
      color: 'gray'
    },
    {
      name: 'Professional',
      price: '$29',
      period: 'per month',
      description: 'Ideal for growing businesses and freelancers',
      features: [
        'Unlimited financial statements',
        'All statement types (P&L, Balance Sheet, Cash Flow)',
        'Advanced trial balance with error checking',
        'Document OCR and auto-extraction',
        'Custom invoice templates',
        'Excel and PDF exports',
        'Priority email support',
        'Up to 5 team members',
        'Bank reconciliation',
        'Expense tracking',
        'Basic analytics dashboard'
      ],
      limitations: [],
      cta: 'Start Free Trial',
      popular: true,
      color: 'blue'
    },
    {
      name: 'Enterprise',
      price: '$99',
      period: 'per month',
      description: 'For established businesses with advanced needs',
      features: [
        'Everything in Professional',
        'Advanced analytics and forecasting',
        'Custom reporting and dashboards',
        'API access for integrations',
        'White-label options',
        'Dedicated account manager',
        'Phone and chat support',
        'Unlimited team members',
        'Advanced user roles and permissions',
        'Custom workflow automation',
        'Data backup and recovery',
        'Compliance reporting tools',
        'Multi-company management'
      ],
      limitations: [],
      cta: 'Contact Sales',
      popular: false,
      color: 'purple'
    }
  ];

  const getColorClasses = (color: string, type: 'bg' | 'text' | 'border' | 'hover') => {
    const colors = {
      gray: {
        bg: 'bg-gray-100 dark:bg-gray-800',
        text: 'text-gray-600 dark:text-gray-400',
        border: 'border-gray-200 dark:border-gray-700',
        hover: 'hover:bg-gray-50 dark:hover:bg-gray-700'
      },
      blue: {
        bg: 'bg-blue-600',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-600',
        hover: 'hover:bg-blue-700'
      },
      purple: {
        bg: 'bg-purple-600',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-600',
        hover: 'hover:bg-purple-700'
      }
    };
    return colors[color as keyof typeof colors][type];
  };

  return (
    <section id="pricing" className="py-24 bg-gray-50 dark:bg-gray-800">
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
            Simple, Transparent
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {" "}Pricing
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Choose the plan that fits your business needs. All plans include a 14-day free trial with no credit card required.
          </p>
          
          {/* Money-back guarantee */}
          <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
            <Check className="w-4 h-4 mr-2" />
            30-day money-back guarantee
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`
                relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden
                ${plan.popular 
                  ? 'ring-2 ring-blue-600 dark:ring-blue-400 transform lg:scale-105' 
                  : 'border border-gray-200 dark:border-gray-700'
                }
              `}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-2 text-sm font-medium">
                  <div className="flex items-center justify-center">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className={`p-8 ${plan.popular ? 'pt-16' : ''}`}>
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    {plan.price !== 'Free' && (
                      <span className="text-gray-600 dark:text-gray-400 ml-2">
                        /{plan.period}
                      </span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start">
                      <div className="flex-shrink-0 w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mt-0.5 mr-3">
                        <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </div>
                  ))}
                  
                  {/* Limitations */}
                  {plan.limitations.map((limitation, limitIndex) => (
                    <div key={limitIndex} className="flex items-start opacity-60">
                      <div className="flex-shrink-0 w-5 h-5 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mt-0.5 mr-3">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      </div>
                      <span className="text-gray-600 dark:text-gray-400">
                        {limitation}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Link
                  to="/register"
                  className={`
                    block w-full py-3 px-6 text-center font-semibold rounded-xl transition-all duration-200 transform hover:scale-105
                    ${plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  {plan.cta}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            All plans include SSL encryption, daily backups, and 99.9% uptime guarantee.
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-green-600" />
              No setup fees
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-green-600" />
              Cancel anytime
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-green-600" />
              24/7 support
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-green-600" />
              Free migration
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;