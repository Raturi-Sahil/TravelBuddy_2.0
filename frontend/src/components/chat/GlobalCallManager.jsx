import React from 'react';
import { useCall } from '../../context/CallContext';
import ActiveCallUI from './ActiveCallUI';
import IncomingCallModal from './IncomingCallModal';

const GlobalCallManager = () => {
  const {
    call,
    callAccepted,
    callEnded,
    isCalling,
    callDuration,
    remoteUser,
    myVideo,
    userVideo,
    answerCall,
    leaveCall,
    toggleMute,
    isMuted,
    callType,
    toggleVideo,
    isVideoEnabled,
    stream,
    remoteStream,
    connectionStatus
  } = useCall();

  // If no call activity, render nothing
  if (!call.isReceivingCall && !isCalling && !callAccepted) return null;

  return (
    <>
      <IncomingCallModal
        call={call}
        callAccepted={callAccepted}
        answerCall={answerCall}
        leaveCall={leaveCall}
      />

      <ActiveCallUI
        callAccepted={callAccepted}
        isCalling={isCalling}
        callEnded={callEnded}
        currentUser={remoteUser} // Pass the remote user info here
        call={call}
        callDuration={callDuration}
        toggleMute={toggleMute}
        isMuted={isMuted}
        leaveCall={leaveCall}
        myVideoRef={myVideo}
        userVideoRef={userVideo}
        callType={callType}
        toggleVideo={toggleVideo}
        isVideoEnabled={isVideoEnabled}
        stream={stream}
        remoteStream={remoteStream}
        connectionStatus={connectionStatus}
      />
    </>
  );
};

export default GlobalCallManager;
