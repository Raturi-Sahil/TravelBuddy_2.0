import { useAuth, useUser } from '@clerk/clerk-react';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { io } from 'socket.io-client';

import { addMessage, setOnlineUsers, setTypingUser } from '../redux/slices/chatSlice';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

let socket = null;

export const useSocket = () => {
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const dispatch = useDispatch();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isSignedIn || !user?.id) return;

    // Initialize socket only once
    if (!socket) {
      socket = io(SOCKET_URL, {
        query: { userId: user.id },
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        setIsConnected(true);
      });

      socket.on('getOnlineUsers', (users) => {
        dispatch(setOnlineUsers(users));
      });

      socket.on('newMessage', (message) => {
        dispatch(addMessage({
          senderId: message.senderId,
          receiverId: message.receiverId,
          message,
        }));
      });

      socket.on('userTyping', ({ senderId, isTyping }) => {
        dispatch(setTypingUser({ userId: senderId, isTyping }));
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });
    }

    return () => {
      // Don't disconnect on unmount - keep connection alive
      // Socket will be cleaned up on sign out
    };
  }, [isSignedIn, user?.id, dispatch]);

  const sendTypingIndicator = useCallback((receiverId, isTyping) => {
    if (socket?.connected) {
      socket.emit('typing', { receiverId, isTyping });
    }
  }, []);

  const updateLocation = useCallback((lat, lng) => {
    if (socket?.connected) {
      socket.emit('updateLocation', { lat, lng });
    }
  }, []);

  const getSocket = useCallback(() => socket, []);

  return {
    getSocket,
    sendTypingIndicator,
    updateLocation,
    isConnected,
  };
};

// Clean up socket on sign out
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default useSocket;

