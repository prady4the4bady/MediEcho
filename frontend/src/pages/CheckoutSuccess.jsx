import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // You could verify the session with your backend here if needed
    if (sessionId) {
      console.log('Payment successful, session ID:', sessionId);
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full glass-card p-8 text-center"
      >
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-6">
          Thank you for subscribing to MediEcho. Your account has been upgraded and you now have access to all premium features.
        </p>
        <div className="space-y-4">
          <Link to="/dashboard" className="btn-primary w-full inline-flex items-center justify-center">
            Go to Dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Link to="/pricing" className="text-primary-600 hover:text-primary-700 font-medium">
            View Subscription Details
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default CheckoutSuccess;