import { useAuth, useUser } from '@clerk/clerk-react';
import EmojiPicker from 'emoji-picker-react';
import {
  ArrowLeft,
  Camera,
  Gift,
  Image as ImageIcon,
  Loader2,
  MapPin,
  MessageCircle,
  Mic,
  MicOff,
  Paperclip,
  Phone,
  PhoneOff,
  Send,
  Smile,
  Sticker,
  Video,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import AudioMessage from '../../components/chat/AudioMessage';
import ChatListItem from '../../components/chat/ChatListItem';
import { useCall } from '../../context/CallContext';
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

const MAX_RECORDING_SECONDS = 30;

const stickers = [
  "https://cdn-icons-png.flaticon.com/512/569/569501.png",
  "https://cdn-icons-png.flaticon.com/512/569/569509.png",
  "https://cdn-icons-png.flaticon.com/512/569/569528.png",
  "https://cdn-icons-png.flaticon.com/512/569/569562.png",
  "https://cdn-icons-png.flaticon.com/512/569/569512.png",
  "https://cdn-icons-png.flaticon.com/512/569/569577.png",
  "https://cdn-icons-png.flaticon.com/512/569/569532.png",
  "https://cdn-icons-png.flaticon.com/512/569/569518.png",
  "https://cdn-icons-png.flaticon.com/512/569/569513.png",
  "https://cdn-icons-png.flaticon.com/512/569/569567.png",
  "https://cdn-icons-png.flaticon.com/512/569/569504.png",
  "https://cdn-icons-png.flaticon.com/512/569/569561.png",
  "https://cdn-icons-png.flaticon.com/512/569/569542.png",
  "https://cdn-icons-png.flaticon.com/512/569/569472.png",
  "https://cdn-icons-png.flaticon.com/512/569/569595.png",
  "https://cdn-icons-png.flaticon.com/512/569/569544.png",
];

export default function ChatPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { user: authUser } = useUser();
  const dispatch = useDispatch();

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

  // Rich media state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeMediaTab, setActiveMediaTab] = useState('emoji');
  const [showAttachments, setShowAttachments] = useState(false);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingRemaining, setRecordingRemaining] = useState(MAX_RECORDING_SECONDS);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  // File inputs
  const imageInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Global Call Context
  const { callUser } = useCall();

  // Initialize socket connection
  const { getSocket, sendTypingIndicator } = useSocket();
  const socket = getSocket();

  // Fetch conversations on mount
  useEffect(() => {
    dispatch(fetchConversations(getToken));
  }, [dispatch, getToken]);

  // Load user info and set current chat when userId changes
  useEffect(() => {
    if (userId) {
      dispatch(setCurrentChat(userId));

      const existingConv = conversations.find(c => c.user._id === userId);
      if (existingConv) {
        setCurrentUser(existingConv.user);
      } else {
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
                clerk_id: response.data.clerk_id,
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
    } else {
      dispatch(setCurrentChat(null));
      setCurrentUser(null);
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
    setShowEmojiPicker(false);

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

    if (currentChatUserId) {
      sendTypingIndicator(currentChatUserId, true);

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

  // Emoji picker
  const handleEmojiClick = (emojiData) => {
    setMessageInput(prev => prev + emojiData.emoji);
    inputRef.current?.focus();
  };

  // Sticker send
  const handleStickerSend = async (stickerUrl) => {
    if (!currentChatUserId || sendingMessage) return;

    setShowEmojiPicker(false);

    const formData = new FormData();
    formData.append("attachmentUrl", stickerUrl);
    formData.append("type", "IMAGE");

    await dispatch(sendMessage({
      getToken,
      receiverId: currentChatUserId,
      message: formData,
    }));
  };

  // File upload
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentChatUserId || sendingMessage) return;

    setShowAttachments(false);

    const formData = new FormData();
    formData.append("attachment", file);

    const toastId = toast.loading("Sending attachment...");

    try {
      await dispatch(sendMessage({
        getToken,
        receiverId: currentChatUserId,
        message: formData,
      }));
      toast.dismiss(toastId);
      toast.success("Attachment sent!");
    } catch {
      toast.dismiss(toastId);
      toast.error("Failed to send attachment");
    } finally {
      e.target.value = null;
    }
  };

  // Location sharing
  const handleLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setShowAttachments(false);
    const toastId = toast.loading("Fetching location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

        await dispatch(sendMessage({
          getToken,
          receiverId: currentChatUserId,
          message: `📍 My Location: ${mapLink}`,
        }));

        toast.dismiss(toastId);
        toast.success("Location shared!");
      },
      (error) => {
        console.error(error);
        toast.error("Unable to retrieve your location");
        toast.dismiss(toastId);
      }
    );
  };

  // Voice recording
  const startRecording = async () => {
    if (isRecording) return;

    clearInterval(recordingIntervalRef.current);
    setRecordingRemaining(MAX_RECORDING_SECONDS);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        clearInterval(recordingIntervalRef.current);
        clearTimeout(recordingTimerRef.current);

        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        audioChunksRef.current = [];

        if (audioBlob.size === 0) {
          toast.error("Recording was too short");
          return;
        }

        const audioFile = new File([audioBlob], "voice_message.webm", {
          type: "audio/webm",
        });

        const formData = new FormData();
        formData.append("attachment", audioFile);
        formData.append("type", "AUDIO");

        const toastId = toast.loading("Sending voice message...");

        try {
          await dispatch(sendMessage({
            getToken,
            receiverId: currentChatUserId,
            message: formData,
          }));
          toast.dismiss(toastId);
          toast.success("Voice message sent!");
        } catch {
          toast.dismiss(toastId);
          toast.error("Failed to send voice message");
        } finally {
          setRecordingRemaining(MAX_RECORDING_SECONDS);
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingRemaining((prev) => {
          if (prev <= 1) {
            stopRecording();
            toast("Max voice message length reached");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      clearInterval(recordingIntervalRef.current);
      clearTimeout(recordingTimerRef.current);
      mediaRecorderRef.current.stop();
      setIsRecording(false);
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

  const handleCallUser = () => {
    callUser(currentUser._id, currentUser.name, currentUser.clerk_id, currentUser.profileImage, false);
  };

  const handleVideoCall = () => {
    callUser(currentUser._id, currentUser.name, currentUser.clerk_id, currentUser.profileImage, true);
  };



  const currentMessages = messages[currentChatUserId] || [];

  // Attachment menu item component
  const AttachmentItem = ({ icon: Icon, label, color, onClick }) => (
    <div className="flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transition-transform" onClick={onClick}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-xs text-gray-500 font-medium">{label}</span>
    </div>
  );

  // Render message with media support
  const renderMessage = (msg, isSent) => {
    const isImage = msg.type === "IMAGE" || (msg.attachmentUrl && msg.attachmentUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i));
    const isAudio = msg.type === "AUDIO" || (msg.attachmentUrl && msg.attachmentUrl.match(/\.(webm|mp3|wav|ogg)$/i));

    // Emoji detection: check if message is only emojis
    const emojiRegex = /^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s]+$/u;
    const emojiCount = msg.message ? [...msg.message].filter(char => /\p{Emoji_Presentation}|\p{Extended_Pictographic}/u.test(char)).length : 0;
    const isOnlyEmoji = !isImage && !isAudio && msg.message && emojiRegex.test(msg.message.trim());
    const isSingleEmoji = isOnlyEmoji && emojiCount === 1;
    const isFewEmojis = isOnlyEmoji && emojiCount >= 2 && emojiCount <= 4;
    // Determine emoji text size class
    const getEmojiSizeClass = () => {
      if (isSingleEmoji) return 'text-6xl py-2';
      if (isFewEmojis) return 'text-3xl py-1';
      return 'text-[15px]';
    };

    return (
      <div className={`max-w-[65%] px-3 pt-2 pb-1.5 rounded-xl shadow-sm relative ${
        isSent
          ? 'bg-gradient-to-br from-orange-100 to-amber-50 text-gray-900 rounded-tr-sm border border-orange-200/50'
          : 'bg-white text-gray-900 rounded-tl-sm border border-gray-100'
      }`}>
        {isImage && msg.attachmentUrl && (
          <div className="mb-1 rounded-lg overflow-hidden">
            <img src={msg.attachmentUrl} alt="Attachment" className="max-w-full max-h-[300px] object-cover rounded-md" />
          </div>
        )}

        {isAudio && msg.attachmentUrl && (
          <div className="mb-1">
            <AudioMessage
              src={msg.attachmentUrl}
              isOwn={isSent}
              senderProfileImage={currentUser?.profileImage}
            />
          </div>
        )}

        {msg.message && (
          <div className="relative">
            <p className={`leading-relaxed break-words ${isOnlyEmoji ? '' : 'pr-14'} ${getEmojiSizeClass()}`}>{msg.message}</p>
            <span className={`text-[10px] ${isOnlyEmoji ? 'block text-right mt-1' : 'absolute bottom-0 right-0'} ${isSent ? 'text-gray-500' : 'text-gray-400'}`}>
              {formatTime(msg.createdAt)}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 pt-20">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header */}


        {/* Chat Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-[calc(100vh-140px)] mx-auto max-w-6xl">
          <div className="flex h-full">
            <div className={`w-full md:w-96 border-r border-orange-100 flex-col bg-white ${currentChatUserId ? 'hidden md:flex' : 'flex'}`}>
              <div className="p-4 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-6 h-6 text-orange-500" />
                  <h3 className="font-semibold text-gray-800 text-lg">Chats</h3>
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
                      className={`cursor-pointer transition-colors ${currentChatUserId === conv.user._id ? 'bg-[#f0f2f5]' : 'hover:bg-gray-50'}`}
                    >
                      <ChatListItem conversation={conv} isActive={currentChatUserId === conv.user._id} />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Window - Right Panel */}
            <div className={`flex-1 flex-col relative ${!currentChatUserId ? 'hidden md:flex' : 'flex'}`}>
              {loadingUser ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                </div>
              ) : currentUser ? (
                <>
                  {/* Chat Header */}
                  <div className="p-3 border-b border-orange-100 flex items-center gap-4 bg-gradient-to-r from-orange-50 to-amber-50">
                    <button
                      onClick={() => navigate('/chat')}
                      className="md:hidden p-1 mr-2 text-gray-500 hover:text-gray-800"
                    >
                      <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="relative">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-lg overflow-hidden shadow-md">
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
                        <p className="text-sm text-orange-500 font-medium animate-pulse">typing...</p>
                      ) : currentUser.isOnline ? (
                        <p className="text-sm text-green-500">Online</p>
                      ) : (
                        <p className="text-sm text-gray-400">Offline</p>
                      )}
                    </div>
                    {/* Call Buttons */}
                    <div className="ml-auto flex items-center gap-2">
                      <button
                        onClick={handleVideoCall}
                        className="p-3 hover:bg-orange-100 rounded-full text-orange-500 transition-colors"
                        title="Start Video Call"
                      >
                        <Video className="w-6 h-6" />
                      </button>
                      <button
                        onClick={handleCallUser}
                        className="p-3 hover:bg-orange-100 rounded-full text-orange-500 transition-colors"
                        title="Start Voice Call"
                      >
                        <Phone className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23f97316" fill-opacity="0.03"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', backgroundColor: '#fef7f0'}}>
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
                              {renderMessage(msg, isSent)}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Emoji/Sticker Picker Overlay */}
                  {showEmojiPicker && (
                    <div className="absolute bottom-20 left-4 bg-white rounded-2xl shadow-2xl border border-gray-200 z-20 overflow-hidden" style={{ width: '320px', height: '400px' }}>
                      {/* Tabs */}
                      <div className="flex items-center bg-gray-50 border-b border-gray-200">
                        <button
                          onClick={() => setActiveMediaTab("emoji")}
                          className={`flex-1 py-3 text-center transition-colors ${activeMediaTab === "emoji" ? "bg-white text-orange-500 border-b-2 border-orange-500" : "text-gray-400 hover:bg-gray-100"}`}
                        >
                          <Smile className="w-5 h-5 mx-auto" />
                        </button>
                        <button
                          onClick={() => setActiveMediaTab("sticker")}
                          className={`flex-1 py-3 text-center transition-colors ${activeMediaTab === "sticker" ? "bg-white text-orange-500 border-b-2 border-orange-500" : "text-gray-400 hover:bg-gray-100"}`}
                        >
                          <Sticker className="w-5 h-5 mx-auto" />
                        </button>
                        <button
                          onClick={() => setActiveMediaTab("gif")}
                          className={`flex-1 py-3 text-center transition-colors ${activeMediaTab === "gif" ? "bg-white text-orange-500 border-b-2 border-orange-500" : "text-gray-400 hover:bg-gray-100"}`}
                        >
                          <Gift className="w-5 h-5 mx-auto" />
                        </button>
                        <button
                          onClick={() => setShowEmojiPicker(false)}
                          className="p-3 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="h-[calc(100%-48px)] overflow-y-auto">
                        {activeMediaTab === "emoji" && (
                          <EmojiPicker
                            theme="light"
                            width="100%"
                            height="100%"
                            onEmojiClick={handleEmojiClick}
                            lazyLoadEmojis={true}
                            searchDisabled={false}
                            previewConfig={{ showPreview: false }}
                          />
                        )}

                        {activeMediaTab === "sticker" && (
                          <div className="p-4 grid grid-cols-4 gap-3">
                            {stickers.map((url, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleStickerSend(url)}
                                className="hover:scale-110 transition-transform p-2 rounded-lg hover:bg-gray-100"
                              >
                                <img src={url} alt="Sticker" className="w-12 h-12 object-contain" />
                              </button>
                            ))}
                          </div>
                        )}

                        {activeMediaTab === "gif" && (
                          <div className="p-4 text-center text-gray-500">
                            <p className="mb-4 text-sm">GIF integration coming soon</p>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="aspect-video bg-gray-100 rounded animate-pulse" />
                              <div className="aspect-video bg-gray-100 rounded animate-pulse" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Attachment Menu Overlay */}
                  {showAttachments && (
                    <div className="absolute bottom-20 left-4 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 z-20" style={{ width: '280px' }}>
                      <div className="grid grid-cols-3 gap-4">
                        <AttachmentItem
                          icon={ImageIcon}
                          label="Photos"
                          color="bg-purple-500"
                          onClick={() => imageInputRef.current?.click()}
                        />
                        <AttachmentItem
                          icon={Camera}
                          label="Camera"
                          color="bg-gray-600"
                          onClick={() => cameraInputRef.current?.click()}
                        />
                        <AttachmentItem
                          icon={MapPin}
                          label="Location"
                          color="bg-green-600"
                          onClick={handleLocation}
                        />
                      </div>
                    </div>
                  )}

                  {/* Message Input */}
                  <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 border-t border-orange-100">
                    <div className="flex items-center gap-2">
                      {/* Attachment Button */}
                      <button
                        onClick={() => {
                          setShowAttachments(!showAttachments);
                          setShowEmojiPicker(false);
                        }}
                        className={`p-2 rounded-full transition-colors ${showAttachments ? 'bg-gray-200 text-gray-600' : 'text-gray-500 hover:bg-gray-200'}`}
                      >
                        <Paperclip className="w-6 h-6" />
                      </button>

                      {/* Emoji Button */}
                      <button
                        onClick={() => {
                          setShowEmojiPicker(!showEmojiPicker);
                          setShowAttachments(false);
                        }}
                        className={`p-2 rounded-full transition-colors ${showEmojiPicker ? 'bg-gray-200 text-gray-600' : 'text-gray-500 hover:bg-gray-200'}`}
                      >
                        <Smile className="w-7 h-7" />
                      </button>

                      {/* Input / Recording indicator */}
                      {isRecording ? (
                        <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-red-50 rounded-lg border border-red-200">
                          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-red-600 font-medium">Recording... {recordingRemaining}s</span>
                        </div>
                      ) : (
                        <input
                          ref={inputRef}
                          type="text"
                          value={messageInput}
                          onChange={handleInputChange}
                          onKeyDown={handleKeyPress}
                          placeholder="Type a message..."
                          className="flex-1 px-4 py-3 bg-white rounded-lg text-base focus:outline-none placeholder-gray-400"
                        />
                      )}

                      {/* Send / Mic Button */}
                      <button
                        onClick={messageInput.trim() ? handleSendMessage : (isRecording ? stopRecording : startRecording)}
                        disabled={sendingMessage}
                        className={`p-3 rounded-full transition-all flex items-center justify-center shadow-md ${
                          isRecording
                            ? 'bg-red-500 hover:bg-red-600'
                            : messageInput.trim()
                              ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600'
                              : 'text-gray-500 hover:bg-white/80 bg-white shadow-sm'
                        }`}
                      >
                        {sendingMessage ? (
                          <Loader2 className="w-6 h-6 animate-spin text-white" />
                        ) : messageInput.trim() ? (
                          <Send className="w-6 h-6 text-white" />
                        ) : isRecording ? (
                          <Send className="w-6 h-6 text-white" />
                        ) : (
                          <Mic className="w-7 h-7" />
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
