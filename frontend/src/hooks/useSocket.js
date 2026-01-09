import { useCallback } from 'react';
import { useSocketContext } from '../context/socketContext';

export const useSocket = () => {
  const { socket } = useSocketContext();

  const getSocket = useCallback(() => socket, [socket]);

  const sendTypingIndicator = useCallback((receiverId, isTyping) => {
    if (socket?.connected) {
      socket.emit('typing', { receiverId, isTyping });
    }
  }, [socket]);

  const updateLocation = useCallback((lat, lng) => {
    if (socket?.connected) {
      socket.emit('updateLocation', { lat, lng });
    }
  }, [socket]);

  return {
    getSocket,
    sendTypingIndicator,
    updateLocation,
    isConnected: !!socket?.connected,
  };
};

export const disconnectSocket = () => {
  // Managed by SocketContext now, no-op or warning
  console.warn("disconnectSocket called but socket is managed by Context");
};

export default useSocket;

