import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2, MapPin, Users, Calendar, Search, Star, Clock, Zap,
  Filter, Play, ChevronLeft, ChevronRight, DollarSign, Globe, Heart
} from "lucide-react";

// Reliable Unsplash Images
const MOCK_ACTIVITIES = [
  {
    _id: "1",
    title: "Midnight Cycling Tour of Old Delhi",
    category: "Adventure",
    description: "Experience the charm of Old Delhi under the stars. We'll ride through the historic lanes, passing by the Red Fort and Jama Masjid, concluding with some delicious chai. This is a unique way to see the capital's heritage without the usual traffic.",
    date: "2024-04-15",
    startTime: "23:00",
    endTime: "02:00",
    price: 500, // Local currency
    foreignerPrice: 15, // USD
    maxCapacity: 20,
    currentParticipants: 12,
    gender: "Any",
    location: {
      address: "Red Fort Main Gate, Delhi",
      lat: 28.6562,
      lng: 77.2410
    },
    photos: [
      "https://framerusercontent.com/images/mQcKcyt3Nb25vMYBSbb47aQ9Kw.jpg?scale-down-to=2048&width=5465&height=3643", // Cycling
      "https://images.unsplash.com/photo-1626125076395-9464e8156641?auto=format&fit=crop&q=80&w=800", // Delhi Night
    ],
    videos: [],
    creator: {
      fullName: "Rahul Verma",
      profilePicture: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150"
    }
  },
  {
    _id: "2",
    title: "Pottery Workshop & Clay Art",
    category: "Culture",
    description: "Get your hands dirty and learn the ancient art of pottery. Perfect for beginners! We provide all materials. You will learn wheel throwing and hand-building techniques. Take home your own creation.",
    date: "2024-04-18",
    startTime: "11:00",
    endTime: "14:00",
    price: 1200,
    foreignerPrice: 30,
    maxCapacity: 8,
    currentParticipants: 8, // Full
    gender: "Female Only", // Specific restriction
    location: {
      address: "Art District, Hauz Khas Village",
      lat: 28.5530,
      lng: 77.1940
    },
    photos: [
      "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&q=80&w=800", // Pottery
      "https://images.unsplash.com/photo-1565193566173-7a6422792949?auto=format&fit=crop&q=80&w=800"
    ],
    videos: ["sample_video_link"],
    creator: {
      fullName: "Priya Singh",
      profilePicture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
    }
  },
  {
    _id: "3",
    title: "Sunrise Yoga by the Lake",
    category: "Sports",
    description: "Start your Sunday with zen. A refreshing Hatha yoga session followed by a mindfulness meditation. Bring your own mats. Herbal tea will be served after the session.",
    date: "2024-04-20",
    startTime: "06:00",
    endTime: "07:30",
    price: 0, // Free event
    foreignerPrice: 0,
    maxCapacity: 50,
    currentParticipants: 15,
    gender: "Any",
    location: {
      address: "Sanjay Lake Park, Mayur Vihar",
      lat: 28.6083,
      lng: 77.3025
    },
    photos: [
      "https://images.unsplash.com/photo-1544367563-12123d8965cd?auto=format&fit=crop&q=80&w=800", // Yoga
      "https://images.unsplash.com/photo-1510894347713-fc3ed6fdf539?auto=format&fit=crop&q=80&w=800"
    ],
    videos: [],
    creator: {
      fullName: "David Miller",
      profilePicture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150"
    }
  }
];

// Helper to calculate status
const getActivityStatus = (current, max) => {
  const spotsLeft = max - current;
  if (spotsLeft <= 0) return { type: 'full', text: 'Full', color: 'bg-red-500 text-white' };
  if (spotsLeft <= 3) return { type: 'limited', text: `${spotsLeft} spots left`, color: 'bg-amber-100 text-amber-800' };
  return { type: 'open', text: 'Open', color: 'bg-emerald-100 text-emerald-800' };
};

const ImageSlider = ({ photos }) => {
  const [idx, setIdx] = useState(0);
  if (!photos?.length) return <div className="h-full w-full bg-slate-100 flex items-center justify-center text-slate-400"><MapPin /></div>;

  return (
    <div className="relative h-full w-full group">
      <img src={photos[idx]} alt="Activity" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setIdx((p) => p > 0 ? p - 1 : photos.length - 1)}}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 text-slate-800 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setIdx((p) => (p + 1) % photos.length)}}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 text-slate-800 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
          >
            <ChevronRight size={16} />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {photos.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-white w-3' : 'bg-white/50'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default function ActivityNearMe() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Filter Logic (Mock)
  const filteredActivities = MOCK_ACTIVITIES.filter(act =>
    act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    act.location.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 "> {/* pt-20 for fixed navbar */}

      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-amber-400 to-orange-600 pb-16 pt-12 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-b-[2.5rem] shadow-2xl shadow-orange-500/20 mb-8">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
             <div className="absolute top-0 right-[-10%] w-[50%] h-[150%] bg-white/10 rounded-full blur-3xl transform rotate-12"></div>
             <div className="absolute bottom-0 left-[-10%] w-[40%] h-[120%] bg-amber-300/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto text-center z-10 mt-16">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-medium mb-6 animate-fade-in-up">
              <Zap className="w-4 h-4 text-amber-100" /> <span>Happening Now</span>
           </div>

           <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-sm">
             Discover Activities <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-100 to-white">Near You</span>
           </h1>

           <p className="text-amber-50 max-w-2xl mx-auto text-lg leading-relaxed mb-8 font-medium">
             Join vibrant communities, explore hidden gems, and make new friends with curated local experiences.
           </p>

           {/* Search Bar - Floating */}
           <div className="max-w-3xl mx-auto bg-white rounded-2xl p-2 shadow-xl shadow-orange-900/5 flex flex-col md:flex-row gap-2">
               <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search adventures, workshops, or places..."
                    className="w-full bg-transparent border-none rounded-xl py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
               <div className="h-0.5 w-full md:w-0.5 md:h-12 bg-slate-100"></div>
               <button className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95">
                  <Filter className="w-4 h-4" /> Filter
               </button>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-20">

        {/* Results Info */}
        <div className="flex items-center justify-between mb-8 px-2">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Top Picks For You</h2>
                <p className="text-slate-500 text-sm">Based on your interests</p>
            </div>
            <div className="flex items-center gap-3">
                 <span className="text-sm font-medium text-slate-600 hidden sm:block">Sort by:</span>
                 <select className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-2.5">
                    <option>Recommended</option>
                    <option>Price: Low to High</option>
                    <option>Nearest First</option>
                 </select>
            </div>
        </div>

        {/* Loading / Empty / Grid */}
        {loading ? (
           <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
             <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
             <p className="text-slate-500 font-medium">Finding adventures nearby...</p>
           </div>
        ) : filteredActivities.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No activities found</h3>
              <p className="text-slate-500">We couldn't find matches for "{searchQuery}"</p>
              <button onClick={() => setSearchQuery('')} className="mt-6 text-orange-600 font-medium hover:underline">
                  Clear Search
              </button>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredActivities.map((activity, index) => {
              const status = getActivityStatus(activity.currentParticipants, activity.maxCapacity);

              return (
                <div
                  key={activity._id}
                  className="group bg-white rounded-3xl overflow-hidden border border-slate-100 hover:border-orange-100 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-900/5 hover:-translate-y-1"
                >
                  {/* Image Section */}
                  <div className="h-64 relative overflow-hidden">
                    <ImageSlider photos={activity.photos} />

                    {/* Floating Badges */}
                    <div className="absolute top-4 left-4">
                       <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-slate-800 text-xs font-bold rounded-lg uppercase tracking-wider shadow-sm flex items-center gap-1">
                          {activity.category === 'Adventure' && <Zap className="w-3 h-3 text-orange-500" />}
                          {activity.category}
                       </span>
                    </div>

                    <div className="absolute top-4 right-4 flex gap-2">
                       <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-red-500 transition-colors">
                           <Heart className="w-4 h-4" />
                       </button>
                    </div>

                    <div className="absolute bottom-4 left-4 flex gap-2">
                       <span className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${status.color}`}>
                          {status.text}
                       </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-slate-900 leading-snug group-hover:text-orange-600 transition-colors line-clamp-2">
                        {activity.title}
                      </h3>
                      <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-xs font-bold text-slate-700">4.8</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                       <MapPin className="w-4 h-4 text-orange-500" />
                       <span className="truncate">{activity.location.address}</span>
                    </div>

                    {/* Meta Info Grid */}
                    <div className="flex flex-wrap gap-y-3 gap-x-4 text-xs font-medium text-slate-600 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                       <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                       </div>
                       <div className="w-px h-4 bg-slate-200"></div>
                       <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{activity.startTime}</span>
                       </div>
                       <div className="w-px h-4 bg-slate-200"></div>
                       <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{activity.currentParticipants}/{activity.maxCapacity}</span>
                       </div>
                       {activity.gender !== "Any" && (
                          <div className="w-full pt-2 mt-2 border-t border-slate-200 flex items-center gap-1.5 text-rose-500">
                             <Users className="w-3.5 h-3.5" />
                             <span>{activity.gender} Limited</span>
                          </div>
                       )}
                    </div>

                    {/* Price and Action */}
                    <div className="flex items-center justify-between">
                       <div>
                          <p className="text-xs text-slate-400 font-medium uppercase">Price per person</p>
                          <div className="flex items-baseline gap-1">
                             <span className="text-lg font-bold text-slate-900">₹{activity.price}</span>
                             {activity.price === 0 && <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded-full">FREE</span>}
                          </div>
                       </div>

                       <button
                         className={`px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-200 active:scale-95 flex items-center gap-2 ${
                            status.type === 'full'
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                            : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700'
                         }`}
                         disabled={status.type === 'full'}
                         onClick={() => navigate(`/activity/${activity._id}`)}
                       >
                         {status.type === 'full' ? 'Sold Out' : <>Join <ChevronRight className="w-4 h-4" /></>}
                       </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}