import { useAuth } from '@clerk/clerk-react';
import { ArrowLeft, Calendar, Check, Clock, Globe, Heart, Languages, Loader2, Lock, MapPin, MessageCircle, UserCheck, UserMinus, UserPlus, UserX, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

import { createAuthenticatedApi, userService } from '../../redux/services/api';

export default function TravelerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const loadProfile = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await userService.getUserById(authApi, id);
      if (response.statusCode === 200) {
        setProfile(response.data);
      } else {
        setError(response.message || 'Failed to load profile');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [id, getToken]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSendRequest = async () => {
    setActionLoading(true);
    try {
      const authApi = createAuthenticatedApi(getToken);
      await userService.sendFriendRequest(authApi, id);
      toast.success('Friend request sent!');
      setProfile(prev => ({ ...prev, hasSentRequest: true }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    setActionLoading(true);
    try {
      const authApi = createAuthenticatedApi(getToken);
      await userService.rejectFriendRequest(authApi, id);
      toast.success('Request cancelled');
      setProfile(prev => ({ ...prev, hasSentRequest: false }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    setActionLoading(true);
    try {
      const authApi = createAuthenticatedApi(getToken);
      await userService.acceptFriendRequest(authApi, id);
      toast.success('Friend request accepted!');
      await loadProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRequest = async () => {
    setActionLoading(true);
    try {
      const authApi = createAuthenticatedApi(getToken);
      await userService.rejectFriendRequest(authApi, id);
      toast.success('Request rejected');
      setProfile(prev => ({ ...prev, hasReceivedRequest: false }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!confirm('Are you sure you want to remove this friend?')) return;
    setActionLoading(true);
    try {
      const authApi = createAuthenticatedApi(getToken);
      await userService.removeFriend(authApi, id);
      toast.success('Friend removed');
      await loadProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove friend');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100">
        <div className="text-center bg-white rounded-2xl p-8 border border-gray-100 shadow-xl max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-500 mb-6">{error || 'This profile could not be loaded.'}</p>
          <button onClick={() => navigate(-1)} className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/20 transition-all">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isPrivate = profile.isPrivate;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 pt-20">
      {/* Header with back button */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-orange-600 transition-colors mb-6 group">
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-xl mb-6">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-orange-400 via-orange-500 to-yellow-500 relative">
            {profile.coverImage && (
              <img src={profile.coverImage} alt="Cover" className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16">
              {/* Avatar and name */}
              <div className="flex items-end gap-5">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white">
                    {profile.profilePicture ? (
                      <img src={profile.profilePicture} alt={profile.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-orange-500 bg-orange-50">
                        {profile.fullName?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  {/* Online indicator */}
                  <div className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-2 border-white ${profile.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                </div>

                <div className="pb-3">
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold text-gray-900">{profile.fullName}</h1>
                    {isPrivate && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Private
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-gray-500 text-sm font-medium">
                    {profile.nationality && (
                      <span className="flex items-center gap-1">
                        <Globe className="w-4 h-4 text-orange-500" /> {profile.nationality}
                      </span>
                    )}
                    {profile.distanceKm !== null && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-orange-500" /> {profile.distanceKm} km away
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-6 sm:mt-0">
                {profile.isFriend ? (
                  <>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-900/20">
                      <MessageCircle className="w-5 h-5" /> Message
                    </button>
                    <button onClick={handleRemoveFriend} disabled={actionLoading} className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-500 font-medium rounded-xl hover:bg-red-100 border border-red-100 transition-all">
                      {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserMinus className="w-5 h-5" />}
                      Remove
                    </button>
                  </>
                ) : profile.hasSentRequest ? (
                  <button onClick={handleCancelRequest} disabled={actionLoading} className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-all">
                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Clock className="w-5 h-5" /> Request Sent</>}
                  </button>
                ) : profile.hasReceivedRequest ? (
                  <div className="flex gap-2">
                    <button onClick={handleAcceptRequest} disabled={actionLoading} className="flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white font-medium rounded-xl hover:bg-green-600 shadow-lg shadow-green-500/20 transition-all">
                      {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> Accept</>}
                    </button>
                    <button onClick={handleRejectRequest} disabled={actionLoading} className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-500 font-medium rounded-xl hover:bg-red-100 border border-red-100 transition-all">
                      <X className="w-5 h-5" /> Decline
                    </button>
                  </div>
                ) : (
                  <button onClick={handleSendRequest} disabled={actionLoading} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/30 transition-all transform hover:-translate-y-0.5">
                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UserPlus className="w-5 h-5" /> Add Friend</>}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Basic Info Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg shadow-orange-500/5">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                <Globe className="w-5 h-5" />
              </div>
              About
            </h2>
            <div className="space-y-4">
              {profile.bio && (
                <div>
                  <p className="text-gray-600 leading-relaxed font-medium">{profile.bio}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-50">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Travel Style</p>
                  <p className="text-gray-900 font-semibold">{profile.travelStyle || 'Not set'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Gender</p>
                  <p className="text-gray-900 font-semibold">{profile.gender || 'Not set'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Notice for Private Profiles */}
          {isPrivate && !profile.isFriend && (
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg shadow-orange-500/5 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Private Profile</h3>
              <p className="text-gray-500 text-sm max-w-xs">
                This user has a private profile. Send a friend request to see their full profile including interests, languages, and social links.
              </p>
            </div>
          )}

          {/* Full profile sections - only shown for public profiles or friends */}
          {!isPrivate && (
            <>
              {/* Interests */}
              {profile.interests?.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg shadow-orange-500/5">
                   <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="p-2 bg-pink-100 rounded-lg text-pink-600">
                      <Heart className="w-5 h-5" />
                    </div>
                    Interests
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest, i) => (
                      <span key={i} className="px-4 py-2 bg-white border border-gray-100 text-gray-700 rounded-xl text-sm font-medium shadow-sm hover:border-orange-200 hover:text-orange-600 transition-colors cursor-default">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {profile.languages?.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg shadow-orange-500/5">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      <Languages className="w-5 h-5" />
                    </div>
                    Languages
                  </h2>
                  <div className="space-y-3">
                    {profile.languages.map((lang, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-gray-900 font-semibold">{lang.name}</span>
                        <span className="text-gray-500 text-sm font-medium bg-white px-3 py-1 rounded-lg shadow-sm border border-gray-100">{lang.level}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Links */}
              {profile.socialLinks && Object.values(profile.socialLinks).some(v => v) && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg shadow-orange-500/5 md:col-span-2">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                      <Globe className="w-5 h-5" />
                    </div>
                    Social Links
                  </h2>
                  <div className="flex flex-wrap gap-4">
                    {profile.socialLinks.instagram && (
                      <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-3 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 hover:-translate-y-0.5 transition-all">
                        Instagram
                      </a>
                    )}
                    {profile.socialLinks.facebook && (
                      <a href={profile.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-3 bg-[#1877F2] text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all">
                        Facebook
                      </a>
                    )}
                    {profile.socialLinks.twitter && (
                      <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-3 bg-black text-white rounded-xl text-sm font-bold shadow-lg shadow-gray-900/20 hover:shadow-gray-900/30 hover:-translate-y-0.5 transition-all">
                        X (Twitter)
                      </a>
                    )}
                    {profile.socialLinks.linkedin && (
                      <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-3 bg-[#0A66C2] text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 hover:-translate-y-0.5 transition-all">
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Member Since */}
              {profile.createdAt && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg shadow-orange-500/5">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                      <Calendar className="w-5 h-5" />
                    </div>
                    Member Since
                  </h2>
                  <p className="text-gray-600 font-medium">
                    {new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

