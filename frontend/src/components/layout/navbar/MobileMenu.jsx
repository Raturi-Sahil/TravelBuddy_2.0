import { useClerk } from '@clerk/clerk-react';
import {
  Activity, Bed, BookOpen, Bot,
Calendar, CalendarDays, Camera, ChevronDown,   Compass, Image, Landmark, Link, LogOut, MapPin, 
Plane,
Plus, Receipt, ShieldAlert, ShoppingBag, Upload, User,   Users, UtensilsCrossed} from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

const MobileMenu = ({ isOpen, setIsOpen, isSignedIn, currentLocationName, onNavigate, myGuideProfile }) => {
  const [expandedMenu, setExpandedMenu] = useState(null);
  const { signOut } = useClerk();

  const handleLogout = async () => {
    await signOut();
    toast.success('Logout successful');
    setIsOpen(false);
    onNavigate('/sign-in');
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

  if (!isOpen) return null;

  return (
    <div className="md:hidden absolute top-[calc(100%+0.5rem)] left-0 right-0 w-full bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-xl animate-in slide-in-from-top-5 duration-300 z-40 mx-auto max-w-[95%]">
      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">

        {isSignedIn && (
          <div className="flex items-center space-x-3 bg-gray-50/80 p-3 rounded-xl border border-gray-100">
            <div className="p-2 bg-white rounded-full shadow-sm">
               <MapPin size={18} className="text-amber-500" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Current Location</p>
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
                    onClick={() => setExpandedMenu(expandedMenu === link.name ? null : link.name)}
                    className="flex items-center justify-between w-full px-4 py-3 text-gray-700 font-semibold bg-gray-50/50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <link.icon size={20} className="text-gray-500" />
                      <span>{link.name}</span>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`text-gray-400 transition-transform duration-200 ${expandedMenu === link.name ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {expandedMenu === link.name && (
                    <div className="pl-4 ml-4 border-l-2 border-gray-100 space-y-1 animate-in slide-in-from-top-2 duration-200">
                      {link.children.map((child) => (
                        <button
                            key={child.name}
                            onClick={() => {
                              onNavigate(child.path);
                              setIsOpen(false);
                              setExpandedMenu(null);
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
                    onNavigate(link.path);
                    setIsOpen(false);
                  }}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl w-full text-left transition-all duration-200 text-gray-600 hover:bg-gray-50"
                >
                  <link.icon size={20} className="text-gray-500"/>
                  <span className="font-medium">{link.name}</span>
                </button>
              )}
            </div>
          ))}
        </div>

        {isSignedIn ? (
          <>
            <button
              onClick={() => {
                onNavigate('/create-activity');
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-3 sm:py-3.5 rounded-xl font-semibold shadow-lg shadow-amber-500/20 active:scale-95 transition-all hover:brightness-110"
            >
              <Plus size={18} />
              <span>Create Activity</span>
            </button>

            <div className="pt-4 border-t border-gray-100 space-y-2">
               {profileTabs.map((tab) => (
                 <div key={tab.id} className="space-y-1">
                    <button
                      onClick={() => setExpandedMenu(expandedMenu === tab.id ? null : tab.id)}
                      className="flex items-center justify-between w-full px-4 py-3 text-gray-700 font-semibold bg-gray-50/50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <tab.icon size={20} className="text-gray-500" />
                        <span>{tab.label}</span>
                      </div>
                      <ChevronDown
                        size={18}
                        className={`text-gray-400 transition-transform duration-200 ${expandedMenu === tab.id ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {expandedMenu === tab.id && (
                      <div className="pl-4 ml-4 border-l-2 border-gray-100 space-y-1 animate-in slide-in-from-top-2 duration-200">
                        {profileContent[tab.id].map((item, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              onNavigate(item.path);
                              setIsOpen(false);
                              setExpandedMenu(null);
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
                onClick={handleLogout}
                className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl w-full text-left font-medium transition-colors"
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
                onNavigate('/sign-in');
                setIsOpen(false);
              }}
              className="flex justify-center items-center px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => {
                onNavigate('/sign-up');
                setIsOpen(false);
              }}
              className="flex justify-center items-center px-4 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/10"
            >
               Sign up
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;
