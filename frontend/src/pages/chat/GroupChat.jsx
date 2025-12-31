import { useAuth } from "@clerk/clerk-react";
import {
  Loader2,
  Send,
  Paperclip,
  Image as ImageIcon,
  Camera,
  MapPin,
  User,
  FileText,
  BarChart2,
  Calendar,
  IndianRupee,
  Sparkles,
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Mic,
  Smile,
  Sticker,
  Gift,
  UserPlus,
  X,
  Search,
  Check
} from "lucide-react";
import EmojiPicker from 'emoji-picker-react';
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import AudioMessage from "../../components/chat/AudioMessage";


import { createAuthenticatedApi, groupChatService, userService } from "../../redux/services/api";
import { useDispatch, useSelector } from "react-redux";
import { fetchFriends } from "../../redux/slices/userSlice";
import { inviteUsersToActivity } from "../../redux/slices/ActivitySlice";

function GroupChat() {
  const { activityId } = useParams();
  const { getToken, userId } = useAuth();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { friends } = useSelector((state) => state.user);

  const authApi = createAuthenticatedApi(getToken);

  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [showStickers, setShowStickers] = useState(false);
  const [activeMediaTab, setActiveMediaTab] = useState("emoji"); // emoji | sticker | gif

  // Invite Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [invitedUsers, setInvitedUsers] = useState(new Set());
  const [invitingLoader, setInvitingLoader] = useState(new Set());

  const [showAttachments, setShowAttachments] = useState(false);
  const messagesEndRef = useRef(null);

  const MAX_RECORDING_SECONDS = 30;
  const recordingTimerRef = useRef(null);      // auto-stop timer
  const recordingIntervalRef = useRef(null);   // countdown interval
  const [recordingRemaining, setRecordingRemaining] = useState(MAX_RECORDING_SECONDS);


  const stickers = [
    "https://cdn-icons-png.flaticon.com/512/569/569501.png", // Smile
    "https://cdn-icons-png.flaticon.com/512/569/569509.png", // Wink
    "https://cdn-icons-png.flaticon.com/512/569/569528.png", // Cool
    "https://cdn-icons-png.flaticon.com/512/569/569562.png", // Sad
    "https://cdn-icons-png.flaticon.com/512/569/569512.png", // Love
    "https://cdn-icons-png.flaticon.com/512/569/569577.png", // Angry
    "https://cdn-icons-png.flaticon.com/512/569/569532.png", // Tongue
    "https://cdn-icons-png.flaticon.com/512/569/569518.png", // Surprised
    "https://cdn-icons-png.flaticon.com/512/569/569513.png", // Cry
    "https://cdn-icons-png.flaticon.com/512/569/569567.png", // Devil
    "https://cdn-icons-png.flaticon.com/512/569/569504.png", // Happy
    "https://cdn-icons-png.flaticon.com/512/569/569561.png", // Unhappy
    "https://cdn-icons-png.flaticon.com/512/569/569542.png", // Sleep
    "https://cdn-icons-png.flaticon.com/512/569/569472.png", // Ghost
    "https://cdn-icons-png.flaticon.com/512/569/569595.png", // Poop
    "https://cdn-icons-png.flaticon.com/512/569/569544.png", // Mask
    "https://cdn-icons-png.flaticon.com/512/569/569485.png", // Alien
    "https://cdn-icons-png.flaticon.com/512/569/569493.png", // Skull
    "https://cdn-icons-png.flaticon.com/512/569/569572.png", // Shock
    "https://cdn-icons-png.flaticon.com/512/569/569549.png", // Nerd
  ];

  const handleStickerSend = async (stickerUrl) => {
    // Send as an image message, but maybe we download it and send as file?
    // Or just send the URL if backend supported it.
    // But my backend expects "attachment" file for images usually or "message" text.
    // If I send URL as text, it renders as text unless I implement URL preview or handle it.
    // But I implemented `attachmentUrl`.
    // I can't easily populate `attachmentUrl` without uploading a file.
    // OPTION 1: Send as Text with a special flag?
    // OPTION 2: Fetch the sticker blob and upload it.

    try {
      setIsSending(true);
      setShowStickers(false);

      // Send sticker URL directly without re-uploading
      const formData = new FormData();
      formData.append("attachmentUrl", stickerUrl);
      formData.append("type", "IMAGE");

      const res = await groupChatService.sendGroupChatMessage(
        authApi,
        chat._id,
        formData
      );
      setMessages((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("Failed to send sticker", err);
      toast.error("Failed to send sticker");
    } finally {
      setIsSending(false);
    }
  };


  const imageInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  // Load User Profile (to get Mongo ID)
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await userService.getProfile(authApi);
        setCurrentUser(res.data);
      } catch (err) {
        console.error("Failed to load user profile", err);
      }
    };
    if (userId) {
      loadUser();
      dispatch(fetchFriends(getToken));
    }
  }, [userId, dispatch, getToken]);

  // Load chat + messages
  useEffect(() => {
    const loadChat = async () => {
      try {
        setLoading(true);

        const chatRes = await groupChatService.getGroupChatByActivity(
          authApi,
          activityId
        );
        setChat(chatRes.data);

        const msgRes = await groupChatService.getGroupChatMessages(
          authApi,
          chatRes.data._id
        );
        setMessages(msgRes.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load chat");
      } finally {
        setLoading(false);
      }
    };

    if (activityId) {
      loadChat();
    }
  }, [activityId]);

  // Send message (Text)
  const handleSend = async () => {
    if (!message.trim() || !chat?._id || isSending) return;

    try {
      setIsSending(true);
      const res = await groupChatService.sendGroupChatMessage(
        authApi,
        chat._id,
        message
      );

      setMessages((prev) => [...prev, res.data]);
      setMessage("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const startRecording = async () => {
    if (isRecording) return;
    clearInterval(recordingIntervalRef.current);
    recordingIntervalRef.current = null;
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

        try {
          setIsSending(true);
          const res = await groupChatService.sendGroupChatMessage(
            authApi,
            chat._id,
            formData
          );
          setMessages((prev) => [...prev, res.data]);
        } catch (err) {
          toast.error("Failed to send voice message");
        } finally {
          setIsSending(false);
          setRecordingRemaining(MAX_RECORDING_SECONDS);
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      // Start Countdown & Auto-stop
      setRecordingRemaining(MAX_RECORDING_SECONDS);
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
    } catch (err) {
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

  // Send File (Image/Doc)
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file || !chat?._id) return;

    const formData = new FormData();
    formData.append("attachment", file);
    // Optional: add a caption if message input has text, but checking backend logic it might be separate.
    // Let's just send empty message or a default text if needed.
    // Backend expects 'message' field if no file, but with file it's optional.
    // For now, let's send standard "Sent an attachment" or empty.
    // Just appending message empty string if needed or nothing.

    try {
      setIsSending(true);
      setShowAttachments(false); // Close menu

      // Show loading toast since this might take a moment
      const toastId = toast.loading("Sending attachment...");

      const res = await groupChatService.sendGroupChatMessage(
        authApi,
        chat._id,
        formData
      );

      toast.dismiss(toastId);
      setMessages((prev) => [...prev, res.data]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload file");
    } finally {
      setIsSending(false);
      // Reset input
      e.target.value = null;
    }
  };

  // Invite Logic
  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const limit = 20;
      const response = await userService.getNearbyTravelers(authApi, { search: searchQuery, limit });
      setSearchResults(response.data.users || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to search users');
    } finally {
      setIsSearching(false);
    }
  };

  const handleInviteUser = async (userToInviteId) => {
    setInvitingLoader(prev => new Set(prev).add(userToInviteId));
    try {
      await dispatch(inviteUsersToActivity({
        getToken,
        activityId: activityId, // Use the activityID from params
        userIds: [userToInviteId]
      })).unwrap();

      setInvitedUsers(prev => new Set(prev).add(userToInviteId));
      toast.success('Invitation sent successfully');
    } catch (err) {
      toast.error(err || 'Failed to send invitation');
    } finally {
      setInvitingLoader(prev => {
        const next = new Set(prev);
        next.delete(userToInviteId);
        return next;
      });
    }
  };

  // Send Location
  const handleLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsSending(true);
    setShowAttachments(false);
    const toastId = toast.loading("Fetching location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

        try {
          const res = await groupChatService.sendGroupChatMessage(
            authApi,
            chat._id,
            `📍 My Location: ${mapLink}`
          );
          setMessages((prev) => [...prev, res.data]);
        } catch (err) {
          console.error(err);
          toast.error("Failed to send location");
        } finally {
          toast.dismiss(toastId);
          setIsSending(false);
        }
      },
      (error) => {
        console.error(error);
        toast.error("Unable to retrieve your location");
        toast.dismiss(toastId);
        setIsSending(false);
      }
    );
  };

  const AttachmentItem = ({ icon: Icon, label, color, onClick }) => (
    <div className="flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transition-transform" onClick={onClick}>
      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-xs text-gray-300 font-medium">{label}</span>
    </div>
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0b141a]">
        <Loader2 className="w-8 h-8 animate-spin text-[#00a884]" />
      </div>
    );
  }

  // Determine chat image (group icon or default)
  const chatImage = "https://cdn-icons-png.flaticon.com/512/166/166258.png";

  return (
    <div className="h-screen flex flex-col bg-black overflow-hidden relative pt-24">
      {/* Background Pattern Overlay (Optional) */}

      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat z-0" />

      {/* Hidden Inputs */}
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

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/90 backdrop-blur-md border-b border-gray-800 z-10 shrink-0">

        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-300 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-700">
            <img src={chatImage} alt="Group" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-white font-medium text-base leading-tight truncate max-w-[200px]">
              {chat?.name || "Group Chat"}
            </h1>
            <p className="text-xs text-orange-500 truncate">
              {chat?.participants?.length ? `${chat.participants.length} participants` : "Tap for info"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-5 text-gray-300">
          {/* Invite Button (Only for Creator) */}
          {chat?.createdBy?._id === userId && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="p-2 bg-orange-600/20 hover:bg-orange-600 text-orange-500 hover:text-white rounded-full transition-all"
              title="Invite Participants"
            >
              <UserPlus className="w-5 h-5" />
            </button>
          )}
          <Video className="w-6 h-6 cursor-pointer hover:text-orange-500 transition-colors" />
          <Phone className="w-5 h-5 cursor-pointer hover:text-orange-500 transition-colors" />
          <MoreVertical className="w-5 h-5 cursor-pointer hover:text-white" />
        </div>
      </div>


      <div className="flex-1 overflow-y-auto px-4 sm:px-12 py-4 space-y-2 z-10 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
        {messages.map((msg) => {
          const isOwn = msg.senderId === currentUser?._id;
          const isImage = msg.type === "IMAGE" || (msg.attachmentUrl && msg.attachmentUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i));
          const isAudio = msg.type === "AUDIO" || (msg.attachmentUrl && msg.attachmentUrl.match(/\.(webm|mp3|wav|ogg)$/i));

          return (
            <div
              key={msg._id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-1 group`}
            >
              <div
                className={`relative px-4 py-2 max-w-[85%] sm:max-w-[65%] text-sm rounded-2xl shadow-sm
                  ${isOwn
                    ? "bg-orange-600 text-white rounded-br-none"
                    : "bg-gray-800 text-gray-100 rounded-bl-none"
                  }`}
              >
                {/* Sender Name (only for others) */}
                {!isOwn && (
                  <p className="text-[11px] font-bold text-orange-400 mb-0.5 leading-tight">
                    {msg.senderName || "User"}
                  </p>
                )}

                <div className="flex flex-col">
                  {isImage && msg.attachmentUrl ? (
                    <div className="mb-2 rounded-lg overflow-hidden">
                      <img src={msg.attachmentUrl} alt="Attachment" className="w-full h-auto max-h-[300px] object-cover" />
                    </div>
                  ) : null}

                  {isAudio && msg.attachmentUrl && (
                    <div className="">
                      <AudioMessage
                        src={msg.attachmentUrl}
                        isOwn={isOwn}
                        senderProfileImage={chat?.participants?.find(p => p._id === msg.senderId)?.profileImage}
                      />
                    </div>
                  )}

                  {msg.message && <span className="break-words text-[15px] leading-snug pr-2">{msg.message}</span>}

                  <span className={`text-[10px] min-w-[50px] text-right ml-auto -mb-1 inline-block ${isOwn ? 'text-orange-100/80' : 'text-gray-400'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true
                    })}
                    {isOwn && <span className="ml-1 text-white font-bold">✓✓</span>}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Menu Overlay */}
      {showAttachments && (
        <div
          className="absolute bottom-20 left-4 bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-2xl z-20 animate-in fade-in zoom-in-95 duration-200"
          style={{ width: 'min(90vw, 350px)' }}
        >
          <div className="grid grid-cols-3 gap-y-6 gap-x-4">
            <AttachmentItem
              icon={ImageIcon}
              label="Photos"
              color="bg-gradient-to-br from-orange-400 to-orange-600"
              onClick={() => imageInputRef.current?.click()}
            />
            <AttachmentItem
              icon={Camera}
              label="Camera"
              color="bg-gray-700"
              onClick={() => cameraInputRef.current?.click()}
            />
            <AttachmentItem
              icon={MapPin}
              label="Location"
              color="bg-gray-700"
              onClick={handleLocation}
            />

            <AttachmentItem icon={User} label="Contact" color="bg-blue-600" onClick={() => toast("Contact sharing coming soon")} />
            <AttachmentItem icon={FileText} label="Document" color="bg-indigo-600" onClick={() => toast("Document sharing coming soon")} />
            <AttachmentItem icon={BarChart2} label="Poll" color="bg-yellow-600" onClick={() => toast("Polls coming soon")} />

            <AttachmentItem icon={Calendar} label="Event" color="bg-red-600" onClick={() => toast("Events coming soon")} />
            <AttachmentItem icon={IndianRupee} label="Payment" color="bg-green-600" onClick={() => toast("Payments coming soon")} />
            <AttachmentItem icon={Sparkles} label="AI images" color="bg-purple-600" onClick={() => toast("AI Image Gen coming soon")} />
          </div>
        </div>
      )}


      {/* Input Area */}
      <div className="p-3 bg-black border-t border-gray-800 flex items-end gap-2 z-20 shrink-0">
        {/* Attachment Button */}
        <button
          onClick={() => {
            setShowAttachments(!showAttachments);
            setShowStickers(false);
          }}
          className={`p-3 rounded-full text-gray-400 hover:text-orange-500 transition-colors ${showAttachments ? 'bg-gray-900 text-orange-500' : ''}`}
        >
          <div className={`transition-transform duration-200 ${showAttachments ? 'rotate-45' : ''}`}>
            <span className="text-2xl font-light leading-none">+</span>
          </div>
        </button>

        <div className="flex-1 bg-gray-900 border border-gray-800 rounded-full flex items-center min-h-[46px] px-4 py-1">

          {/* Rich Media Picker Overlay */}
          {showStickers && (
            <div
              className="absolute bottom-16 left-0 sm:left-4 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl z-20 overflow-hidden flex flex-col"
              style={{ width: 'min(100vw, 350px)', height: '450px' }}
            >
              {/* Tabs */}
              <div className="flex items-center bg-gray-800 border-b border-gray-700">
                <button
                  onClick={() => setActiveMediaTab("emoji")}
                  className={`flex-1 py-3 text-center transition-colors ${activeMediaTab === "emoji" ? "bg-gray-700 text-white" : "text-gray-400 hover:bg-gray-700/50"}`}
                >
                  <Smile className="w-5 h-5 mx-auto" />
                </button>
                <button
                  onClick={() => setActiveMediaTab("gif")}
                  className={`flex-1 py-3 text-center transition-colors ${activeMediaTab === "gif" ? "bg-gray-700 text-white" : "text-gray-400 hover:bg-gray-700/50"}`}
                >
                  <Gift className="w-5 h-5 mx-auto" />
                </button>
                <button
                  onClick={() => setActiveMediaTab("sticker")}
                  className={`flex-1 py-3 text-center transition-colors ${activeMediaTab === "sticker" ? "bg-gray-700 text-white" : "text-gray-400 hover:bg-gray-700/50"}`}
                >
                  <Sticker className="w-5 h-5 mx-auto" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent bg-[#111b21]">
                {activeMediaTab === "emoji" && (
                  <EmojiPicker
                    theme="dark"
                    width="100%"
                    height="100%"
                    onEmojiClick={(emojiData) => setMessage(prev => prev + emojiData.emoji)}
                    lazyLoadEmojis={true}
                    searchDisabled={false}
                    previewConfig={{ showPreview: false }}
                  />
                )}

                {activeMediaTab === "sticker" && (
                  <div className="p-4 grid grid-cols-4 gap-4">
                    {stickers.map((url, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleStickerSend(url)}
                        className="hover:scale-110 transition-transform p-1"
                      >
                        <img src={url} alt="Sticker" className="w-12 h-12 object-contain" style={{ filter: 'invert(69%) sepia(61%) saturate(2682%) hue-rotate(352deg) brightness(103%) contrast(104%)' }} />
                      </button>
                    ))}
                  </div>
                )}

                {activeMediaTab === "gif" && (
                  <div className="p-4 text-center text-gray-500">
                    <p className="mb-4 text-sm">GIF integration coming soon</p>
                    <div className="grid grid-cols-2 gap-2">
                      {/* Placeholders */}
                      <div className="aspect-video bg-gray-800 rounded animate-pulse" />
                      <div className="aspect-video bg-gray-800 rounded animate-pulse" />
                      <div className="aspect-video bg-gray-800 rounded animate-pulse" />
                      <div className="aspect-video bg-gray-800 rounded animate-pulse" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {isRecording ? (
            <div className="flex-1 flex items-center gap-2 animate-pulse text-red-500">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-bounce" />
              <span className="text-sm font-medium">Recording… {recordingRemaining}s</span>
            </div>
          ) : (
            <>
              <button
                className={`text-gray-400 hover:text-orange-500 mr-2 transition-colors ${showStickers ? 'text-orange-500' : ''}`}
                onClick={() => {
                  setShowStickers(!showStickers);
                  setShowAttachments(false);
                }}
              >
                <Smile className="w-6 h-6" />
              </button>
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-transparent text-white text-[15px] outline-none placeholder-gray-500 min-h-[24px]"
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={isSending}
                autoFocus
              />
            </>
          )}
        </div>


        {/* Send / Mic Button */}
        <button
          onClick={message.trim() ? handleSend : (isRecording ? stopRecording : startRecording)}
          disabled={isSending}
          className={`p-3 rounded-full shadow-lg shadow-orange-900/20 flex items-center justify-center transition-all transform active:scale-95 ${isRecording ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-orange-600 hover:bg-orange-700'}`}
        >
          {isSending ? (
            <Loader2 className="w-5 h-5 animate-spin text-white" />
          ) : (
            message.trim()
              ? <Send className="w-5 h-5 ml-0.5 text-white" />
              : (isRecording ? <Send className="w-5 h-5 ml-0.5 text-white" /> : <Mic className="w-5 h-5 text-white" />)
            // If recording, show Send icon to indicate "Stop & Send", or maybe a Stop icon.
            // WhatsApp shows a Mic icon that gets bigger or a Send icon.
            // Let's explicitly show Send icon when recording to mean "Send Voice Note".
          )}
        </button>
      </div>
       {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200 h-[600px] flex flex-col border border-gray-800">
            {/* Modal Header */}
            <div className="bg-gray-800 p-6 border-b border-gray-700 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-600/20 rounded-full">
                    <UserPlus className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Invite to Group</h3>
                    <p className="text-gray-400 text-sm">Add friends to this chat</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="p-2 hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex-1 flex flex-col overflow-hidden">
              {/* Search Bar */}
              <div className="relative mb-6 flex-shrink-0">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchUsers()}
                  placeholder="Search by name..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition-colors text-white placeholder-gray-500"
                  autoFocus
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <button
                  onClick={handleSearchUsers}
                  disabled={!searchQuery.trim() || isSearching}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-orange-600 text-white rounded-lg text-xs font-bold hover:bg-orange-700 disabled:opacity-50 transition-colors"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                </button>
              </div>

              {/* Results List */}
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
               {isSearching ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin mb-2 text-orange-500" />
                    <p>Searching travelers...</p>
                  </div>
                ) : (searchResults.length > 0 ? searchResults : friends).filter(u => !searchQuery || searchResults.length > 0 || u.name?.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                  (searchResults.length > 0 ? searchResults : friends)
                    .filter(u => !searchQuery || searchResults.length > 0 || u.name?.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((user) => {
                    const isParticipant = chat?.participants?.some(p => p._id === user._id || p === user._id);
                    const isInvited = invitedUsers.has(user._id);
                    const isLoading = invitingLoader.has(user._id);

                    return (
                      <div key={user._id} className="flex items-center justify-between p-3 bg-gray-800 rounded-xl hover:bg-gray-750 transition-colors border border-gray-750">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.profilePicture || user.profileImage || `https://ui-avatars.com/api/?name=${user.fullName || user.name}`}
                            alt={user.fullName || user.name}
                            className="w-10 h-10 rounded-full object-cover border border-gray-600"
                          />
                          <div>
                            <p className="font-semibold text-gray-200">{user.fullName || user.name}</p>
                            {(user.distanceKm !== null && user.distanceKm !== undefined) && (
                              <p className="text-xs text-gray-500">{user.distanceKm} km away</p>
                            )}
                          </div>
                        </div>

                        {isParticipant ? (
                          <span className="px-3 py-1.5 bg-green-900/30 text-green-400 text-xs font-bold rounded-lg flex items-center gap-1 border border-green-900/50">
                            <Check className="w-3 h-3" /> Joined
                          </span>
                        ) : isInvited ? (
                          <span className="px-3 py-1.5 bg-orange-900/30 text-orange-400 text-xs font-bold rounded-lg border border-orange-900/50">
                            Invited
                          </span>
                        ) : (
                          <button
                            onClick={() => handleInviteUser(user._id)}
                            disabled={isLoading}
                            className="px-3 py-1.5 bg-orange-600 text-white hover:bg-orange-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50 shadow-lg shadow-orange-900/20"
                          >
                            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                            Invite
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 text-gray-600">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      {searchQuery ? <Search className="w-8 h-8 opacity-50" /> : <UserPlus className="w-8 h-8 opacity-50" />}
                    </div>
                    <p>{searchQuery ? "No travelers found." : "Invite your friends to join!"}</p>
                  </div>
                )}
              </div>
            </div>

             <div className="p-4 bg-gray-800 border-t border-gray-700 text-center">
               <p className="text-xs text-gray-500">Invited users will join this chat and the activity.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

}

export default GroupChat;

