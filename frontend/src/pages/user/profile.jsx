import { useAuth, useUser } from '@clerk/clerk-react';
import { Autocomplete } from '@react-google-maps/api';
import {
    Briefcase,
    Calendar,
    Camera,
    CreditCard,
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
    Map as MapIcon,
    MapPin,
    PartyPopper,
    Plus,
    Save,
    Search,
    Sparkles,
    Trash2,
    Twitter,
    User,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { useGoogleMaps } from '../../context/GoogleMapsContext';
import {
    COUNTRIES,
    GENDERS,
    INTERESTS,
    LANGUAGE_LEVELS,
    LANGUAGES,
    TRAVEL_STYLES,
} from '../../data/enums';
import { useUserActions } from '../../redux/hooks/useUser';
import { fetchJoinedActivities, fetchMyCreatedActivities } from '../../redux/slices/userActivitySlice';

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
    const { isSignedIn, isLoaded: isAuthLoaded, getToken } = useAuth();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {
        profile: reduxProfile,
        fetchProfile,
        updateProfile,
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
    const [_showNationalityDropdown, setShowNationalityDropdown] = useState(false);
    const [languageSearch, setLanguageSearch] = useState('');
    const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
    const [newLanguage, setNewLanguage] = useState({ name: '', level: 'Beginner' });
    const [interestSearch, setInterestSearch] = useState('');
    const [showInterestDropdown, setShowInterestDropdown] = useState(false);

    // Future Destination Input
    const [pendingDestination, setPendingDestination] = useState(null); // { name, coordinates }
    const destinationAutocompleteRef = useRef(null);

    const nationalityRef = useRef(null);
    const languageRef = useRef(null);
    const interestRef = useRef(null);

    // Google Maps
    const { isLoaded: isGoogleMapsLoaded } = useGoogleMaps();

    // Destination Autocomplete Handlers
    const onDestinationAutocompleteLoad = (autocomplete) => {
        destinationAutocompleteRef.current = autocomplete;
    };

    const onDestinationPlaceChanged = () => {
        const place = destinationAutocompleteRef.current?.getPlace();
        if (place?.geometry?.location) {
            const destData = {
                name: place.formatted_address || place.name || '',
                coordinates: [place.geometry.location.lng(), place.geometry.location.lat()]
            };
            setPendingDestination(destData);
        }
    };

    // Filter lists
    const _filteredCountries = COUNTRIES.filter((c) =>
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

    // Fetch created and joined activities
    useEffect(() => {
        if (isSignedIn && clerkUser) {
            const fetchActivities = async () => {
                const token = await getToken();
                dispatch(fetchMyCreatedActivities(() => Promise.resolve(token)));
                dispatch(fetchJoinedActivities(() => Promise.resolve(token)));
            };
            fetchActivities();
        }
    }, [isSignedIn, clerkUser, dispatch, getToken]);

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

    const handleAddDestination = () => {
        if (pendingDestination && pendingDestination.name) {
            const currentDestinations = editData.futureDestinations || [];
            handleEditChange('futureDestinations', [...currentDestinations, pendingDestination]);
            setPendingDestination(null);
            // Clear the autocomplete input
            const input = document.querySelector('#destination-autocomplete-input');
            if (input) input.value = '';
        } else {
            toast.error('Please select a destination from the dropdown');
        }
    };

    const handleRemoveDestination = (index) => {
        const currentDestinations = editData.futureDestinations || [];
        const updatedDestinations = currentDestinations.filter((_, i) => i !== index);
        handleEditChange('futureDestinations', updatedDestinations);
    };


    const validateForm = () => {
        if (!editData.mobile || editData.mobile.length !== 10) return 'Mobile must be 10 digits';
        if (!editData.dob) return 'Date of Birth is required';
        if (!editData.gender) return 'Gender is required';
        if (!editData.nationality) return 'Nationality is required';
        if (!editData.languages || editData.languages.length === 0)
            return 'At least one language is required';
        if (!clerkUpdates.firstName) return 'First Name is required';

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
            if (
                clerkUpdates.firstName !== clerkUser.firstName ||
                clerkUpdates.lastName !== clerkUser.lastName
            ) {
                await clerkUser.update({
                    firstName: clerkUpdates.firstName,
                    lastName: clerkUpdates.lastName,
                });
            }

            const newName = `${clerkUpdates.firstName} ${clerkUpdates.lastName}`.trim() || 'Anonymous';
            // Ensure complex objects are stringified for FormData if utilizing the controller's expectation 
            // strictly, but the redux action `updateProfile` typically handles FormData conversion.
            // Assuming `updateProfile` accepts the object and converts it to FormData if files exist,
            // or sends JSON if no files. The controller handles both but specifically parses JSON strings
            // for multipart/form-data.

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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (connectionError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
        return null;
    }

    // --- UI Components ---

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 mt-16 font-sans">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* TOP SECTION: Cover & Profile Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative group">
                    {/* Cover Image */}
                    <div className="h-48 relative bg-gradient-to-r from-orange-400 to-orange-600">
                        {(coverImageFile || profile?.coverImage) ? (
                            <img
                                src={coverImageFile ? URL.createObjectURL(coverImageFile) : profile.coverImage}
                                alt="Cover"
                                className="w-full h-full object-cover"
                            />
                        ) : null}

                        {isEditing && (
                            <label className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                                    <ImagePlus size={18} className="text-gray-700" />
                                    <span className="font-medium text-gray-700">Change Cover</span>
                                </div>
                                <input type="file" accept="image/*" className="hidden" onChange={handleCoverImageChange} />
                            </label>
                        )}
                    </div>

                    {/* Profile Info Section */}
                    <div className="px-6 py-5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            {/* Left: Avatar + Name */}
                            <div className="flex items-center gap-4">
                                {/* Avatar */}
                                <div className="relative w-20 h-20 rounded-full border-4 border-white shadow-lg bg-white overflow-hidden group/avatar -mt-14">
                                    {(profileImageFile || profile?.profileImage) ? (
                                        <img
                                            src={profileImageFile ? URL.createObjectURL(profileImageFile) : profile.profileImage}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-orange-100 text-orange-500 font-bold text-2xl">
                                            {profile?.name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                    )}

                                    {isEditing && (
                                        <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer">
                                            <Camera size={18} className="text-white" />
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                        </label>
                                    )}
                                </div>

                                {/* Name & Location */}
                                <div>
                                    {isEditing ? (
                                        <div className="flex gap-2">
                                            <input
                                                value={clerkUpdates.firstName}
                                                onChange={(e) => setClerkUpdates(prev => ({ ...prev, firstName: e.target.value }))}
                                                className="text-xl font-bold border-b-2 border-orange-200 focus:border-orange-500 outline-none bg-transparent w-28"
                                                placeholder="First Name"
                                            />
                                            <input
                                                value={clerkUpdates.lastName}
                                                onChange={(e) => setClerkUpdates(prev => ({ ...prev, lastName: e.target.value }))}
                                                className="text-xl font-bold border-b-2 border-orange-200 focus:border-orange-500 outline-none bg-transparent w-28"
                                                placeholder="Last Name"
                                            />
                                        </div>
                                    ) : (
                                        <h1 className="text-2xl font-bold text-gray-900">{profile?.name || 'Anonymous User'}</h1>
                                    )}
                                    <div className="flex items-center gap-2 text-gray-500 text-sm mt-0.5">
                                        <MapPin size={14} />
                                        <span>{profile?.nationality || 'Global Citizen'}</span>
                                        <span className="mx-1">•</span>
                                        <span>{profile?.gender || 'Human'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Edit Button */}
                            <div className="flex items-center gap-3">
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-2 px-5 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
                                    >
                                        <Edit2 size={14} />
                                        Edit Profile
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleCancel}
                                            className="px-5 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="px-5 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                        >
                                            <Save size={14} />
                                            Save Changes
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                            <div className="flex items-center gap-1.5">
                                <Calendar size={14} className="text-gray-400" />
                                <span>Member since <strong className="text-gray-700">{profile?.createdAt ? new Date(profile.createdAt).getFullYear() : 'N/A'}</strong></span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <PartyPopper size={14} className="text-gray-400" />
                                <span><strong className="text-gray-700">{(profile?.JoinActivity || []).filter(a => a.createdBy?._id !== profile?._id && a.createdBy !== profile?._id).length}</strong> Activities joined</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Sparkles size={14} className="text-gray-400" />
                                <span><strong className="text-gray-700">{(profile?.JoinActivity || []).filter(a => a.createdBy?._id === profile?._id || a.createdBy === profile?._id).length}</strong> Activities created</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MAIN GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* About Me */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
                                <span className="bg-yellow-100 p-2 rounded-lg text-yellow-600"><User size={20} /></span>
                                About Me
                            </h3>
                            {isEditing ? (
                                <textarea
                                    value={editData.bio || ''}
                                    onChange={(e) => handleEditChange('bio', e.target.value)}
                                    rows={4}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                                    placeholder="Tell us about yourself..."
                                />
                            ) : (
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    {profile?.bio || 'No bio yet.'}
                                </p>
                            )}
                        </div>

                        {/* Personal Details */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
                                <span className="bg-blue-100 p-2 rounded-lg text-blue-600"><Briefcase size={20} /></span>
                                Personal Details
                            </h3>

                            <div className="space-y-4 text-sm">
                                <div>
                                    <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">Mobile</p>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            value={editData.mobile || ''}
                                            onChange={(e) => handleEditChange('mobile', e.target.value)}
                                            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg"
                                        />
                                    ) : (
                                        <p className="font-medium text-gray-800">{profile?.mobile}</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">Date of Birth</p>
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            value={editData.dob ? new Date(editData.dob).toISOString().split('T')[0] : ''}
                                            onChange={(e) => handleEditChange('dob', e.target.value)}
                                            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg"
                                        />
                                    ) : (
                                        <p className="font-medium text-gray-800">{formatDate(profile?.dob)}</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">Gender</p>
                                    {isEditing ? (
                                        <select
                                            value={editData.gender || ''}
                                            onChange={(e) => handleEditChange('gender', e.target.value)}
                                            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg"
                                        >
                                            {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                    ) : (
                                        <p className="font-medium text-gray-800">{profile?.gender}</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">Visibility</p>
                                    <div className="flex items-center gap-2">
                                        {((isEditing ? editData.profileVisibility : profile?.profileVisibility) === 'Public')
                                            ? <Globe size={14} className="text-green-500" />
                                            : <EyeOff size={14} className="text-orange-500" />}
                                        <span className="font-medium text-gray-800">
                                            {isEditing ? editData.profileVisibility : profile?.profileVisibility}
                                        </span>
                                        {isEditing && (
                                            <button
                                                onClick={() => handleEditChange('profileVisibility', editData.profileVisibility === 'Public' ? 'Private' : 'Public')}
                                                className="ml-auto text-xs text-blue-600 hover:underline"
                                            >
                                                Change
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Connections */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
                                <span className="bg-purple-100 p-2 rounded-lg text-purple-600"><Globe size={20} /></span>
                                Social Connections
                            </h3>
                            <div className="space-y-3">
                                {/* Instagram */}
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-500"><Instagram size={16} /></div>
                                    {isEditing ? (
                                        <input
                                            value={editData.socialLinks?.instagram || ''}
                                            onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                                            placeholder="Instagram URL"
                                            className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                        />
                                    ) : (
                                        profile?.socialLinks?.instagram ? <a href={profile.socialLinks.instagram} target="_blank" className="text-sm hover:underline truncate flex-1">{profile.socialLinks.instagram}</a> : <span className="text-sm text-gray-400">Not connected</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><Facebook size={16} /></div>
                                    {isEditing ? (
                                        <input
                                            value={editData.socialLinks?.facebook || ''}
                                            onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                                            placeholder="Facebook URL"
                                            className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                        />
                                    ) : (
                                        profile?.socialLinks?.facebook ? <a href={profile.socialLinks.facebook} target="_blank" className="text-sm hover:underline truncate flex-1">{profile.socialLinks.facebook}</a> : <span className="text-sm text-gray-400">Not connected</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-700"><Linkedin size={16} /></div>
                                    {isEditing ? (
                                        <input
                                            value={editData.socialLinks?.linkedin || ''}
                                            onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                                            placeholder="LinkedIn URL"
                                            className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                        />
                                    ) : (
                                        profile?.socialLinks?.linkedin ? <a href={profile.socialLinks.linkedin} target="_blank" className="text-sm hover:underline truncate flex-1">{profile.socialLinks.linkedin}</a> : <span className="text-sm text-gray-400">Not connected</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center text-sky-500"><Twitter size={16} /></div>
                                    {isEditing ? (
                                        <input
                                            value={editData.socialLinks?.twitter || ''}
                                            onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                                            placeholder="Twitter URL"
                                            className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                        />
                                    ) : (
                                        profile?.socialLinks?.twitter ? <a href={profile.socialLinks.twitter} target="_blank" className="text-sm hover:underline truncate flex-1">{profile.socialLinks.twitter}</a> : <span className="text-sm text-gray-400">Not connected</span>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Subscription Plan Card */}
                        <div className="bg-gray-900 rounded-3xl p-6 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                            <h3 className="flex items-center gap-2 font-semibold mb-6 relative z-10">
                                <CreditCard size={20} />
                                Subscription Plan
                            </h3>
                            <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                                <div>
                                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Current Plan</p>
                                    <p className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
                                        {profile?.planType || 'Free Tier'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Activities Left</p>
                                    <p className="text-2xl font-bold">
                                        {['Monthly', 'Yearly'].includes(profile?.planType) ? (
                                            'Unlimited'
                                        ) : (
                                            <>
                                                {profile?.remainingActivityCount || 0} <span className="text-sm font-normal text-gray-500">/ 5</span>
                                            </>
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Valid Until</p>
                                    <p className="text-xl font-bold">{profile?.planEndDate ? formatDate(profile.planEndDate) : 'Forever'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Local Guide Section */}
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full -mr-12 -mt-12 pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full -ml-8 -mb-8 pointer-events-none"></div>

                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
                                <div>
                                    <h3 className="flex items-center gap-2 font-semibold text-lg mb-2">
                                        <MapPin size={20} />
                                        Local Guide
                                    </h3>
                                    <p className="text-indigo-200 text-sm max-w-md">
                                        {profile?.isLocalGuide
                                            ? "You're a local guide! Manage bookings and share your expertise with travelers."
                                            : "Share your local knowledge and earn by guiding travelers around your city."
                                        }
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    {profile?.isLocalGuide ? (
                                        <>
                                            <button
                                                onClick={() => navigate('/guide-dashboard')}
                                                className="px-5 py-2.5 bg-white text-indigo-700 text-sm font-semibold rounded-lg hover:bg-indigo-50 transition-colors"
                                            >
                                                Dashboard
                                            </button>
                                            <button
                                                onClick={() => navigate('/my-guide-bookings')}
                                                className="px-5 py-2.5 bg-indigo-500/30 text-white text-sm font-semibold rounded-lg hover:bg-indigo-500/40 transition-colors border border-indigo-400/30"
                                            >
                                                My Bookings
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => navigate('/guide-setup')}
                                            className="px-6 py-2.5 bg-white text-indigo-700 text-sm font-semibold rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2"
                                        >
                                            <Sparkles size={16} />
                                            Become a Guide
                                        </button>
                                    )}
                                </div>
                            </div>

                            {profile?.isLocalGuide && (
                                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-indigo-400/20 relative z-10">
                                    <div className="flex items-center gap-2 bg-indigo-500/20 px-3 py-1.5 rounded-full">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                        <span className="text-xs font-medium">Active Guide</span>
                                    </div>
                                    <button
                                        onClick={() => navigate('/guides')}
                                        className="text-xs text-indigo-200 hover:text-white transition-colors"
                                    >
                                        Browse Other Guides →
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Future Destinations */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
                                <span className="bg-green-100 p-2 rounded-lg text-green-600"><MapIcon size={20} /></span>
                                Future Destinations
                            </h3>

                            {isEditing && (
                                <div className="flex gap-2 mb-4">
                                    {isGoogleMapsLoaded ? (
                                        <Autocomplete
                                            onLoad={onDestinationAutocompleteLoad}
                                            onPlaceChanged={onDestinationPlaceChanged}
                                            className="flex-1"
                                        >
                                            <div className="relative">
                                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    id="destination-autocomplete-input"
                                                    type="text"
                                                    placeholder="Search for a destination..."
                                                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                                                />
                                            </div>
                                        </Autocomplete>
                                    ) : (
                                        <input
                                            type="text"
                                            placeholder="Loading places..."
                                            disabled
                                            className="flex-1 p-2 bg-gray-100 border border-gray-200 rounded-lg outline-none text-gray-400"
                                        />
                                    )}
                                    <button
                                        onClick={handleAddDestination}
                                        disabled={!pendingDestination}
                                        className={`p-2 rounded-lg transition-colors ${pendingDestination ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {((isEditing ? editData.futureDestinations : profile?.futureDestinations) || []).map((dest, idx) => (
                                    <div key={idx} className="bg-gray-50 p-3 rounded-xl flex items-center justify-between group">
                                        <span className="font-medium text-gray-700">{dest.name}</span>
                                        {isEditing && (
                                            <button onClick={() => handleRemoveDestination(idx)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {(!(isEditing ? editData.futureDestinations : profile?.futureDestinations)?.length) && (
                                    <div className="col-span-full py-8 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                                        <MapIcon size={32} className="mx-auto mb-2 opacity-50" />
                                        <p>No future destinations added yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Interests & Languages Row */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Interests */}
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                                <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
                                    <span className="bg-red-100 p-2 rounded-lg text-red-600"><Heart size={20} /></span>
                                    Interests
                                </h3>

                                {isEditing && (
                                    <div className="relative mb-3" ref={interestRef}>
                                        <input
                                            value={interestSearch}
                                            onChange={(e) => {
                                                setInterestSearch(e.target.value);
                                                setShowInterestDropdown(true);
                                            }}
                                            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                            placeholder="Search interests..."
                                            onFocus={() => setShowInterestDropdown(true)}
                                        />
                                        {showInterestDropdown && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-40 overflow-y-auto">
                                                {filteredInterests.map(i => (
                                                    <button key={i} onClick={() => {
                                                        if (!editData.interests?.includes(i)) {
                                                            handleEditChange('interests', [...(editData.interests || []), i]);
                                                        }
                                                        setInterestSearch('');
                                                        setShowInterestDropdown(false);
                                                    }} className="w-full text-left px-3 py-2 hover:bg-orange-50 text-sm">
                                                        {i}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-2">
                                    {((isEditing ? editData.interests : profile?.interests) || []).map((interest, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium flex items-center gap-1">
                                            {interest}
                                            {isEditing && <button onClick={() => handleEditChange('interests', editData.interests.filter(i => i !== interest))} className="hover:text-red-500"><X size={12} /></button>}
                                        </span>
                                    ))}
                                    {!profile?.interests?.length && !isEditing && <span className="text-gray-400 text-sm italic">No interests added.</span>}
                                </div>
                            </div>

                            {/* Languages */}
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                                <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
                                    <span className="bg-indigo-100 p-2 rounded-lg text-indigo-600"><Languages size={20} /></span>
                                    Languages
                                </h3>

                                {isEditing && (
                                    <div className="flex gap-2 mb-3" ref={languageRef}>
                                        <div className="relative flex-1">
                                            <input
                                                value={languageSearch}
                                                onChange={(e) => {
                                                    setLanguageSearch(e.target.value);
                                                    setShowLanguageDropdown(true);
                                                }}
                                                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                                placeholder="Language"
                                                onFocus={() => setShowLanguageDropdown(true)}
                                            />
                                            {showLanguageDropdown && (
                                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-40 overflow-y-auto">
                                                    {filteredLanguages.map(l => (
                                                        <button key={l} onClick={() => {
                                                            setNewLanguage(p => ({ ...p, name: l }));
                                                            setLanguageSearch(l);
                                                            setShowLanguageDropdown(false);
                                                        }} className="w-full text-left px-3 py-2 hover:bg-orange-50 text-sm">{l}</button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <select
                                            value={newLanguage.level}
                                            onChange={(e) => setNewLanguage(p => ({ ...p, level: e.target.value }))}
                                            className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm w-24"
                                        >
                                            {LANGUAGE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                        </select>
                                        <button
                                            onClick={() => {
                                                if (newLanguage.name && !editData.languages?.some(l => l.name === newLanguage.name)) {
                                                    handleEditChange('languages', [...(editData.languages || []), newLanguage]);
                                                    setLanguageSearch('');
                                                    setNewLanguage({ name: '', level: 'Beginner' });
                                                }
                                            }}
                                            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    {((isEditing ? editData.languages : profile?.languages) || []).map((lang, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-800">{lang.name}</span>
                                                <span className="px-1.5 py-0.5 bg-white border border-gray-200 text-xs rounded text-gray-500">{lang.level}</span>
                                            </div>
                                            {isEditing && <button onClick={() => handleEditChange('languages', editData.languages.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500"><X size={14} /></button>}
                                        </div>
                                    ))}
                                    {!profile?.languages?.length && !isEditing && <span className="text-gray-400 text-sm italic">No languages.</span>}
                                </div>
                            </div>
                        </div>

                        {/* Created Activities */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                                    <span className="bg-purple-100 p-2 rounded-lg text-purple-600"><Sparkles size={20} /></span>
                                    Created Activities
                                </h3>
                                {(profile?.JoinActivity || []).filter(a => a.createdBy?._id === profile?._id || a.createdBy === profile?._id).length > 2 && (
                                    <button
                                        onClick={() => navigate('/my-activities')}
                                        className="text-sm text-orange-600 hover:text-orange-700 font-medium hover:underline"
                                    >
                                        View All →
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(profile?.JoinActivity || [])
                                    .filter(activity => activity.createdBy?._id === profile?._id || activity.createdBy === profile?._id)
                                    .slice(0, 2)
                                    .map((activity) => (
                                        <div key={activity._id} onClick={() => navigate(`/activity/${activity._id}`)} className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow group cursor-pointer">
                                            <div className="h-32 bg-gray-200 relative">
                                                {activity.photos?.[0] ? (
                                                    <img src={activity.photos[0]} alt={activity.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                                                        <Sparkles className="text-purple-300" size={32} />
                                                    </div>
                                                )}
                                                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-gray-800">
                                                    {new Date(activity.date).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <h4 className="font-bold text-gray-900 truncate">{activity.title}</h4>
                                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                    <Calendar size={12} />
                                                    <span>{activity.category || 'General'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                {!(profile?.JoinActivity || []).filter(a => a.createdBy?._id === profile?._id || a.createdBy === profile?._id).length && (
                                    <div className="col-span-full py-8 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                                        <Sparkles className="mx-auto mb-2 opacity-50" size={32} />
                                        <p>No created activities yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Joined Activities */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                                    <span className="bg-orange-100 p-2 rounded-lg text-orange-600"><PartyPopper size={20} /></span>
                                    Joined Activities
                                </h3>
                                {(profile?.JoinActivity || []).filter(a => a.createdBy?._id !== profile?._id && a.createdBy !== profile?._id).length > 2 && (
                                    <button
                                        onClick={() => navigate('/joined-activities')}
                                        className="text-sm text-orange-600 hover:text-orange-700 font-medium hover:underline"
                                    >
                                        View All →
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(profile?.JoinActivity || [])
                                    .filter(activity => activity.createdBy?._id !== profile?._id && activity.createdBy !== profile?._id)
                                    .slice(0, 2)
                                    .map((activity) => (
                                        <div key={activity._id} onClick={() => navigate(`/activity/${activity._id}`)} className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow group cursor-pointer">
                                            <div className="h-32 bg-gray-200 relative">
                                                {activity.photos?.[0] ? (
                                                    <img src={activity.photos[0]} alt={activity.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                                                        <PartyPopper className="text-orange-300" size={32} />
                                                    </div>
                                                )}
                                                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-gray-800">
                                                    {new Date(activity.date).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <h4 className="font-bold text-gray-900 truncate">{activity.title}</h4>
                                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                    <Calendar size={12} />
                                                    <span>{activity.category || 'General'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                {!(profile?.JoinActivity || []).filter(a => a.createdBy?._id !== profile?._id && a.createdBy !== profile?._id).length && (
                                    <div className="col-span-full py-8 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                                        <PartyPopper className="mx-auto mb-2 opacity-50" size={32} />
                                        <p>No joined activities yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}