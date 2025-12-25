import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { fetchJoinedActivities, leaveActivity } from "../../redux/slices/userActivitySlice";
import { Loader2, MapPin, Users, Calendar, Search, Star, Clock, Zap } from "lucide-react";
import ReverseGeocode from "../../helpers/reverseGeoCode";

// Animation styles
const cardAnimationStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in-up {
    animation: fadeInUp 0.6s ease-out forwards;
    opacity: 0;
  }
`;

function JoinedActivites() {
  const { getToken } = useAuth();
  const currentUser = useSelector((state) => state.user.profile);
  const { joinedActivities = [], loading } = useSelector((state) => state.userActivity);
  const [searchQuery, setSearchQuery] = useState('');
  const [addresses, setAddresses] = useState({}); // Store resolved addresses by activity ID

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchJoinedActivities(getToken));
    }
  }, [dispatch, currentUser, getToken]);

  // Reverse geocode locations when activities are loaded
  useEffect(() => {
    const fetchAddresses = async () => {
      const newAddresses = {};

      for (const activity of joinedActivities) {
        // Skip if we already have the address cached
        if (addresses[activity._id]) continue;

        // Check if activity has coordinates
        if (activity.location?.coordinates && activity.location.coordinates.length === 2) {
          const [lng, lat] = activity.location.coordinates;
          try {
            const address = await ReverseGeocode({ lat, lng });
            newAddresses[activity._id] = address;
          } catch (error) {
            console.error('Error reverse geocoding:', error);
            newAddresses[activity._id] = 'Location unavailable';
          }
        } else {
          newAddresses[activity._id] = 'Location TBD';
        }
      }

      if (Object.keys(newAddresses).length > 0) {
        setAddresses(prev => ({ ...prev, ...newAddresses }));
      }
    };

    if (joinedActivities.length > 0) {
      fetchAddresses();
    }
  }, [joinedActivities]);

  console.log('Joined Activities:', joinedActivities);

  const handleLeaveActivity = async (e, activityId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to leave this activity?')) {
      dispatch(leaveActivity({ getToken, activityId }));
    }
  };

  const filteredActivities = joinedActivities.filter((activity) => {
    const title = activity.title?.toLowerCase() || '';
    const address = (addresses[activity._id] || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return title.includes(query) || address.includes(query);
  });

  // Show loading spinner for initial page load
  if (loading && joinedActivities.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-100 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-amber-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50  to-orange-100">
      {/* Inject animation styles */}
      <style>{cardAnimationStyles}</style>
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-400">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 mt-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
               Your Joined Activities
            </h1>
            <p className="text-xl text-amber-100 max-w-2xl mx-auto">
             Welcome to your joined activities page! Here you can find all the activities you have joined.
            </p>
          </div>
        </div>

        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full translate-x-48 translate-y-48"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search activities by title or location..."
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
            />
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                Near your location
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Updated recently
              </span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <Loader2 className="animate-spin w-12 h-12 text-amber-600" />
              <div className="absolute inset-0 animate-ping w-12 h-12 rounded-full bg-amber-200 opacity-75"></div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">Loading your activities...</p>
          </div>
        )}

        {!loading && filteredActivities.length === 0 && (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <MapPin className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No activities joined</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              {searchQuery
                ? "We couldn't find any activities matching your search. Try adjusting your search terms."
                : "You haven't joined any activities yet. Explore and join activities to see them here!"}
            </p>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors duration-200 font-medium"
              >
                Clear Search
              </button>
            ) : (
              <button
                onClick={() => navigate('/activities')}
                className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors duration-200 font-medium"
              >
                Explore Activities
              </button>
            )}
          </div>
        )}

        {/* Activities Grid */}
        {!loading && filteredActivities.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {filteredActivities.length} {filteredActivities.length === 1 ? 'Activity' : 'Activities'} Joined
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
              {filteredActivities.map((activity, index) => {
                const activityDate = activity.date ? new Date(activity.date) : new Date();
                const startTime = activity.startTime
                  ? new Date(activity.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : "TBD";
                const locationAddress = addresses[activity._id] || 'Loading...';

                return (
                  <div
                    key={activity._id}
                    className="animate-fade-in-up group bg-gray-50 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 transform transition-all duration-300 overflow-hidden border border-gray-100 hover:border-amber-200 cursor-pointer"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => navigate(`/activity/${activity._id}`)}
                  >
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-bold line-clamp-2 flex-1 mr-3">{activity.title}</h3>
                        </div>
                        <div className="flex items-center space-x-4 text-amber-100">
                          <span className="flex items-center text-sm">
                            <Star className="w-4 h-4 mr-1 fill-current" />
                            {activity.category || "Activity"}
                          </span>
                          <span className="flex items-center text-sm">
                            <Users className="w-4 h-4 mr-1" />
                            {activity.participants?.length || 0}/{activity.maxCapacity || "∞"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6">
                      <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                        {activity.description}
                      </p>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center text-gray-700">
                          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                            <Calendar className="w-4 h-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {activityDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                            <p className="text-sm text-gray-500">{startTime}</p>
                          </div>
                        </div>

                        <div className="flex items-start text-gray-700">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                            <MapPin className="w-4 h-4 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm leading-relaxed line-clamp-2">
                              {locationAddress}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Creator Info / Leave Button */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-3">
                          {activity.createdBy?.profileImage ? (
                            <img
                              src={activity.createdBy.profileImage}
                              alt={activity.createdBy.name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {activity.createdBy?.name?.charAt(0) || "?"}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {activity.createdBy?.name || "Unknown Host"}
                            </p>
                            <p className="text-xs text-gray-500">Organizer</p>
                          </div>
                        </div>
                        <button
                          className="px-4 py-2 text-white bg-red-500 text-sm font-medium rounded-lg transition-colors hover:bg-red-600 duration-200 shadow-md hover:shadow-lg"
                          onClick={(e) => handleLeaveActivity(e, activity._id)}
                        >
                          Leave
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default JoinedActivites;
