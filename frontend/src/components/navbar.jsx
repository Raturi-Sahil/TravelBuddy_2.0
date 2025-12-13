import { SignedIn, SignedOut,useClerk, useUser } from '@clerk/clerk-react';
import {
  Activity,
  Bell,
  Calendar,
  ChevronDown,
  Compass,
  Globe,
  Info,
  Link,
  LogOut,
  MapPin,
  Menu,
  Plus,
  Settings,
  Trash2,
  User,
  Users,
  Bed,
  Landmark,
  X} from 'lucide-react';
import  { useEffect, useRef,useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import ReverseGeocode from '../helpers/reverseGeoCode';

import { useSocketContext } from '../context/socketContext';



function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const { user } = useUser();

  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useClerk();
  const { user:  isSignedIn } = useUser();
const currentUser  = {
    fullName: user?.fullName,
    profilePicture: user?.imageUrl,

  };


  const notificationCount = 3;

  // Derive user display values from Clerk user
  const userImage = user?.imageUrl;
  const userDisplayName = user?.fullName || user?.firstName || 'User';
  const userEmail = user?.primaryEmailAddress?.emailAddress || '';


  const { socket } = useSocketContext();
  const [currentLocationName, setCurrentLocationName] = useState('Locating...');

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
            console.log('Current Location:', { latitude, longitude });

             // 1. Get readable address for UI
            try {
               const address = await ReverseGeocode({ lat: latitude, lng: longitude });
               console.log('address', address);

               setCurrentLocationName(address);
            } catch (error) {
               console.error("Error reverse geocoding:", error);
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


  const handleLogout = async () => {
    await signOut();
    toast.success('Logout successful');
    setIsProfileMenuOpen(false);
    navigate('/sign-in');
  };

  const handleDeleteAccount = () => {
    console.log('Delete account clicked');
    setIsProfileMenuOpen(false);
  };

  const navLinks = [
    { name: 'Discover', path: '/', icon: Compass },
    {
      name: 'Map',
      path: '/map',
      icon: MapPin,
      children: [
        { name: 'Nearby Traveller', path: '/map', icon: Users },
        { name: 'Near Hotels', path: '/map/hotels', icon: Bed },
        { name: 'Nearby Tourist Place', path: '/map/tourist-places', icon: Landmark }
      ]
    },
    { name: 'Activities', path: '/activity-near-me', icon: Calendar },
    { name: 'About Us', path: '/about-us', icon: Info },
  ];

  const profileMenuItems = [
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Joined Activities', path: '/joined-activities', icon: Activity },
    { name: 'My Activities', path: '/created-activities', icon: Calendar },
    { name: 'Connections', path: '/connections', icon: Link },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: notificationCount },
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          <button
            onClick={() => handleNavigation('/')}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <div className="bg-amber-600 p-2 rounded-lg">
              <Globe className="text-white" size={24} />
            </div>
            <div>
              <span className="text-xl font-bold bg-amber-600 bg-clip-text text-transparent">
                TravelBuddy
              </span>
              <div className="text-xs text-gray-500 -mt-1">Find your travel buddy</div>
            </div>
          </button>

          {isSignedIn && (
            <div className="hidden lg:flex items-center space-x-1 text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
              <MapPin size={24} className="text-amber-600" />
              <span className="truncate max-w-[200px]">{currentLocationName}</span>
            </div>
          )}

          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              link.children ? (
                <div key={link.name} className="relative group z-50">
                  <button className={`flex items-center space-x-1 transition-colors duration-200 py-2 ${
                    link.children.some(child => location.pathname === child.path) ? 'text-amber-600 font-medium' : 'text-gray-700 hover:text-blue-600'
                  }`}>
                    <link.icon size={20} />
                    <span className="group-hover:underline underline-offset-4">{link.name}</span>
                    <ChevronDown size={16} className="ml-1" />
                  </button>
                  <div className="absolute left-0 mt-0 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 transform origin-top-left">
                    {link.children.map((child) => (
                      <button
                        key={child.name}
                        onClick={() => handleNavigation(child.path)}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors text-left"
                      >
                        <child.icon size={16} />
                        <span>{child.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <button
                  key={link.name}
                  onClick={() => handleNavigation(link.path)}
                  className={`relative flex items-center space-x-1 transition-colors duration-200 group ${
                    location.pathname === link.path ? 'text-amber-600 font-medium' : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  <link.icon size={20} />
                  <span className="group-hover:underline underline-offset-4">{link.name}</span>
                  {link.badge && link.badge > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {link.badge}
                    </span>
                  )}
                </button>
              )
            ))}

            {isSignedIn ? (
              <div className="flex items-center space-x-4">
                 <button
              onClick={() => handleNavigation('/create-activity')}
              className="flex items-center space-x-1 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Plus size={18} />
              <span className="hidden lg:inline text-center">Create Activity</span>
            </button>

                {/* Profile Dropdown Menu */}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-amber-600 transition-colors p-1 rounded-lg hover:bg-gray-50"
                  >
                    <img
                      src={userImage || 'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png'}
                      alt={userDisplayName}
                      className="w-8 h-8 rounded-full border-2 border-gray-200 hover:border-amber-600 transition-colors"
                    />
                    <span className="hidden lg:inline">{userDisplayName}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <img
                            src={userImage || 'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png'}
                            alt={userDisplayName}
                            className="w-10 h-10 rounded-full border-2 border-gray-200 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">{userDisplayName}</p>
                            <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                          </div>
                        </div>
                      </div>

                      {profileMenuItems.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => handleNavigation(item.path)}
                          className="w-full flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="flex items-center space-x-3">
                            <item.icon size={16} />
                            <span>{item.name}</span>
                          </div>
                          {item.badge && item.badge > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      ))}

                      <div className="border-t border-gray-100 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>

                      <button
                        onClick={handleDeleteAccount}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <Trash2 size={16} />
                        <span>Delete Account</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleLogin('/sign-in')}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => handleRegister('/sign-up')}
                  className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                >
                  Join Now
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700 hover:text-blue-600 p-2"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-2 space-y-1 pb-4 border-t border-gray-100 pt-4">
            {/* Current Location (Mobile) */}
            {isSignedIn && (
              <div className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg mx-3 mb-3">
                <MapPin size={14} className="text-blue-500" />
                <span className="truncate">{currentLocationName}</span>
              </div>
            )}

            {navLinks.map((link) => (
              <div key={link.name}>
                {link.children ? (
                  <div className="mx-3 mb-1">
                    <div className="flex items-center space-x-3 px-3 py-3 text-gray-700 font-medium">
                      <link.icon size={20} />
                      <span>{link.name}</span>
                    </div>
                    <div className="pl-4 border-l-2 border-gray-100 ml-5 space-y-1">
                      {link.children.map((child) => (
                        <button
                          key={child.name}
                          onClick={() => {
                            handleNavigation(child.path);
                            setIsMenuOpen(false);
                          }}
                          className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg w-full text-left text-sm"
                        >
                          <child.icon size={16} />
                          <span>{child.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      handleNavigation(link.path);
                      setIsMenuOpen(false);
                    }}
                    className={`relative flex items-center space-x-3 px-3 py-3 rounded-lg mx-3 transition-colors w-full text-left ${
                      location.pathname === link.path ? 'bg-amber-50 text-amber-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <link.icon size={20} />
                    <span className="font-medium">{link.name}</span>
                    {link.badge && link.badge > 0 && (
                      <span className=" bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {link.badge}
                      </span>
                    )}
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={() => {
                handleNavigation('/create-activity');
                setIsMenuOpen(false);
              }}
              className="flex align-center space-x-3 px-4 py-3 mx-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 w-full"
            >
              <Plus size={20} />
              <span className="font-medium text-center mt-[-1px]">Create Activity</span>
            </button>

            {isSignedIn ? (
              <div className="space-y-1 border-t border-gray-100 mx-3 pt-2">
                {/* Mobile Profile Menu Items */}
                {profileMenuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      handleNavigation(item.path);
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:bg-gray-50 rounded-lg w-full text-left"
                  >
                    <item.icon size={20} />
                    <span>{item.name}</span>
                  </button>
                ))}

                {/* Notifications (Mobile) */}
                <button className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:bg-gray-50 rounded-lg w-full">
                  <Bell size={20} />
                  <span>Notifications</span>
                  {notificationCount > 0 && (
                    <span className=" bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center text-left">
                      {notificationCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>

                <button
                  onClick={() => {
                    handleDeleteAccount();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full"
                >
                  <Trash2 size={20} />
                  <span>Delete Account</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 mt-4 pt-4 border-t border-gray-100 mx-3">
                <button
                  onClick={() => {
                    handleLogin('/sign-in');
                    setIsMenuOpen(false);
                  }}
                  className="block px-3 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium w-full text-left"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    handleRegister('/sign-up');
                    setIsMenuOpen(false);
                  }}
                  className="block px-3 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all duration-200 font-medium text-center w-full"
                >
                  Join TravelBuddy
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default NavBar;