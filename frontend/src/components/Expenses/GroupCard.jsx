import {
  AlertTriangle,
  ArrowRight,
  Loader2,
  LogOut,
  MoreVertical,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';

export default function GroupCard({ group, onClick, onDelete, onLeave, isCreator }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'delete' or 'leave'
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    setConfirmAction('delete');
    setShowConfirmModal(true);
  };

  const handleLeaveClick = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    setConfirmAction('leave');
    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      if (confirmAction === 'delete') {
        await onDelete(group._id);
      } else {
        await onLeave(group._id);
      }
      setShowConfirmModal(false);
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseModal = (e) => {
    e?.stopPropagation();
    if (!isProcessing) {
      setShowConfirmModal(false);
      setConfirmAction(null);
    }
  };

  return (
    <>
      <div
        className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group relative"
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-400 to-purple-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-violet-500/30">
              {group.name?.[0] || '?'}
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">{group.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <Users className="w-4 h-4" />
                <span>{group.members?.length || 0} members</span>
                {isCreator && (
                  <span className="px-2 py-0.5 bg-violet-100 text-violet-600 rounded-full text-xs font-medium">
                    Creator
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Expenses</p>
              <p className="text-xl font-bold text-gray-900">₹{(group.totalExpenses || 0).toLocaleString()}</p>
            </div>

            {/* Menu Button */}
            <div className="relative">
              <button
                onClick={handleMenuClick}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-gray-400" />
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-10 min-w-[140px] overflow-hidden">
                  {isCreator ? (
                    <button
                      onClick={handleDeleteClick}
                      className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Group
                    </button>
                  ) : (
                    <button
                      onClick={handleLeaveClick}
                      className="w-full flex items-center gap-2 px-4 py-3 text-orange-600 hover:bg-orange-50 transition-colors text-sm font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Leave Group
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
          <div className="flex -space-x-2">
            {group.members?.slice(0, 5).map((member, index) => (
              <div
                key={member.userId || member._id || index}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-white flex items-center justify-center text-gray-600 text-xs font-bold overflow-hidden"
              >
                {member.profileImage ? (
                  <img src={member.profileImage} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  member.name?.[0] || '?'
                )}
              </div>
            ))}
            {group.members?.length > 5 && (
              <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-gray-500 text-xs font-bold">
                +{group.members.length - 5}
              </div>
            )}
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
        </div>

        {/* Click outside to close menu */}
        {showMenu && (
          <div
            className="fixed inset-0 z-0"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(false);
            }}
          />
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                confirmAction === 'delete'
                  ? 'bg-red-100'
                  : 'bg-orange-100'
              }`}>
                <AlertTriangle className={`w-8 h-8 ${
                  confirmAction === 'delete'
                    ? 'text-red-500'
                    : 'text-orange-500'
                }`} />
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {confirmAction === 'delete' ? 'Delete Group?' : 'Leave Group?'}
              </h2>

              <p className="text-gray-500">
                {confirmAction === 'delete'
                  ? `Are you sure you want to delete "${group.name}"? All expenses and settlements will be permanently deleted.`
                  : `Are you sure you want to leave "${group.name}"? You won't be able to see group expenses anymore.`
                }
              </p>
            </div>

            {/* Actions */}
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={handleCloseModal}
                disabled={isProcessing}
                className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isProcessing}
                className={`flex-1 py-3 px-4 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                  confirmAction === 'delete'
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg hover:shadow-red-500/30'
                    : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-lg hover:shadow-orange-500/30'
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {confirmAction === 'delete' ? 'Deleting...' : 'Leaving...'}
                  </>
                ) : (
                  <>
                    {confirmAction === 'delete' ? (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Delete Group
                      </>
                    ) : (
                      <>
                        <LogOut className="w-4 h-4" />
                        Leave Group
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
