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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-zinc-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center bg-zinc-900 rounded-2xl p-8 border border-zinc-800 max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-white mb-2">Profile Not Found</h2>
          <p className="text-zinc-400 mb-6">{error || 'This profile could not be loaded.'}</p>
          <button onClick={() => navigate(-1)} className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isPrivate = profile.isPrivate;

  return (
    <div className="min-h-screen bg-black pt-20">
      {/* Header with back button */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Profile Header Card */}
        <div className="bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl mb-6">
          {/* Cover Image */}
          <div className="h-40 bg-gradient-to-br from-orange-600 via-orange-500 to-yellow-500 relative">
            {profile.coverImage && (
              <img src={profile.coverImage} alt="Cover" className="w-full h-full object-cover" />
            )}
          </div>

          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16">
              {/* Avatar and name */}
              <div className="flex items-end gap-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-zinc-900 shadow-xl overflow-hidden bg-zinc-800">
                    {profile.profilePicture ? (
                      <img src={profile.profilePicture} alt={profile.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-orange-500 bg-zinc-800">
                        {profile.fullName?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  {/* Online indicator */}
                  <div className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-3 border-zinc-900 ${profile.isOnline ? 'bg-green-500' : 'bg-zinc-600'}`} />
                </div>

                <div className="pb-3">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">{profile.fullName}</h1>
                    {isPrivate && (
                      <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-xs rounded-full flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Private
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-zinc-400 text-sm">
                    {profile.nationality && (
                      <span className="flex items-center gap-1">
                        <Globe className="w-4 h-4" /> {profile.nationality}
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
              <div className="flex gap-3 mt-4 sm:mt-0">
                {profile.isFriend ? (
                  <>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800 text-white font-medium rounded-xl hover:bg-zinc-700 border border-zinc-700">
                      <MessageCircle className="w-5 h-5" /> Message
                    </button>
                    <button onClick={handleRemoveFriend} disabled={actionLoading} className="flex items-center gap-2 px-5 py-2.5 bg-red-600/20 text-red-400 font-medium rounded-xl hover:bg-red-600/30 border border-red-500/30">
                      {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserMinus className="w-5 h-5" />}
                      Remove
                    </button>
                  </>
                ) : profile.hasSentRequest ? (
                  <button onClick={handleCancelRequest} disabled={actionLoading} className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800 text-zinc-300 font-medium rounded-xl hover:bg-zinc-700 border border-zinc-700">
                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Clock className="w-5 h-5" /> Request Sent</>}
                  </button>
                ) : profile.hasReceivedRequest ? (
                  <div className="flex gap-2">
                    <button onClick={handleAcceptRequest} disabled={actionLoading} className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700">
                      {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> Accept</>}
                    </button>
                    <button onClick={handleRejectRequest} disabled={actionLoading} className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800 text-zinc-300 font-medium rounded-xl hover:bg-zinc-700">
                      <X className="w-5 h-5" /> Decline
                    </button>
                  </div>
                ) : (
                  <button onClick={handleSendRequest} disabled={actionLoading} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/20">
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
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-orange-500" /> About
            </h2>
            <div className="space-y-4">
              {profile.bio && (
                <div>
                  <p className="text-zinc-300 leading-relaxed">{profile.bio}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-zinc-500 text-sm">Travel Style</p>
                  <p className="text-white font-medium">{profile.travelStyle || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-sm">Gender</p>
                  <p className="text-white font-medium">{profile.gender || 'Not set'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Notice for Private Profiles */}
          {isPrivate && !profile.isFriend && (
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 flex flex-col items-center justify-center text-center">
              <Lock className="w-12 h-12 text-zinc-600 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Private Profile</h3>
              <p className="text-zinc-400 text-sm max-w-xs">
                This user has a private profile. Send a friend request to see their full profile including interests, languages, and social links.
              </p>
            </div>
          )}

          {/* Full profile sections - only shown for public profiles or friends */}
          {!isPrivate && (
            <>
              {/* Interests */}
              {profile.interests?.length > 0 && (
                <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-orange-500" /> Interests
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest, i) => (
                      <span key={i} className="px-3 py-1.5 bg-orange-500/10 text-orange-400 rounded-full text-sm border border-orange-500/20">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {profile.languages?.length > 0 && (
                <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Languages className="w-5 h-5 text-orange-500" /> Languages
                  </h2>
                  <div className="space-y-2">
                    {profile.languages.map((lang, i) => (
                      <div key={i} className="flex items-center justify-between bg-zinc-800/50 rounded-lg px-4 py-2">
                        <span className="text-white font-medium">{lang.name}</span>
                        <span className="text-zinc-400 text-sm">{lang.level}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Links */}
              {profile.socialLinks && Object.values(profile.socialLinks).some(v => v) && (
                <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 md:col-span-2">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-orange-500" /> Social Links
                  </h2>
                  <div className="flex flex-wrap gap-4">
                    {profile.socialLinks.instagram && (
                      <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-medium hover:opacity-90">
                        Instagram
                      </a>
                    )}
                    {profile.socialLinks.facebook && (
                      <a href={profile.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:opacity-90">
                        Facebook
                      </a>
                    )}
                    {profile.socialLinks.twitter && (
                      <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-xl text-sm font-medium hover:opacity-90">
                        Twitter
                      </a>
                    )}
                    {profile.socialLinks.linkedin && (
                      <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-xl text-sm font-medium hover:opacity-90">
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Member Since */}
              {profile.createdAt && (
                <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-500" /> Member Since
                  </h2>
                  <p className="text-zinc-300">
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
