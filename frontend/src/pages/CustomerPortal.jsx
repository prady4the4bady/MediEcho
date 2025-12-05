import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Settings, FileText, Shield } from 'lucide-react';
import { createCustomerPortal } from '../utils/api';

const CustomerPortal = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePortalRedirect = async () => {
    setIsLoading(true);
    try {
      const response = await createCustomerPortal();
      window.location.href = response.url;
    } catch (error) {
      console.error('Error accessing customer portal:', error);
      alert('Failed to access customer portal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <CreditCard className="h-6 w-6 text-primary-600" />,
      title: 'Manage Payment Methods',
      description: 'Update your credit card, add new payment methods, or remove old ones.'
    },
    {
      icon: <Settings className="h-6 w-6 text-primary-600" />,
      title: 'Update Subscription',
      description: 'Change your plan, pause billing, or cancel your subscription.'
    },
    {
      icon: <FileText className="h-6 w-6 text-primary-600" />,
      title: 'View Invoices',
      description: 'Download your billing history and tax documents.'
    },
    {
      icon: <Shield className="h-6 w-6 text-primary-600" />,
      title: 'Account Security',
      description: 'Update your password and manage security settings.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Account & Billing
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-gray-600"
          >
            Manage your subscription, payment methods, and account settings
          </motion.p>
        </div>

        {/* Portal Access Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card p-8 mb-12 text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Stripe Customer Portal
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Access Stripe's secure customer portal to manage your subscription, update payment methods,
            view invoices, and handle all your billing needs.
          </p>
          <button
            onClick={handlePortalRedirect}
            disabled={isLoading}
            className="btn-primary px-8 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Loading Portal...
              </div>
            ) : (
              'Open Customer Portal'
            )}
          </button>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex items-start">
                <div className="bg-primary-50 p-3 rounded-lg mr-4">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-12 glass-card p-6"
        >
          <div className="flex items-start">
            <Shield className="h-6 w-6 text-green-600 mr-3 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Secure & Private
              </h3>
              <p className="text-gray-600">
                Your billing information is handled securely by Stripe, a PCI DSS compliant payment processor.
                We never store your payment details on our servers.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerPortal;