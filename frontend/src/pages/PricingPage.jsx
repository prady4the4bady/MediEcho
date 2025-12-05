import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap } from 'lucide-react';
import { createCheckoutSession } from '../utils/api';

// Stripe Price IDs - these should match your backend .env
const PRICE_IDS = {
  pro: 'price_1SaWq0Pq3dHffIt6lCqFbLDN',
  coach: 'price_1SaWrqPq3dHffIt63pt2sBEY'
};

const PricingPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for trying out MediEcho',
      features: [
        'Up to 10 voice logs per month',
        'Basic text entries',
        'Local storage only',
        'Community support'
      ],
      buttonText: 'Current Plan',
      buttonVariant: 'secondary',
      popular: false,
      priceId: null
    },
    {
      name: 'Pro',
      price: '$9.99',
      period: 'per month',
      description: 'For serious health tracking',
      features: [
        'Unlimited voice logs',
        'Advanced AI insights',
        'Encrypted cloud storage',
        'Weekly PDF briefs',
        'Priority support',
        'Export data'
      ],
      buttonText: 'Upgrade to Pro',
      buttonVariant: 'primary',
      popular: true,
      priceId: PRICE_IDS.pro
    },
    {
      name: 'Coach',
      price: '$29.99',
      period: 'per month',
      description: 'Complete health management suite',
      features: [
        'Everything in Pro',
        'Real-time AI coaching',
        'Custom health goals',
        'Advanced analytics',
        'HIPAA compliance',
        'White-label option',
        'Dedicated support'
      ],
      buttonText: 'Go Coach',
      buttonVariant: 'primary',
      popular: false,
      priceId: PRICE_IDS.coach
    }
  ];

  const handleUpgrade = async (priceId) => {
    if (!priceId) return; // Free plan
    setIsLoading(true);
    try {
      const response = await createCheckoutSession(priceId);
      // Redirect to Stripe Checkout
      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Choose Your Plan
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Start free and upgrade as your health tracking needs grow. All plans include our core privacy-first features.
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative glass-card p-8 ${
                plan.popular ? 'border-2 border-primary-500 shadow-lg' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">/{plan.period}</span>
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => plan.priceId && handleUpgrade(plan.priceId)}
                disabled={isLoading || !plan.priceId}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors duration-200 ${
                  plan.buttonVariant === 'primary'
                    ? 'bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
                } disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  plan.buttonText
                )}
              </button>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I change plans anytime?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate the billing.
              </p>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is my data really private?
              </h3>
              <p className="text-gray-600">
                Absolutely. We use end-to-end encryption, and your health data is never shared with third parties. You can choose local storage for maximum privacy.
              </p>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What happens to my data if I cancel?
              </h3>
              <p className="text-gray-600">
                Your data remains securely stored for 30 days after cancellation, giving you time to export it. After that period, it's permanently deleted.
              </p>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600">
                We offer a 30-day money-back guarantee. If you're not satisfied, contact our support team for a full refund.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-20 text-center"
        >
          <div className="bg-primary-600 rounded-2xl p-8 text-white">
            <Zap className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Health Tracking?
            </h2>
            <p className="text-xl mb-6 opacity-90">
              Join thousands of users who trust MediEcho with their health data.
            </p>
            <button
              onClick={() => handleUpgrade('pro')}
              disabled={isLoading}
              className="bg-white text-primary-600 hover:bg-gray-100 font-semibold text-lg px-8 py-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Start Your Free Trial'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PricingPage;