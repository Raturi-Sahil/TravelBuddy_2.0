import { GoogleMap, Marker } from '@react-google-maps/api';
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  Info,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  ShieldAlert,
  Star,
  Tag,
  Users,
  Video,
  LogOut,
  MessagesSquare
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

import { useGoogleMaps } from '../../context/GoogleMapsContext';
import { getSingleActivity, leaveActivity } from '../../redux/slices/userActivitySlice';
import JoinChatGroup from './JoinActivityGroup';

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

function ManageJoinedActivity() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { getToken } = useAuth();

  const [loading, setLoading] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [confirmChecks, setConfirmChecks] = useState({
    refundPolicy: false,
    confirmAction: false,
    irreversible: false
  });

  const { singleActivity } = useSelector((state) => state.userActivity);
  const { profile: currentUser } = useSelector((state) => state.user);
  const { isLoaded } = useGoogleMaps();

  useEffect(() => {
    if (id) {
      setLoading(true);
      dispatch(getSingleActivity({ getToken, activityId: id })).finally(() => {
        setLoading(false);
      });
    }
  }, [id, dispatch, getToken]);

  const handleLeaveClick = () => {
    setConfirmChecks({
      refundPolicy: false,
      confirmAction: false,
      irreversible: false
    });
    setShowLeaveModal(true);
  };

  const confirmLeave = async () => {
    setIsLeaving(true);
    setShowLeaveModal(false);
    try {
      await dispatch(leaveActivity({ getToken, activityId: id })).unwrap();
      toast.success("Left activity successfully");
      setIsRedirecting(true);

      // Delay navigation to show overlay
      localStorage.removeItem(`joined_chat_${id}`);
      setTimeout(() => {
        navigate('/joined-activities');
      }, 2000);

    } catch (error) {
      toast.error(error || "Failed to leave activity");
      setIsLeaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="animate-spin w-12 h-12 text-orange-600" />
          <p className="mt-4 text-slate-700 font-semibold">Loading activity details...</p>
        </div>
      </div>
    );
  }

  if (!singleActivity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Activity not found</h2>
          <button onClick={() => navigate('/joined-activities')} className="mt-4 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-semibold shadow-lg shadow-orange-200 transition-all">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Handle data structure differences
  const activity = singleActivity;
  // Fallbacks for creator fields
  const creator = activity.creator || activity.createdBy || {};

  // Check if current user is creator
  const isCreator = currentUser?._id && creator?._id && currentUser._id === creator._id;


  const currentParticipants = activity.participants ? activity.participants.length : 0;
  const isParticipant = activity.participants?.some(p => (p._id || p) === currentUser?._id);
  // Handle maxCapacity vs participantLimit naming
  const maxCapacity = activity.maxCapacity || activity.participantLimit || 0;
  const spotsLeft = maxCapacity - currentParticipants;
  const isFull = spotsLeft <= 0;

  // Handle photos: could be strings (URLs) or objects
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
                {activity.isCancelled ? (
                  <span className="px-4 py-1.5 bg-red-600 text-white border border-red-700 text-xs font-bold rounded-full flex items-center gap-1.5 shadow-sm">
                    <ShieldAlert className="w-3.5 h-3.5" /> Cancelled
                  </span>
                ) : !isFull && spotsLeft <= 5 && (
                  <span className="px-4 py-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-full flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" /> Only {spotsLeft} spots left!
                  </span>
                )}
                {isFull && !activity.isCancelled && (
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
                      {new Date(activity.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-amber-900 mb-1">Time</p>
                    <p className="text-sm font-medium text-slate-700">
                      {activity.startTime ? new Date(activity.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                        (activity.time || 'TBD')}
                      {activity.endDate && (
                        <span className="block text-xs text-slate-500 mt-1">
                          Ends: {new Date(activity.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <Users className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-orange-900 mb-1">Participants</p>
                    <p className="text-sm font-medium text-slate-700">
                      {currentParticipants} / {maxCapacity} joined
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

            {/* Chat Group - Primary Action for Attendees */}
            {/* TODO: Add chat functionality later */}
            {!activity.isCancelled && (
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl shadow-lg border border-orange-100 p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <MessagesSquare className="w-6 h-6 text-orange-600" />
                      Activity Chat Group
                    </h2>
                    <p className="text-slate-600">Connect with other participants and the host securely.</p>
                  </div>
                  <button
                    onClick={() => {
                      const hasJoinedLocally = localStorage.getItem(`joined_chat_${id}`);
                      if (hasJoinedLocally || isCreator || isParticipant) {
                        navigate(`/activity-chat/${id}`);
                      } else {
                        setShowChatModal(true);
                      }
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold rounded-xl shadow-lg shadow-orange-200 hover:shadow-xl hover:-translate-y-0.5 transition-all text-lg whitespace-nowrap"
                  >
                    Open Group Chat
                  </button>
                </div>
              </div>
            )}

            {/* Location */}
            <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-orange-600" />
                Meeting Location
              </h2>
              <div className="mb-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
                <p className="text-sm text-slate-700 font-medium">
                  {activity.location?.address || activity.location?.formattedAddress || "Location details provided by map below"}
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

            {/* Status Card */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-orange-200 p-6 top-24">
              <div className="text-center mb-6 pb-6 border-b border-orange-100">
                <p className="text-sm text-slate-500 font-semibold mb-2 uppercase tracking-wide">Status</p>

                {activity.isCancelled ? (
                  <div className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-red-100 text-red-700 rounded-lg font-bold">
                    <ShieldAlert className="w-5 h-5" /> Cancelled
                  </div>
                ) : isCreator ? (
                  <div className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-purple-100 text-purple-700 rounded-lg font-bold">
                    <Star className="w-5 h-5" /> You're Hosting!
                  </div>
                ) : (
                  <div className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-green-100 text-green-700 rounded-lg font-bold">
                    <CheckCircle2 className="w-5 h-5" /> You're Going!
                  </div>
                )}

                {activity.cancellationReason && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-left">
                    <p className="text-xs text-red-700 font-bold mb-1">Reason for cancellation:</p>
                    <p className="text-sm text-slate-700">{activity.cancellationReason}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600 font-medium">Your Ticket</span>
                  <span className="font-bold text-slate-900"> Confirmed</span>
                </div>
                {activity.price > 0 && (
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="text-sm text-slate-600 font-medium">Price Paid</span>
                    <span className="font-bold text-orange-700">₹{activity.price}</span>
                  </div>
                )}

                <div className="pt-2">
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500 rounded-full"
                      style={{ width: `${(currentParticipants / maxCapacity) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 text-center font-medium">
                    {Math.round((currentParticipants / maxCapacity) * 100)}% filled
                  </p>
                </div>
              </div>

              {!activity.isCancelled && !isCreator && (
                <button
                  onClick={handleLeaveClick}
                  disabled={isLeaving}
                  className="w-full py-4 bg-red-50 text-red-600 border-2 border-red-100 hover:bg-red-100 hover:border-red-200 font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  {isLeaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <LogOut className="w-5 h-5" />
                  )}
                  {isLeaving ? 'Leaving...' : 'Leave Activity'}
                </button>
              )}
              {!activity.isCancelled && isCreator && (
                <button
                  onClick={() => navigate(`/manage-activity/${activity._id}`)}
                  className="w-full py-4 bg-purple-50 text-purple-600 border-2 border-purple-100 hover:bg-purple-100 hover:border-purple-200 font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <Star className="w-5 h-5" /> Manage your Activity
                </button>
              )}


              <p className="text-center text-xs text-slate-400 mt-4 font-medium">
                {isCreator ? "You are the host of this activity" : "Leaving will open up your spot for others"}
              </p>
            </div>

            {/* Host Card - Hide contact buttons if user is host */}
            <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-bold text-slate-900">Your Host</h3>
              </div>

              <div className="flex items-center gap-4 mb-5 pb-5 border-b border-slate-100">
                <img
                  src={creator.profileImage || creator.profilePicture || "https://ui-avatars.com/api/?name=" + (creator.name || creator.fullName || "Host")}
                  alt={creator.name}
                  className="w-16 h-16 rounded-full object-cover border-4 border-orange-100 shadow-md"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 text-lg">{creator.name || creator.fullName || "Activity Host"}</h4>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-semibold text-slate-700">4.9</span>
                    <span className="text-sm text-slate-500">(Host Rating)</span>
                  </div>
                </div>
              </div>

              {!isCreator && (
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      const phone = creator.mobile;
                      if (phone) window.open(`https://wa.me/${phone}`, "_blank");
                      else toast.error("Host contact not available");
                    }}
                    disabled={!creator.mobile}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl font-semibold transition-all border border-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MessageCircle className="w-4 h-4" /> Message on WhatsApp
                  </button>
                  <button
                    onClick={() => {
                      const phone = creator.mobile;
                      if (phone) window.location.href = `tel:${phone}`;
                      else toast.error("Host contact not available");
                    }}
                    disabled={!creator.mobile}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl font-semibold transition-all border border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Phone className="w-4 h-4" /> Call Now
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Leave Confirmation Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <ShieldAlert className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Leave Activity?</h3>
              <p className="text-slate-600 mb-4">
                Please confirm the following before leaving:
              </p>

              {Number(activity.price) > 0 && (
                <div className="w-full mb-4 p-4 bg-amber-50 border border-amber-100 rounded-xl text-left space-y-1">
                  <h4 className="font-bold text-amber-800 text-sm mb-2">Refund Breakdown</h4>
                  <div className="flex justify-between text-xs text-amber-700">
                    <span>Price Paid:</span>
                    <span>₹{activity.price}</span>
                  </div>
                  <div className="flex justify-between text-xs text-amber-700">
                    <span>Deduction (30%):</span>
                    <span>- ₹{Math.round(activity.price * 0.3)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-amber-900 border-t border-amber-200 pt-1 mt-1">
                    <span>Refund Amount:</span>
                    <span>₹{Math.round(activity.price * 0.7)}</span>
                  </div>
                </div>
              )}


              <div className="w-full space-y-3 text-left bg-slate-50 p-4 rounded-xl border border-slate-100">
                {/* Checkbox 1: Action Confirmation */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={confirmChecks.confirmAction}
                      onChange={(e) => setConfirmChecks(prev => ({ ...prev, confirmAction: e.target.checked }))}
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 bg-white transition-all checked:border-red-500 checked:bg-red-500 hover:border-red-400"
                    />
                    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                      <CheckCircle2 size={12} strokeWidth={4} />
                    </div>
                  </div>
                  <span className="text-sm text-slate-700 font-medium group-hover:text-slate-900">
                    I confirm that I want to cancel my participation in this activity.
                  </span>
                </label>

                {/* Checkbox 2: Irreversible */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={confirmChecks.irreversible}
                      onChange={(e) => setConfirmChecks(prev => ({ ...prev, irreversible: e.target.checked }))}
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 bg-white transition-all checked:border-red-500 checked:bg-red-500 hover:border-red-400"
                    />
                    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                      <CheckCircle2 size={12} strokeWidth={4} />
                    </div>
                  </div>
                  <span className="text-sm text-slate-700 font-medium group-hover:text-slate-900">
                    I understand this action is irreversible and I may lose my spot.
                  </span>
                </label>

                {/* Checkbox 3: Refund Policy (Only if Paid) */}
                {Number(activity.price) > 0 && (
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={confirmChecks.refundPolicy}
                        onChange={(e) => setConfirmChecks(prev => ({ ...prev, refundPolicy: e.target.checked }))}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 bg-white transition-all checked:border-red-500 checked:bg-red-500 hover:border-red-400"
                      />
                      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                        <CheckCircle2 size={12} strokeWidth={4} />
                      </div>
                    </div>
                    <span className="text-sm text-amber-800 font-medium group-hover:text-amber-900">
                      I accept the <b>30% deduction refund policy</b>. <br />
                      You will receive <b>₹{Math.round((activity.price || 0) * 0.7)}</b> (70% of ₹{activity.price}) back in 7-10 days.
                    </span>
                  </label>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLeaveModal(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLeave}
                disabled={!confirmChecks.confirmAction || !confirmChecks.irreversible || (Number(activity.price) > 0 && !confirmChecks.refundPolicy)}
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Yes, Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Redirect Overlay */}
      {isRedirecting && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-white/60 backdrop-blur-md animate-fade-in text-slate-900">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-4" />
          <h3 className="text-2xl font-bold">Left Activity</h3>
          <p className="text-slate-600 mt-2 font-medium">Redirecting to activity list...</p>
        </div>
      )}


      {/* Chat Group Modal */}
      {
        showChatModal && (
          <JoinChatGroup
            isOpen={showChatModal}
            onClose={() => setShowChatModal(false)}
            activityId={id}
          />
        )
      }
    </div >
  );
}

export default ManageJoinedActivity;
