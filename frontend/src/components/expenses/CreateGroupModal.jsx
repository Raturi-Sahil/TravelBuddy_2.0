import { useAuth } from '@clerk/clerk-react';
import { Check, Loader2, Search, UserPlus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchFriends } from '../../redux/slices/userSlice';

export default function CreateGroupModal({
  isOpen,
  onClose,
  newGroup,
  setNewGroup,
  memberSearch,
  setMemberSearch,
  onSubmit,
  isCreating
}) {
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const { friends, isLoading: friendsLoading } = useSelector((state) => state.user);
  const [filteredFriends, setFilteredFriends] = useState([]);

  // Fetch friends when modal opens
  useEffect(() => {
    if (isOpen && getToken) {
      dispatch(fetchFriends(getToken));
    }
  }, [isOpen, dispatch, getToken]);

  // Filter friends based on search - show only 5 initially, all when searching
  useEffect(() => {
    if (!friends) {
      setFilteredFriends([]);
      return;
    }

    if (!memberSearch.trim()) {
      // Show only first 5 friends when not searching
      setFilteredFriends(friends.slice(0, 5));
    } else {
      const search = memberSearch.toLowerCase();
      setFilteredFriends(
        friends.filter(
          (friend) =>
            friend.name?.toLowerCase().includes(search) ||
            friend.email?.toLowerCase().includes(search)
        )
      );
    }
  }, [friends, memberSearch]);

  // Check if a friend is already added
  const isMemberAdded = (friendId) => {
    return newGroup.members?.some((m) => m.userId === friendId);
  };

  // Add/remove member
  const toggleMember = (friend) => {
    const friendId = friend._id;
    if (isMemberAdded(friendId)) {
      // Remove member
      setNewGroup({
        ...newGroup,
        members: newGroup.members.filter((m) => m.userId !== friendId),
      });
    } else {
      // Add member
      setNewGroup({
        ...newGroup,
        members: [
          ...(newGroup.members || []),
          {
            userId: friendId,
            name: friend.name,
            profileImage: friend.profileImage,
          },
        ],
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Create New Group</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
            <input
              type="text"
              value={newGroup.name}
              onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
              placeholder="e.g., Goa Trip 2024"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
            />
          </div>

          {/* Selected Members */}
          {newGroup.members?.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Members ({newGroup.members.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {newGroup.members.map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center gap-2 px-3 py-1.5 bg-violet-50 text-violet-700 rounded-full text-sm"
                  >
                    {member.profileImage ? (
                      <img
                        src={member.profileImage}
                        alt={member.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-violet-200 flex items-center justify-center text-xs font-bold">
                        {member.name?.[0]}
                      </div>
                    )}
                    <span className="font-medium">{member.name}</span>
                    <button
                      onClick={() => toggleMember({ _id: member.userId, ...member })}
                      className="p-0.5 hover:bg-violet-200 rounded-full transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Add Members</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Search friends to add..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
              />
            </div>
            {!memberSearch.trim() && friends?.length > 5 && (
              <p className="text-xs text-violet-500 mt-2">
                Showing 5 of {friends.length} friends • Type to search all
              </p>
            )}
          </div>

          {/* Friends List */}
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            {friendsLoading ? (
              <div className="p-6 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
              </div>
            ) : filteredFriends.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                {friends?.length === 0 ? (
                  <div>
                    <UserPlus className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No friends yet</p>
                    <p className="text-xs text-gray-400 mt-1">Add friends to include them in expense groups</p>
                  </div>
                ) : (
                  <p className="text-sm">No friends match your search</p>
                )}
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto">
                {filteredFriends.map((friend) => {
                  const isAdded = isMemberAdded(friend._id);
                  return (
                    <button
                      key={friend._id}
                      onClick={() => toggleMember(friend)}
                      className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 ${
                        isAdded ? 'bg-violet-50' : ''
                      }`}
                    >
                      {friend.profileImage ? (
                        <img
                          src={friend.profileImage}
                          alt={friend.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold">
                          {friend.name?.[0]}
                        </div>
                      )}
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-800">{friend.name}</p>
                        {friend.email && (
                          <p className="text-xs text-gray-500">{friend.email}</p>
                        )}
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                          isAdded
                            ? 'bg-violet-500 text-white'
                            : 'border-2 border-gray-200'
                        }`}
                      >
                        {isAdded && <Check className="w-4 h-4" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isCreating || !newGroup.name?.trim()}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Group'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
