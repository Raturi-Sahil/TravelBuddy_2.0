import { useNavigate } from 'react-router-dom';

export default function ChatListItem({ conversation, isActive = false }) {
  const navigate = useNavigate();
  const { user, lastMessage, unreadCount } = conversation;

  const handleClick = () => {
    navigate(`/chat/${user._id}`);
  };

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (d.toDateString() === today.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 cursor-pointer border-b border-gray-100 hover:bg-orange-50 transition-all ${
        isActive ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Profile Image with Online Indicator */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden shadow-md">
            {user.profileImage ? (
              <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
            ) : (
              user.name?.[0]?.toUpperCase() || '?'
            )}
          </div>
          {/* Online Status Indicator */}
          <div 
            className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
              user.isOnline ? 'bg-green-500' : 'bg-gray-400'
            }`} 
          />
        </div>

        {/* Name and Last Message */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <p className="font-semibold text-gray-900 truncate">{user.name}</p>
            {lastMessage?.createdAt && (
              <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                {formatTime(lastMessage.createdAt)}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 truncate">
              {lastMessage?.message || (
                <span className="italic text-gray-400">Start a conversation</span>
              )}
            </p>
            {unreadCount > 0 && (
              <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0 ml-2">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
