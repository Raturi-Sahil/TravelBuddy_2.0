import { useAuth } from '@clerk/clerk-react';
import { Check, Loader2, MessageCircle, Search, UserCheck, UserMinus, UserPlus, Users, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import ChatPanel from '../../components/Chat/ChatPanel';
import { useSocket } from '../../hooks/useSocket';
import { createAuthenticatedApi, userService } from '../../redux/services/api';

export default function Connections() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  
  // Initialize socket connection
  useSocket();

  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showChat, setShowChat] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const authApi = createAuthenticatedApi(getToken);
      
      // Fetch friends and requests in parallel
      const [friendsRes, requestsRes] = await Promise.all([
        userService.getFriends(authApi),
        userService.getFriendRequests(authApi),
      ]);

      if (friendsRes.statusCode === 200) {
        setFriends(friendsRes.data || []);
      }
      if (requestsRes.statusCode === 200) {
        setReceivedRequests(requestsRes.data?.received || []);
        setSentRequests(requestsRes.data?.sent || []);
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

  const handleRemoveFriend = async (userId) => {
    if (!confirm('Are you sure you want to remove this friend?')) return;
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

  const EmptyState = ({ icon: Icon, title, description }) => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 pt-28 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Connections</h1>
            <p className="text-gray-500">Manage your friends and chat with them</p>
          </div>
          <button
            onClick={() => setShowChat(!showChat)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
              showChat 
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            {showChat ? 'Hide Chat' : 'Show Chat'}
          </button>
        </div>

        {/* Two Column Layout */}
        <div className={`grid gap-6 ${showChat ? 'lg:grid-cols-2' : 'grid-cols-1 max-w-3xl mx-auto'}`}>
          {/* Left Column - Friends List */}
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
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
            <div className="flex gap-2 bg-white rounded-xl p-1.5 shadow-sm border border-gray-100">
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
            <div className="space-y-3 max-h-[calc(100vh-350px)] overflow-y-auto pr-1">
              {activeTab === 'friends' && (
                <>
                  {filteredFriends.length === 0 ? (
                    <EmptyState 
                      icon={Users} 
                      title="No friends yet" 
                      description="Find travelers on the map and send them friend requests!" 
                    />
                  ) : (
                    filteredFriends.map(friend => (
                      <UserCard 
                        key={friend._id} 
                        user={friend}
                        actions={
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRemoveFriend(friend._id); }}
                            disabled={actionLoading[friend._id]}
                            className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium transition-all"
                          >
                            {actionLoading[friend._id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserMinus className="w-4 h-4" />}
                            <span className="hidden sm:inline">Remove</span>
                          </button>
                        }
                      />
                    ))
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
            </div>
          </div>

          {/* Right Column - Chat Panel */}
          {showChat && (
            <div className="lg:sticky lg:top-28 lg:h-[calc(100vh-160px)]">
              <ChatPanel friends={friends} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
