import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

const TestimonialsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Small Business Owner',
      company: 'Johnson\'s Bakery',
      image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      content: 'FinEasy has completely transformed how I manage my bakery\'s finances. The trial balance feature catches errors I would have missed, and generating financial statements is now a breeze. My accountant loves the professional reports!',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Freelance Consultant',
      company: 'Chen Consulting',
      image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      content: 'As a freelancer, I needed something simple yet powerful. FinEasy\'s invoice creator and expense tracking have saved me hours every week. The mobile app means I can manage everything on the go.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Startup Founder',
      company: 'GreenTech Solutions',
      image: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      content: 'We were spending too much on accounting software that was overkill for our startup. FinEasy gives us everything we need at a fraction of the cost. The cash flow forecasting feature helped us secure our Series A funding.',
      rating: 5
    },
    {
      name: 'David Thompson',
      role: 'Restaurant Owner',
      company: 'Thompson\'s Grill',
      image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      content: 'Managing restaurant finances used to be a nightmare. FinEasy\'s document upload feature with OCR means I can scan receipts instantly, and the real-time dashboards help me make better business decisions daily.',
      rating: 5
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  return (
    <section className="py-24 bg-white dark:bg-gray-900">
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
            Trusted by
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {" "}10,000+ Businesses
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            See what our customers are saying about their experience with FinEasy
          </p>
        </motion.div>

        {/* Main Testimonial */}
        <div className="relative max-w-4xl mx-auto mb-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 md:p-12"
            >
              {/* Stars */}
              <div className="flex justify-center mb-6">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Content */}
              <blockquote className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 text-center mb-8 leading-relaxed">
                "{testimonials[currentIndex].content}"
              </blockquote>

              {/* Author */}
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <img
                  src={testimonials[currentIndex].image}
                  alt={testimonials[currentIndex].name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="text-center sm:text-left">
                  <div className="font-semibold text-gray-900 dark:text-white text-lg">
                    {testimonials[currentIndex].name}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {testimonials[currentIndex].role}
                  </div>
                  <div className="text-blue-600 dark:text-blue-400 font-medium">
                    {testimonials[currentIndex].company}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <button
            onClick={prevTestimonial}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextTestimonial}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center space-x-3 mb-16">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`
                w-3 h-3 rounded-full transition-all duration-200
                ${index === currentIndex 
                  ? 'bg-blue-600 w-8' 
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }
              `}
            />
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">4.9/5</div>
            <div className="text-gray-600 dark:text-gray-400">Average Rating</div>
          </div>
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">10K+</div>
            <div className="text-gray-600 dark:text-gray-400">Happy Customers</div>
          </div>
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">50K+</div>
            <div className="text-gray-600 dark:text-gray-400">Reports Generated</div>
          </div>
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">99.9%</div>
            <div className="text-gray-600 dark:text-gray-400">Uptime</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;