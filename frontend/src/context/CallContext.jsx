import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import { useSocket } from '../hooks/useSocket';

const CallContext = createContext(null);

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};

// ICE Server configuration with multiple STUN servers and free TURN servers for better connectivity
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    // Free TURN servers from OpenRelay project for NAT traversal
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ],
  iceCandidatePoolSize: 10,
};

export const CallProvider = ({ children }) => {
  const { user: authUser } = useUser();
  const { getSocket, isConnected } = useSocket();
  const socket = getSocket();

  // Call State
  const [call, setCall] = useState({});
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [stream, setStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [remoteUser, setRemoteUser] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('idle'); // idle, connecting, connected, failed

  const [callType, setCallType] = useState('audio'); // 'audio' or 'video'
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const answerProcessedRef = useRef(false);

  // Audio refs for call sounds
  const incomingAudio = useRef(new Audio("https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3"));
  const outgoingAudio = useRef(new Audio("https://assets.mixkit.co/active_storage/sfx/2367/2367-preview.mp3"));

  // Configure audio loops
  useEffect(() => {
    incomingAudio.current.loop = true;
    outgoingAudio.current.loop = true;
    return () => {
      incomingAudio.current.pause();
      outgoingAudio.current.pause();
    }
  }, []);

  // Handle Call Sounds
  useEffect(() => {
    if (call.isReceivingCall && !callAccepted && !callEnded) {
      incomingAudio.current.play().catch(e => console.log("Audio play failed", e));
    } else {
      incomingAudio.current.pause();
      incomingAudio.current.currentTime = 0;
    }

    if (isCalling && !callAccepted && !callEnded) {
      outgoingAudio.current.play().catch(e => console.log("Audio play failed", e));
    } else {
      outgoingAudio.current.pause();
      outgoingAudio.current.currentTime = 0;
    }
  }, [call.isReceivingCall, isCalling, callAccepted, callEnded]);

  // Socket Event Listeners
  useEffect(() => {
    if(!socket) return;

    socket.on('callUser', ({ from, name: callerName, signal, type }) => {
      // If already in a call, maybe auto-decline or show waiting?
      // For now, simple overwrite or ignore if busy logic could be added
      if (callAccepted && !callEnded) return;

      setCall({ isReceivingCall: true, from, name: callerName, signal, type: type || 'audio' });
      setRemoteUser({ name: callerName });
      setCallType(type || 'audio');
    });

    socket.on('callAccepted', (signal) => {
      setCallAccepted(true);
      if (connectionRef.current) {
          connectionRef.current.setRemoteDescription(new RTCSessionDescription(signal))
           .catch(e => console.error("Error setting remote description", e));
      }
    });

    socket.on('iceCandidate', async (candidate) => {
      if (connectionRef.current) {
        try {
          await connectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error("Error adding received ice candidate", e);
        }
      }
    });

    socket.on('callEnded', () => {
      setCallEnded(true);
      cleanupCall();
    });

    return () => {
      socket.off('callUser');
      socket.off('callAccepted');
      socket.off('iceCandidate');
      socket.off('callEnded');
    };
  }, [socket, callAccepted, callEnded]);

  // Call Timer
  useEffect(() => {
    let interval;
    if (callAccepted && !callEnded) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callAccepted, callEnded]);

  // Helper to setup ICE connection state monitoring
  const setupConnectionStateMonitoring = (peer) => {
    peer.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', peer.iceConnectionState);
      switch (peer.iceConnectionState) {
        case 'checking':
          setConnectionStatus('connecting');
          break;
        case 'connected':
        case 'completed':
          setConnectionStatus('connected');
          break;
        case 'failed':
          setConnectionStatus('failed');
          toast.error('Connection failed. Please check your network and try again.');
          break;
        case 'disconnected':
          setConnectionStatus('connecting');
          toast('Connection interrupted. Attempting to reconnect...', { icon: '⚠️' });
          // WebRTC will attempt to reconnect automatically
          break;
        case 'closed':
          setConnectionStatus('idle');
          break;
        default:
          break;
      }
    };

    peer.onconnectionstatechange = () => {
      console.log('Connection state:', peer.connectionState);
      if (peer.connectionState === 'failed') {
        toast.error('Call connection failed. Please try again.');
        cleanupCall();
      }
    };
  };

  // Helper to cleanup call state
  const cleanupCall = () => {
     if (connectionRef.current) {
      connectionRef.current.close();
      connectionRef.current = null;
    }

    if (stream) {
      stream.getTracks().forEach(track => {
         track.stop();
         track.enabled = false;
      });
      setStream(null);
    }

    setCall({});
    setIsCalling(false);
    setCallAccepted(false);
    setCallEnded(false);
    setCallDuration(0);
    setRemoteUser(null);
    setRemoteStream(null);
    setCallType('audio');
    setIsVideoEnabled(true);
    setConnectionStatus('idle');
    answerProcessedRef.current = false;
  };

  const callUser = async (userToCallId, userToCallName, userToCallClerkId, userToCallImage, isVideoCall = false) => {
    // Check socket connection before starting call
    if (!socket?.connected) {
      toast.error('Not connected to server. Please refresh the page and try again.');
      return;
    }

    setIsCalling(true);
    setCallEnded(false);
    setConnectionStatus('connecting');
    setRemoteUser({ name: userToCallName, profileImage: userToCallImage });
    setCallType(isVideoCall ? 'video' : 'audio');
    setIsVideoEnabled(true);

    try {
      let currentStream;
      try {
        currentStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isVideoCall });
      } catch (err) {
        if (isVideoCall && (err.name === 'NotReadableError' || err.name === 'NotAllowedError' || err.name === 'OverconstrainedError')) {
          console.warn("Video failed, falling back to audio only:", err);
          toast.error("Camera unavailable or in use. Switching to voice call.");
          currentStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          isVideoCall = false; // Update local flag
          setCallType('audio'); // Update state
        } else {
          throw err;
        }
      }

      setStream(currentStream);
      if (myVideo.current) myVideo.current.srcObject = currentStream;

      const peer = new RTCPeerConnection(ICE_SERVERS);

      // Setup connection state monitoring for debugging and user feedback
      setupConnectionStateMonitoring(peer);

      currentStream.getTracks().forEach((track) => peer.addTrack(track, currentStream));

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("iceCandidate", {
            to: userToCallClerkId,
            candidate: event.candidate,
          });
        }
      };

      peer.ontrack = (event) => {
        console.log('Received remote track:', event.streams[0]);
        setRemoteStream(event.streams[0]);
        if (userVideo.current) {
          userVideo.current.srcObject = event.streams[0];
        }
      };

      connectionRef.current = peer;

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      socket.emit("callUser", {
        userToCall: userToCallClerkId,
        signalData: offer,
        from: authUser?.id,
        name: authUser?.fullName || "User",
        type: isVideoCall ? 'video' : 'audio'
      });
    } catch (err) {
      console.error("Failed to start call:", err);
      toast.error("Could not access media devices. Check permissions.");
      setIsCalling(false);
      setCallType('audio');
      setConnectionStatus('idle');
    }
  };

  const answerCall = async () => {
    // Check socket connection before answering
    if (!socket?.connected) {
      toast.error('Not connected to server. Please refresh the page.');
      return;
    }

    setCallAccepted(true);
    setConnectionStatus('connecting');
    const isVideoCall = call.type === 'video';
    setCallType(isVideoCall ? 'video' : 'audio');
    setIsVideoEnabled(true);

    try {
      let currentStream = stream;
      if (!currentStream) {
        try {
          currentStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isVideoCall });
        } catch (err) {
           if (isVideoCall && (err.name === 'NotReadableError' || err.name === 'NotAllowedError')) {
              console.warn("Video failed, answering with audio only:", err);
              toast.error("Camera unavailable. Answering with voice only.");
              currentStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
              setCallType('audio');
           } else {
             throw err;
           }
        }
        setStream(currentStream);
        if (myVideo.current) myVideo.current.srcObject = currentStream;
      }

      const peer = new RTCPeerConnection(ICE_SERVERS);

      // Setup connection state monitoring for debugging and user feedback
      setupConnectionStateMonitoring(peer);

      currentStream.getTracks().forEach((track) => peer.addTrack(track, currentStream));

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("iceCandidate", {
            to: call.from,
            candidate: event.candidate,
          });
        }
      };

      peer.ontrack = (event) => {
        console.log('Received remote track on answer:', event.streams[0]);
        // FIX: Update remoteStream state so ActiveCallUI can use it
        setRemoteStream(event.streams[0]);
        if (userVideo.current) {
          userVideo.current.srcObject = event.streams[0];
        }
      };

      connectionRef.current = peer;

      await peer.setRemoteDescription(new RTCSessionDescription(call.signal));

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.emit("answerCall", { signal: answer, to: call.from });

    } catch (err) {
      console.error("Failed to answer call:", err);
      toast.error("Could not access media devices");
      setConnectionStatus('idle');
    }
  };

  const leaveCall = () => {
    // Notify other user
    socket.emit("endCall", { to: callAccepted ? (call.from === authUser?.id ? remoteUser?.clerk_id : call.from) : call.from });

    // If I'm the caller, call.from might be undefined or me, logic might need adjustment if call.from isn't always the other person.
    // Actually, in 'callUser' event, 'from' is the caller.
    // If I started the call, 'call' state might differ.
    // Current ChatPage logic seemed to handle it by sending to 'currentChatUserId' or 'call.from'.

    // Let's refine target for endCall:
    let targetId;
    if (call.isReceivingCall) {
        // I am receiver, ending call with caller
        targetId = call.from;
    } else {
        // I am caller (isCalling=true), logic to find who I called?
        // We didn't store who we called in state other than remoteUser object.
        // We need the clerk_id of the person we called.
        // Let's rely on whoever we have connection with or just emit to the room/user if we stored it.
        // The original ChatPage logic used `currentChatUserId`. We don't have that globally unless we pass it to `callUser`.
        // I passed userToCallClerkId to `callUser`, I should store it.
    }

    // Simpler approach compatible with original: emit to BOTH potential targets if unsure, or store target properly.
    // Ideally we store `callTargetId` in state.

    // For now, let's just do local cleanup and try to emit if we have value.
    // The original code: socket.emit("endCall", { to: callAccepted ? currentChatUserId : call.from });

    if (connectionRef.current) {
        // cleanupCall handles reset
    }

    // We need to know who to tell.
    // If I am calling, I know `userToCallClerkId` I passed to callUser.

    setCallEnded(true);
    cleanupCall();
  };

  // We need to fix the 'leaveCall' signaling target in the context logic.
  // Let's modify callUser to store the target ID.
  const [activeCallTarget, setActiveCallTarget] = useState(null); // Clerk ID of other party

  const callUserWrapped = async (userToCallId, userToCallName, userToCallClerkId, userToCallImage, isVideoCall = false) => {
      setActiveCallTarget(userToCallClerkId);
      await callUser(userToCallId, userToCallName, userToCallClerkId, userToCallImage, isVideoCall);
  }

  const leaveCallWrapped = () => {
      const target = activeCallTarget || call.from;
      if (target && socket?.connected) {
        socket.emit("endCall", { to: target });
      }
      setCallEnded(true);
      cleanupCall();
      setActiveCallTarget(null);
  }

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = !stream.getAudioTracks()[0].enabled;
      setIsMuted(!stream.getAudioTracks()[0].enabled);
    }
  };

  return (
    <CallContext.Provider value={{
      call,
      callAccepted,
      callEnded,
      isCalling,
      stream,
      isMuted,
      callDuration,
      remoteUser,
      myVideo,
      userVideo,
      callUser: callUserWrapped,
      answerCall,
      leaveCall: leaveCallWrapped,
      toggleMute,
      toggleVideo: () => {
        if (stream) {
          const videoTrack = stream.getVideoTracks()[0];
          if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            setIsVideoEnabled(videoTrack.enabled);
          }
        }
      },
      callType,
      isVideoEnabled,
      remoteStream,
      connectionStatus
    }}>
      {children}
    </CallContext.Provider>
  );
};
