import { useAuth } from '@clerk/clerk-react';
import {
  ArrowLeft,
  Calendar,
  Globe,
  MapPin,
  Star,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

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
        className={i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
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

  const isOwnProfile = selectedGuide?.user?._id === profile?._id;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500">Loading guide details...</p>
        </div>
      </div>
    );
  }

  if (!selectedGuide) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="flex flex-col items-center text-gray-500">
          <Users size={48} className="mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Guide Not Found</h3>
          <p className="mb-4">This guide profile doesn&apos;t exist or has been removed.</p>
          <button
            onClick={() => navigate('/guides')}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Browse Guides
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Cover Image Gallery */}
      <div className="relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md hover:bg-white transition-all"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="h-64 md:h-80 lg:h-96 bg-gradient-to-br from-orange-100 to-amber-50">
          {selectedGuide.coverImages?.length > 0 ? (
            <img
              src={selectedGuide.coverImages[activeImageIndex]}
              alt={selectedGuide.user?.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Users size={64} className="text-orange-300" />
            </div>
          )}
        </div>

        {selectedGuide.coverImages?.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {selectedGuide.coverImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveImageIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === activeImageIndex ? 'bg-white scale-110' : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Profile Section */}
      <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10 pb-12">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Profile Header */}
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <img
                src={selectedGuide.user?.profileImage || '/default-avatar.png'}
                alt={selectedGuide.user?.name}
                className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-white shadow-lg"
              />
              
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                  {selectedGuide.user?.name}
                </h1>
                <p className="flex items-center gap-1.5 text-gray-500 mb-3">
                  <MapPin size={16} />
                  {selectedGuide.city}
                </p>
                
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-yellow-600">
                    <Star size={16} className="fill-yellow-400" />
                    <span className="font-semibold">{selectedGuide.averageRating?.toFixed(1) || 'New'}</span>
                    <span className="text-gray-500">({selectedGuide.totalReviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Calendar size={16} />
                    <span>{selectedGuide.experience} years exp.</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Users size={16} />
                    <span>{selectedGuide.totalBookings} bookings</span>
                  </div>
                </div>
              </div>

              <div className="text-center md:text-right">
                <p className="text-sm text-gray-500 mb-1">Price per day</p>
                <p className="text-3xl font-bold text-orange-600">
                  ₹{selectedGuide.pricePerDay}
                  <span className="text-base font-normal text-gray-400">/day</span>
                </p>
              </div>
            </div>
          </div>

          {/* Specialties */}
          <div className="px-6 md:px-8 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {selectedGuide.specialties?.map((specialty) => (
                <span
                  key={specialty}
                  className="px-3 py-1.5 bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 font-medium rounded-full border border-orange-100"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>

          {/* Bio */}
          {selectedGuide.bio && (
            <div className="px-6 md:px-8 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
              <p className="text-gray-600 leading-relaxed">{selectedGuide.bio}</p>
            </div>
          )}

          {/* Languages */}
          <div className="px-6 md:px-8 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Languages</h3>
            <div className="flex flex-wrap gap-2">
              {selectedGuide.languages?.map((lang, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full"
                >
                  <Globe size={14} />
                  <span className="font-medium">{lang.name}</span>
                  <span className="text-gray-500">({lang.level})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Book Button */}
          {!isOwnProfile && (
            <div className="px-6 md:px-8 pb-8">
              <button
                onClick={() => setShowBookingModal(true)}
                disabled={!selectedGuide.isActive}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
                  selectedGuide.isActive
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg hover:shadow-orange-500/30'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {selectedGuide.isActive ? 'Book This Guide' : 'Guide Not Available'}
              </button>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Reviews ({selectedGuide.totalReviews})
          </h2>

          {reviewsLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-gray-500">
              <Star size={32} className="mb-2 opacity-50" />
              <p>No reviews yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review._id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={review.reviewer?.profileImage || '/default-avatar.png'}
                        alt={review.reviewer?.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{review.reviewer?.name}</p>
                        <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex">{renderStars(review.rating)}</div>
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
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
