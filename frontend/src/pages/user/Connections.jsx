import { useAuth } from '@clerk/clerk-react';
import { Check, Loader2, MessageCircle, Search, UserCheck, UserMinus, UserPlus, Users, Users2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useSocket } from '../../hooks/useSocket';
import { activityService, createAuthenticatedApi, userService } from '../../redux/services/api';
import { fetchConversations } from '../../redux/slices/chatSlice';

export default function Connections() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  
  // Initialize socket connection
  useSocket();

  const { conversations } = useSelector((state) => state.chat);

  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [groupChats, setGroupChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, userId: null });

  // Fetch conversations for chat list
  useEffect(() => {
    dispatch(fetchConversations(getToken));
  }, [dispatch, getToken]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const authApi = createAuthenticatedApi(getToken);
      
      // Fetch friends, requests, and joined activities in parallel
      const [friendsRes, requestsRes, joinedActivitiesRes] = await Promise.all([
        userService.getFriends(authApi),
        userService.getFriendRequests(authApi),
        activityService.getJoinedActivities(authApi),
      ]);

      if (friendsRes.statusCode === 200) {
        setFriends(friendsRes.data || []);
      }
      if (requestsRes.statusCode === 200) {
        setReceivedRequests(requestsRes.data?.received || []);
        setSentRequests(requestsRes.data?.sent || []);
      }
      if (joinedActivitiesRes.statusCode === 200 && joinedActivitiesRes.data) {
        // Map activities to group chat items
        const activities = joinedActivitiesRes.data || [];
        setGroupChats(activities.map(activity => ({
          _id: activity._id,
          name: activity.title,
          image: activity.photos?.[0] || 'https://cdn-icons-png.flaticon.com/512/166/166258.png',
          participantCount: activity.participants?.length || 0,
          lastMessage: null, // Group chats would need separate fetching for last message
        })));
      }
    } catch (err) {
      console.error('Error loading connections:', err);
      toast.error('Failed to load connections');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAccept = async (userId) => {
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    try {
      const authApi = createAuthenticatedApi(getToken);
      await userService.acceptFriendRequest(authApi, userId);
      toast.success('Friend request accepted!');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept request');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleReject = async (userId) => {
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    try {
      const authApi = createAuthenticatedApi(getToken);
      await userService.rejectFriendRequest(authApi, userId);
      toast.success('Request rejected');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject request');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleCancelRequest = async (userId) => {
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    try {
      const authApi = createAuthenticatedApi(getToken);
      await userService.rejectFriendRequest(authApi, userId);
      toast.success('Request cancelled');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel request');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Open confirm dialog for removing friend
  const openRemoveFriendDialog = (userId) => {
    setConfirmDialog({ isOpen: true, userId });
  };

  // Handle the actual friend removal after confirmation
  const handleRemoveFriend = async (userId) => {
    setConfirmDialog({ isOpen: false, userId: null });
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    try {
      const authApi = createAuthenticatedApi(getToken);
      await userService.removeFriend(authApi, userId);
      toast.success('Friend removed');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove friend');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Filter based on search
  const filterList = (list) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(user => 
      user.name?.toLowerCase().includes(q)
    );
  };

  const filteredFriends = filterList(friends);
  const filteredReceived = filterList(receivedRequests);
  const filteredSent = filterList(sentRequests);

  const tabs = [
    { id: 'friends', label: 'Friends', count: friends.length, icon: Users },
    { id: 'groups', label: 'Groups', count: groupChats.length, icon: Users2 },
    { id: 'received', label: 'Received', count: receivedRequests.length, icon: UserPlus },
    { id: 'sent', label: 'Sent', count: sentRequests.length, icon: UserCheck },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading connections...</p>
        </div>
      </div>
    );
  }

  const UserCard = ({ user, actions }) => (
    <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div 
        className="flex items-center gap-4 cursor-pointer flex-1"
        onClick={() => navigate(`/traveler/${user._id}`)}
      >
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
          {user.profileImage ? (
            <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            user.name?.[0]?.toUpperCase() || '?'
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{user.name || 'Anonymous'}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {user.nationality && <span>🌍 {user.nationality}</span>}
            {user.travelStyle && <span>• ✈️ {user.travelStyle}</span>}
          </div>
        </div>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        {actions}
      </div>
    </div>
  );

  const EmptyState = (props) => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <props.icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{props.title}</h3>
      <p className="text-gray-500 text-sm">{props.description}</p>
    </div>
  );

  // Helper to get conversation for a friend
  const getConversation = (friendId) => {
    return conversations.find(c => c.user._id === friendId);
  };

  // Format time for last message
  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (d.toDateString() === today.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Filter group chats based on search
  const filteredGroupChats = searchQuery.trim() 
    ? groupChats.filter(g => g.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : groupChats;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 pt-28 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Connections</h1>
          <p className="text-gray-500">Manage your friends and chat with them</p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search connections..."
            className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-xl p-1.5 shadow-sm border border-gray-100 mb-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-medium text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-3 mb-8">
          {activeTab === 'friends' && (
            <>
              {filteredFriends.length === 0 ? (
                <EmptyState 
                  icon={Users} 
                  title="No friends yet" 
                  description="Find travelers on the map and send them friend requests!" 
                />
              ) : (
                filteredFriends.map(friend => {
                  const conv = getConversation(friend._id);
                  const lastMsg = conv?.lastMessage;
                  const unreadCount = conv?.unreadCount || 0;
                  
                  return (
                    <div 
                      key={friend._id}
                      className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => navigate(`/chat/${friend._id}`)}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Profile Image with Online Indicator */}
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {friend.profileImage ? (
                              <img src={friend.profileImage} alt={friend.name} className="w-full h-full object-cover" />
                            ) : (
                              friend.name?.[0]?.toUpperCase() || '?'
                            )}
                          </div>
                          {/* Online Status Indicator */}
                          <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${friend.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                        </div>

                        {/* Name and Last Message */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className="font-semibold text-gray-900 truncate">{friend.name || 'Anonymous'}</p>
                            {lastMsg?.createdAt && (
                              <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                                {formatTime(lastMsg.createdAt)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500 truncate">
                              {lastMsg?.message || (
                                <span className="italic text-gray-400">Tap to start chatting</span>
                              )}
                            </p>
                            {unreadCount > 0 && (
                              <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0 ml-2">
                                {unreadCount > 99 ? '99+' : unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0 ml-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/traveler/${friend._id}`); }}
                          className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
                          title="View Profile"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); openRemoveFriendDialog(friend._id); }}
                          disabled={actionLoading[friend._id]}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Remove Friend"
                        >
                          {actionLoading[friend._id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserMinus className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

          {activeTab === 'received' && (
            <>
              {filteredReceived.length === 0 ? (
                <EmptyState 
                  icon={UserPlus} 
                  title="No pending requests" 
                  description="When someone sends you a friend request, it will appear here." 
                />
              ) : (
                filteredReceived.map(user => (
                  <UserCard 
                    key={user._id} 
                    user={user}
                    actions={
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAccept(user._id); }}
                          disabled={actionLoading[user._id]}
                          className="flex items-center gap-1.5 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium transition-all"
                        >
                          {actionLoading[user._id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          <span className="hidden sm:inline">Accept</span>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleReject(user._id); }}
                          disabled={actionLoading[user._id]}
                          className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm font-medium transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    }
                  />
                ))
              )}
            </>
          )}

          {activeTab === 'sent' && (
            <>
              {filteredSent.length === 0 ? (
                <EmptyState 
                  icon={UserCheck} 
                  title="No sent requests" 
                  description="Friend requests you've sent will appear here." 
                />
              ) : (
                filteredSent.map(user => (
                  <UserCard 
                    key={user._id} 
                    user={user}
                    actions={
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCancelRequest(user._id); }}
                        disabled={actionLoading[user._id]}
                        className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm font-medium transition-all"
                      >
                        {actionLoading[user._id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                        <span className="hidden sm:inline">Cancel</span>
                      </button>
                    }
                  />
                ))
              )}
            </>
          )}
          {activeTab === 'groups' && (
            <>
              {filteredGroupChats.length === 0 ? (
                <EmptyState 
                  icon={Users2} 
                  title="No group chats yet" 
                  description="Join activities to start group conversations" 
                />
              ) : (
                filteredGroupChats.map((group) => (
                  <div
                    key={group._id}
                    onClick={() => navigate(`/activity/${group._id}/chat`)}
                    className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Group Image */}
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                        <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
                      </div>

                      {/* Group Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{group.name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Users className="w-3 h-3" />
                          <span>{group.participantCount} participants</span>
                        </div>
                      </div>
                    </div>

                    {/* Chat Icon */}
                    <MessageCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Remove Friend"
        message="Are you sure you want to remove this friend? You can send them a friend request again later."
        confirmText="Remove"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => handleRemoveFriend(confirmDialog.userId)}
        onCancel={() => setConfirmDialog({ isOpen: false, userId: null })}
        loading={actionLoading[confirmDialog.userId]}
      />
    </div>
  );
}
