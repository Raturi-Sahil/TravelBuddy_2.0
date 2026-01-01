import { Loader2, Mic, MicOff, PhoneOff, Video, VideoOff, Wifi, WifiOff } from 'lucide-react';
import { useEffect } from 'react';
import { useCall } from '../../context/CallContext';

const ActiveCallUI = ({
  callAccepted,
  isCalling,
  callEnded,
  currentUser,
  call,
  callDuration,
  toggleMute,
  isMuted,
  leaveCall,
  myVideoRef,
  userVideoRef,
  callType,
  toggleVideo,
  isVideoEnabled,
  stream,
  remoteStream,
  connectionStatus = 'idle' // 'idle' | 'connecting' | 'connected' | 'failed'
}) => {
  if ((!callAccepted && !isCalling) || callEnded) return null;

  useEffect(() => {
    if (callType === 'video') {
      if (myVideoRef.current && stream) {
        myVideoRef.current.srcObject = stream;
      }
      if (userVideoRef.current && remoteStream) {
        userVideoRef.current.srcObject = remoteStream;
      }
    }
  }, [callType, stream, remoteStream, myVideoRef, userVideoRef]);

  const formatDuration = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Connection status indicator
  const ConnectionStatusBadge = () => {
    if (connectionStatus === 'connecting') {
      return (
        <div className="flex items-center gap-2 bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Connecting...</span>
        </div>
      );
    }
    if (connectionStatus === 'connected') {
      return (
        <div className="flex items-center gap-2 bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">
          <Wifi className="w-4 h-4" />
          <span>Connected</span>
        </div>
      );
    }
    if (connectionStatus === 'failed') {
      return (
        <div className="flex items-center gap-2 bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm">
          <WifiOff className="w-4 h-4" />
          <span>Connection Failed</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/95 backdrop-blur-md">
      <div className={`flex flex-col items-center gap-8 ${callType === 'video' ? 'w-full max-w-4xl px-4' : 'text-white'}`}>

          {/* Connection Status Badge - Show during call setup */}
          {!callAccepted && (
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
              <ConnectionStatusBadge />
            </div>
          )}

          {callType === 'video' ? (
             <div className="relative w-full aspect-video bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
                {/* Remote Video (Full Size) */}
                <video
                  playsInline
                  ref={userVideoRef}
                  autoPlay
                  className="w-full h-full object-cover"
                />

                {/* Show connecting overlay if not connected yet */}
                {!callAccepted && (
                  <div className="absolute inset-0 bg-gray-900/80 flex flex-col items-center justify-center text-white">
                    <Loader2 className="w-12 h-12 animate-spin mb-4 text-orange-500" />
                    <p className="text-lg">Connecting to {currentUser?.name || 'user'}...</p>
                    <p className="text-sm text-gray-400 mt-2">Please wait while we establish the connection</p>
                  </div>
                )}

                {/* Local Video (Picture-in-Picture) */}
                <div className="absolute bottom-4 right-4 w-32 md:w-48 aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-lg border-2 border-orange-500/50">
                  <video
                    playsInline
                    muted
                    ref={myVideoRef}
                    autoPlay
                    className={`w-full h-full object-cover ${!isVideoEnabled ? 'hidden' : ''}`}
                  />
                   {!isVideoEnabled && (
                    <div className="w-full h-full flex items-center justify-center text-white/50 text-xs">
                       Camera Off
                    </div>
                  )}
                </div>

                <div className="absolute top-4 left-4 flex items-center gap-3">
                  <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-white/90 font-medium">
                    {callAccepted ? (call.name || currentUser?.name) : 'Connecting...'} ({formatDuration(callDuration)})
                  </div>
                  {callAccepted && <ConnectionStatusBadge />}
                </div>
             </div>
          ) : (
            <>
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white/20 overflow-hidden shadow-2xl">
                  {currentUser?.profileImage ? (
                    <img src={currentUser.profileImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center text-4xl font-bold">
                      {currentUser?.name?.[0]}
                    </div>
                  )}
                </div>
                {/* Audio Visualizer / Ripple Effect */}
                <div className="absolute inset-0 rounded-full border-2 border-orange-500 scale-110 animate-ping opacity-20"></div>
                <div className="absolute inset-0 rounded-full border border-orange-500 scale-125 animate-pulse opacity-10"></div>
              </div>

              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">{callAccepted ? (call.name || currentUser?.name) : (currentUser?.name || "Calling...")}</h2>
                <p className="text-orange-300">{callAccepted ? formatDuration(callDuration) : "Ringing..."}</p>
                {callAccepted && (
                  <div className="mt-2">
                    <ConnectionStatusBadge />
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex items-center gap-6">
            <button
              onClick={toggleMute}
              className={`p-4 rounded-full backdrop-blur-md transition-all ${isMuted ? 'bg-white text-gray-900' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
               {isMuted ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
            </button>

            {callType === 'video' && (
              <button
                onClick={toggleVideo}
                className={`p-4 rounded-full backdrop-blur-md transition-all ${!isVideoEnabled ? 'bg-white text-gray-900' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                 {!isVideoEnabled ? <VideoOff className="w-7 h-7" /> : <Video className="w-7 h-7" />}
              </button>
            )}

            <button
              onClick={leaveCall}
              className="p-5 bg-red-500 rounded-full text-white hover:bg-red-600 shadow-xl shadow-red-500/30 transition-transform hover:scale-105"
            >
               <PhoneOff className="w-8 h-8" />
            </button>
          </div>

          {/* Hidden Audio Elements for voice calls */}
           {callType !== 'video' && (
              <>
                <audio ref={myVideoRef} autoPlay muted />
                <audio ref={userVideoRef} autoPlay />
              </>
           )}
       </div>
    </div>
  );
};

export default ActiveCallUI;
