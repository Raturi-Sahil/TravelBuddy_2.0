import { useAuth,useUser } from '@clerk/clerk-react';
import { Bell, Bot, Globe, Menu, Plus, X } from 'lucide-react';
import React, { useEffect, useRef,useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import useLocationTracking from '../../hooks/useLocationTracking';
import useNotificationSystem from '../../hooks/useNotificationSystem';
import { fetchMyGuideProfile } from '../../redux/slices/guideSlice';
import { fetchNotifications } from '../../redux/slices/notificationSlice';
import { fetchProfile } from '../../redux/slices/userSlice';
import NotificationDropdown from '../notifications/NotificationDropdown';
import MobileMenu from './navbar/MobileMenu';
import NavLinks from './navbar/NavLinks';
import ProfileMenu from './navbar/ProfileMenu';

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();
  
  const { profile: userProfile } = useSelector((state) => state.user);
  const { myGuideProfile } = useSelector((state) => state.guide);
  const { unreadCount } = useSelector((state) => state.notifications);

  // Custom Hooks
  const { currentLocationName } = useLocationTracking(isSignedIn);
  useNotificationSystem(isSignedIn);

  // Local State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

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

  // Fetch initial data
  useEffect(() => {
    if (isSignedIn) {
      dispatch(fetchProfile({ getToken }));
      dispatch(fetchMyGuideProfile({ getToken }));
      dispatch(fetchNotifications(getToken));
    }
  }, [isSignedIn, dispatch, getToken]);

  const handleCreateActivity = () => {
    const hasActivePlan =
      userProfile && (userProfile.planType === "Monthly" || userProfile.planType === "Yearly") &&
      new Date(userProfile.planEndDate) > new Date();

    if (hasActivePlan) {
      navigate('/create-activity');
    } else {
      navigate('/subscription');
    }
  };

  const handleLogin = (path) => navigate(path);
  const handleRegister = (path) => navigate(path);

  return (
    <div className={`fixed top-4 left-0 right-0 z-50 flex justify-center px-2 sm:px-4 pointer-events-none transition-all duration-500 ease-in-out ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-[150%] opacity-0'}`}>
      <nav className="w-full max-w-7xl pointer-events-auto bg-white/80 backdrop-blur-xl shadow-lg shadow-gray-200/50 border border-gray-100/50 rounded-2xl transition-all duration-300">
        <div className="px-3 sm:px-4 md:px-6">
          <div className="flex items-center h-16 sm:h-20 justify-between gap-3">

            {/* Logo Section */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 group"
              >
                <div className="bg-gradient-to-tr from-amber-500 to-orange-600 p-2 rounded-xl shadow-lg shadow-amber-500/20 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
                  <Globe className="text-white" size={20} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight">
                    TravelBuddy
                  </span>
                  <span className="hidden sm:block text-[10px] font-semibold text-amber-600 tracking-wider uppercase">Find your companion</span>
                </div>
              </button>
            </div>

            {/* Center Navigation (Desktop) */}
            <NavLinks currentPath={location.pathname} onNavigate={navigate} />

            {/* Right Actions (Desktop) */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-3 flex-shrink-0">
               {/* AI Buddy */}
              <button
                onClick={() => navigate('/ai-buddy')}
                className="flex items-center space-x-1.5 bg-gradient-to-r from-purple-500 to-violet-600 text-white px-3 py-2 rounded-xl hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5 transition-all duration-300 font-semibold text-xs group"
              >
                <Bot size={16} className="group-hover:rotate-12 transition-transform duration-300" />
                <span className="hidden xl:inline">Ai Buddy</span>
              </button>

              {isSignedIn ? (
                <>
                  {/* Notifications */}
                  <div className="relative">
                    <button
                      className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-all duration-200 relative group"
                      onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    >
                      <Bell size={20} strokeWidth={2} className="group-hover:scale-110 transition-transform" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>
                      )}
                    </button>
                    <NotificationDropdown
                      isOpen={isNotificationOpen}
                      onClose={() => setIsNotificationOpen(false)}
                    />
                  </div>

                  {/* Create Activity */}
                  <button
                    onClick={handleCreateActivity}
                    className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 py-2 rounded-xl hover:shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5 transition-all duration-300 font-semibold text-xs group"
                  >
                    <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                  </button>

                  {/* Profile Menu */}
                  <div className="pl-1">
                    <ProfileMenu 
                        user={user} 
                        userProfile={userProfile} 
                        currentLocationName={currentLocationName}
                        isOpen={isProfileMenuOpen}
                        setIsOpen={setIsProfileMenuOpen}
                        myGuideProfile={myGuideProfile}
                    />
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2 pl-2">
                  <button
                    onClick={() => handleLogin('/sign-in')}
                    className="text-gray-600 hover:text-gray-900 font-semibold text-sm transition-colors py-2 px-4 hover:bg-gray-50 rounded-xl"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => handleRegister('/sign-up')}
                    className="bg-gray-900 text-white px-5 py-2 rounded-xl hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-semibold text-sm"
                  >
                    Sign up
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={() => navigate('/ai-buddy')}
                className="flex items-center justify-center w-9 h-9 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl shadow-md shadow-purple-500/20 active:scale-95 transition-transform"
              >
                <Bot size={18} />
              </button>

              {isSignedIn && (
                <div className="relative">
                  <button
                    className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors relative"
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-1 ring-white"></span>
                    )}
                  </button>
                   <NotificationDropdown
                      isOpen={isNotificationOpen}
                      onClose={() => setIsNotificationOpen(false)}
                    />
                </div>
              )}

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors active:bg-gray-100"
              >
                {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Component */}
          <MobileMenu 
            isOpen={isMenuOpen} 
            setIsOpen={setIsMenuOpen}
            isSignedIn={isSignedIn}
            currentLocationName={currentLocationName}
            onNavigate={navigate}
            myGuideProfile={myGuideProfile}
          />

        </div>
      </nav>
    </div>
  );
}

export default NavBar;