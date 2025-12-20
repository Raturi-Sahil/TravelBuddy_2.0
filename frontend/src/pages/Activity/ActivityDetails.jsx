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

import { useGoogleMaps } from '../../context/GoogleMapsContext';

// MOCK DATA
const MOCK_ACTIVITY = {
  _id: "1",
  title: "Midnight Cycling Tour of Old Delhi",
  category: "Adventure",
  description: "Experience the charm of Old Delhi under the stars. We'll ride through the historic lanes, passing by the Red Fort and Jama Masjid, concluding with some delicious chai. This is a unique way to see the capital's heritage without the usual traffic. We provide bicycles, helmets, and a safety briefing before the tour starts.",
  date: "2024-04-15",
  startTime: "23:00",
  endTime: "02:00",
  price: 500,
  foreignerPrice: 15,
  maxCapacity: 20,
  gender: "Any",
  participants: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  location: {
    lat: 28.6562,
    lng: 77.2410,
    address: "Red Fort Main Gate, Netaji Subhash Marg, Lal Qila, Chandni Chowk, New Delhi, Delhi 110006"
  },
  photos: [
    { preview: "https://images.unsplash.com/photo-1559103006-25d25950854d?auto=format&fit=crop&q=80&w=1200" },
    { preview: "https://images.unsplash.com/photo-1626125076395-9464e8156641?auto=format&fit=crop&q=80&w=1200" },
    { preview: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=1200" }
  ],
  videos: ["https://www.youtube.com/watch?v=LXb3EKWsInQ"],
  createdAt: "2024-03-10T10:00:00Z",
  creator: {
    fullName: "Rahul Verma",
    profilePicture: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150",
    mobile: "919876543210"
  }
};

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
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [singleActivity, setSingleActivity] = useState(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const { isLoaded } = useGoogleMaps();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setSingleActivity(MOCK_ACTIVITY);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

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
          <button onClick={() => window.history.back()} className="mt-4 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-semibold shadow-lg shadow-orange-200 transition-all">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentParticipants = singleActivity.participants ? singleActivity.participants.length : 0;
  const spotsLeft = (singleActivity.maxCapacity || 0) - currentParticipants;
  const isFull = spotsLeft <= 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 mt-20">


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT: Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Photo Gallery */}
            <div className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">
              <div className="aspect-[16/9] relative bg-slate-100 group">
                {singleActivity.photos && singleActivity.photos.length > 0 ? (
                  <>
                    <img
                      src={singleActivity.photos[activePhotoIndex].preview}
                      alt="Activity"
                      className="w-full h-full object-cover"
                    />
                    {singleActivity.photos.length > 1 && (
                      <>
                        <button
                          onClick={() => setActivePhotoIndex(prev => prev > 0 ? prev - 1 : singleActivity.photos.length - 1)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full text-slate-900 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setActivePhotoIndex(prev => (prev + 1) % singleActivity.photos.length)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full text-slate-900 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                      {singleActivity.photos.map((_, idx) => (
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
                  <Tag className="w-3.5 h-3.5" /> {singleActivity.category}
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
                {singleActivity.gender !== "Any" && (
                  <span className="px-4 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold rounded-full flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" /> {singleActivity.gender} Only
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                {singleActivity.title}
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <Calendar className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-orange-900 mb-1">Date</p>
                    <p className="text-sm font-medium text-slate-700">
                      {new Date(singleActivity.date).toLocaleDateString('en-US', {
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
                      {singleActivity.startTime} - {singleActivity.endTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <Users className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-orange-900 mb-1">Participants</p>
                    <p className="text-sm font-medium text-slate-700">
                      {currentParticipants} / {singleActivity.maxCapacity} joined
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
                {singleActivity.description}
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
                  {singleActivity.location?.address || "Location details will be shared upon booking"}
                </p>
              </div>
              <div className="h-[350px] w-full bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                 {isLoaded && singleActivity?.location ? (
                     <GoogleMap
                       mapContainerStyle={mapContainerStyle}
                       center={{ lat: singleActivity.location.lat, lng: singleActivity.location.lng }}
                       zoom={15}
                       options={{
                         disableDefaultUI: true,
                         zoomControl: true,
                         streetViewControl: false,
                         mapTypeControl: false,
                         fullscreenControl: true,
                       }}
                     >
                       <Marker position={{ lat: singleActivity.location.lat, lng: singleActivity.location.lng }} />
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
            {singleActivity.videos && singleActivity.videos.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6 md:p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Video className="w-6 h-6 text-orange-600" />
                  Preview Video
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {singleActivity.videos.map((vid, i) => {
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
                    ₹{singleActivity.price}
                  </span>
                  {singleActivity.price === 0 && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-bold">FREE</span>
                  )}
                </div>
                {singleActivity.foreignerPrice && (
                  <p className="text-sm text-slate-500 mt-3 flex items-center justify-center gap-1.5">
                    <Globe className="w-4 h-4" />
                    International: <span className="text-orange-600 font-bold">${singleActivity.foreignerPrice}</span>
                  </p>
                )}
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600 font-medium">Total Capacity</span>
                  <span className="font-bold text-slate-900">{singleActivity.maxCapacity} people</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm text-slate-600 font-medium">Already Joined</span>
                  <span className="font-bold text-orange-700">{currentParticipants} people</span>
                </div>

                <div className="pt-2">
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500 rounded-full"
                      style={{ width: `${(currentParticipants / singleActivity.maxCapacity) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 text-center font-medium">
                    {Math.round((currentParticipants / singleActivity.maxCapacity) * 100)}% filled
                  </p>
                </div>
              </div>

              {isFull ? (
                <button disabled className="w-full py-4 bg-slate-200 text-slate-500 font-bold rounded-xl ">
                  Fully Booked
                </button>
              ) : (
                <button
                  onClick={() => { setIsJoined(true); setTimeout(() => alert("Booking confirmed!"), 300); }}
                  className={`w-full py-4 font-bold rounded-xl text-white shadow-lg transition-all text-lg flex items-center justify-center gap-2 ${
                    isJoined
                      ? 'bg-green-600 cursor-default'
                      : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 active:scale-95 shadow-orange-300'
                  }`}
                >
                  {isJoined ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Booking Confirmed!
                    </>
                  ) : (
                    'Reserve Your Spot'
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
                  src={singleActivity.creator.profilePicture}
                  alt={singleActivity.creator.fullName}
                  className="w-16 h-16 rounded-full object-cover border-4 border-orange-100 shadow-md"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 text-lg">{singleActivity.creator.fullName}</h4>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-semibold text-slate-700">4.9</span>
                    <span className="text-sm text-slate-500">(127 reviews)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => window.open(`https://wa.me/${singleActivity.creator.mobile}`, "_blank")}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl font-semibold transition-all border border-green-200"
                >
                  <MessageCircle className="w-4 h-4" /> Message on WhatsApp
                </button>
                <button
                  onClick={() => window.location.href=`tel:${singleActivity.creator.mobile}`}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl font-semibold transition-all border border-blue-200"
                >
                  <Phone className="w-4 h-4" /> Call Now
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default IndividualActivity;