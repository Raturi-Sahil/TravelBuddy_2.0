import React from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';

const IncomingCallModal = ({ call, callAccepted, answerCall, leaveCall }) => {
  if (!call.isReceivingCall || callAccepted) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-80 shadow-2xl flex flex-col items-center animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mb-4 animate-bounce">
           {call.type === 'video' ? <Video className="w-10 h-10 text-orange-600" /> : <Phone className="w-10 h-10 text-orange-600" />}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">{call.name || "Unknown"}</h3>
        <p className="text-gray-500 mb-8">{call.type === 'video' ? "Incoming Video Call..." : "Incoming Voice Call..."}</p>
        <div className="flex gap-4 w-full">
          <button
            onClick={leaveCall}
            className="flex-1 py-3 bg-red-100 text-red-600 rounded-xl font-semibold hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
          >
            <PhoneOff className="w-5 h-5" /> Decline
          </button>
          <button
            onClick={answerCall}
            className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
          >
            <Phone className="w-5 h-5" /> Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
