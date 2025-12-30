import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import { fetchMyCreatedActivities } from "../../redux/slices/userActivitySlice";
import {
  Loader2, MapPin, Users, Calendar, Search, Star, Clock, Plus,
  ChevronLeft, ChevronRight, Edit, Zap, Settings
} from "lucide-react";

// Helper to calculate status
const getActivityStatus = (current, max) => {
  const spotsLeft = max - current;
  if (spotsLeft <= 0) return { type: 'full', text: 'Full', color: 'bg-red-500 text-white' };
  if (spotsLeft <= 3) return { type: 'limited', text: `${spotsLeft} spots left`, color: 'bg-amber-100 text-amber-800' };
  return { type: 'open', text: 'Open', color: 'bg-emerald-100 text-emerald-800' };
};

// ImageSlider Component
const ImageSlider = ({ photos }) => {
  const [idx, setIdx] = useState(0);
  const validPhotos = Array.isArray(photos) ? photos.filter(p => p) : [];

  if (!validPhotos.length) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
        <MapPin className="w-12 h-12 text-amber-300" />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full group">
      <img src={validPhotos[idx]} alt="Activity" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

      {validPhotos.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setIdx((p) => p > 0 ? p - 1 : validPhotos.length - 1)}}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 text-slate-800 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setIdx((p) => (p + 1) % validPhotos.length)}}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 text-slate-800 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
          >
            <ChevronRight size={16} />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {validPhotos.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-white w-3' : 'bg-white/50'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

function MyCreatedActivities() {
  const { getToken } = useAuth();
  const currentUser = useSelector((state) => state.user.profile);
  const { createdActivities = [], createdLoading } = useSelector((state) => state.userActivity);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchMyCreatedActivities(getToken));
    }
  }, [dispatch, currentUser, getToken]);

  // Filter activities based on search
  const filteredActivities = createdActivities.filter(activity => {
    const matchesSearch = !searchQuery ||
      activity.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (createdLoading && createdActivities.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Loading your activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-amber-400 to-orange-600 pb-16 pt-12 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-b-[2.5rem] shadow-2xl shadow-orange-500/20 mb-8">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-0 right-[-10%] w-[50%] h-[150%] bg-white/10 rounded-full blur-3xl transform rotate-12"></div>
          <div className="absolute bottom-0 left-[-10%] w-[40%] h-[120%] bg-amber-300/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto text-center z-10 mt-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-medium mb-6">
            <Settings className="w-4 h-4 text-amber-100" />
            <span>Manage Your Activities</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-sm">
            Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-100 to-white">Created Activities</span>
          </h1>

          <p className="text-amber-50 max-w-2xl mx-auto text-lg leading-relaxed mb-8 font-medium">
            Manage, update, and track all the activities you've created. View participants and engagement.
          </p>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto bg-white rounded-2xl p-2 shadow-xl shadow-orange-900/5 flex flex-col md:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search your activities..."
                className="w-full bg-transparent border-none rounded-xl py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-0 focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="h-0.5 w-full md:w-0.5 md:h-12 bg-slate-100"></div>
            <button
              onClick={() => navigate('/create-activity')}
              className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" /> Create New
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-20">
        {/* Results Info */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Your Activities</h2>
            <p className="text-slate-500 text-sm">Showing {filteredActivities.length} {filteredActivities.length === 1 ? 'activity' : 'activities'}</p>
          </div>
        </div>

        {/* Empty State */}
        {filteredActivities.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-orange-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              {searchQuery ? 'No activities found' : 'No activities yet'}
            </h3>
            <p className="text-slate-500 mb-6">
              {searchQuery ? 'Try adjusting your search query' : 'Create your first activity and start connecting!'}
            </p>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="text-orange-600 font-medium hover:underline"
              >
                Clear Search
              </button>
            ) : (
              <button
                onClick={() => navigate('/create-activity')}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-colors font-semibold flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Create Activity
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredActivities.map((activity) => {
              const participantsCount = activity.participants ? activity.participants.length : 0;
              const status = getActivityStatus(participantsCount, activity.maxCapacity);
              const activityDate = activity.date ? new Date(activity.date) : new Date();
              const startTime = activity.startTime ? new Date(activity.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "TBD";
              const isPast = activityDate < new Date();
              const isCancelled = activity.isCancelled === true;

              const handleCardClick = () => {
                if (isCancelled) {
                  toast.error('This activity has been cancelled and cannot be managed.');
                  return;
                }
                navigate(`/manage-activity/${activity._id}`);
              };

              return (
                <div
                  key={activity._id}
                  onClick={handleCardClick}
                  className={`group bg-white rounded-3xl overflow-hidden border transition-all duration-300 cursor-pointer ${
                    isCancelled
                      ? 'opacity-60 border-red-200 hover:border-red-300'
                      : isPast
                        ? 'opacity-75 border-slate-100 hover:border-orange-100'
                        : 'border-slate-100 hover:border-orange-100 hover:shadow-2xl hover:shadow-orange-900/5 hover:-translate-y-1'
                  }`}
                >
                  {/* Image Section */}
                  <div className="h-56 relative overflow-hidden">
                    <ImageSlider photos={activity.photos} />

                    {/* Cancelled Overlay */}
                    {isCancelled && (
                      <div className="absolute inset-0 bg-red-900/40 flex items-center justify-center">
                        <span className="px-4 py-2 bg-red-600 text-white text-lg font-bold rounded-lg uppercase tracking-wider shadow-lg">
                          Cancelled
                        </span>
                      </div>
                    )}

                    {/* Floating Badges */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-slate-800 text-xs font-bold rounded-lg uppercase tracking-wider shadow-sm flex items-center gap-1">
                        {activity.category === 'Adventure' && <Zap className="w-3 h-3 text-orange-500" />}
                        {activity.category}
                      </span>
                    </div>

                    {!isCancelled && (
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/manage-activity/${activity._id}`); }}
                          className="p-2 bg-white/90 backdrop-blur-md rounded-full text-slate-700 hover:bg-orange-500 hover:text-white transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <div className="absolute bottom-4 left-4 flex gap-2">
                      {isCancelled ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold shadow-sm bg-red-600 text-white">
                          Cancelled
                        </span>
                      ) : isPast ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold shadow-sm bg-slate-500 text-white">
                          Past Event
                        </span>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${status.color}`}>
                          {status.text}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-slate-900 leading-snug group-hover:text-orange-600 transition-colors line-clamp-2">
                        {activity.title}
                      </h3>
                      <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                        <Users className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-xs font-bold text-slate-700">{participantsCount}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                      <MapPin className="w-4 h-4 text-orange-500" />
                      <span className="truncate">{activity.location?.address || "Location on map"}</span>
                    </div>

                    {/* Meta Info Grid */}
                    <div className="flex flex-wrap gap-y-3 gap-x-4 text-xs font-medium text-slate-600 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{activityDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="w-px h-4 bg-slate-200"></div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{startTime}</span>
                      </div>
                      <div className="w-px h-4 bg-slate-200"></div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{participantsCount}/{activity.maxCapacity}</span>
                      </div>
                    </div>

                    {/* Price and Action */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400 font-medium uppercase">Price</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-bold text-slate-900">₹{activity.price}</span>
                          {activity.price === 0 && <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded-full">FREE</span>}
                        </div>
                      </div>

                      <button
                        className="px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-200 active:scale-95 flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700"
                        onClick={(e) => { e.stopPropagation(); navigate(`/manage-activity/${activity._id}`); }}
                      >
                        Manage <ChevronRight className="w-4 h-4" />
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

export default MyCreatedActivities;
