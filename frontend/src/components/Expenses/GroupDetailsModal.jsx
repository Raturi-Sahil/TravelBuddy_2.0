import { useAuth } from '@clerk/clerk-react';
import {
  AlertTriangle,
  Check,
  Loader2,
  LogOut,
  Plus,
  Search,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';

import {
  addMembersToGroup,
  deleteExpenseGroup,
  leaveExpenseGroup,
  removeMemberFromGroup,
  fetchExpenseGroupById,
} from '../../redux/slices/expenseSlice';
import { fetchFriends } from '../../redux/slices/userSlice';

export default function GroupDetailsModal({ isOpen, onClose, group, onGroupUpdated }) {
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const { profile: userProfile, friends, isFetchingFriends } = useSelector((state) => state.user);
  const { currentGroup } = useSelector((state) => state.expense);

  const [activeTab, setActiveTab] = useState('members');
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [removingMember, setRemovingMember] = useState(null);

  // Use currentGroup from Redux if available, otherwise use prop
  const displayGroup = currentGroup?._id === group?._id ? currentGroup : group;

  const isCreator = displayGroup?.createdBy === userProfile?._id || displayGroup?.createdBy?._id === userProfile?._id;

  // Fetch group details when modal opens
  useEffect(() => {
    if (isOpen && group?._id && getToken) {
      dispatch(fetchExpenseGroupById({ getToken, id: group._id }));
    }
  }, [isOpen, group?._id, dispatch, getToken]);

  // Fetch friends when Add Members tab is opened
  useEffect(() => {
    if (activeTab === 'add' && getToken) {
      dispatch(fetchFriends(getToken));
    }
  }, [activeTab, dispatch, getToken]);

  // Filter friends that are not already members
  const availableFriends = friends?.filter((friend) => {
    const isMember = displayGroup?.members?.some(
      (m) => (m.userId?._id || m.userId) === friend._id
    );
    return !isMember;
  }) || [];

  // Filter by search
  const filteredFriends = memberSearch.trim()
    ? availableFriends.filter(
        (friend) =>
          friend.name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
          friend.email?.toLowerCase().includes(memberSearch.toLowerCase())
      )
    : availableFriends.slice(0, 5);

  const toggleFriendSelection = (friend) => {
    const isSelected = selectedFriends.some((f) => f._id === friend._id);
    if (isSelected) {
      setSelectedFriends(selectedFriends.filter((f) => f._id !== friend._id));
    } else {
      setSelectedFriends([...selectedFriends, friend]);
    }
  };

  const handleAddMembers = async () => {
    if (selectedFriends.length === 0) {
      toast.error('Please select at least one friend');
      return;
    }

    setIsProcessing(true);
    try {
      const members = selectedFriends.map((f) => ({
        userId: f._id,
        name: f.name,
        profileImage: f.profileImage,
      }));

      await dispatch(
        addMembersToGroup({
          getToken,
          groupId: displayGroup._id,
          members,
        })
      ).unwrap();

      toast.success(`Added ${selectedFriends.length} member(s) to the group`);
      setSelectedFriends([]);
      setMemberSearch('');
      setActiveTab('members');
      onGroupUpdated?.();
    } catch (error) {
      toast.error(error || 'Failed to add members');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveMember = async (member) => {
    const memberId = member.userId?._id || member.userId;

    setIsProcessing(true);
    try {
      await dispatch(
        removeMemberFromGroup({
          getToken,
          groupId: displayGroup._id,
          memberId,
        })
      ).unwrap();

      toast.success(`Removed ${member.name} from the group`);
      setRemovingMember(null);
      onGroupUpdated?.();
    } catch (error) {
      toast.error(error || 'Failed to remove member');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteGroup = async () => {
    setIsProcessing(true);
    try {
      await dispatch(deleteExpenseGroup({ getToken, groupId: displayGroup._id })).unwrap();
      toast.success('Group deleted successfully');
      onClose();
    } catch (error) {
      toast.error(error || 'Failed to delete group');
    } finally {
      setIsProcessing(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleLeaveGroup = async () => {
    setIsProcessing(true);
    try {
      await dispatch(leaveExpenseGroup({ getToken, groupId: displayGroup._id })).unwrap();
      toast.success('You have left the group');
      onClose();
    } catch (error) {
      toast.error(error || 'Failed to leave group');
    } finally {
      setIsProcessing(false);
      setShowLeaveConfirm(false);
    }
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('members');
      setMemberSearch('');
      setSelectedFriends([]);
      setRemovingMember(null);
      setShowDeleteConfirm(false);
      setShowLeaveConfirm(false);
    }
  }, [isOpen]);

  if (!isOpen || !group) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-400 to-purple-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-violet-500/30">
                {displayGroup.name?.[0] || '?'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{displayGroup.name}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <Users className="w-4 h-4" />
                  <span>{displayGroup.members?.length || 0} members</span>
                  {isCreator && (
                    <span className="px-2 py-0.5 bg-violet-100 text-violet-600 rounded-full text-xs font-medium">
                      Creator
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('members')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'members'
                  ? 'bg-violet-100 text-violet-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Members
            </button>
            {isCreator && (
              <button
                onClick={() => setActiveTab('add')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === 'add'
                    ? 'bg-violet-100 text-violet-700'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <UserPlus className="w-4 h-4 inline mr-2" />
                Add Members
              </button>
            )}
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'bg-violet-100 text-violet-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              Settings
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="space-y-3">
              {displayGroup.members?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No members in this group</p>
                </div>
              ) : (
                displayGroup.members?.map((member, index) => {
                  const memberId = member.userId?._id || member.userId;
                  const isCurrentUser = memberId === userProfile?._id;
                  const isMemberCreator = memberId === (displayGroup.createdBy?._id || displayGroup.createdBy);

                  return (
                    <div
                      key={memberId || index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {member.profileImage ? (
                          <img
                            src={member.profileImage}
                            alt={member.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold">
                            {member.name?.[0] || '?'}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-800">
                            {member.name}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-gray-500">(You)</span>
                            )}
                          </p>
                          {isMemberCreator && (
                            <span className="text-xs text-violet-600">Group Creator</span>
                          )}
                        </div>
                      </div>

                      {/* Remove button - only creator can remove others, not themselves */}
                      {isCreator && !isCurrentUser && !isMemberCreator && (
                        <button
                          onClick={() => setRemovingMember(member)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove member"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Add Members Tab */}
          {activeTab === 'add' && isCreator && (
            <div className="space-y-4">
              {/* Selected Friends */}
              {selectedFriends.length > 0 && (
                <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-100">
                  {selectedFriends.map((friend) => (
                    <div
                      key={friend._id}
                      className="flex items-center gap-2 px-3 py-1.5 bg-violet-50 text-violet-700 rounded-full text-sm"
                    >
                      <span className="font-medium">{friend.name}</span>
                      <button
                        onClick={() => toggleFriendSelection(friend)}
                        className="p-0.5 hover:bg-violet-200 rounded-full transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Search */}
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

              {!memberSearch.trim() && availableFriends.length > 5 && (
                <p className="text-xs text-violet-500">
                  Showing 5 of {availableFriends.length} friends • Type to search all
                </p>
              )}

              {/* Friends List */}
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                {isFetchingFriends ? (
                  <div className="p-6 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
                  </div>
                ) : filteredFriends.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    {availableFriends.length === 0 ? (
                      <div>
                        <UserPlus className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No friends available to add</p>
                        <p className="text-xs text-gray-400 mt-1">
                          All your friends are already in this group
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm">No friends match your search</p>
                    )}
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto">
                    {filteredFriends.map((friend) => {
                      const isSelected = selectedFriends.some((f) => f._id === friend._id);
                      return (
                        <button
                          key={friend._id}
                          onClick={() => toggleFriendSelection(friend)}
                          className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 ${
                            isSelected ? 'bg-violet-50' : ''
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
                          </div>
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'bg-violet-500 text-white'
                                : 'border-2 border-gray-200'
                            }`}
                          >
                            {isSelected && <Check className="w-4 h-4" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Add Button */}
              {selectedFriends.length > 0 && (
                <button
                  onClick={handleAddMembers}
                  disabled={isProcessing}
                  className="w-full py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add {selectedFriends.length} Member(s)
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="font-semibold text-gray-800 mb-2">Group Info</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Total Expenses: ₹{(displayGroup.totalExpenses || 0).toLocaleString()}</p>
                  <p>Members: {displayGroup.members?.length || 0}</p>
                  <p>Created: {new Date(displayGroup.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Leave/Delete Actions */}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                {isCreator ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Group
                  </button>
                ) : (
                  <button
                    onClick={() => setShowLeaveConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-orange-50 text-orange-600 rounded-xl font-semibold hover:bg-orange-100 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Leave Group
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Remove Member Confirmation */}
        {removingMember && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 rounded-3xl">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <UserMinus className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-center text-gray-900 mb-2">Remove Member?</h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                Are you sure you want to remove <strong>{removingMember.name}</strong> from this group?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setRemovingMember(null)}
                  disabled={isProcessing}
                  className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRemoveMember(removingMember)}
                  disabled={isProcessing}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <UserMinus className="w-4 h-4" />
                      Remove
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 rounded-3xl">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-center text-gray-900 mb-2">Delete Group?</h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                All expenses and settlements will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isProcessing}
                  className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteGroup}
                  disabled={isProcessing}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Leave Confirmation */}
        {showLeaveConfirm && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 rounded-3xl">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-lg font-bold text-center text-gray-900 mb-2">Leave Group?</h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                You won't be able to see group expenses anymore.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLeaveConfirm(false)}
                  disabled={isProcessing}
                  className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLeaveGroup}
                  disabled={isProcessing}
                  className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" />
                      Leave
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
