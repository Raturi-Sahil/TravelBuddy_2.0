import { useAuth, useUser } from '@clerk/clerk-react';
import {
  Briefcase,
  Calendar,
  Camera,
  Edit2,
  Eye,
  EyeOff,
  Facebook,
  Globe,
  Heart,
  ImagePlus,
  Instagram,
  Languages,
  Linkedin,
  MapPin,
  Save,
  Twitter,
  User,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import {
  COUNTRIES,
  GENDERS,
  INTERESTS,
  LANGUAGE_LEVELS,
  LANGUAGES,
  TRAVEL_STYLES,
} from '../../data/enums';
import { useUserActions } from '../../redux/hooks/useUser';

// Check if error is a network/connection error
const isNetworkError = (err) => {
  if (!err) return false;
  if (!err.status && !err.response?.status) return true;
  if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') return true;
  if (err.message?.includes('Network Error')) return true;
  if (err.message?.includes('ERR_CONNECTION_REFUSED')) return true;
  return false;
};

export default function ProfilePage() {
  const { user: clerkUser, isLoaded: isUserLoaded } = useUser();
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const navigate = useNavigate();
  const {
    profile: reduxProfile,
    fetchProfile,
    updateProfile,
    isLoading: isUpdatingRedux,
  } = useUserActions();

  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit State
  const [editData, setEditData] = useState({});
  const [clerkUpdates, setClerkUpdates] = useState({
    firstName: '',
    lastName: '',
  });
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);

  // Search/Dropdown States
  const [nationalitySearch, setNationalitySearch] = useState('');
  const [showNationalityDropdown, setShowNationalityDropdown] = useState(false);
  const [languageSearch, setLanguageSearch] = useState('');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [newLanguage, setNewLanguage] = useState({ name: '', level: 'Beginner' });
  const [interestSearch, setInterestSearch] = useState('');
  const [showInterestDropdown, setShowInterestDropdown] = useState(false);

  const nationalityRef = useRef(null);
  const languageRef = useRef(null);
  const interestRef = useRef(null);

  // Filter lists
  const filteredCountries = COUNTRIES.filter((c) =>
    c.toLowerCase().includes(nationalitySearch.toLowerCase())
  );
  const filteredLanguages = LANGUAGES.filter((l) =>
    l.toLowerCase().includes(languageSearch.toLowerCase())
  );
  const filteredInterests = INTERESTS.filter((i) =>
    i.toLowerCase().includes(interestSearch.toLowerCase())
  );

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (nationalityRef.current && !nationalityRef.current.contains(event.target))
        setShowNationalityDropdown(false);
      if (languageRef.current && !languageRef.current.contains(event.target))
        setShowLanguageDropdown(false);
      if (interestRef.current && !interestRef.current.contains(event.target))
        setShowInterestDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadProfile = useCallback(async () => {
    if (!isAuthLoaded || !isUserLoaded) return;

    if (!isSignedIn) {
      navigate('/sign-in', { replace: true });
      return;
    }

    if (reduxProfile) {
      setProfile(reduxProfile);
      setEditData(reduxProfile);
      setLoadingProfile(false);
      return;
    }

    setConnectionError(false);
    setLoadingProfile(true);

    try {
      const response = await fetchProfile();
      setProfile(response.data);
      setEditData(response.data);
    } catch (err) {
      if (isNetworkError(err)) {
        setConnectionError(true);
      } else {
        const status = err?.status || err?.response?.status;
        if (status === 403 || status === 404) {
          navigate('/complete-registration', { replace: true });
        } else {
          toast.error(err?.message || 'Failed to load profile');
        }
      }
    } finally {
      setLoadingProfile(false);
    }
  }, [isAuthLoaded, isUserLoaded, isSignedIn, navigate, reduxProfile, fetchProfile]);

  useEffect(() => {
    if (reduxProfile && !profile) {
      setProfile(reduxProfile);
      setEditData(reduxProfile);
      setLoadingProfile(false);
    }
  }, [reduxProfile, profile]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Initialize Clerk Edit Data when entering edit mode
  useEffect(() => {
    if (isEditing && clerkUser) {
      setClerkUpdates({
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
      });
      // Initialize validation/search fields
      setNationalitySearch(editData.nationality || '');
    }
  }, [isEditing, clerkUser, editData?.nationality]);

  const handleEditChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialLinkChange = (platform, value) => {
    setEditData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value,
      },
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      // Store file for backend upload (not Clerk)
      setProfileImageFile(file);
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Cover image size should be less than 5MB');
        return;
      }
      setCoverImageFile(file);
    }
  };

  const validateForm = () => {
    if (!editData.mobile || editData.mobile.length !== 10) return 'Mobile must be 10 digits';
    if (!editData.dob) return 'Date of Birth is required';
    if (!editData.gender) return 'Gender is required';
    if (!editData.nationality) return 'Nationality is required';
    if (!editData.languages || editData.languages.length === 0)
      return 'At least one language is required';
    if (!clerkUpdates.firstName) return 'First Name is required';

    // Check if user has typed an interest but not selected it
    if (interestSearch && interestSearch.trim().length > 0) {
        return 'Please select the interest from the dropdown or clear the search field';
    }

    return null;
  };

  const handleSave = async () => {
    const errorMsg = validateForm();
    if (errorMsg) {
      toast.error(errorMsg);
      return;
    }

    setIsSaving(true);
    try {
      // 1. Update Clerk name (if changed) - we keep name synced in Clerk for auth display
      if (
        clerkUpdates.firstName !== clerkUser.firstName ||
        clerkUpdates.lastName !== clerkUser.lastName
      ) {
        await clerkUser.update({
          firstName: clerkUpdates.firstName,
          lastName: clerkUpdates.lastName,
        });
      }

      // 2. Update Backend Data (include cover image and profile image files if selected)
      // Also update name in backend to keep in sync
      const newName = `${clerkUpdates.firstName} ${clerkUpdates.lastName}`.trim() || 'Anonymous';
      const profilePayload = {
        ...editData,
        name: newName,
        ...(coverImageFile && { coverImageFile }),
        ...(profileImageFile && { profileImageFile }),
      };
      const response = await updateProfile(profilePayload);
      setProfile(response.data);
      setIsEditing(false);
      setCoverImageFile(null);
      setProfileImageFile(null);
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData(profile);
    setIsEditing(false);
    setCoverImageFile(null);
    setProfileImageFile(null);
    setClerkUpdates({
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!isAuthLoaded || !isUserLoaded || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="text-center p-8 max-w-md bg-white rounded-xl shadow-lg">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">Unable to connect to the server.</p>
          <button
            onClick={() => loadProfile()}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profile && !isEditing) {
     // Fallback if not loading and no profile (should act handled by loadProfile redirect)
     return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 py-8 px-4 mt-20">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-xl overflow-visible mb-6 relative">
          {/* Cover Image Section */}
          <div className="h-32 rounded-t-3xl relative overflow-hidden group">
            {/* Cover Image Display */}
            {coverImageFile ? (
              <img
                src={URL.createObjectURL(coverImageFile)}
                alt="Cover Preview"
                className="w-full h-full object-cover"
              />
            ) : profile?.coverImage ? (
              <img
                src={profile.coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600" />
            )}

            {/* Edit Cover Image Overlay */}
            {isEditing && (
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <div className="flex items-center gap-2 text-white">
                  <ImagePlus size={24} />
                  <span className="font-medium">Change Cover</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverImageChange}
                />
              </label>
            )}
          </div>
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16">
              <div className="flex items-end gap-6 relative">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                    {/* Image Preview */}
                    {isEditing && profileImageFile ? (
                        <img
                         src={URL.createObjectURL(profileImageFile)}
                         alt="Preview"
                         className="w-full h-full object-cover"
                        />
                    ) : (
                         profile?.profileImage ? (
                        <img
                          src={profile.profileImage}
                          alt={profile?.name || 'Profile'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl text-orange-500 font-bold bg-orange-100">
                          {profile?.name?.[0]?.toUpperCase() || clerkUser?.firstName?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 p-2 bg-orange-500 text-white rounded-full cursor-pointer hover:bg-orange-600 shadow-lg transition-all">
                      <Camera size={18} />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>

                <div className="pb-2">
                    {isEditing ? (
                        <div className="flex gap-2 mb-1">
                             <input
                               type="text"
                               value={clerkUpdates.firstName}
                               onChange={(e) => setClerkUpdates(prev => ({...prev, firstName: e.target.value}))}
                               placeholder="First Name"
                               className="px-2 py-1 border rounded focus:ring-2 focus:ring-orange-500 w-32 font-bold text-xl"
                             />
                              <input
                               type="text"
                               value={clerkUpdates.lastName}
                               onChange={(e) => setClerkUpdates(prev => ({...prev, lastName: e.target.value}))}
                               placeholder="Last Name"
                               className="px-2 py-1 border rounded focus:ring-2 focus:ring-orange-500 w-32 font-bold text-xl"
                             />
                        </div>
                    ) : (
                         <h1 className="text-3xl font-bold text-gray-900">
                            {clerkUser?.fullName || 'User'}
                         </h1>
                    )}

                  <p className="text-gray-500 flex items-center gap-1">
                      {clerkUser?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </div>

              <div className="mt-4 md:mt-0">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-md"
                  >
                    <Edit2 size={18} />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      disabled={isSaving || isUpdatingRedux}
                      className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all shadow-md disabled:opacity-50"
                    >
                      <Save size={18} />
                      {(isSaving || isUpdatingRedux) ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all shadow-md"
                    >
                      <X size={18} />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* 1. Basic Info */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="text-orange-500" size={24} />
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Mobile</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editData.mobile || ''}
                    onChange={(e) => handleEditChange('mobile', e.target.value)}
                    maxLength={10}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile?.mobile}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-500">Gender</label>
                {isEditing ? (
                  <select
                    value={editData.gender || ''}
                    onChange={(e) => handleEditChange('gender', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    {GENDERS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900 font-medium">{profile?.gender}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar size={14} />
                  Date of Birth
                </label>
                {isEditing ? (
                     <input
                     type="date"
                     value={editData.dob ? new Date(editData.dob).toISOString().split('T')[0] : ''}
                     onChange={(e) => handleEditChange('dob', e.target.value)}
                     max={new Date().toISOString().split('T')[0]}
                     className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                   />
                ) : (
                    <p className="text-gray-900 font-medium">{formatDate(profile?.dob)}</p>
                )}
              </div>

              {/* Profile Visibility Toggle */}
              <div className="pt-4 border-t border-gray-200">
                <label className="text-sm text-gray-500 mb-2 block">Profile Visibility</label>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {(isEditing ? editData.profileVisibility : profile?.profileVisibility) === 'Public' ? (
                      <Eye className="w-5 h-5 text-green-500" />
                    ) : (
                      <EyeOff className="w-5 h-5 text-orange-500" />
                    )}
                    <span className="text-gray-900 font-medium">
                      {(isEditing ? editData.profileVisibility : profile?.profileVisibility) || 'Public'}
                    </span>
                  </div>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handleEditChange('profileVisibility', editData.profileVisibility === 'Public' ? 'Private' : 'Public')}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                        editData.profileVisibility === 'Public' ? 'bg-green-500' : 'bg-orange-500'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          editData.profileVisibility === 'Public' ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {(isEditing ? editData.profileVisibility : profile?.profileVisibility) === 'Public' 
                    ? 'Anyone can see your full profile' 
                    : 'Only friends can see your full profile'}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Travel & Location */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="text-orange-500" size={24} />
              Travel Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Travel Style</label>
                {isEditing ? (
                  <select
                    value={editData.travelStyle || 'Solo'}
                    onChange={(e) => handleEditChange('travelStyle', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    {TRAVEL_STYLES.map((style) => (
                      <option key={style} value={style}>{style}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900 font-medium">{profile?.travelStyle || 'Solo'}</p>
                )}
              </div>

              <div className="relative" ref={nationalityRef}>
                <label className="text-sm text-gray-500 flex items-center gap-1">
                  <Globe size={14} />
                  Nationality
                </label>
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={nationalitySearch}
                      onChange={(e) => {
                           setNationalitySearch(e.target.value);
                           setShowNationalityDropdown(true);
                           handleEditChange('nationality', ''); // Clear if typing
                      }}
                      onFocus={() => setShowNationalityDropdown(true)}
                      placeholder="Search Country"
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                     {showNationalityDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredCountries.map((c) => (
                          <button
                            key={c}
                            onClick={() => {
                              handleEditChange('nationality', c);
                              setNationalitySearch(c);
                              setShowNationalityDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-orange-50 text-gray-700"
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-900 font-medium">{profile?.nationality || 'Not Specified'}</p>
                )}
              </div>
            </div>
          </div>

          {/* 3. Bio & Interests */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Heart className="text-orange-500" size={24} />
              About & Interests
            </h2>
            <div className="mb-6">
                <label className="text-sm text-gray-500 mb-1 block">Bio</label>
                {isEditing ? (
                <textarea
                    value={editData.bio || ''}
                    onChange={(e) => handleEditChange('bio', e.target.value)}
                    rows={4}
                    maxLength={500}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
                ) : (
                <p className="text-gray-700">{profile?.bio || 'Not Updated Yet'}</p>
                )}
            </div>

            <div ref={interestRef} className="relative">
                <label className="text-sm text-gray-500 mb-2 block">Interests</label>
                {isEditing && (
                     <div className="mb-2">
                         <input
                          type="text"
                          value={interestSearch}
                          onChange={(e) => {
                            setInterestSearch(e.target.value);
                            setShowInterestDropdown(true);
                          }}
                          onFocus={() => setShowInterestDropdown(true)}
                          placeholder="Add Interest..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                         {showInterestDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {filteredInterests.map((interest) => (
                              <button
                                key={interest}
                                onClick={() => {
                                  if (!editData.interests?.includes(interest)) {
                                    handleEditChange('interests', [...(editData.interests || []), interest]);
                                  }
                                  setInterestSearch('');
                                  setShowInterestDropdown(false);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-orange-50 text-gray-700"
                              >
                                {interest}
                              </button>
                            ))}
                          </div>
                        )}
                     </div>
                )}

                <div className="flex flex-wrap gap-2">
                    {((isEditing ? editData.interests : profile?.interests) || []).map((interest, index) => (
                        <span key={index} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm flex items-center gap-1">
                            {interest}
                             {isEditing && (
                                <button
                                 onClick={() => {
                                     const newInterests = editData.interests.filter(i => i !== interest);
                                     handleEditChange('interests', newInterests);
                                 }}
                                 className="hover:text-red-500"
                                >
                                    <X size={14} />
                                </button>
                             )}
                        </span>
                    ))}
                    {(!profile?.interests?.length && !isEditing) && <span className="text-gray-500">No interests added</span>}
                </div>
            </div>
          </div>

          {/* 4. Languages */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Languages className="text-orange-500" size={24} />
              Languages
            </h2>

            {isEditing && (
                <div className="flex flex-col gap-2 mb-4" ref={languageRef}>
                    <div className="relative">
                         <input
                            type="text"
                            value={languageSearch}
                            onChange={(e) => {
                                setLanguageSearch(e.target.value);
                                setShowLanguageDropdown(true);
                                setNewLanguage(p => ({...p, name: ''}));
                            }}
                            onFocus={() => setShowLanguageDropdown(true)}
                            placeholder="Select Language"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                        {showLanguageDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {filteredLanguages.map((l) => (
                              <button
                                key={l}
                                onClick={() => {
                                  setNewLanguage(prev => ({ ...prev, name: l }));
                                  setLanguageSearch(l);
                                  setShowLanguageDropdown(false);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-orange-50 text-gray-700"
                              >
                                {l}
                              </button>
                            ))}
                          </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <select
                         value={newLanguage.level}
                         onChange={(e) => setNewLanguage(prev => ({ ...prev, level: e.target.value }))}
                         className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        >
                            {LANGUAGE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                         <button
                          onClick={() => {
                              if (newLanguage.name) {
                                  if (editData.languages?.some(l => l.name === newLanguage.name)) {
                                      toast.error(`${newLanguage.name} is already added`);
                                  } else {
                                      handleEditChange('languages', [...(editData.languages || []), newLanguage]);
                                      setNewLanguage({ name: '', level: 'Beginner' });
                                      setLanguageSearch('');
                                  }
                              }
                          }}
                          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                         >Add</button>
                     </div>
                 </div>
             )}

            <div className="space-y-2">
              {((isEditing ? editData.languages : profile?.languages) || []).map((lang, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                  <div className="flex items-center gap-2">
                      <span className="text-gray-900 font-medium">{lang.name}</span>
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs">
                        {lang.level}
                      </span>
                  </div>
                  {isEditing && (
                      <button
                       onClick={() => {
                           const newLangs = editData.languages.filter((_, i) => i !== index);
                           handleEditChange('languages', newLangs);
                       }}
                       className="text-gray-400 hover:text-red-500"
                      >
                          <X size={16} />
                      </button>
                  )}
                </div>
              ))}
              {(!profile?.languages?.length && !isEditing) && <span className="text-gray-500">No languages added</span>}
            </div>
          </div>

          {/* 5. Social Links */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
             <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="text-orange-500" size={24} />
              Social Links
            </h2>
            <div className="space-y-3">
                 {/* Instagram */}
                 <div className="flex items-center gap-3">
                      <Instagram size={20} className="text-pink-500" />
                      {isEditing ? (
                          <input
                           type="text"
                           value={editData.socialLinks?.instagram || ''}
                           onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                           placeholder="Instagram Profile URL"
                           className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                      ) : (
                          profile?.socialLinks?.instagram ? (
                              <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                                  {profile.socialLinks.instagram}
                              </a>
                          ) : <span className="text-gray-400">Not set</span>
                      )}
                 </div>

                 {/* Facebook */}
                 <div className="flex items-center gap-3">
                      <Facebook size={20} className="text-blue-600" />
                      {isEditing ? (
                          <input
                           type="text"
                           value={editData.socialLinks?.facebook || ''}
                           onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                           placeholder="Facebook Profile URL"
                           className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                      ) : (
                          profile?.socialLinks?.facebook ? (
                              <a href={profile.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                                  {profile.socialLinks.facebook}
                              </a>
                          ) : <span className="text-gray-400">Not set</span>
                      )}
                 </div>

                 {/* LinkedIn */}
                 <div className="flex items-center gap-3">
                      <Linkedin size={20} className="text-blue-700" />
                      {isEditing ? (
                          <input
                           type="text"
                           value={editData.socialLinks?.linkedin || ''}
                           onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                           placeholder="LinkedIn Profile URL"
                           className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                      ) : (
                          profile?.socialLinks?.linkedin ? (
                              <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                                  {profile.socialLinks.linkedin}
                              </a>
                          ) : <span className="text-gray-400">Not set</span>
                      )}
                 </div>

                 {/* Twitter */}
                 <div className="flex items-center gap-3">
                      <Twitter size={20} className="text-blue-400" />
                      {isEditing ? (
                          <input
                           type="text"
                           value={editData.socialLinks?.twitter || ''}
                           onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                           placeholder="Twitter Profile URL"
                           className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                      ) : (
                          profile?.socialLinks?.twitter ? (
                              <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                                  {profile.socialLinks.twitter}
                              </a>
                          ) : <span className="text-gray-400">Not set</span>
                      )}
                 </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
