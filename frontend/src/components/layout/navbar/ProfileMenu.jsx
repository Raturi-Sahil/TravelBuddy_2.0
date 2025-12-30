import { useClerk } from '@clerk/clerk-react';
import {
Activity, BookOpen,   Calendar, CalendarDays, Camera, ChevronDown, Compass,
Image, Link, LogOut, MapPin,
Receipt, Upload,   User} from 'lucide-react';
import React, { useEffect,useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const ProfileMenu = ({ user, userProfile, currentLocationName, isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const menuRef = useRef(null);
  const [activeTab, setActiveTab] = useState('profile');

  const { myGuideProfile } = useSelector((state) => state.guide);

  // Derive user display values
  const userImage = userProfile?.profileImage || user?.imageUrl;
  const userDisplayName = userProfile?.name || user?.fullName || user?.firstName || 'User';
  const userEmail = userProfile?.email || user?.primaryEmailAddress?.emailAddress || '';

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
      { name: 'Split Group Expenses', path: '/split-expenses', icon: Receipt },
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    await signOut();
    toast.success('Logout successful');
    setIsOpen(false);
    navigate('/sign-in');
  };

  return (
    <div className="relative flex-shrink-0" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 p-1 lg:p-1.5 rounded-full border border-gray-200/50 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 outline-none focus:ring-2 focus:ring-amber-100 group"
      >
        <div className="relative">
          <img
            src={userImage || 'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png'}
            alt={userDisplayName}
            className="w-8 h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10 rounded-full object-cover border-2 border-white shadow-md ring-1 ring-gray-100 group-hover:ring-amber-200 transition-all"
          />
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 lg:w-3 lg:h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
        </div>
        <ChevronDown 
            className={`w-4 h-4 text-gray-400 group-hover:text-amber-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
            strokeWidth={2.5}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top-right ring-1 ring-black/5">
          
          {/* User Info Header */}
          <div className="px-6 py-5 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <img
                src={userImage || 'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png'}
                alt={userDisplayName}
                className="w-14 h-14 rounded-full object-cover border-4 border-white shadow-lg ring-1 ring-gray-100"
              />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-gray-900 text-lg truncate tracking-tight">{userDisplayName}</p>
                <p className="text-xs text-gray-500 truncate font-medium">{userEmail}</p>
              </div>
            </div>
            {/* Current Location */}
            <div className="flex items-center space-x-3 mt-4 px-3.5 py-2.5 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="p-1.5 bg-amber-50 rounded-lg">
                <MapPin size={14} className="text-amber-500 flex-shrink-0" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Current Location</p>
                <p className="text-sm text-gray-700 font-medium truncate">{currentLocationName}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex p-2 gap-1.5 border-b border-gray-100 bg-gray-50/50">
            {profileTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all duration-200 border ${
                  activeTab === tab.id
                    ? 'bg-white text-amber-600 shadow-sm border-gray-100'
                    : 'border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                <tab.icon size={18} className="mb-1" strokeWidth={2} />
                <span className="text-[9px] font-bold uppercase tracking-wide">{tab.label}</span>
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
                  className="w-full flex items-center justify-between px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent rounded-xl transition-all duration-200 text-left group"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-xl ${
                        activeTab === 'profile' ? 'bg-indigo-50/50 text-indigo-500' : 
                        activeTab === 'activity' ? 'bg-orange-50/50 text-orange-500' : 
                        activeTab === 'posts' ? 'bg-pink-50/50 text-pink-500' : 
                        'bg-emerald-50/50 text-emerald-500'
                    } group-hover:bg-white group-hover:shadow-sm transition-all duration-200`}>
                      <item.icon size={18} strokeWidth={2} />
                    </div>
                    <span className="font-semibold text-sm">{item.name}</span>
                  </div>
                  {item.badge && item.badge > 0 && (
                    <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full ring-1 ring-red-100">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="p-2 border-t border-gray-100 bg-gray-50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2.5 px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-white hover:shadow-sm rounded-xl transition-all duration-200 font-semibold text-sm border border-transparent hover:border-gray-100"
            >
              <LogOut size={18} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
