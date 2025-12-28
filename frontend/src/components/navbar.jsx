import { SignedIn, SignedOut, useAuth,useClerk, useUser } from '@clerk/clerk-react';
import {
  Activity,
  Bed,
  Bell,
  BookOpen,
  Bot,
  Calendar,
  CalendarDays,
  Camera,
  ChevronDown,
  Compass,
  Globe,
  Image,
  Info,
  Landmark,
  Link,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  Plane,
  Plus,
  Settings,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  Trash2,
  Upload,
  User,
  Users,
  UtensilsCrossed,
  X} from 'lucide-react';
import  { useEffect, useRef,useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation,useNavigate } from 'react-router-dom';

import { useSocketContext } from '../context/socketContext';
import ReverseGeocode from '../helpers/reverseGeoCode';
import { fetchMyGuideProfile } from '../redux/slices/guideSlice';
import { fetchProfile } from '../redux/slices/userSlice';
import { fetchNotifications, addNotification } from '../redux/slices/notificationSlice';
import NotificationDropdown from './notifications/NotificationDropdown';



function NavBar() {
  const { socket } = useSocketContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [expandedMobileMenu, setExpandedMobileMenu] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const profileMenuRef = useRef(null);

  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();

  const dispatch = useDispatch();
  const { profile: userProfile } = useSelector((state) => state.user);
  const { myGuideProfile } = useSelector((state) => state.guide);
  const { unreadCount } = useSelector((state) => state.notifications);

  useEffect(() => {
    if (isSignedIn) {
      dispatch(fetchProfile({ getToken }));
      dispatch(fetchMyGuideProfile({ getToken }));
      dispatch(fetchNotifications(getToken));
    }
  }, [isSignedIn, dispatch, getToken]);

  // Listen for real-time notifications
  useEffect(() => {
    if (socket && isSignedIn) {
      socket.on("newNotification", (notification) => {
        dispatch(addNotification(notification));

        // Play notification sound
        try {
          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
          audio.volume = 0.5;
          audio.play().catch(e => console.log("Audio play failed (user interaction required):", e));
        } catch (error) {
          console.log("Audio error", error);
        }

        // Don't show toast for self-actions as they usually have their own success feedback
        if (notification.type === 'ACTIVITY_CREATED_SELF' || notification.type === 'ACTIVITY_CANCELLED_SELF' || notification.type === 'ACTIVITY_DELETED_SELF') return;

        toast.custom((t) => (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
            onClick={() => navigate('/notifications')}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <img
                    className="h-10 w-10 rounded-full"
                    src={notification.sender?.profileImage || "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"}
                    alt=""
                  />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    New Notification
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {notification.message}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Close
              </button>
            </div>
          </div>
        ));
      });

      return () => {
        socket.off("newNotification");
      };
    }
  }, [socket, isSignedIn, dispatch, navigate]);



  const { signOut } = useClerk();




  // Derive user display values - prefer data from backend profile, fallback to Clerk
  const userImage = userProfile?.profileImage || user?.imageUrl;
  const userDisplayName = userProfile?.name || user?.fullName || user?.firstName || 'User';
  const userEmail = userProfile?.email || user?.primaryEmailAddress?.emailAddress || '';



  const [currentLocationName, setCurrentLocationName] = useState('Locating...');




  // Scroll visibility logic
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isSignedIn) return;

    const updateLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

             // 1. Get readable address for UI
            try {
               const address = await ReverseGeocode({ lat: latitude, lng: longitude });
               console.log('address', address);

               setCurrentLocationName(address);
            } catch {
               setCurrentLocationName("Unknown Location");
            }

            // 2. Emit location to backend via socket
            if (socket) {
              socket.emit("updateLocation", { lat: latitude, lng: longitude });
            }
          },
          (error) => {
            console.error("Error getting location:", error);
            setCurrentLocationName("Location Unavailable");
          },
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
        );
      } else {
        setCurrentLocationName("Geolocation not supported");
      }
    };

    // Initial update
    updateLocation();

    // Update every 1 minute
    const intervalId = setInterval(updateLocation, 60000);

    return () => clearInterval(intervalId);
  }, [isSignedIn, socket]);

  const handleLogin = (path) => {
    navigate(path);
  };
  const handleRegister = (path) => {
    navigate(path);
  };
  const handleNavigation = (path) => {
    navigate(path);
    setIsProfileMenuOpen(false);
  };
  const handleCreateActivity = () => {
  const hasActivePlan =
  userProfile && (userProfile.planType === "Monthly" || userProfile.planType === "Yearly") &&
  new Date(userProfile.planEndDate) > new Date();

  if(hasActivePlan){
    navigate('/create-activity');
    setIsProfileMenuOpen(false);
  }else{
    navigate('/subscription');
    setIsProfileMenuOpen(false);
  }
  };
  const handleLogout = async () => {
    await signOut();
    toast.success('Logout successful');
    setIsProfileMenuOpen(false);
    navigate('/sign-in');
  };


  const navLinks = [
    {name:'Read Article',path:'/read-article',icon:BookOpen},
    { name: 'Ai Buddy', path: '/ai-buddy', icon: Bot },
    {
      name: 'Map',
      path: '/map',
      icon: MapPin,
      children: [
        { name: 'Nearby Traveller', path: '/map', icon: Users },
        { name: 'Nearby Activities', path: '/map/nearby-activities', icon: Activity },
        { name: 'Near Hotels', path: '/map/hotels', icon: Bed },
        { name: 'Tourist Places', path: '/map/tourist-places', icon: Landmark },
        { name: 'Food & Nightlife', path: '/map/food-nightlife', icon: UtensilsCrossed },
        { name: 'Shopping', path: '/map/shopping', icon: ShoppingBag },
        { name: 'Emergency', path: '/map/emergency', icon: ShieldAlert },
        { name: 'Transport', path: '/map/transport', icon: Plane },
      ]
    },
    { name: 'Traveler Posts', path: '/user-posts', icon: Camera },
    { name: 'Activities', path: '/activities', icon: Calendar },
    { name: 'Local Guides', path: '/guides', icon: Compass },

  ];

  const profileTabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'posts', label: 'Posts', icon: Camera },
    { id: 'articles', label: 'Articles', icon: BookOpen },
  ];

  const profileContent = {
    profile: [
      { name: 'My Profile', path: '/profile', icon: User },
      { name: 'Connections', path: '/connections', icon: Link },
      ...(myGuideProfile
        ? [{ name: 'Guide Dashboard', path: '/guide-dashboard', icon: Compass }]
        : [{ name: 'Become a Guide', path: '/guide-setup', icon: Compass }]
      ),
    ],
    activity: [
      { name: 'Joined Activities', path: '/joined-activities', icon: Activity },
      { name: 'My Activities', path: '/my-activities', icon: Calendar },
      { name: 'My Guide Bookings', path: '/my-guide-bookings', icon: CalendarDays },
    ],
    posts: [
      { name: 'Upload Post', path: '/upload-post', icon: Upload },
      { name: 'Manage Post', path: '/manage-posts', icon: Image },
    ],
    articles: [
      { name: 'Upload Article', path: '/upload-article', icon: Upload },
      { name: 'Manage Article', path: '/manage-article', icon: Image },
    ],
  };

  return (
    <div className={`fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none transition-all duration-500 ease-in-out ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-[150%] opacity-0'}`}>
    <nav className="w-full pointer-events-auto bg-white/80 backdrop-blur-xl shadow-lg border border-gray-100/50 rounded-2xl transition-all duration-300">
      <div className="px-2 sm:px-3 md:px-4 lg:px-6">
        <div className="flex items-center h-16 sm:h-20 justify-between gap-1 sm:gap-2 md:gap-3">

          {/* Left Section: Logo + Location */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 flex-shrink-0 min-w-0">
            <button
              onClick={() => handleNavigation('/')}
              className="flex items-center space-x-1.5 sm:space-x-2 group flex-shrink-0"
            >
              <div className="bg-gradient-to-tr from-amber-500 to-orange-600 p-1.5 sm:p-2 rounded-lg shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300">
                <Globe className="text-white" size={18} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight whitespace-nowrap">
                  TravelBuddy
                </span>
                <span className="hidden lg:block text-[9px] xl:text-[10px] font-medium text-amber-600 tracking-wider uppercase ml-0.5">Find your companion</span>
              </div>
            </button>
          </div>

          {/* Center Section: Navigation Links (Excluding AI Buddy) */}
          <div className="hidden md:flex items-center justify-center space-x-1 lg:space-x-2 xl:space-x-4 2xl:space-x-6 flex-1 min-w-0 overflow-hidden">
            {navLinks.filter(link => link.name !== 'Ai Buddy').map((link) => (
              link.children ? (
                <div key={link.name} className="relative group z-50 flex-shrink-0">
                  <button className={`flex items-center space-x-1 py-2 text-xs lg:text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                    link.children.some(child => location.pathname === child.path)
                      ? 'text-amber-600'
                      : 'text-gray-600 hover:text-amber-600'
                  }`}>
                    <link.icon size={16} strokeWidth={2} className="flex-shrink-0" />
                    <span className="hidden lg:inline">{link.name}</span>
                    <ChevronDown size={12} className="group-hover:rotate-180 transition-transform duration-200 flex-shrink-0" />
                  </button>
                  <div className="absolute left-1/2 -translate-x-1/2 pt-4 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 w-60">
                    <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden p-2">
                       {link.children.map((child) => (
                        <button
                          key={child.name}
                          onClick={() => handleNavigation(child.path)}
                          className="w-full flex items-center space-x-3 px-3 py-2.5 text-gray-600 hover:text-amber-600 hover:bg-amber-50/50 rounded-xl transition-all duration-200 text-left group/item"
                        >
                          <div className="p-1.5 bg-gray-100 group-hover/item:bg-amber-100 rounded-lg transition-colors">
                            <child.icon size={16} className="text-gray-500 group-hover/item:text-amber-600" />
                          </div>
                          <span className="text-sm font-medium">{child.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  key={link.name}
                  onClick={() => handleNavigation(link.path)}
                  className={`relative flex items-center space-x-1 text-xs lg:text-sm font-medium transition-colors duration-200 whitespace-nowrap flex-shrink-0 ${
                    location.pathname === link.path
                      ? 'text-amber-600'
                      : 'text-gray-600 hover:text-amber-600'
                  }`}
                >
                  <link.icon size={16} strokeWidth={2} className="flex-shrink-0" />
                  <span className="hidden lg:inline">{link.name}</span>
                  {link.badge && link.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                      {link.badge}
                    </span>
                  )}
                </button>
              )
            ))}
          </div>

          {/* Right Actions: AI Planner, Create Activity, Profile */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2 xl:space-x-3 flex-shrink-0">
             {/* Ai Buddy Button - Placed here next to Create Activity */}
              <button
                onClick={() => handleNavigation('/ai-buddy')}
                className="flex items-center space-x-1 lg:space-x-1.5 bg-gradient-to-r from-purple-500 to-violet-600 text-white px-2 lg:px-3 xl:px-4 py-1.5 lg:py-2 rounded-lg hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5 transition-all duration-300 font-medium text-xs group"
              >
                <Bot size={14} className="group-hover:rotate-12 transition-transform duration-300 flex-shrink-0" />
                <span className="hidden xl:inline whitespace-nowrap">Ai Buddy</span>
              </button>

            {isSignedIn ? (
              <div className="flex items-center space-x-1 lg:space-x-2 xl:space-x-3">

                 {/* Notification Bell */}
                 <div className="relative flex-shrink-0">
                    <button
                      className="p-1.5 lg:p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors relative"
                      onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    >
                      <Bell size={18} />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1.5 h-2 w-2 bg-red-500 rounded-full"></span>
                      )}
                    </button>
                    <NotificationDropdown
                      isOpen={isNotificationOpen}
                      onClose={() => setIsNotificationOpen(false)}
                    />
                 </div>

                 <button
                  onClick={() => handleCreateActivity()}
                  className="flex items-center space-x-1 lg:space-x-1.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-2 lg:px-3 xl:px-4 py-1.5 lg:py-2 rounded-lg hover:shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5 transition-all duration-300 font-medium text-xs group"
                >
                  <Plus size={14} className="group-hover:rotate-90 transition-transform duration-300 flex-shrink-0" />
                  <span className="hidden lg:inline whitespace-nowrap">Create Activity</span>
                </button>

                {/* Profile Dropdown Menu */}
                <div className="relative flex-shrink-0" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-1 p-0.5 lg:p-1 rounded-full border border-transparent hover:border-gray-200 hover:bg-gray-50 transition-all duration-200"
                  >
                    <div className="relative">
                      <img
                        src={userImage || 'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png'}
                        alt={userDisplayName}
                        className="w-7 h-7 lg:w-8 lg:h-8 xl:w-9 xl:h-9 rounded-full object-cover border-2 border-white shadow-md ring-1 ring-gray-100"
                      />
                      <div className="absolute bottom-0 right-0 w-2 h-2 lg:w-2.5 lg:h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <ChevronDown className={`w-3 h-3 lg:w-4 lg:h-4 text-gray-500 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-4 w-80 md:w-96 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                      {/* User Info Header */}
                      <div className="px-6 py-5 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
                        <div className="flex items-center space-x-4">
                          <img
                            src={userImage || 'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png'}
                            alt={userDisplayName}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-gray-900 text-base truncate">{userDisplayName}</p>
                            <p className="text-xs text-gray-500 truncate mt-0.5">{userEmail}</p>
                          </div>
                        </div>
                        {/* Current Location */}
                        <div className="flex items-center space-x-2 mt-3 px-3 py-2 bg-amber-50/50 rounded-lg border border-amber-100">
                          <MapPin size={14} className="text-amber-500 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] text-amber-600 font-semibold uppercase tracking-wide">Current Location</p>
                            <p className="text-sm text-gray-700 font-medium truncate">{currentLocationName}</p>
                          </div>
                        </div>
                      </div>

                      {/* Tabs */}
                      <div className="flex p-2 gap-1 border-b border-gray-100 bg-gray-50/50">
                        {profileTabs.map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 border ${
                              activeTab === tab.id
                                ? 'bg-white text-amber-600 shadow-sm border-gray-100'
                                : 'border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                            }`}
                          >
                            <tab.icon size={18} className="mb-px" />
                            <span className="text-[10px] font-semibold uppercase tracking-wide">{tab.label}</span>
                          </button>
                        ))}
                      </div>

                      {/* Content Area */}
                      <div className="p-2 min-h-[200px]">
                        <div className="space-y-1">
                           {profileContent[activeTab]?.map((item, index) => (
                            <button
                              key={index}
                              onClick={() => handleNavigation(item.path)}
                              className="w-full flex items-center justify-between px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors text-left group"
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg ${activeTab === 'profile' ? 'bg-indigo-50 text-indigo-500' : activeTab === 'activity' ? 'bg-orange-50 text-orange-500' : activeTab === 'posts' ? 'bg-pink-50 text-pink-500' : 'bg-emerald-50 text-emerald-500'} group-hover:bg-white group-hover:shadow-sm transition-all duration-200`}>
                                  <item.icon size={18} />
                                </div>
                                <span className="font-medium text-sm">{item.name}</span>
                              </div>
                              {item.badge && item.badge > 0 && (
                                <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                  {item.badge}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-2 border-t border-gray-50 bg-gray-50/50">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-4 py-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left group"
                        >
                          <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                          <span className="font-medium text-sm">Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleLogin('/sign-in')}
                  className="text-gray-600 hover:text-gray-900 font-semibold text-sm transition-colors py-2 px-4 hover:bg-gray-50 rounded-lg"
                >
                  Log in
                </button>
                <button
                  onClick={() => handleRegister('/sign-up')}
                  className="bg-gray-900 text-white px-6 py-2.5 rounded-xl hover:bg-gray-800 hover:shadow-lg transition-all duration-200 font-medium text-sm"
                >
                  Sign up
                </button>
              </div>
            )}
          </div>

          {/* Mobile Right Actions: AI Buddy, Notification, Menu Toggle */}
          <div className="md:hidden flex items-center space-x-1 sm:space-x-2">
            {/* AI Buddy Button - Mobile */}
            <button
              onClick={() => handleNavigation('/ai-buddy')}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-purple-500 to-violet-600 text-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 font-medium text-xs group"
            >
              <Bot size={16} className="group-hover:rotate-12 transition-transform duration-300" />
              <span>Ai Buddy</span>
            </button>

            {/* Notification Bell - Mobile */}
            {isSignedIn && (
              <div className="relative">
                <button
                  className="p-1.5 sm:p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors relative"
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 h-2 w-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
                <NotificationDropdown
                  isOpen={isNotificationOpen}
                  onClose={() => setIsNotificationOpen(false)}
                />
              </div>
            )}

            {/* Hamburger Menu */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 sm:p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex-shrink-0"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-[calc(100%+0.5rem)] left-0 right-0 w-full bg-white border border-gray-100 rounded-2xl shadow-xl animate-in slide-in-from-top-5 duration-200 z-40 mx-2 sm:mx-4">
            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">

              {isSignedIn && (
                <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="p-2 bg-white rounded-full shadow-sm">
                     <MapPin size={18} className="text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Current Location</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{currentLocationName}</p>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                {navLinks.map((link) => (
                  <div key={link.name}>
                    {link.children ? (
                      <div className="space-y-1">
                        <button
                          onClick={() => setExpandedMobileMenu(expandedMobileMenu === link.name ? null : link.name)}
                          className="flex items-center justify-between w-full px-4 py-3 text-gray-900 font-semibold bg-gray-50/50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <link.icon size={20} className="text-gray-500" />
                            <span>{link.name}</span>
                          </div>
                          <ChevronDown
                            size={18}
                            className={`text-gray-400 transition-transform duration-200 ${expandedMobileMenu === link.name ? 'rotate-180' : ''}`}
                          />
                        </button>
                        {expandedMobileMenu === link.name && (
                          <div className="pl-4 ml-4 border-l-2 border-gray-100 space-y-1 animate-in slide-in-from-top-2 duration-200">
                            {link.children.map((child) => (
                              <button
                                  key={child.name}
                                  onClick={() => {
                                    handleNavigation(child.path);
                                    setIsMenuOpen(false);
                                    setExpandedMobileMenu(null);
                                  }}
                                  className="flex items-center space-x-3 px-4 py-2.5 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg w-full text-left transition-colors"
                                >
                                  <child.icon size={18} />
                                  <span className="text-sm font-medium">{child.name}</span>
                                </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          handleNavigation(link.path);
                          setIsMenuOpen(false);
                        }}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl w-full text-left transition-all duration-200 ${
                          location.pathname === link.path
                            ? 'bg-amber-50 text-amber-600 font-semibold'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <link.icon size={20} />
                        <span>{link.name}</span>
                        {link.badge && link.badge > 0 && (
                          <span className="ml-auto bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                            {link.badge}
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {isSignedIn ? (
                <>
                  <button
                    onClick={() => {
                      handleCreateActivity();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-3 sm:py-3.5 rounded-xl font-semibold shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                  >
                    <Plus size={18} />
                    <span>Create Activity</span>
                  </button>

                  <div className="pt-4 border-t border-gray-100 space-y-2">
                     {profileTabs.map((tab) => (
                       <div key={tab.id} className="space-y-1">
                          <button
                            onClick={() => setExpandedMobileMenu(expandedMobileMenu === tab.id ? null : tab.id)}
                            className="flex items-center justify-between w-full px-4 py-3 text-gray-900 font-semibold bg-gray-50/50 rounded-xl hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <tab.icon size={20} className="text-gray-500" />
                              <span>{tab.label}</span>
                            </div>
                            <ChevronDown
                              size={18}
                              className={`text-gray-400 transition-transform duration-200 ${expandedMobileMenu === tab.id ? 'rotate-180' : ''}`}
                            />
                          </button>
                          {expandedMobileMenu === tab.id && (
                            <div className="pl-4 ml-4 border-l-2 border-gray-100 space-y-1 animate-in slide-in-from-top-2 duration-200">
                              {profileContent[tab.id].map((item, index) => (
                                <button
                                  key={index}
                                  onClick={() => {
                                    handleNavigation(item.path);
                                    setIsMenuOpen(false);
                                    setExpandedMobileMenu(null);
                                  }}
                                  className="flex items-center space-x-3 px-4 py-2.5 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg w-full text-left font-medium transition-colors"
                                >
                                  <item.icon size={18} className="text-gray-400" />
                                  <span className="text-sm">{item.name}</span>
                                </button>
                              ))}
                            </div>
                          )}
                       </div>
                     ))}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl w-full text-left font-medium"
                    >
                      <LogOut size={20} />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      handleLogin('/sign-in');
                      setIsMenuOpen(false);
                    }}
                    className="flex justify-center items-center px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => {
                      handleRegister('/sign-up');
                      setIsMenuOpen(false);
                    }}
                    className="flex justify-center items-center px-4 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors"
                  >
                     Sign up
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
    </div>
  );
}

export default NavBar;