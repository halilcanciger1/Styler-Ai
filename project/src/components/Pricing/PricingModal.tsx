import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Check, Star } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-stone-800 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-stone-800">Buy Credits</h2>
                  <p className="text-stone-700 text-sm">Choose the perfect plan for your needs</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-stone-600 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Benefits Section */}
              <div className="mb-8 text-center">
                <h3 className="text-2xl font-bold text-stone-900 mb-4">
                  Unlock AI-Powered Fashion Generation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center space-x-3 p-4 bg-stone-50 rounded-lg">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-stone-900">High Quality</h4>
                      <p className="text-stone-600 text-sm">Professional-grade AI results</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-stone-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Zap className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-stone-900">Fast Processing</h4>
                      <p className="text-stone-600 text-sm">Results in 3-8 seconds</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-stone-50 rounded-lg">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-stone-900">Premium Features</h4>
                      <p className="text-stone-600 text-sm">Advanced controls & options</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stripe Pricing Table */}
              <div className="bg-stone-50 rounded-xl p-6">
                <div className="text-center mb-6">
                  <h4 className="text-lg font-semibold text-stone-900 mb-2">
                    Choose Your Credit Package
                  </h4>
                  <p className="text-stone-600">
                    Secure payment powered by Stripe • Cancel anytime • Instant activation
                  </p>
                </div>
                
                <div className="stripe-pricing-container">
                  <stripe-pricing-table 
                    pricing-table-id="prctbl_1Rf6BWRgdiF56xwIYcxrLpRG"
                    publishable-key="pk_test_51Rf5vtRgdiF56xwI7Gk6M8vaT1AjL21AqvqSqLbfSHwEarDvbSQgaOt39Gugak8r8ffIldmC3A5k4enY7ZvuLJoE003rU9P5ER">
                  </stripe-pricing-table>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-stone-900 mb-4">Frequently Asked Questions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-stone-50 rounded-lg">
                    <h5 className="font-medium text-stone-900 mb-2">How do credits work?</h5>
                    <p className="text-stone-600 text-sm">
                      Each AI generation uses 1 credit. Credits never expire and can be used anytime.
                    </p>
                  </div>
                  <div className="p-4 bg-stone-50 rounded-lg">
                    <h5 className="font-medium text-stone-900 mb-2">What payment methods do you accept?</h5>
                    <p className="text-stone-600 text-sm">
                      We accept all major credit cards, PayPal, and other payment methods via Stripe.
                    </p>
                  </div>
                  <div className="p-4 bg-stone-50 rounded-lg">
                    <h5 className="font-medium text-stone-900 mb-2">Can I get a refund?</h5>
                    <p className="text-stone-600 text-sm">
                      Yes, we offer a 30-day money-back guarantee for all credit purchases.
                    </p>
                  </div>
                  <div className="p-4 bg-stone-50 rounded-lg">
                    <h5 className="font-medium text-stone-900 mb-2">Is my payment secure?</h5>
                    <p className="text-stone-600 text-sm">
                      Absolutely. All payments are processed securely through Stripe with bank-level encryption.
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="mt-8 text-center">
                <div className="flex items-center justify-center space-x-6 text-stone-500">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-sm">SSL Secured</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Stripe Protected</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">30-Day Guarantee</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PricingModal;