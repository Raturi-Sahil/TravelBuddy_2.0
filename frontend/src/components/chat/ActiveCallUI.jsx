import { Mic, MicOff, PhoneOff, Video, VideoOff } from 'lucide-react';
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
  isVideoEnabled
}) => {
  if ((!callAccepted && !isCalling) || callEnded) return null;

  const formatDuration = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/95 backdrop-blur-md">
      <div className={`flex flex-col items-center gap-8 ${callType === 'video' ? 'w-full max-w-4xl' : 'text-white'}`}>

          {callType === 'video' ? (
             <div className="relative w-full aspect-video bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
                {/* Remote Video (Full Size) */}
                <video
                  playsInline
                  ref={userVideoRef}
                  autoPlay
                  className="w-full h-full object-cover"
                />

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

                <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-white/90 font-medium">
                   {callAccepted ? (call.name || currentUser?.name) : 'Connecting...'} ({formatDuration(callDuration)})
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

          {/* Hidden Audio Elements (rendered independently if video call handled video logic above) */}
           {/* Note: In video call, ref is attached to video element, but we also kept audio element refs in context.
               However, userVideoRef should be assigned to the VIDEO element.
               Wait, ActiveCallUI receives refs. We need to attach them conditionally.
               If callType is audio, attach to audio tag. If video, attach to video tag.
           */}
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
