import { useAuth } from '@clerk/clerk-react';
import { ArrowLeft, Loader2, MessageCircle, Send } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import ChatListItem from '../../components/Chat/ChatListItem';
import { useSocket } from '../../hooks/useSocket';
import { createAuthenticatedApi, userService } from '../../redux/services/api';
import {
  addNewConversation,
  fetchConversations,
  fetchMessages,
  markConversationAsRead,
  sendMessage,
  setCurrentChat,
} from '../../redux/slices/chatSlice';

export default function ChatPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const { sendTypingIndicator } = useSocket();
  
  const {
    conversations,
    currentChatUserId,
    messages,
    loading,
    messagesLoading,
    sendingMessage,
    typingUsers,
  } = useSelector((state) => state.chat);
  
  const [messageInput, setMessageInput] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize socket connection
  useSocket();

  // Fetch conversations on mount
  useEffect(() => {
    dispatch(fetchConversations(getToken));
  }, [dispatch, getToken]);

  // Load user info and set current chat when userId changes
  useEffect(() => {
    if (userId) {
      dispatch(setCurrentChat(userId));
      
      // Check if user exists in conversations
      const existingConv = conversations.find(c => c.user._id === userId);
      if (existingConv) {
        setCurrentUser(existingConv.user);
      } else {
        // Fetch user details if not in conversations
        const loadUser = async () => {
          setLoadingUser(true);
          try {
            const authApi = createAuthenticatedApi(getToken);
            const response = await userService.getUserById(authApi, userId);
            if (response.statusCode === 200) {
              const user = {
                _id: response.data._id,
                name: response.data.fullName,
                profileImage: response.data.profilePicture,
                isOnline: response.data.isOnline,
              };
              setCurrentUser(user);
              dispatch(addNewConversation(user));
            }
          } catch (err) {
            console.error('Failed to load user:', err);
          } finally {
            setLoadingUser(false);
          }
        };
        loadUser();
      }
    }
  }, [userId, conversations, dispatch, getToken]);

  // Fetch messages when chat is selected
  useEffect(() => {
    if (currentChatUserId) {
      dispatch(fetchMessages({ getToken, userId: currentChatUserId }));
      dispatch(markConversationAsRead(currentChatUserId));
    }
  }, [dispatch, getToken, currentChatUserId]);

  // Auto-scroll to bottom on new messages
  const currentMessagesForScroll = messages[currentChatUserId];
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessagesForScroll]);

  // Focus input when chat loads
  useEffect(() => {
    if (currentUser && !loadingUser) {
      inputRef.current?.focus();
    }
  }, [currentUser, loadingUser]);

  const handleSelectChat = useCallback((user) => {
    navigate(`/chat/${user._id}`);
  }, [navigate]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || sendingMessage || !currentChatUserId) return;
    
    const message = messageInput.trim();
    setMessageInput('');
    
    // Clear typing indicator
    sendTypingIndicator(currentChatUserId, false);
    
    await dispatch(sendMessage({
      getToken,
      receiverId: currentChatUserId,
      message,
    }));
    
    inputRef.current?.focus();
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    
    // Send typing indicator
    if (currentChatUserId) {
      sendTypingIndicator(currentChatUserId, true);
      
      // Clear typing after 2 seconds of no input
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingIndicator(currentChatUserId, false);
      }, 2000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString();
  };

  const currentMessages = messages[currentChatUserId] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate('/connections')} 
            className="flex items-center gap-2 text-gray-500 hover:text-orange-600 transition-colors group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Connections</span>
          </button>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden h-[calc(100vh-180px)]">
          <div className="flex h-full">
            {/* Conversation List - Left Panel */}
            <div className="w-80 border-r border-gray-100 flex flex-col">
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-orange-100">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-orange-500" />
                  <h3 className="font-semibold text-gray-800">Messages</h3>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No conversations yet
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv.user._id}
                      onClick={() => handleSelectChat(conv.user)}
                      className={`cursor-pointer ${currentChatUserId === conv.user._id ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''}`}
                    >
                      <ChatListItem conversation={conv} isActive={currentChatUserId === conv.user._id} />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Window - Right Panel */}
            <div className="flex-1 flex flex-col">
              {loadingUser ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                </div>
              ) : currentUser ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-white">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden shadow-md">
                        {currentUser.profileImage ? (
                          <img src={currentUser.profileImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          currentUser.name?.[0]?.toUpperCase() || '?'
                        )}
                      </div>
                      <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${currentUser.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{currentUser.name}</p>
                      {typingUsers[currentChatUserId] ? (
                        <p className="text-sm text-orange-500 animate-pulse">typing...</p>
                      ) : currentUser.isOnline ? (
                        <p className="text-sm text-green-500">Online</p>
                      ) : (
                        <p className="text-sm text-gray-400">Offline</p>
                      )}
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                      </div>
                    ) : currentMessages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-400 text-center">
                        <div>
                          <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                          <p className="text-lg font-medium">No messages yet</p>
                          <p className="text-sm">Say hello to start the conversation! 👋</p>
                        </div>
                      </div>
                    ) : (
                      currentMessages.map((msg, index) => {
                        const isSent = msg.senderId !== currentChatUserId;
                        const showDate = index === 0 || 
                          new Date(msg.createdAt).toDateString() !== new Date(currentMessages[index - 1].createdAt).toDateString();
                        
                        return (
                          <div key={msg._id || index}>
                            {showDate && (
                              <div className="text-center my-4">
                                <span className="text-xs text-gray-400 bg-white px-3 py-1.5 rounded-full shadow-sm">
                                  {formatDate(msg.createdAt)}
                                </span>
                              </div>
                            )}
                            <div className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
                              <div
                                className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-sm ${
                                  isSent
                                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-br-md'
                                    : 'bg-white text-gray-800 rounded-bl-md'
                                }`}
                              >
                                <p className="text-sm leading-relaxed break-words">{msg.message}</p>
                                <p className={`text-xs mt-1.5 ${isSent ? 'text-orange-100' : 'text-gray-400'}`}>
                                  {formatTime(msg.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-100 bg-white">
                    <div className="flex items-center gap-3">
                      <input
                        ref={inputRef}
                        type="text"
                        value={messageInput}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1 px-5 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim() || sendingMessage}
                        className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                      >
                        {sendingMessage ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">Select a conversation</p>
                    <p className="text-sm">Choose a friend to start chatting</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
