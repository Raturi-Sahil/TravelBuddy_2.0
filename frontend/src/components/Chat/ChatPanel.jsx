import { useAuth } from '@clerk/clerk-react';
import { Loader2, MessageCircle, Send, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useSocket } from '../../hooks/useSocket';
import {
  addNewConversation,
  clearCurrentChat,
  fetchConversations,
  fetchMessages,
  markConversationAsRead,
  sendMessage,
  setCurrentChat,
} from '../../redux/slices/chatSlice';

export default function ChatPanel({ friends = [], onClose }) {
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
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Fetch conversations on mount
  useEffect(() => {
    dispatch(fetchConversations(getToken));
  }, [dispatch, getToken]);

  // Fetch messages when chat is selected
  useEffect(() => {
    if (currentChatUserId) {
      dispatch(fetchMessages({ getToken, userId: currentChatUserId }));
      dispatch(markConversationAsRead(currentChatUserId));
    }
  }, [dispatch, getToken, currentChatUserId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages[currentChatUserId]]);

  // Get current user from conversations or friends
  const currentChatUser = conversations.find(c => c.user._id === currentChatUserId)?.user
    || friends.find(f => f._id === currentChatUserId);

  const handleSelectChat = useCallback((user) => {
    dispatch(setCurrentChat(user._id));
    // Add conversation if it doesn't exist
    dispatch(addNewConversation(user));
    inputRef.current?.focus();
  }, [dispatch]);

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

  const handleStartChat = useCallback((friend) => {
    handleSelectChat(friend);
  }, [handleSelectChat]);

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
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 h-[600px] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-50 to-orange-100">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-orange-500" />
          <h3 className="font-semibold text-gray-800">Messages</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Conversation List */}
        <div className="w-1/3 border-r border-gray-100 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
            </div>
          ) : conversations.length === 0 && friends.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No conversations yet
            </div>
          ) : (
            <>
              {/* Show conversations */}
              {conversations.map((conv) => (
                <div
                  key={conv.user._id}
                  onClick={() => handleSelectChat(conv.user)}
                  className={`p-3 cursor-pointer border-b border-gray-50 hover:bg-orange-50 transition-colors ${
                    currentChatUserId === conv.user._id ? 'bg-orange-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                        {conv.user.profileImage ? (
                          <img src={conv.user.profileImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          conv.user.name?.[0]?.toUpperCase() || '?'
                        )}
                      </div>
                      {conv.user.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-800 text-sm truncate">{conv.user.name}</p>
                        {conv.unreadCount > 0 && (
                          <span className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      {conv.lastMessage && (
                        <p className="text-xs text-gray-500 truncate">
                          {conv.lastMessage.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Show friends without conversations */}
              {friends.filter(f => !conversations.some(c => c.user._id === f._id)).map((friend) => (
                <div
                  key={friend._id}
                  onClick={() => handleStartChat(friend)}
                  className={`p-3 cursor-pointer border-b border-gray-50 hover:bg-orange-50 transition-colors ${
                    currentChatUserId === friend._id ? 'bg-orange-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                      {friend.profileImage ? (
                        <img src={friend.profileImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        friend.name?.[0]?.toUpperCase() || '?'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{friend.name}</p>
                      <p className="text-xs text-gray-400">Start a conversation</p>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col">
          {currentChatUserId && currentChatUser ? (
            <>
              {/* Chat Header */}
              <div className="p-3 border-b border-gray-100 flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                    {currentChatUser.profileImage ? (
                      <img src={currentChatUser.profileImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      currentChatUser.name?.[0]?.toUpperCase() || '?'
                    )}
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">{currentChatUser.name}</p>
                  {typingUsers[currentChatUserId] ? (
                    <p className="text-xs text-orange-500">typing...</p>
                  ) : currentChatUser.isOnline ? (
                    <p className="text-xs text-green-500">Online</p>
                  ) : null}
                </div>
                <button
                  onClick={() => dispatch(clearCurrentChat())}
                  className="ml-auto p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                  </div>
                ) : currentMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    No messages yet. Say hello! 👋
                  </div>
                ) : (
                  currentMessages.map((msg, index) => {
                    const isSent = msg.senderId !== currentChatUserId;
                    const showDate = index === 0 || 
                      new Date(msg.createdAt).toDateString() !== new Date(currentMessages[index - 1].createdAt).toDateString();
                    
                    return (
                      <div key={msg._id || index}>
                        {showDate && (
                          <div className="text-center my-2">
                            <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded-full">
                              {formatDate(msg.createdAt)}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[70%] px-3 py-2 rounded-2xl ${
                              isSent
                                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-br-sm'
                                : 'bg-white text-gray-800 shadow-sm rounded-bl-sm'
                            }`}
                          >
                            <p className="text-sm break-words">{msg.message}</p>
                            <p className={`text-xs mt-1 ${isSent ? 'text-orange-100' : 'text-gray-400'}`}>
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
              <div className="p-3 border-t border-gray-100 bg-white">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={messageInput}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || sendingMessage}
                    className="p-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
