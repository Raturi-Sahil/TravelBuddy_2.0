import { Users, Crown, UserCheck, Mail, Phone } from 'lucide-react';

function ParticipantsTable({ participants = [], activityLimit, onInvite }) {
  if (!participants || participants.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Participants</h2>
          </div>
          {onInvite && (
            <button
              onClick={onInvite}
              className="px-4 py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg font-semibold text-sm transition-colors border border-orange-200"
            >
              + Invite User
            </button>
          )}
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">No participants yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Participants</h2>
            <p className="text-sm text-gray-500">
              {participants.length}/{activityLimit || '∞'} joined
            </p>
          </div>
        </div>
        {onInvite && (
          <button
            onClick={onInvite}
            className="px-4 py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg font-semibold text-sm transition-colors border border-orange-200"
          >
            + Invite User
          </button>
        )}
      </div>

      <div className="space-y-3">
        {participants.map((participant, index) => (
          <div
            key={participant._id || index}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-4">
              {participant.profileImage ? (
                <img
                  src={participant.profileImage}
                  alt={participant.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  {participant.name?.charAt(0) || '?'}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{participant.name || 'Unknown'}</p>
                  {index === 0 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                      <Crown className="w-3 h-3" />
                      Organizer
                    </span>
                  )}
                </div>
                {participant.email && (
                  <p className="text-sm text-gray-500 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    {participant.email}
                  </p>
                )}
                {participant.mobile && (
                  <p className="text-sm text-gray-500 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    {participant.mobile}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-green-500" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ParticipantsTable;
