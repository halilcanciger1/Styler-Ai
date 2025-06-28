import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap, CreditCard, Shield, Clock } from 'lucide-react';

interface PricingSectionProps {
  onBuyCredits: () => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({ onBuyCredits }) => {
  const plans = [
    {
      id: 'starter',
      name: 'Starter Pack',
      credits: 50,
      price: 9.99,
      originalPrice: 12.99,
      popular: false,
      features: [
        '50 AI generations',
        'All quality settings',
        'Standard processing speed',
        'Download in HD',
        'Email support'
      ],
      color: 'from-blue-400 to-blue-500',
      savings: '23%'
    },
    {
      id: 'popular',
      name: 'Popular Pack',
      credits: 150,
      price: 24.99,
      originalPrice: 34.99,
      popular: true,
      features: [
        '150 AI generations',
        'All quality settings',
        'Priority processing',
        'Download in HD',
        'Advanced controls',
        'Priority support',
        'Bulk processing'
      ],
      color: 'from-yellow-400 to-yellow-500',
      savings: '29%'
    },
    {
      id: 'pro',
      name: 'Pro Pack',
      credits: 500,
      price: 69.99,
      originalPrice: 99.99,
      popular: false,
      features: [
        '500 AI generations',
        'All premium features',
        'Fastest processing',
        'Download in 4K',
        'API access',
        'Custom seeds',
        'Dedicated support',
        'Commercial license'
      ],
      color: 'from-purple-400 to-purple-500',
      savings: '30%'
    }
  ];

  return (
    <div className="py-16 bg-gradient-to-br from-stone-50 to-stone-100">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h2 className="text-4xl font-bold text-stone-900 mb-4">
              Choose Your Credit Package
            </h2>
            <p className="text-xl text-stone-600 max-w-3xl mx-auto">
              Get more credits, unlock premium features, and create stunning AI fashion visualizations
            </p>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center space-x-8 mb-8"
          >
            <div className="flex items-center space-x-2 text-stone-600">
              <Shield className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium">Secure Payment</span>
            </div>
            <div className="flex items-center space-x-2 text-stone-600">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium">Instant Activation</span>
            </div>
            <div className="flex items-center space-x-2 text-stone-600">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium">30-Day Guarantee</span>
            </div>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:scale-105
                ${plan.popular 
                  ? 'border-yellow-400 shadow-yellow-100' 
                  : 'border-stone-200 hover:border-stone-300'
                }
              `}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-stone-800 px-6 py-2 rounded-full text-sm font-bold flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-current" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              {/* Savings Badge */}
              <div className="absolute top-4 right-4">
                <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  Save {plan.savings}
                </div>
              </div>

              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${plan.color} flex items-center justify-center`}>
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-stone-900 mb-2">{plan.name}</h3>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-1">
                      <span className="text-3xl font-bold text-stone-900">${plan.price}</span>
                      <span className="text-lg text-stone-500 line-through">${plan.originalPrice}</span>
                    </div>
                    <p className="text-stone-600">{plan.credits} credits included</p>
                    <p className="text-stone-500 text-sm">
                      ${(plan.price / plan.credits).toFixed(3)} per credit
                    </p>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-stone-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={onBuyCredits}
                  className={`
                    w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105
                    ${plan.popular
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-stone-800 shadow-lg'
                      : 'bg-stone-800 hover:bg-stone-900 text-white'
                    }
                  `}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <CreditCard className="w-5 h-5" />
                    <span>Get {plan.credits} Credits</span>
                  </div>
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-stone-900 mb-4">
              Need a Custom Package?
            </h3>
            <p className="text-stone-600 mb-6">
              For enterprise customers or bulk purchases, we offer custom pricing and dedicated support.
            </p>
            <button className="bg-stone-100 hover:bg-stone-200 text-stone-800 px-8 py-3 rounded-lg font-medium transition-colors">
              Contact Sales
            </button>
          </div>
        </motion.div>

        {/* Stripe Powered Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <p className="text-stone-500 text-sm">
            Payments securely processed by{' '}
            <span className="font-semibold text-stone-700">Stripe</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default PricingSection;