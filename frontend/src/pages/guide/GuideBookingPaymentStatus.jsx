import { useAuth } from '@clerk/clerk-react';
import { ArrowRight, CheckCircle, Loader2, PartyPopper, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { verifyGuideBookingPayment } from '../../redux/slices/guideSlice';

const GuideBookingPaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const bookingId = searchParams.get('booking_id');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { getToken } = useAuth();

  const [status, setStatus] = useState('verifying'); // verifying, success, failed
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!orderId || !bookingId) {
        setStatus('failed');
        toast.error('Invalid payment parameters');
        return;
      }

      try {
        const result = await dispatch(verifyGuideBookingPayment({
          getToken,
          orderId,
          bookingId,
        })).unwrap();

        if (result?.status === 'PAID') {
          setStatus('success');
          setBooking(result.booking);
          toast.success('Payment successful! Your booking is confirmed');

          // Redirect after a few seconds
          setTimeout(() => {
            navigate('/my-guide-bookings');
          }, 3000);
        } else {
          setStatus('failed');
          toast.error('Payment verification failed');
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        setStatus('failed');
        toast.error(err || 'Payment verification failed');
      }
    };

    verifyPayment();
  }, [orderId, bookingId, dispatch, getToken, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center space-y-6 relative overflow-hidden border-2 border-purple-100">

        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-purple-100 rounded-full mix-blend-multiply blur-xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-100 rounded-full mix-blend-multiply blur-xl translate-x-1/2 translate-y-1/2"></div>

        {status === 'verifying' && (
          <div className="flex flex-col items-center animate-pulse relative z-10">
            <Loader2 className="w-16 h-16 text-purple-600 animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-slate-900">Verifying Payment</h2>
            <p className="text-slate-500">Please wait while we confirm your booking...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500 relative z-10">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 relative">
              <CheckCircle className="w-10 h-10 text-green-600" />
              <PartyPopper className="w-6 h-6 text-emerald-500 absolute -top-2 -right-2 animate-bounce" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Booking Confirmed!</h2>
            <p className="text-slate-600 mb-6">
              {booking?.guide?.user?.name ? (
                <>
                  Your booking with <span className="font-bold text-purple-600">{booking.guide.user.name}</span> is confirmed!
                </>
              ) : (
                'Your payment has been processed successfully.'
              )}
            </p>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4 w-full">
              <p className="text-sm text-slate-700">
                <span className="font-semibold">Order ID:</span> {orderId}
              </p>
            </div>
            <p className="text-sm text-slate-400">Redirecting you to your bookings...</p>
            <button
              onClick={() => navigate('/my-guide-bookings')}
              className="mt-4 flex items-center gap-2 text-purple-600 font-semibold hover:gap-3 transition-all"
            >
              View My Bookings <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {status === 'failed' && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500 relative z-10">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Failed</h2>
            <p className="text-slate-600 mb-6">
              We couldn't verify your payment. Please try again or contact support if the issue persists.
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => navigate('/my-guide-bookings')}
                className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all"
              >
                View Bookings
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-emerald-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg shadow-purple-200"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuideBookingPaymentStatus;
