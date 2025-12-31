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
  Check,
  CheckCircle2,
  Clock,
  ChevronDown,
  Plus
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

  const isOnlyEmojis = (text) => {
    if (!text) return false;
    // Standard emoji regex
    const emojiRegex = /^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]|[ \u200d\ufe0f])+\s*$/;
    const cleanText = text.trim();
    if (!emojiRegex.test(cleanText)) return false;

    // Count emojis (not characters)
    try {
      const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
      const count = [...segmenter.segment(cleanText)].filter(s => s.segment.trim().length > 0).length;
      return count >= 1 && count <= 3;
    } catch (e) {
      // Fallback for older browsers if Segmenter is missing
      return cleanText.length <= 12; // Very rough fallback
    }
  };

  const [showStickers, setShowStickers] = useState(false);
  const [activeMediaTab, setActiveMediaTab] = useState("emoji"); // emoji | sticker | gif

  // Invite Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [invitedUsers, setInvitedUsers] = useState(new Set());
  const [invitingLoader, setInvitingLoader] = useState(new Set());

  // Attachment Modals State
  const [showPollModal, setShowPollModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAIImageModal, setShowAIImageModal] = useState(false);
  const [showFriendSelectModal, setShowFriendSelectModal] = useState(false);

  // Modal Input States
  const [pollForm, setPollForm] = useState({ question: "", options: ["", ""] });
  const [eventForm, setEventForm] = useState({ title: "", date: "", time: "", description: "" });
  const [paymentForm, setPaymentForm] = useState({ amount: "", reason: "" });
  const [aiPrompt, setAiPrompt] = useState("");
  const [userVotes, setUserVotes] = useState({}); // { [messageId]: [optionIndices] }
  const [eventResponses, setEventResponses] = useState({}); // { [messageId]: 'going' | 'maybe' | 'not' }
  const [activeEventMenu, setActiveEventMenu] = useState(null); // messageId
  const [editingMessageId, setEditingMessageId] = useState(null);

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
  const documentInputRef = useRef(null);

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

  const sendCustomMessage = async (prefix, data) => {
    if (!chat?._id || isSending) return;
    try {
      setIsSending(true);
      const customMsg = `${prefix}${JSON.stringify(data)}`;
      const res = await groupChatService.sendGroupChatMessage(
        authApi,
        chat._id,
        customMsg
      );
      setMessages((prev) => [...prev, res.data]);
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

  const handleDocumentSelect = async (e) => {
    const file = e.target.files[0];
    if (!file || !chat?._id) return;

    const formData = new FormData();
    formData.append("attachment", file);
    formData.append("type", "DOCUMENT");

    try {
      setIsSending(true);
      setShowAttachments(false);
      const toastId = toast.loading("Sending document...");

      const res = await groupChatService.sendGroupChatMessage(
        authApi,
        chat._id,
        formData
      );

      toast.dismiss(toastId);
      setMessages((prev) => [...prev, res.data]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload document");
    } finally {
      setIsSending(false);
      e.target.value = null;
    }
  };

  const handlePaste = async (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const file = new File([blob], `pasted_image_${Date.now()}.png`, { type: blob.type });

          const formData = new FormData();
          formData.append("attachment", file);

          try {
            setIsSending(true);
            const toastId = toast.loading("Sending pasted image...");
            const res = await groupChatService.sendGroupChatMessage(authApi, chat._id, formData);
            toast.dismiss(toastId);
            setMessages((prev) => [...prev, res.data]);
          } catch (err) {
            toast.error("Failed to upload pasted image");
          } finally {
            setIsSending(false);
          }
        }
      }
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

  const handleEditEvent = (msg) => {
    try {
      const eventData = JSON.parse(msg.message.replace("[EVENT]", ""));
      setEventForm({
        title: eventData.title || "",
        date: eventData.date || "",
        time: eventData.time || "",
        description: eventData.description || ""
      });
      setEditingMessageId(msg._id);
      setShowEventModal(true);
    } catch (e) {
      toast.error("Failed to load event data");
    }
  };

  const handleVote = (msgId, optionIndex) => {
    setUserVotes(prev => {
      const currentVotes = prev[msgId] || [];
      if (currentVotes.includes(optionIndex)) {
        return { ...prev, [msgId]: currentVotes.filter(i => i !== optionIndex) };
      } else {
        return { ...prev, [msgId]: [...currentVotes, optionIndex] };
      }
    });
    toast.success("Vote updated!");
  };

  const formatDateSeparator = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (messageDate.getTime() === today.getTime()) {
      return "Today";
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], {
        day: "numeric",
        month: "long",
        year: "numeric"
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
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-1.5 hover:bg-gray-50 transition-colors group first:rounded-t-2xl last:rounded-b-2xl"
    >
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white shadow-sm shrink-0 ${color} group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-sm text-gray-700 font-semibold">{label}</span>
    </button>
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FAF9F6]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  // Determine chat image (group icon or default)
  const chatImage = "https://cdn-icons-png.flaticon.com/512/166/166258.png";

  return (
    <div className="h-screen flex flex-col bg-[#FAF9F6] pt-[116px] overflow-hidden relative">
      {/* Background Pattern Overlay (Optional) */}

      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat z-0" />

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
        ref={documentInputRef}
        onChange={handleDocumentSelect}
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

      {/* Centered Content Wrapper */}
      <div className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-2 sm:px-6 md:px-8 pb-4 sm:pb-8 relative z-10 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 z-10 shrink-0 shadow-sm rounded-t-3xl">

          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-orange-600 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-orange-100">
              <img src={chatImage} alt="Group" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-gray-900 font-bold text-base leading-tight truncate max-w-[200px]">
                {chat?.name || "Group Chat"}
              </h1>
              <p className="text-[10px] text-green-600 font-semibold uppercase tracking-wider">
                {chat?.participants?.length ? `${chat.participants.length} participants • Online` : "Tap for info"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-5 text-gray-500">
            {/* Invite Button (Only for Creator) */}
            {chat?.createdBy?._id === userId && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="p-2 bg-orange-100 hover:bg-orange-600 text-orange-600 hover:text-white rounded-full transition-all"
                title="Invite Participants"
              >
                <UserPlus className="w-5 h-5" />
              </button>
            )}
            <Video className="w-6 h-6 cursor-pointer hover:text-orange-600 transition-colors" />
            <Phone className="w-5 h-5 cursor-pointer hover:text-orange-600 transition-colors" />
            <MoreVertical className="w-5 h-5 cursor-pointer hover:text-gray-900" />
          </div>
        </div>


        <div className="flex-1 overflow-y-auto px-4 sm:px-12 py-4 space-y-2 z-10 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent bg-white/20">
          {messages.map((msg, index) => {
            const isOwn = msg.senderId === currentUser?._id;
            const isImage = msg.type === "IMAGE" || (msg.attachmentUrl && msg.attachmentUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i));
            const isSticker = isImage && msg.attachmentUrl && msg.attachmentUrl.includes("flaticon.com");
            const isAudio = msg.type === "AUDIO" || (msg.attachmentUrl && msg.attachmentUrl.match(/\.(webm|mp3|wav|ogg)$/i));
            const isJumboEmoji = !isImage && !isAudio && !msg.attachmentUrl && isOnlyEmojis(msg.message);
            const hideBubble = isSticker || isJumboEmoji;

            const prevMsg = index > 0 ? messages[index - 1] : null;
            const showDateSeparator = !prevMsg ||
              new Date(msg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();

            return (
              <div key={msg._id || index}>
                {showDateSeparator && (
                  <div className="flex justify-center my-6">
                    <div className="bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm border border-gray-100/50">
                      <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">
                        {formatDateSeparator(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                )}
                <div
                  className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-1 group`}
                >
                  <div
                    className={`relative px-4 py-2 max-w-[85%] sm:max-w-[70%] text-[15px] rounded-2xl shadow-sm
                  ${hideBubble
                        ? "bg-transparent border-none shadow-none"
                        : `border border-gray-100/50 ${isOwn ? "bg-[#FFF3E0] text-gray-900 rounded-br-none" : "bg-white text-gray-900 rounded-bl-none shadow-[0_2px_5px_rgba(0,0,0,0.05)]"}`
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
                        <div className={`mb-2 rounded-lg overflow-hidden ${isSticker ? "flex justify-center" : ""}`}>
                          <img
                            src={msg.attachmentUrl}
                            alt="Attachment"
                            className={isSticker ? "w-48 h-48 object-contain" : "w-full h-auto max-h-[300px] object-cover"}
                          />
                        </div>
                      ) : null}

                      {isJumboEmoji ? (
                        <div className="text-7xl py-2 select-none animate-in fade-in zoom-in duration-300">
                          {msg.message}
                        </div>
                      ) : (
                        !isImage && !isAudio && msg.type !== "DOCUMENT" && !msg.message?.startsWith("[") && (
                          <p className="whitespace-pre-wrap break-words leading-relaxed">
                            {msg.message}
                          </p>
                        )
                      )}

                      {isAudio && msg.attachmentUrl && (
                        <div className="">
                          <AudioMessage
                            src={msg.attachmentUrl}
                            isOwn={isOwn}
                            senderProfileImage={chat?.participants?.find(p => p._id === msg.senderId)?.profileImage}
                          />
                        </div>
                      )}

                      {msg.type === "DOCUMENT" && msg.attachmentUrl && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-2 border border-gray-100 hover:bg-gray-100 cursor-pointer transition-colors" onClick={() => window.open(msg.attachmentUrl, '_blank')}>
                          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-semibold text-gray-900 truncate">{msg.attachmentUrl.split('/').pop()}</p>
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Document</p>
                          </div>
                        </div>
                      )}

                      {msg.message?.startsWith("[POLL]") && (
                        <div className="bg-orange-50/50 rounded-2xl mb-2 border border-orange-100/50 w-full sm:min-w-[280px] shadow-sm overflow-hidden">
                          {(() => {
                            try {
                              const poll = JSON.parse(msg.message.replace("[POLL]", ""));
                              return (
                                <div className="flex flex-col">
                                  <div className="p-4 pb-2">
                                    <h4 className="font-bold text-gray-900 text-lg leading-tight mb-1">
                                      {poll.question}
                                    </h4>
                                    <div className="flex items-center gap-1.5 text-gray-400">
                                      <div className="flex -space-x-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                      </div>
                                      <span className="text-[11px] font-bold uppercase tracking-tight">Select one or more</span>
                                    </div>
                                  </div>

                                  <div className="px-4 pb-1 space-y-4 my-2">
                                    {poll.options.map((opt, i) => {
                                      const isSelected = userVotes[msg._id]?.includes(i);
                                      return (
                                        <button
                                          key={i}
                                          onClick={() => handleVote(msg._id, i)}
                                          className="w-full text-left group/poll-opt"
                                        >
                                          <div className="flex items-center gap-3 mb-1">
                                            <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${isSelected
                                              ? "border-orange-500 bg-orange-500 text-white shadow-sm shadow-orange-200"
                                              : "border-orange-200 group-hover/poll-opt:border-orange-400"
                                              }`}>
                                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                            </div>
                                            <div className="flex-1 flex justify-between items-center text-gray-700">
                                              <span className={`text-[15px] font-medium transition-colors ${isSelected ? "text-orange-600" : ""}`}>{opt}</span>
                                              <span className={`text-[13px] font-bold ${isSelected ? "text-orange-600" : "text-gray-400"}`}>
                                                {isSelected ? 1 : 0}
                                              </span>
                                            </div>
                                          </div>
                                          <div className="h-2 w-full bg-orange-100/30 rounded-full overflow-hidden border border-orange-100/20">
                                            <div
                                              className={`h-full bg-orange-500 transition-all duration-500 rounded-full ${isSelected ? "w-full" : "w-0"}`}
                                            />
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>

                                  <button
                                    onClick={() => toast.info("Viewing votes functionality coming soon")}
                                    className="w-full py-3 border-t border-orange-100 text-center text-[13px] font-black text-orange-600 hover:bg-orange-100/30 transition-colors uppercase tracking-widest"
                                  >
                                    View votes
                                  </button>
                                </div>
                              )
                            } catch (e) { return <div className="p-4 text-red-500 italic">Invalid Poll Data</div> }
                          })()}
                        </div>
                      )}

                      {msg.message?.startsWith("[EVENT]") && (
                        <div className="bg-red-50/50 rounded-2xl mb-2 border border-red-100/50 w-full sm:min-w-[280px] shadow-sm overflow-hidden relative">
                          {(() => {
                            try {
                              const event = JSON.parse(msg.message.replace("[EVENT]", ""));
                              const eventDate = event.date ? new Date(event.date) : null;
                              const isValidDate = eventDate && !isNaN(eventDate.getTime());
                              const response = eventResponses[msg._id] || "Going"; // Default for demo

                              return (
                                <div className="flex flex-col">
                                  <div className="p-4 flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-orange-100/80 flex items-center justify-center text-orange-600 shadow-sm shrink-0">
                                      <Calendar className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-bold text-gray-900 text-[17px] leading-tight mb-0.5 truncate uppercase">
                                        {event.title}
                                      </h4>
                                      <p className="text-[13px] text-gray-500 font-medium mb-1">
                                        {isValidDate ? (
                                          <>
                                            {eventDate.toDateString() === new Date().toDateString() ? "Today" :
                                              eventDate.toDateString() === new Date(Date.now() + 86400000).toDateString() ? "Tomorrow" :
                                                eventDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}, {event.time}
                                          </>
                                        ) : "Date TBD"}
                                      </p>
                                      <div className="flex items-center gap-1.5 ">
                                        <div className="flex -space-x-1.5">
                                          {chat?.participants?.slice(0, 3).map((participant, i) => (
                                            <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-gray-200 overflow-hidden shadow-sm">
                                              <img src={participant.profileImage || `https://i.pravatar.cc/100?img=${i + 10}`} alt="" />
                                            </div>
                                          ))}
                                        </div>
                                        <span className="text-[12px] font-bold text-gray-500 ml-0.5">{chat?.participants?.length || 0} going</span>
                                      </div>
                                    </div>
                                  </div>

                                  {isOwn ? (
                                    <button
                                      onClick={() => handleEditEvent(msg)}
                                      className="w-full py-3 border-t border-red-100/50 text-center text-[14px] font-bold text-orange-600 hover:bg-orange-50/50 transition-colors"
                                    >
                                      Edit event
                                    </button>
                                  ) : (
                                    <div className="relative">
                                      <button
                                        onClick={() => setActiveEventMenu(activeEventMenu === msg._id ? null : msg._id)}
                                        className="w-full py-2.5 border-t border-red-100/50 flex items-center justify-center gap-1.5 text-[15px] font-bold text-orange-600 hover:bg-orange-50/50 transition-colors"
                                      >
                                        {response} <ChevronDown className={`w-4 h-4 transition-transform ${activeEventMenu === msg._id ? 'rotate-180' : ''}`} />
                                      </button>

                                      {activeEventMenu === msg._id && (
                                        <div className="absolute bottom-full right-4 mb-2 w-40 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                                          {["Going", "Maybe", "Not going"].map((opt) => (
                                            <button
                                              key={opt}
                                              onClick={() => {
                                                setEventResponses(prev => ({ ...prev, [msg._id]: opt }));
                                                setActiveEventMenu(null);
                                                toast.success(`Marked as ${opt}`);
                                              }}
                                              className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors"
                                            >
                                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${response === opt
                                                ? "border-orange-500 bg-orange-500 text-white"
                                                : "border-gray-300"
                                                }`}>
                                                {response === opt && <Check className="w-3 h-3 stroke-[3]" />}
                                              </div>
                                              <span className={`text-sm font-bold ${response === opt ? "text-gray-900" : "text-gray-500"}`}>
                                                {opt}
                                              </span>
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )
                            } catch (e) { return <div className="p-4 text-red-500 italic">Invalid Event Data</div> }
                          })()}
                        </div>
                      )}

                      {msg.message?.startsWith("[PAYMENT]") && (
                        <div className="p-5 bg-orange-50/50 rounded-2xl mb-2 border border-orange-100 w-full shadow-sm">
                          {(() => {
                            try {
                              const pay = JSON.parse(msg.message.replace("[PAYMENT]", ""));
                              return (
                                <>
                                  <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-orange-100 rounded-xl text-orange-600 shadow-sm">
                                      <IndianRupee className="w-6 h-6" />
                                    </div>
                                    <div>
                                      <p className="text-[10px] text-orange-600/60 uppercase font-black tracking-widest">Payment Request</p>
                                      <h4 className="font-black text-2xl text-gray-900">₹{pay.amount}</h4>
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-5 font-medium">{pay.reason}</p>
                                  <button
                                    onClick={() => toast.success("Opening payment gateway...")}
                                    className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-orange-200"
                                  >
                                    Pay Now
                                  </button>
                                </>
                              )
                            } catch (e) { return <span className="text-red-500 italic">Invalid Payment Request</span> }
                          })()}
                        </div>
                      )}

                      {msg.message?.startsWith("[CONTACT]") && (
                        <div className="p-4 bg-blue-50/50 rounded-2xl mb-2 border border-blue-100 w-full max-w-[220px] shadow-sm">
                          {(() => {
                            try {
                              const contact = JSON.parse(msg.message.replace("[CONTACT]", ""));
                              return (
                                <div className="flex flex-col items-center">
                                  <div className="relative mb-3">
                                    <img src={contact.profilePicture || `https://ui-avatars.com/api/?name=${contact.name}`} className="w-20 h-20 rounded-full border-4 border-white shadow-md object-cover" alt="" />
                                    <div className="absolute bottom-0 right-0 p-1.5 bg-blue-500 rounded-full text-white border-2 border-white shadow-sm">
                                      <User className="w-3 h-3" />
                                    </div>
                                  </div>
                                  <p className="font-bold text-gray-900 text-base mb-0.5">{contact.name}</p>
                                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mb-4">Contact Shared</p>
                                  <button
                                    onClick={() => navigate(`/traveler/${contact._id}`)}
                                    className="w-full py-2 bg-white border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                                  >
                                    View Profile
                                  </button>
                                </div>
                              )
                            } catch (e) { return <span className="text-red-500 italic">Invalid Contact Data</span> }
                          })()}
                        </div>
                      )}

                      {msg.message && !msg.message.startsWith("[") && <span className="break-words leading-snug whitespace-pre-wrap">{msg.message}</span>}

                      <span className={`text-[10px] min-w-[50px] text-right ml-auto -mb-1 mt-1 inline-block opacity-60 ${isOwn ? 'text-orange-900/60' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true
                        })}
                        {isOwn && <span className="ml-1 text-orange-600/80 font-bold">✓✓</span>}
                      </span>
                    </div>
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
            className="absolute bottom-[100px] left-3 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 overflow-hidden"
            style={{ width: '220px' }}
          >
            <div className="flex flex-col">
              <AttachmentItem
                icon={FileText}
                label="Document"
                color="bg-[#7F66FF]"
                onClick={() => { documentInputRef.current?.click(); setShowAttachments(false); }}
              />
              <AttachmentItem
                icon={ImageIcon}
                label="Photos & videos"
                color="bg-[#007AFF]"
                onClick={() => { imageInputRef.current?.click(); setShowAttachments(false); }}
              />
              <AttachmentItem
                icon={Camera}
                label="Camera"
                color="bg-[#FF3B30]"
                onClick={() => { cameraInputRef.current?.click(); setShowAttachments(false); }}
              />
              <AttachmentItem
                icon={Mic}
                label="Audio"
                color="bg-[#FF9500]"
                onClick={() => { startRecording(); setShowAttachments(false); }}
              />

              <AttachmentItem
                icon={User}
                label="Contact"
                color="bg-[#007AFF]"
                onClick={() => { setShowAttachments(false); setShowFriendSelectModal(true); }}
              />
              <AttachmentItem
                icon={BarChart2}
                label="Poll"
                color="bg-[#FFCC00]"
                onClick={() => { setShowAttachments(false); setShowPollModal(true); }}
              />
              <AttachmentItem
                icon={Calendar}
                label="Event"
                color="bg-[#FF2D55]"
                onClick={() => { setShowAttachments(false); setShowEventModal(true); }}
              />
              <AttachmentItem
                icon={Sticker}
                label="New sticker"
                color="bg-[#25D366]"
                onClick={() => { setShowAttachments(false); setShowStickers(true); }}
              />
            </div>
          </div>
        )}


        {/* Input Area */}
        <div className="p-3 bg-white border-t border-gray-100 flex items-end gap-2 z-20 shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.03)] rounded-b-3xl mb-1">
          <div className="flex-1 bg-white border border-gray-200 rounded-full flex items-center min-h-[46px] px-2 py-1 shadow-sm">
            {/* Attachment Button Inside Pill */}
            <button
              onClick={() => {
                setShowAttachments(!showAttachments);
                setShowStickers(false);
              }}
              className={`p-2 rounded-full text-gray-500 hover:text-orange-600 transition-all ${showAttachments ? 'bg-orange-50 text-orange-600 px-3' : ''}`}
            >
              <Plus className={`w-6 h-6 transition-transform duration-200 ${showAttachments ? 'rotate-45' : ''}`} />
            </button>

            {/* Rich Media Picker Overlay */}
            {showStickers && (
              <div
                className="absolute bottom-[100px] left-0 sm:left-4 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
                style={{ width: 'min(100vw, 350px)', height: '340px' }}
              >
                {/* Tabs */}
                <div className="flex items-center bg-gray-50 border-b border-gray-100">
                  <button
                    onClick={() => setActiveMediaTab("emoji")}
                    className={`flex-1 py-3 text-center transition-colors ${activeMediaTab === "emoji" ? "bg-white text-orange-600" : "text-gray-400 hover:bg-gray-100"}`}
                  >
                    <Smile className="w-5 h-5 mx-auto" />
                  </button>
                  <button
                    onClick={() => setActiveMediaTab("gif")}
                    className={`flex-1 py-3 text-center transition-colors ${activeMediaTab === "gif" ? "bg-white text-orange-600" : "text-gray-400 hover:bg-gray-100"}`}
                  >
                    <Gift className="w-5 h-5 mx-auto" />
                  </button>
                  <button
                    onClick={() => setActiveMediaTab("sticker")}
                    className={`flex-1 py-3 text-center transition-colors ${activeMediaTab === "sticker" ? "bg-white text-orange-600" : "text-gray-400 hover:bg-gray-100"}`}
                  >
                    <Sticker className="w-5 h-5 mx-auto" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent bg-white">
                  {activeMediaTab === "emoji" && (
                    <EmojiPicker
                      theme="light"
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
                        <div className="aspect-video bg-gray-100 rounded animate-pulse" />
                        <div className="aspect-video bg-gray-100 rounded animate-pulse" />
                        <div className="aspect-video bg-gray-100 rounded animate-pulse" />
                        <div className="aspect-video bg-gray-100 rounded animate-pulse" />
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
                  className={`text-gray-500 hover:text-orange-600 mr-2 transition-colors ${showStickers ? 'text-orange-600' : ''}`}
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
                  onPaste={handlePaste}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent text-gray-900 text-[15px] outline-none placeholder-gray-400 min-h-[24px]"
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
        {
          showInviteModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200 h-[600px] flex flex-col border border-gray-100">
                {/* Modal Header */}
                <div className="bg-gray-50 p-6 border-b border-gray-100 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-full">
                        <UserPlus className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Invite to Group</h3>
                        <p className="text-gray-500 text-sm">Add friends to this chat</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowInviteModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
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
                      className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition-colors text-gray-900 placeholder-gray-400"
                      autoFocus
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <button
                      onClick={handleSearchUsers}
                      disabled={!searchQuery.trim() || isSearching}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-orange-600 text-white rounded-lg text-xs font-bold hover:bg-orange-700 disabled:opacity-50 transition-colors shadow-sm"
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
                            <div key={user._id} className="flex items-center justify-between p-3 bg-white rounded-xl hover:bg-gray-50 transition-colors border border-gray-100 shadow-sm">
                              <div className="flex items-center gap-3">
                                <img
                                  src={user.profilePicture || user.profileImage || `https://ui-avatars.com/api/?name=${user.fullName || user.name}`}
                                  alt={user.fullName || user.name}
                                  className="w-10 h-10 rounded-full object-cover border border-gray-100"
                                />
                                <div>
                                  <p className="font-semibold text-gray-900">{user.fullName || user.name}</p>
                                  {(user.distanceKm !== null && user.distanceKm !== undefined) && (
                                    <p className="text-xs text-gray-500">{user.distanceKm} km away</p>
                                  )}
                                </div>
                              </div>

                              {isParticipant ? (
                                <span className="px-3 py-1.5 bg-green-50 text-green-600 text-xs font-bold rounded-lg flex items-center gap-1 border border-green-100">
                                  <Check className="w-3 h-3" /> Joined
                                </span>
                              ) : isInvited ? (
                                <span className="px-3 py-1.5 bg-orange-50 text-orange-600 text-xs font-bold rounded-lg border border-orange-100">
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
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          {searchQuery ? <Search className="w-8 h-8 opacity-50" /> : <UserPlus className="w-8 h-8 opacity-50" />}
                        </div>
                        <p>{searchQuery ? "No travelers found." : "Invite your friends to join!"}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                  <p className="text-xs text-gray-500">Invited users will join this chat and the activity.</p>
                </div>
              </div>
            </div>
          )
        }

        {/* Poll Modal */}
        {
          showPollModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white border border-gray-100 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Create a Poll</h3>
                <input
                  type="text"
                  placeholder="Your question"
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 mb-4 text-gray-900 focus:outline-none focus:border-orange-500 shadow-sm"
                  value={pollForm.question}
                  onChange={(e) => setPollForm({ ...pollForm, question: e.target.value })}
                />
                <div className="space-y-3 mb-6">
                  {pollForm.options.map((opt, i) => (
                    <input
                      key={i}
                      type="text"
                      placeholder={`Option ${i + 1}`}
                      className="w-full bg-white border border-gray-100 rounded-xl p-2 text-gray-900 text-sm shadow-sm"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...pollForm.options];
                        newOpts[i] = e.target.value;
                        setPollForm({ ...pollForm, options: newOpts });
                      }}
                    />
                  ))}
                  <button
                    onClick={() => setPollForm({ ...pollForm, options: [...pollForm.options, ""] })}
                    className="text-orange-500 text-xs font-bold hover:underline"
                  >
                    + Add Option
                  </button>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowPollModal(false)} className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                  <button
                    onClick={() => {
                      sendCustomMessage("[POLL]", pollForm);
                      setShowPollModal(false);
                      setPollForm({ question: "", options: ["", ""] });
                    }}
                    disabled={!pollForm.question || pollForm.options.some(o => !o)}
                    className="flex-1 py-2 bg-orange-600 text-white rounded-xl font-bold disabled:opacity-50"
                  >
                    Send Poll
                  </button>
                </div>
              </div>
            </div>
          )
        }

        {/* Event Modal */}
        {
          showEventModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white border border-gray-100 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-orange-600" /> {editingMessageId ? "Update Event" : "Schedule Event"}
                </h3>
                <div className="space-y-4 mb-6">
                  <input type="text" placeholder="Event Title" className="w-full bg-white border border-gray-200 rounded-xl p-3 text-gray-900" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} />
                  <div className="flex gap-2">
                    <input type="date" className="flex-1 bg-white border border-gray-200 rounded-xl p-3 text-gray-900" value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} />
                    <input type="time" className="flex-1 bg-white border border-gray-200 rounded-xl p-3 text-gray-900" value={eventForm.time} onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })} />
                  </div>
                  <textarea placeholder="Description" className="w-full bg-white border border-gray-200 rounded-xl p-3 text-gray-900 h-24" value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowEventModal(false); setEditingMessageId(null); setEventForm({ title: "", date: "", time: "", description: "" }); }}
                    className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      const prefix = "[EVENT]";
                      const fullMessage = `${prefix}${JSON.stringify(eventForm)}`;

                      if (editingMessageId) {
                        try {
                          setIsSending(true);
                          const res = await groupChatService.updateGroupChatMessage(authApi, editingMessageId, fullMessage);
                          // Update local state
                          setMessages(prev => prev.map(m => m._id === editingMessageId ? res.data : m));
                          toast.success("Event updated!");
                        } catch (err) {
                          toast.error("Failed to update event");
                        } finally {
                          setIsSending(false);
                        }
                      } else {
                        sendCustomMessage(prefix, eventForm);
                      }
                      setShowEventModal(false);
                      setEditingMessageId(null);
                      setEventForm({ title: "", date: "", time: "", description: "" });
                    }}
                    className="flex-1 py-2 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors"
                  >
                    {isSending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (editingMessageId ? "Update Event" : "Create Event")}
                  </button>
                </div>
              </div>
            </div>
          )
        }

        {/* Payment Modal */}
        {
          showPaymentModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white border border-gray-100 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <IndianRupee className="w-6 h-6 text-green-600" /> Request Payment
                </h3>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block uppercase font-bold">Amount</label>
                    <input type="number" placeholder="0.00" className="w-full bg-white border border-gray-200 rounded-xl p-4 text-2xl font-bold text-gray-900 text-center" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block uppercase font-bold">Purpose</label>
                    <input type="text" placeholder="e.g. Dinner, Taxi, etc." className="w-full bg-white border border-gray-200 rounded-xl p-3 text-gray-900" value={paymentForm.reason} onChange={(e) => setPaymentForm({ ...paymentForm, reason: e.target.value })} />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowPaymentModal(false)} className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                  <button
                    onClick={() => {
                      sendCustomMessage("[PAYMENT]", paymentForm);
                      setShowPaymentModal(false);
                      setPaymentForm({ amount: "", reason: "" });
                    }}
                    className="flex-1 py-2 bg-green-600 text-white rounded-xl font-bold"
                  >
                    Send Request
                  </button>
                </div>
              </div>
            </div>
          )
        }

        {/* AI Image Modal */}
        {
          showAIImageModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white border border-gray-100 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-600" /> AI Image Generator
                </h3>
                <textarea
                  placeholder="Describe the image you want to generate..."
                  className="w-full bg-white border border-gray-200 rounded-xl p-4 text-gray-900 h-32 mb-6 focus:outline-none focus:border-purple-600 shadow-sm"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                />
                <div className="flex gap-3">
                  <button onClick={() => setShowAIImageModal(false)} className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                  <button
                    onClick={() => {
                      setMessage(aiPrompt);
                      handleSend(); // Send the prompt as a text message first
                      toast.success("AI is processing your prompt...");
                      setShowAIImageModal(false);
                      setAiPrompt("");
                    }}
                    className="flex-1 py-2 bg-purple-600 text-white rounded-xl font-bold"
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>
          )
        }

        {/* Friend Select Modal (Contact sharing) */}
        {
          showFriendSelectModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white border border-gray-100 rounded-2xl w-full max-w-md p-6 shadow-2xl h-[600px] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Share a Friend</h3>
                  <button onClick={() => setShowFriendSelectModal(false)} className="text-gray-400 hover:text-gray-900 transition-colors"><X /></button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 px-1 scrollbar-thin scrollbar-thumb-gray-200">
                  {friends.map(friend => (
                    <div key={friend._id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors shadow-sm" onClick={() => {
                      sendCustomMessage("[CONTACT]", { _id: friend._id, name: friend.fullName || friend.name, profilePicture: friend.profilePicture || friend.profileImage });
                      setShowFriendSelectModal(false);
                    }}>
                      <div className="flex items-center gap-3">
                        <img src={friend.profilePicture || friend.profileImage || `https://ui-avatars.com/api/?name=${friend.name}`} className="w-10 h-10 rounded-full object-cover border border-gray-100" alt="" />
                        <p className="font-bold text-gray-900 text-sm">{friend.fullName || friend.name}</p>
                      </div>
                      <div className="p-2 bg-orange-100 text-orange-600 rounded-full">
                        <Send className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
                  {friends.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <UserPlus className="w-12 h-12 mb-3 opacity-20" />
                      <p>No friends found to share.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        }
      </div>
    </div>
  );

}

export default GroupChat;

