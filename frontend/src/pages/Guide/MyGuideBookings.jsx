import { load } from '@cashfreepayments/cashfree-js';
import { useAuth } from '@clerk/clerk-react';
import {
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  MapPin,
  MessageCircle,
  Star,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import {
  cancelBooking,
  createGuideBookingPayment,
  createReview,
  fetchMyBookingsAsTraveler,
} from '../../redux/slices/guideSlice';

const MyGuideBookings = () => {
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const { travelerBookings, bookingsLoading, loading, paymentLoading } = useSelector(
    (state) => state.guide
  );

  const [activeTab, setActiveTab] = useState('all');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });

  // Initialize Cashfree SDK
  const cashfreeRef = useRef(null);
  useEffect(() => {
    const initializeSDK = async () => {
      cashfreeRef.current = await load({
        mode: "sandbox" // Change to "production" for live
      });
    };
    initializeSDK();
  }, []);

  useEffect(() => {
    dispatch(fetchMyBookingsAsTraveler({ getToken }));
  }, [dispatch, getToken]);

  const filteredBookings = travelerBookings.filter((booking) => {
    if (activeTab === 'all') return true;
    return booking.status === activeTab;
  });

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await dispatch(cancelBooking({ getToken, bookingId, reason: 'Cancelled by traveler' })).unwrap();
      toast.success('Booking cancelled successfully');
    } catch (error) {
      toast.error(error || 'Failed to cancel booking');
    }
  };

  // Handle payment for accepted booking
  const handlePayment = async (booking) => {
    try {
      const result = await dispatch(
        createGuideBookingPayment({ getToken, bookingId: booking._id })
      ).unwrap();

      if (result && result.payment_session_id) {
        const checkoutOptions = {
          paymentSessionId: result.payment_session_id,
          redirectTarget: "_self",
        };
        if (cashfreeRef.current) {
          cashfreeRef.current.checkout(checkoutOptions);
        } else {
          // Fallback if cashfree didn't load yet
          const cf = await load({ mode: "sandbox" });
          cf.checkout(checkoutOptions);
        }
      } else {
        toast.error("Failed to initiate payment. Please try again.");
      }
    } catch (error) {
      toast.error(error || 'Failed to create payment order');
    }
  };

  const openReviewModal = (booking) => {
    setSelectedBooking(booking);
    setReviewData({ rating: 5, comment: '' });
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (!reviewData.comment.trim()) {
      toast.error('Please enter a review comment');
      return;
    }

    try {
      await dispatch(
        createReview({
          getToken,
          guideId: selectedBooking.guide._id,
          reviewData: {
            bookingId: selectedBooking._id,
            rating: reviewData.rating,
            comment: reviewData.comment,
          },
        })
      ).unwrap();
      toast.success('Review submitted successfully');
      setShowReviewModal(false);
      dispatch(fetchMyBookingsAsTraveler({ getToken }));
    } catch (error) {
      toast.error(error || 'Failed to submit review');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Guide Bookings</h1>
          <p className="text-gray-500 mt-1">View and manage your guide bookings</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'pending', 'accepted', 'confirmed', 'completed', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {bookingsLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500">Loading bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Calendar size={48} className="mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Bookings Found</h3>
            <p className="mb-4">You haven&apos;t made any guide bookings yet.</p>
            <Link to="/guides">
              <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all">
                Browse Guides
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={booking.guide?.user?.profileImage || '/default-avatar.png'}
                      alt={booking.guide?.user?.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{booking.guide?.user?.name}</p>
                      <p className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin size={12} />
                        {booking.guide?.city}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    booking.status === 'accepted' ? 'bg-purple-100 text-purple-700' :
                    booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                    booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {booking.status === 'accepted' ? 'Awaiting Payment' : booking.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {formatDate(booking.date)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {booking.startTime} - {booking.endTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {booking.duration} hour{booking.duration !== 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center gap-1 font-semibold text-orange-600">
                    <DollarSign size={14} />
                    ₹{booking.totalPrice}
                  </div>
                </div>

                {booking.notes && (
                  <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-3 mb-4 text-sm text-gray-600">
                    <MessageCircle size={14} className="mt-0.5 flex-shrink-0" />
                    {booking.notes}
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      className="px-4 py-2 bg-red-100 text-red-600 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Cancel Booking
                    </button>
                  )}

                  {booking.status === 'accepted' && (
                    <>
                      <button
                        onClick={() => handlePayment(booking)}
                        disabled={paymentLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CreditCard size={14} />
                        {paymentLoading ? 'Processing...' : 'Pay Now'}
                      </button>
                      <span className="text-sm text-purple-600 font-medium">
                        Guide accepted! Pay ₹{booking.totalPrice} to confirm.
                      </span>
                    </>
                  )}

                  {booking.status === 'confirmed' && (
                    <>
                      <Link
                        to={`/guide/${booking.guide?._id}`}
                        className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        View Guide
                      </Link>
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="px-4 py-2 bg-red-100 text-red-600 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {booking.status === 'completed' && (
                    <button
                      onClick={() => openReviewModal(booking)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all"
                    >
                      <Star size={14} />
                      Leave Review
                    </button>
                  )}

                  {booking.status === 'cancelled' && (
                    <span className="text-sm text-gray-500">
                      {booking.cancellationReason || 'Booking was cancelled'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review Modal */}
        {showReviewModal && selectedBooking && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowReviewModal(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Review Your Experience</h2>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={32}
                        onClick={() => setReviewData({ ...reviewData, rating: star })}
                        className={`cursor-pointer transition-colors ${
                          star <= reviewData.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Your Review
                  </label>
                  <textarea
                    value={reviewData.comment}
                    onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                    placeholder="Share your experience with this guide..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitReview}
                    disabled={loading}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                      loading
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg'
                    }`}
                  >
                    {loading ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyGuideBookings;
