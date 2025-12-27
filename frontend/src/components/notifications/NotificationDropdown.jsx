import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../redux/slices/notificationSlice';
import { useAuth } from '@clerk/clerk-react';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const dropdownRef = useRef(null);

  const { notifications, loading, error, unreadCount } = useSelector((state) => state.notifications);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchNotifications(getToken));
    }
  }, [isOpen, dispatch, getToken]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      dispatch(markNotificationAsRead({ id: notification._id, getToken }));
    }

    if (notification.link) {
      navigate(notification.link);
      onClose();
    }
  };

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsAsRead(getToken));
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-12 w-80 sm:w-96 bg-gray-900 border border-purple-500/30 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-md"
    >
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gray-900/90">
        <h3 className="text-white font-semibold flex items-center gap-2">
          Notifications
          {unreadCount > 0 && (
            <span className="bg-purple-600 text-xs px-2 py-0.5 rounded-full text-white">
              {unreadCount}
            </span>
          )}
        </h3>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
        {loading && notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <div className="animate-spin h-6 w-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            Loading...
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-400 text-sm">
            {error}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-400 flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 hover:bg-white/5 transition-colors cursor-pointer flex gap-3 ${
                  !notification.isRead ? 'bg-purple-900/10 border-l-2 border-purple-500' : ''
                }`}
              >
                <div className="mt-1">
                  {notification.sender?.profileImage ? (
                    <img
                      src={notification.sender.profileImage}
                      alt="User"
                      className="w-10 h-10 rounded-full object-cover border border-purple-500/30"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 border border-purple-500/30">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${!notification.isRead ? 'text-white font-medium' : 'text-gray-300'}`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>


    </div>
  );
};

export default NotificationDropdown;
