import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, RefreshCw, ArrowRight } from 'lucide-react';

const CheckoutFailure = () => {
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error') || 'Payment was cancelled or failed';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full glass-card p-8 text-center"
      >
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Failed
        </h1>
        <p className="text-gray-600 mb-6">
          {error === 'cancelled' ? 'Payment was cancelled.' : 'There was an issue processing your payment.'}
        </p>
        <div className="space-y-4">
          <Link to="/pricing" className="btn-primary w-full inline-flex items-center justify-center">
            <RefreshCw className="mr-2 h-5 w-5" />
            Try Again
          </Link>
          <Link to="/dashboard" className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center">
            Return to Dashboard
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            If you continue to experience issues, please contact our support team.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default CheckoutFailure;