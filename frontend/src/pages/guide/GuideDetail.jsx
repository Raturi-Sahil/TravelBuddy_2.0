import { useAuth } from '@clerk/clerk-react';
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  Quote,
  Share2,
  Shield,
  Sparkles,
  Star,
  ThumbsUp,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';

import BookGuideModal from '../../components/guide/BookGuideModal';
import { fetchGuideById, fetchGuideReviews } from '../../redux/slices/guideSlice';

const GuideDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const dispatch = useDispatch();

  const { selectedGuide, reviews, loading, reviewsLoading } = useSelector(
    (state) => state.guide
  );
  const { profile } = useSelector((state) => state.user);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchGuideById({ getToken, guideId: id }));
      dispatch(fetchGuideReviews({ getToken, guideId: id }));
    }
  }, [id, dispatch, getToken]);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
      />
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const nextImage = () => {
    if (selectedGuide?.coverImages?.length > 1) {
      setActiveImageIndex((prev) => (prev + 1) % selectedGuide.coverImages.length);
    }
  };

  const prevImage = () => {
    if (selectedGuide?.coverImages?.length > 1) {
      setActiveImageIndex((prev) =>
        prev === 0 ? selectedGuide.coverImages.length - 1 : prev - 1
      );
    }
  };

  const isOwnProfile = selectedGuide?.user?._id === profile?._id;

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 pt-24 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-orange-200 rounded-full" />
            <div className="absolute inset-0 w-20 h-20 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="mt-6 text-lg text-gray-600 font-medium">Loading guide profile...</p>
          <p className="text-sm text-gray-400">Please wait a moment</p>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!selectedGuide) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 pt-24 flex items-center justify-center">
        <div className="flex flex-col items-center text-center px-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center mb-6">
            <Users size={48} className="text-orange-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Guide Not Found</h3>
          <p className="text-gray-500 mb-6 max-w-md">
            This guide profile doesn&apos;t exist or has been removed from our platform.
          </p>
          <button
            onClick={() => navigate('/guides')}
            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Browse All Guides
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
      {/* Hero Cover Section */}
      <div className="relative h-[50vh] md:h-[60vh] bg-gray-900">
        {/* Background Image */}
        {selectedGuide.coverImages?.length > 0 ? (
          <img
            src={selectedGuide.coverImages[activeImageIndex]}
            alt={selectedGuide.user?.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-400 via-amber-500 to-orange-600 flex items-center justify-center">
            <Users size={80} className="text-white/30" />
          </div>
        )}

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />

        {/* Top Navigation Bar */}
        <div className="absolute top-0 left-0 right-0 pt-20 px-4 md:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">


            <div className="flex items-center gap-2 mt-10">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-3 rounded-xl border transition-all ${
                  isLiked
                    ? 'bg-red-500 border-red-500 text-white'
                    : 'bg-white/10 hover:bg-white/20 backdrop-blur-md border-white/20 text-white'
                }`}
              >
                <Heart size={20} className={isLiked ? 'fill-current' : ''} />
              </button>
              <button className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-xl border border-white/20 transition-all">
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Image Navigation */}
        {selectedGuide.coverImages?.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-xl border border-white/20 transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-xl border border-white/20 transition-all"
            >
              <ChevronRight size={24} />
            </button>

            {/* Image Indicators */}
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2">
              {selectedGuide.coverImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    index === activeImageIndex
                      ? 'w-8 bg-white'
                      : 'w-4 bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Floating Profile Preview */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-7xl mx-auto px-4 md:px-8 pb-6">
            <div className="flex items-end gap-4">
              {/* Profile Image */}
              <div className="relative">
                <img
                  src={selectedGuide.user?.profileImage || '/default-avatar.png'}
                  alt={selectedGuide.user?.name}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover border-4 border-white shadow-2xl"
                />
                {selectedGuide.isVerified && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center border-2 border-white shadow-lg">
                    <BadgeCheck size={18} className="text-white" />
                  </div>
                )}
              </div>

              {/* Name and Quick Info */}
              <div className="flex-1 pb-2">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {selectedGuide.averageRating >= 4.5 && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded-lg">
                      <Zap size={12} />
                      Top Rated
                    </span>
                  )}
                  {selectedGuide.isActive && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500 text-white text-xs font-bold rounded-lg">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      Available
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-4xl font-bold text-white drop-shadow-lg">
                  {selectedGuide.user?.name}
                </h1>
                <p className="flex items-center gap-2 text-white/80 mt-1">
                  <MapPin size={16} />
                  {selectedGuide.city}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                    <Star size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{selectedGuide.averageRating?.toFixed(1) || 'New'}</p>
                    <p className="text-xs text-gray-500">Rating</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg">
                    <MessageCircle size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{selectedGuide.totalReviews}</p>
                    <p className="text-xs text-gray-500">Reviews</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                    <TrendingUp size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{selectedGuide.experience}</p>
                    <p className="text-xs text-gray-500">Years Exp</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg">
                    <Users size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{selectedGuide.totalBookings}</p>
                    <p className="text-xs text-gray-500">Bookings</p>
                  </div>
                </div>
              </div>
            </div>

            {/* About Section */}
            {selectedGuide.bio && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                    <Quote size={20} className="text-orange-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">About Me</h2>
                </div>
                <p className="text-gray-600 leading-relaxed text-lg">{selectedGuide.bio}</p>
              </div>
            )}

            {/* Specialties Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <Sparkles size={20} className="text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Specialties</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {selectedGuide.specialties?.map((specialty, index) => (
                  <span
                    key={specialty}
                    className="group relative px-4 py-2.5 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 text-orange-700 font-semibold rounded-xl border border-orange-200/50 hover:border-orange-300 transition-all cursor-default"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-400" />
                      {specialty}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Languages Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                  <Globe size={20} className="text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Languages</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {selectedGuide.languages?.map((lang, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100 hover:shadow-md transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow">
                      <Globe size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{lang.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{lang.level}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                    <Star size={20} className="text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Reviews</h2>
                    <p className="text-sm text-gray-500">{selectedGuide.totalReviews} total reviews</p>
                  </div>
                </div>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 rounded-lg">
                    {renderStars(selectedGuide.averageRating || 0)}
                  </div>
                )}
              </div>

              {reviewsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-orange-200 rounded-full" />
                    <div className="absolute inset-0 w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                </div>
              ) : reviews.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-gray-500">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Star size={32} className="text-gray-300" />
                  </div>
                  <p className="font-medium text-gray-600">No reviews yet</p>
                  <p className="text-sm">Be the first to book and review!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div
                      key={review._id}
                      className="group p-5 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl border border-gray-100 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={review.reviewer?.profileImage || '/default-avatar.png'}
                            alt={review.reviewer?.name}
                            className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow"
                          />
                          <div>
                            <p className="font-bold text-gray-900">{review.reviewer?.name}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock size={12} />
                              {formatDate(review.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg shadow-sm">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200/50">
                        <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-600 transition-colors">
                          <ThumbsUp size={14} />
                          Helpful
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Booking Card */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Price Header */}
                <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 p-6 text-white">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">₹{selectedGuide.pricePerDay}</span>
                    <span className="text-white/80">/ day</span>
                  </div>
                  <p className="text-white/70 text-sm mt-1">All-inclusive guide experience</p>
                </div>

                <div className="p-6 space-y-4">
                  {/* Features */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <Shield size={16} className="text-emerald-600" />
                      </div>
                      <span className="text-sm">Verified & Background Checked</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Clock size={16} className="text-blue-600" />
                      </div>
                      <span className="text-sm">Response within 1 hour</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Award size={16} className="text-purple-600" />
                      </div>
                      <span className="text-sm">100% Satisfaction Guaranteed</span>
                    </div>
                  </div>

                  {/* Book Button */}
                  {!isOwnProfile && (
                    <button
                      onClick={() => setShowBookingModal(true)}
                      disabled={!selectedGuide.isActive}
                      className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                        selectedGuide.isActive
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-xl hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98]'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {selectedGuide.isActive ? (
                        <>
                          <Calendar size={20} />
                          Book This Guide
                        </>
                      ) : (
                        'Currently Unavailable'
                      )}
                    </button>
                  )}

                  {isOwnProfile && (
                    <Link
                      to="/guide-dashboard"
                      className="w-full py-4 rounded-xl font-bold text-lg bg-gray-900 text-white hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                    >
                      Go to Dashboard
                    </Link>
                  )}

                  <p className="text-center text-xs text-gray-400">
                    Free cancellation up to 24 hours before
                  </p>
                </div>
              </div>

              {/* Contact Card */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <MessageCircle size={20} />
                  Need Help?
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  Have questions before booking? Reach out to our support team.
                </p>
                <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-all border border-white/20 flex items-center justify-center gap-2">
                  <Phone size={18} />
                  Contact Support
                </button>
              </div>

              {/* Trust Badges */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-around text-center">
                  <div>
                    <Shield className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Secure<br />Booking</p>
                  </div>
                  <div className="w-px h-10 bg-gray-200" />
                  <div>
                    <Award className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Best Price<br />Guarantee</p>
                  </div>
                  <div className="w-px h-10 bg-gray-200" />
                  <div>
                    <ThumbsUp className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Verified<br />Reviews</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookGuideModal
          guide={selectedGuide}
          onClose={() => setShowBookingModal(false)}
        />
      )}
    </div>
  );
};

export default GuideDetail;
