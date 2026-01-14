import { useAuth } from '@clerk/clerk-react';
import { ArrowRight,CheckCircle, Loader2, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate,useSearchParams } from 'react-router-dom';

import { useAppDispatch } from '../../redux/hooks';
import { verifySubscription } from '../../redux/slices/userSlice';

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { getToken } = useAuth();

  const [status, setStatus] = useState('verifying'); // verifying, success, failed

  useEffect(() => {
    const verify = async () => {
      if (!orderId) {
        setStatus('failed');
        return;
      }

      try {
        await dispatch(verifySubscription({ getToken, orderId })).unwrap();
        setStatus('success');
        // Redirect after a few seconds
        setTimeout(() => {
            navigate('/create-activity');
        }, 3000);
      } catch (err) {
        console.error('Payment verification failed', err);
        setStatus('failed');
      }
    };

    verify();
  }, [dispatch, getToken, orderId, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 max-w-md w-full text-center space-y-6 relative overflow-hidden">

        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-100 dark:bg-blue-900/20 rounded-full mix-blend-multiply blur-xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-100 dark:bg-purple-900/20 rounded-full mix-blend-multiply blur-xl translate-x-1/2 translate-y-1/2"></div>

        {status === 'verifying' && (
          <div className="flex flex-col items-center animate-pulse">
            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Verifying Payment</h2>
            <p className="text-gray-500 dark:text-gray-400">Please wait while we confirm your subscription...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Success!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your subscription is now active. You're ready to create amazing activities.
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Redirecting you shortly...</p>
            <button
                onClick={() => navigate('/create-activity')}
                className="mt-4 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:gap-3 transition-all"
            >
                Continue now <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {status === 'failed' && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Payment Failed</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We couldn't verify your payment. Please try again or contact support if the issue persists.
            </p>
             <button
                onClick={() => navigate('/subscription')}
                className="px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-xl font-semibold hover:opacity-90 transition-all"
            >
                Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentStatus;
