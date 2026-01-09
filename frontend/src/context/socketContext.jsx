import { useUser } from "@clerk/clerk-react";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import io from "socket.io-client";

import { addMessage, setTypingUser } from "../redux/slices/chatSlice";

const SocketContext = createContext();

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useUser();
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      const socketInstance = io(import.meta.env.VITE_API_URL, {
        query: {
          userId: user.id,
        },
      });

      setSocket(socketInstance);

      socketInstance.on("getOnlineUsers", (users) => {
        setOnlineUsers(users);
      });

      socketInstance.on("newMessage", (message) => {
        dispatch(addMessage({
          senderId: message.senderId,
          receiverId: message.receiverId,
          message,
        }));
      });

      socketInstance.on("userTyping", ({ senderId, isTyping }) => {
        dispatch(setTypingUser({ userId: senderId, isTyping }));
      });

      return () => {
        socketInstance.close();
        setSocket(null);
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user?.id]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
