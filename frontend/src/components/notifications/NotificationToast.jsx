import React from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const NotificationToast = ({ t, notification }) => {
  const navigate = useNavigate();

  return (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 cursor-pointer`}
      onClick={() => {
        navigate('/notifications');
        toast.dismiss(t.id);
      }}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <img
              className="h-10 w-10 rounded-full"
              src={
                notification?.sender?.profileImage ||
                "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"
              }
              alt=""
            />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">New Notification</p>
            <p className="mt-1 text-sm text-gray-500">{notification?.message}</p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toast.dismiss(t.id);
          }}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;
