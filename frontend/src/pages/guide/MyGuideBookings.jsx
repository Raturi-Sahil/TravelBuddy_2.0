import { load } from '@cashfreepayments/cashfree-js';
import { useAuth } from '@clerk/clerk-react';
import {
  ArrowRight,
  BadgeCheck,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  Filter,
  MapPin,
  MessageCircle,
  Search,
  Sparkles,
  Star,
  Timer,
  TrendingUp,
  Users,
  Wallet,
  X,
  XCircle,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import ConfirmDialog from '../../components/ui/ConfirmDialog';
import {
  cancelBooking,
  createGuideBookingPayment,
  createReview,
  fetchMyBookingsAsTraveler,
} from '../../redux/slices/guideSlice';

// Countdown Timer Component
const CountdownTimer = ({ startDate }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const start = new Date(startDate);
      const diff = start - now;

      if (diff <= 0) {
        setTimeLeft('Starting now!');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      let parts = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

      setTimeLeft(parts.join(' '));
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000);

    return () => clearInterval(interval);
  }, [startDate]);

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 rounded-full">
      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
      <Timer size={14} className="text-emerald-600" />
      <span className="text-sm font-semibold text-emerald-700">{timeLeft}</span>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: {
      bg: 'bg-gradient-to-r from-amber-50 to-yellow-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      icon: Clock,
      label: 'Pending Approval',
    },
    accepted: {
      bg: 'bg-gradient-to-r from-violet-50 to-purple-50',
      border: 'border-violet-200',
      text: 'text-violet-700',
      icon: Wallet,
      label: 'Awaiting Payment',
    },
    confirmed: {
      bg: 'bg-gradient-to-r from-blue-50 to-cyan-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      icon: CalendarCheck,
      label: 'Confirmed',
    },
    completed: {
      bg: 'bg-gradient-to-r from-emerald-50 to-green-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      icon: CheckCircle2,
      label: 'Completed',
    },
    cancelled: {
      bg: 'bg-gradient-to-r from-red-50 to-rose-50',
      border: 'border-red-200',
      text: 'text-red-600',
      icon: XCircle,
      label: 'Cancelled',
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${config.bg} ${config.text} text-xs font-bold rounded-full border ${config.border}`}>
      <Icon size={14} />
      {config.label}
    </span>
  );
};

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
  const [cancelBookingId, setCancelBookingId] = useState(null);

  // Initialize Cashfree SDK
  const cashfreeRef = useRef(null);
  useEffect(() => {
    const initializeSDK = async () => {
      cashfreeRef.current = await load({
        mode: "sandbox"
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
    setCancelBookingId(null);
    try {
      await dispatch(cancelBooking({ getToken, bookingId, reason: 'Cancelled by traveler' })).unwrap();
      toast.success('Booking cancelled successfully');
    } catch (error) {
      toast.error(error || 'Failed to cancel booking');
    }
  };

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

  // Tab counts
  const tabCounts = {
    all: travelerBookings.length,
    pending: travelerBookings.filter(b => b.status === 'pending').length,
    accepted: travelerBookings.filter(b => b.status === 'accepted').length,
    confirmed: travelerBookings.filter(b => b.status === 'confirmed').length,
    completed: travelerBookings.filter(b => b.status === 'completed').length,
    cancelled: travelerBookings.filter(b => b.status === 'cancelled').length,
  };

  const tabs = [
    { id: 'all', label: 'All Bookings', icon: Calendar },
    { id: 'pending', label: 'Pending', icon: Clock },
    { id: 'accepted', label: 'Awaiting Payment', icon: Wallet },
    { id: 'confirmed', label: 'Confirmed', icon: CalendarCheck },
    { id: 'completed', label: 'Completed', icon: CheckCircle2 },
    { id: 'cancelled', label: 'Cancelled', icon: XCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
      {/* Hero Header */}
      <div className="relative pt-20 pb-8 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-br from-orange-200/30 to-amber-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-20 w-48 h-48 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mt-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full mb-4 border border-orange-200/50">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-semibold text-orange-700">Your Adventures</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                My Guide Bookings
              </h1>
              <p className="text-gray-500 text-lg">
                Track and manage all your guide experiences in one place
              </p>
            </div>

            {/* Stats Summary */}
            <div className="flex gap-3">
              <div className="px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-100">
                <p className="text-2xl font-bold text-gray-900">{tabCounts.all}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <div className="px-4 py-3 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200/50">
                <p className="text-2xl font-bold text-emerald-600">{tabCounts.confirmed}</p>
                <p className="text-xs text-emerald-600">Active</p>
              </div>
              <div className="px-4 py-3 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-200/50">
                <p className="text-2xl font-bold text-violet-600">{tabCounts.accepted}</p>
                <p className="text-xs text-violet-600">Awaiting Pay</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-8">
          <div className="flex gap-1 overflow-x-auto pb-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const count = tabCounts[tab.id];

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {count > 0 && (
                    <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bookings Grid */}
        {bookingsLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-orange-200 rounded-full" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="mt-6 text-lg text-gray-600 font-medium">Loading your bookings...</p>
            <p className="text-sm text-gray-400">Just a moment</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center mb-6">
              <Calendar size={48} className="text-orange-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Bookings Found</h3>
            <p className="text-gray-500 mb-6 text-center max-w-md">
              {activeTab === 'all'
                ? "You haven't made any guide bookings yet. Start exploring and find your perfect local guide!"
                : `No ${activeTab} bookings at the moment.`}
            </p>
            <Link to="/guides">
              <button className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:scale-[1.02] transition-all">
                <Search size={20} />
                Browse Guides
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredBookings.map((booking) => (
              <div
                key={booking._id}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-orange-200/50 transition-all duration-300 overflow-hidden"
              >
                {/* Top accent bar based on status */}
                <div className={`h-1 ${
                  booking.status === 'pending' ? 'bg-gradient-to-r from-amber-400 to-yellow-400' :
                  booking.status === 'accepted' ? 'bg-gradient-to-r from-violet-400 to-purple-400' :
                  booking.status === 'confirmed' ? 'bg-gradient-to-r from-blue-400 to-cyan-400' :
                  booking.status === 'completed' ? 'bg-gradient-to-r from-emerald-400 to-green-400' :
                  'bg-gradient-to-r from-red-400 to-rose-400'
                }`} />

                <div className="p-6">
                  {/* Header Row */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                    {/* Guide Info */}
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={booking.guide?.user?.profileImage || '/default-avatar.png'}
                          alt={booking.guide?.user?.name}
                          className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-lg ring-2 ring-orange-100"
                        />
                        {booking.guide?.isVerified && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center border-2 border-white">
                            <BadgeCheck size={14} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                          {booking.guide?.user?.name}
                        </h3>
                        <p className="flex items-center gap-1.5 text-sm text-gray-500">
                          <MapPin size={14} className="text-orange-500" />
                          {booking.guide?.city}
                        </p>
                        {booking.guide?.averageRating > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star size={14} className="text-amber-400 fill-amber-400" />
                            <span className="text-sm font-medium text-gray-700">
                              {booking.guide.averageRating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <StatusBadge status={booking.status} />
                  </div>

                  {/* Booking Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Calendar size={14} />
                        <span className="text-xs font-medium">Dates</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDate(booking.startDate).split(',')[0]}
                        {booking.startDate !== booking.endDate && (
                          <> - {formatDate(booking.endDate).split(',')[0]}</>
                        )}
                      </p>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Clock size={14} />
                        <span className="text-xs font-medium">Duration</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {booking.numberOfDays} Day{booking.numberOfDays !== 1 ? 's' : ''}
                      </p>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                      <div className="flex items-center gap-2 text-orange-600 mb-1">
                        <Wallet size={14} />
                        <span className="text-xs font-medium">Total Price</span>
                      </div>
                      <p className="text-lg font-bold text-orange-600">
                        ₹{booking.totalPrice}
                      </p>
                    </div>

                    {/* Countdown Timer for Confirmed Bookings */}
                    {booking.status === 'confirmed' && new Date(booking.startDate) > new Date() ? (
                      <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100 flex flex-col justify-center">
                        <div className="flex items-center gap-2 text-emerald-600 mb-1">
                          <Timer size={14} />
                          <span className="text-xs font-medium">Starts In</span>
                        </div>
                        <CountdownTimer startDate={booking.startDate} />
                      </div>
                    ) : (
                      <div className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                          <TrendingUp size={14} />
                          <span className="text-xs font-medium">Booking ID</span>
                        </div>
                        <p className="text-sm font-mono text-gray-600 truncate">
                          #{booking._id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {booking.notes && (
                    <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100 mb-6">
                      <MessageCircle size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-blue-600 mb-1">Your Notes</p>
                        <p className="text-sm text-gray-700">{booking.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => setCancelBookingId(booking._id)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-xl border border-red-200 transition-all"
                      >
                        <XCircle size={16} />
                        Cancel Request
                      </button>
                    )}

                    {booking.status === 'accepted' && (
                      <>
                        <button
                          onClick={() => handlePayment(booking)}
                          disabled={paymentLoading}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CreditCard size={18} />
                          {paymentLoading ? 'Processing...' : `Pay ₹${booking.totalPrice}`}
                        </button>
                        <p className="text-sm text-violet-600 font-medium">
                          🎉 Guide accepted! Complete payment to confirm.
                        </p>
                      </>
                    )}

                    {booking.status === 'confirmed' && (
                      <>
                        <Link
                          to={`/guide/${booking.guide?._id}`}
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl transition-all"
                        >
                          <ExternalLink size={16} />
                          View Guide
                        </Link>
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 text-sm font-semibold rounded-xl border border-gray-200 hover:border-red-200 transition-all"
                        >
                          <XCircle size={16} />
                          Cancel Booking
                        </button>
                      </>
                    )}

                    {booking.status === 'completed' && (
                      <button
                        onClick={() => openReviewModal(booking)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:scale-[1.02] transition-all"
                      >
                        <Star size={18} />
                        Leave a Review
                        <ArrowRight size={16} />
                      </button>
                    )}

                    {booking.status === 'cancelled' && booking.cancellationReason && (
                      <p className="text-sm text-gray-500 italic">
                        Reason: {booking.cancellationReason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showReviewModal && selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowReviewModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Star size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Share Your Experience</h2>
                    <p className="text-white/70 text-sm">How was your trip with {selectedBooking.guide?.user?.name}?</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Guide Preview */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <img
                  src={selectedBooking.guide?.user?.profileImage || '/default-avatar.png'}
                  alt={selectedBooking.guide?.user?.name}
                  className="w-14 h-14 rounded-xl object-cover shadow"
                />
                <div>
                  <p className="font-bold text-gray-900">{selectedBooking.guide?.user?.name}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin size={12} />
                    {selectedBooking.guide?.city}
                  </p>
                </div>
              </div>

              {/* Rating Stars */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Your Rating</label>
                <div className="flex gap-2 justify-center p-4 bg-amber-50 rounded-xl border border-amber-200/50">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewData({ ...reviewData, rating: star })}
                      className="transform hover:scale-110 transition-transform"
                    >
                      <Star
                        size={40}
                        className={`transition-colors ${
                          star <= reviewData.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-300 hover:text-amber-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-center text-sm text-gray-500 mt-2">
                  {reviewData.rating === 5 && '⭐ Excellent!'}
                  {reviewData.rating === 4 && '👍 Very Good!'}
                  {reviewData.rating === 3 && '👌 Good'}
                  {reviewData.rating === 2 && '😐 Fair'}
                  {reviewData.rating === 1 && '😔 Poor'}
                </p>
              </div>

              {/* Review Comment */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tell us about your experience
                </label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  placeholder="Share the highlights of your trip, what you loved about your guide, and any tips for future travelers..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 outline-none resize-none transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={loading}
                  className={`flex-1 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                    loading
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25 hover:shadow-xl hover:scale-[1.02]'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={20} />
                      Submit Review
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!cancelBookingId}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmText="Yes, Cancel"
        cancelText="Keep Booking"
        variant="warning"
        onConfirm={() => handleCancelBooking(cancelBookingId)}
        onCancel={() => setCancelBookingId(null)}
      />
    </div>
  );
};

export default MyGuideBookings;
