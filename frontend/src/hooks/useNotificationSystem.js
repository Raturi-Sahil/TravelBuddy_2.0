import { createElement,useEffect } from 'react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';

import NotificationToast from '../components/notifications/NotificationToast';
import { useSocketContext } from '../context/socketContext';
import { addNotification } from '../redux/slices/notificationSlice';

const useNotificationSystem = (isSignedIn) => {
  const { socket } = useSocketContext();
  const dispatch = useDispatch();

  useEffect(() => {
    if (socket && isSignedIn) {
      socket.on("newNotification", (notification) => {
        dispatch(addNotification(notification));

        // Play notification sound
        try {
          const audio = new Audio("/mixkit-correct-answer-tone-2870.wav");
          audio.volume = 0.6;
          const playPromise = audio.play();
          if (playPromise !== undefined) {
             playPromise.catch(() => {}); // Ignore auto-play blocks
          }
        } catch (error) {
          console.error("Audio system error", error);
        }

        // Don't show toast for self-actions
        if (['ACTIVITY_CREATED_SELF', 'ACTIVITY_CANCELLED_SELF', 'ACTIVITY_DELETED_SELF'].includes(notification.type)) return;

        // Use createElement to invoke component without JSX syntax
        toast.custom((t) => createElement(NotificationToast, { t, notification }));
      });

      return () => {
        socket.off("newNotification");
      };
    }
  }, [socket, isSignedIn, dispatch]);
};

export default useNotificationSystem;
