import { useEffect, useState } from 'react';
import {
  Users,
  MessageCircle,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';
import { getSingleActivity } from '../../redux/slices/userActivitySlice';

function JoinChatGroup() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { getToken } = useAuth();

  const { singleActivity, isLoading } = useSelector((state) => state.userActivity);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (id) {
       dispatch(getSingleActivity({ getToken, activityId: id }));
    }
  }, [id, dispatch, getToken]);

  // Map the activity data to the structure the UI expects
  const chatGroupDetails = singleActivity;

  const groupDetails = {
    name: chatGroupDetails?.title || "Activity Chat Group",
    description: "Join fellow travelers to discuss and plan your activities together in this secure group chat.",
    memberCount: chatGroupDetails?.participants?.length || "0",
    avatar: chatGroupDetails?.images?.[0] || chatGroupDetails?.photos?.[0] || null,
    privacy: "Private" // Activities are generally private to participants
  };

  const handleJoinGroup = () => {
    setJoining(true);
    // Since we don't have a specific joinChatGroup action separate from joining the activity,
    // we assume the user is already a participant (since they can view this) or this is the gateway.
    // We'll simulate a join process and redirect to the actual chat interface.
    setTimeout(() => {
      setJoining(false);
      toast.success(`Welcome to ${groupDetails.name}!`);
      navigate(`/activity-chat/${id}`); // Navigate to the actual chat page
    }, 1500);
  };

  if (isLoading && !chatGroupDetails) {
     return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-orange-600" />
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col relative">


      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-gray-900 to-black pointer-events-none" />



      {/* Main Content Card */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">

          {/* Header Image Area */}
          <div className="h-32 bg-gradient-to-r from-amber-600 to-orange-600 relative">
            <div className="absolute inset-0 bg-black/10" />

            {/* Group Avatar (Overlapping) */}
            <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
              <div className="w-24 h-24 rounded-full bg-gray-800 border-4 border-gray-900 flex items-center justify-center overflow-hidden shadow-xl">
                {groupDetails.avatar ? (
                  <img src={groupDetails.avatar} alt="Group" className="w-full h-full object-cover" />
                ) : (
                  <Users className="w-10 h-10 text-amber-500" />
                )}
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="pt-12 pb-8 px-8 text-center flex-1 flex flex-col">

            <h1 className="text-2xl font-bold text-white mb-2 line-clamp-2">
              {groupDetails.name}
            </h1>

            <div className="flex items-center justify-center gap-4 text-sm text-gray-400 mb-6">
              <span className="flex items-center gap-1 bg-gray-800 px-3 py-1 rounded-full">
                <Users className="w-3 h-3 text-amber-500" />
                {groupDetails.memberCount} Members
              </span>
              <span className="flex items-center gap-1 bg-gray-800 px-3 py-1 rounded-full">
                <ShieldCheck className="w-3 h-3 text-green-500" />
                {groupDetails.privacy}
              </span>
            </div>

            <p className="text-gray-300 leading-relaxed mb-8 line-clamp-3">
              {groupDetails.description}
            </p>

            {/* Action Area */}
            <div className="mt-auto space-y-4">
              <button
                onClick={handleJoinGroup}
                disabled={joining}
                className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg transform transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {joining ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-5 h-5" />
                    Join Chat Group
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500">
                By joining, you agree to the group rules and community guidelines.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JoinChatGroup;
