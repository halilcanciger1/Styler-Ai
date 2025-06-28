import React, { useState } from 'react';
import { Check, Star } from 'lucide-react';
import { SubscriptionPlan } from '../types';
import PricingSection from '../components/Pricing/PricingSection';
import PricingModal from '../components/Pricing/PricingModal';

const plans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    credits: 10,
    features: [
      '10 generations per month',
      'Basic quality settings',
      'Standard processing speed',
      'Community support',
    ],
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    credits: 100,
    features: [
      '100 generations per month',
      'All quality settings',
      'Faster processing',
      'Email support',
      'Advanced controls',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29.99,
    credits: 500,
    popular: true,
    features: [
      '500 generations per month',
      'All quality settings',
      'Priority processing',
      'Priority support',
      'API access',
      'Bulk processing',
      'Custom seeds',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99.99,
    credits: 2000,
    features: [
      '2000 generations per month',
      'All features included',
      'Highest priority processing',
      'Dedicated support',
      'Custom integrations',
      'White-label options',
      'SLA guarantee',
    ],
  },
];

const Subscription: React.FC = () => {
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-stone-900 mb-4">Choose Your Plan</h1>
        <p className="text-lg text-stone-600">
          Unlock the full potential of AI-powered fashion visualization
        </p>
      </div>

      {/* Monthly Subscription Plans */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-stone-900 mb-8 text-center">Monthly Subscriptions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`
                relative bg-white rounded-xl border-2 p-6 transition-all hover:shadow-lg
                ${plan.popular 
                  ? 'border-yellow-400 shadow-lg' 
                  : 'border-stone-200 hover:border-stone-300'
                }
              `}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-yellow-400 text-stone-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                    <Star className="w-4 h-4 mr-1 fill-current" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-stone-900 mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold text-stone-900 mb-1">
                  ${plan.price}
                  <span className="text-lg font-normal text-stone-600">/month</span>
                </div>
                <p className="text-stone-600">{plan.credits} credits included</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-stone-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`
                  w-full py-3 px-4 rounded-lg font-medium transition-colors
                  ${plan.popular
                    ? 'bg-yellow-400 hover:bg-yellow-500 text-stone-800'
                    : 'bg-stone-800 hover:bg-stone-900 text-white'
                  }
                `}
              >
                {plan.id === 'free' ? 'Current Plan' : 'Upgrade Now'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Credit Packages Section */}
      <PricingSection onBuyCredits={() => setIsPricingModalOpen(true)} />

      {/* Contact Sales */}
      <div className="mt-12 text-center">
        <p className="text-stone-600 mb-4">
          Need a custom plan for your organization?
        </p>
        <button className="bg-stone-100 hover:bg-stone-200 text-stone-800 px-6 py-3 rounded-lg font-medium transition-colors">
          Contact Sales
        </button>
      </div>

      {/* Pricing Modal */}
      <PricingModal 
        isOpen={isPricingModalOpen} 
        onClose={() => setIsPricingModalOpen(false)} 
      />
    </div>
  );
};

export default Subscription;