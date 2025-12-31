import { GoogleMap, Marker } from '@react-google-maps/api';
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Globe,
  Info,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldAlert,
  Star,
  Tag,
  Users,
  Video} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '@clerk/clerk-react';
import { load } from '@cashfreepayments/cashfree-js';
import toast from 'react-hot-toast';

import { useGoogleMaps } from '../../context/GoogleMapsContext';
import { fetchActivityById, createActivityPayment } from '../../redux/slices/ActivitySlice';

const getEmbedUrl = (url) => {
  if (!url) return null;
  let videoId = null;
  if (url.includes("youtube.com/watch?v=")) {
    videoId = url.split("v=")[1].split("&")[0];
  } else if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1].split("?")[0];
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.75rem' // matching rounded-xl
};

function IndividualActivity() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { getToken } = useAuth();

  const { currentActivity, isLoading, error, isPaymentProcessing, paymentSessionId } = useSelector((state) => state.activity);
  const { profile: currentUser } = useSelector((state) => state.user);

  const [isJoined, setIsJoined] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const { isLoaded } = useGoogleMaps();

  let cashfree;
  useEffect(() => {
    const initializeSDK = async () => {
      cashfree = await load({
        mode: "sandbox" // Change to "production" for live
      });
    };
    initializeSDK();
  }, []);

  useEffect(() => {
    if (id) {
      dispatch(fetchActivityById({ getToken, id }));
    }
  }, [id, dispatch, getToken]);

  // Handle payment session ID change - trigger Cashfree checkout
  useEffect(() => {
    const processCashfreePayment = async () => {
      if (paymentSessionId) {
        const checkoutOptions = {
          paymentSessionId: paymentSessionId,
          redirectTarget: "_self",
        };

        if (cashfree) {
          cashfree.checkout(checkoutOptions);
        } else {
          // Fallback if cashfree didn't load yet
          const cf = await load({ mode: "sandbox" });
          cf.checkout(checkoutOptions);
        }
      }
    };
    processCashfreePayment();
  }, [paymentSessionId]);

  const handleJoinActivity = async () => {
    if (isPaymentProcessing) return;

    try {
      const result = await dispatch(createActivityPayment({ getToken, activityId: id })).unwrap();

      // Check if it's a free activity (joined directly)
      if (result.data?.isFree) {
        toast.success('Successfully joined the activity!');
        setIsJoined(true);
        setIsRedirecting(true);

        // Refresh activity data
        dispatch(fetchActivityById({ getToken, id }));

        // Redirect to manage page after 2 seconds
        setTimeout(() => {
          navigate(`/manage-joined-activity/${id}`);
        }, 2000);
      }
      // For paid activities, the useEffect will handle Cashfree checkout
    } catch (err) {
      console.error('Join activity error:', err);
      toast.error(err || 'Failed to join activity');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="animate-spin w-12 h-12 text-orange-600" />
          <p className="mt-4 text-slate-700 font-semibold">Loading activity details...</p>
        </div>
      </div>
    );
  }

  if (error) {
     return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-slate-700 mb-4">{typeof error === 'string' ? error : 'Failed to load activity'}</p>
          <button onClick={() => window.history.back()} className="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-semibold shadow-lg shadow-orange-200 transition-all">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!currentActivity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Activity not found</h2>
          <button onClick={() => window.history.back()} className="mt-4 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-semibold shadow-lg shadow-orange-200 transition-all">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Helper for safe access
  const activity = currentActivity;
  const creator = activity.createdBy || {};

  const currentParticipants = activity.participants ? activity.participants.length : 0;
  const spotsLeft = (activity.maxCapacity || 0) - currentParticipants;
  const isFull = spotsLeft <= 0;

  // Check if current user is the creator or already a participant
  const isCreator = currentUser?._id && creator?._id && currentUser._id === creator._id;
  const isAlreadyParticipant = currentUser?._id && activity.participants?.some(
    (p) => (typeof p === 'string' ? p : p._id) === currentUser._id
  );

  // Handle photos: could be strings (URLs) or objects (if frontend state was different previously, but backend sends strings usually)
  // Check if photos are objects with preview or just strings
  const photos = activity.photos?.map(p => typeof p === 'string' ? p : p.preview) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 mt-20">


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT: Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Photo Gallery */}
            <div className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">
              <div className="aspect-[16/9] relative bg-black group">
                {photos.length > 0 ? (
                  <>
                    <img
                      src={photos[activePhotoIndex]}
                      alt="Activity"
                      className="w-full h-full object-contain"
                    />
                    {photos.length > 1 && (
                      <>
                        <button
                          onClick={() => setActivePhotoIndex(prev => prev > 0 ? prev - 1 : photos.length - 1)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full text-slate-900 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setActivePhotoIndex(prev => (prev + 1) % photos.length)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full text-slate-900 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                      {photos.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActivePhotoIndex(idx)}
                          className={`h-2 rounded-full transition-all ${idx === activePhotoIndex ? 'bg-orange-500 w-8' : 'bg-white/70 w-2 hover:bg-white'}`}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <div className="text-center">
                      <Globe className="w-16 h-16 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">No images available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Title & Category */}
            <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span className="px-4 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                  <Tag className="w-3.5 h-3.5" /> {activity.category}
                </span>
                {!isFull && spotsLeft <= 5 && (
                  <span className="px-4 py-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-full flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" /> Only {spotsLeft} spots left!
                  </span>
                )}
                {isFull && (
                  <span className="px-4 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-full uppercase">
                    Fully Booked
                  </span>
                )}
                {activity.gender !== "Any" && (
                  <span className="px-4 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold rounded-full flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" /> {activity.gender} Only
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                {activity.title}
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <Calendar className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-orange-900 mb-1">Date</p>
                    <p className="text-sm font-medium text-slate-700">
                      {new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {activity.endDate ? (
                        <>
                          <span className="mx-1 text-slate-400">-</span>
                          {new Date(activity.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          <span className="block text-xs text-orange-600 font-semibold mt-0.5">
                            ({Math.ceil((new Date(activity.endDate) - new Date(activity.date)) / (1000 * 60 * 60 * 24)) + 1} days)
                          </span>
                        </>
                      ) : (
                        `, ${new Date(activity.date).getFullYear()}`
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-amber-900 mb-1">Time</p>
                    <p className="text-sm font-medium text-slate-700">
                      {activity.startTime ? new Date(activity.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <Users className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-orange-900 mb-1">Participants</p>
                    <p className="text-sm font-medium text-slate-700">
                      {currentParticipants} / {activity.maxCapacity} joined
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Info className="w-6 h-6 text-orange-600" />
                About This Experience
              </h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                {activity.description}
              </p>
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-orange-600" />
                Meeting Location
              </h2>
              <div className="mb-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
                <p className="text-sm text-slate-700 font-medium">
                  {activity.location?.address || "Location details will be shared upon booking"}
                </p>
              </div>
              <div className="h-[350px] w-full bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                 {isLoaded && activity.location?.coordinates ? (
                     <GoogleMap
                       mapContainerStyle={mapContainerStyle}
                       center={{ lat: activity.location.coordinates[1], lng: activity.location.coordinates[0] }}
                       zoom={15}
                       options={{
                         disableDefaultUI: true,
                         zoomControl: true,
                         streetViewControl: false,
                         mapTypeControl: false,
                         fullscreenControl: true,
                       }}
                     >
                       <Marker position={{ lat: activity.location.coordinates[1], lng: activity.location.coordinates[0] }} />
                     </GoogleMap>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-orange-500" />
                        <p className="text-sm">Loading Map...</p>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Videos */}
            {activity.videos && activity.videos.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6 md:p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Video className="w-6 h-6 text-orange-600" />
                  Preview Video
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {activity.videos.map((vid, i) => {
                    const embedUrl = getEmbedUrl(vid);
                    if (!embedUrl) return null;
                    return (
                      <div key={i} className="aspect-video rounded-xl overflow-hidden shadow-md border border-slate-200">
                        <iframe
                          src={embedUrl}
                          title={`Preview ${i + 1}`}
                          className="w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT: Sidebar */}
          <div className="space-y-6">

            {/* Booking Card */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-orange-200 p-6  top-24">
              <div className="text-center mb-6 pb-6 border-b border-orange-100">
                <p className="text-sm text-slate-500 font-semibold mb-2 uppercase tracking-wide">Price per Person</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-5xl font-extrabold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    ₹{activity.price}
                  </span>
                  {activity.price === 0 && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-bold">FREE</span>
                  )}
                </div>
                {activity.foreignerPrice && (
                  <p className="text-sm text-slate-500 mt-3 flex items-center justify-center gap-1.5">
                    <Globe className="w-4 h-4" />
                    International: <span className="text-orange-600 font-bold">${activity.foreignerPrice}</span>
                  </p>
                )}
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600 font-medium">Total Capacity</span>
                  <span className="font-bold text-slate-900">{activity.maxCapacity} people</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm text-slate-600 font-medium">Already Joined</span>
                  <span className="font-bold text-orange-700">{currentParticipants} people</span>
                </div>

                <div className="pt-2">
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500 rounded-full"
                      style={{ width: `${(currentParticipants / activity.maxCapacity) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 text-center font-medium">
                    {Math.round((currentParticipants / activity.maxCapacity) * 100)}% filled
                  </p>
                </div>
              </div>

              {isCreator ? (
                <button disabled className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                  <Star className="w-5 h-5" />
                  You're Hosting This Activity
                </button>
              ) : isAlreadyParticipant || isJoined ? (
                <button
                  onClick={() => navigate(`/manage-joined-activity/${activity._id}`)}
                  className="w-full py-4 bg-green-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-green-700 transition-all shadow-lg shadow-green-200"
                >
                  <Users className="w-5 h-5" />
                  Open Group
                </button>
              ) : isFull ? (
                <button disabled className="w-full py-4 bg-slate-200 text-slate-500 font-bold rounded-xl ">
                  Fully Booked
                </button>
              ) : (
                <button
                  onClick={handleJoinActivity}
                  disabled={isPaymentProcessing}
                  className={`w-full py-4 font-bold rounded-xl text-white shadow-lg transition-all text-lg flex items-center justify-center gap-2 ${
                    isPaymentProcessing
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 active:scale-95 shadow-orange-300'
                  }`}
                >
                  {isPaymentProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Join Group'
                  )}
                </button>
              )}

              <p className="text-center text-xs text-slate-400 mt-4 font-medium">
                100% secure • Free cancellation up to 24 hours
              </p>
            </div>

            {/* Host Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-bold text-slate-900">Your Host</h3>
              </div>

              <div className="flex items-center gap-4 mb-5 pb-5 border-b border-slate-100">
                <img
                  src={creator.profileImage || "https://ui-avatars.com/api/?name=" + (creator.name || "User")}
                  alt={creator.name}
                  className="w-16 h-16 rounded-full object-cover border-4 border-orange-100 shadow-md"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 text-lg">{creator.name || "Unknown Host"}</h4>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-semibold text-slate-700">4.9</span>
                    <span className="text-sm text-slate-500">(127 reviews)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => creator.mobile && window.open(`https://wa.me/${creator.mobile}`, "_blank")}
                  disabled={!creator.mobile}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl font-semibold transition-all border border-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MessageCircle className="w-4 h-4" /> Message on WhatsApp
                </button>
                <button
                  onClick={() => creator.mobile && (window.location.href=`tel:${creator.mobile}`)}
                  disabled={!creator.mobile}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl font-semibold transition-all border border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Phone className="w-4 h-4" /> Call Now
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Redirect Overlay */}
      {isRedirecting && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-white/60 backdrop-blur-md animate-fade-in text-slate-900">
           <Loader2 className="w-12 h-12 text-orange-600 animate-spin mb-4" />
           <h3 className="text-2xl font-bold">Successfully Joined!</h3>
           <p className="text-slate-600 mt-2 font-medium">Redirecting to your dashboard...</p>
        </div>
      )}
    </div>
  );
}

export default IndividualActivity;