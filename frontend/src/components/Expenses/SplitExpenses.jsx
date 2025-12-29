import { useAuth } from '@clerk/clerk-react';
import {
  ArrowRight,
  Calculator,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clock,
  DollarSign,
  Loader2,
  Minus,
  Plus,
  Receipt,
  Search,
  Sparkles,
  Split,
  Trash2,
  User,
  Users,
  Wallet,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';

import {
  createExpense,
  createExpenseGroup,
  deleteExpenseGroup,
  leaveExpenseGroup,
  fetchMyExpenseGroups,
  fetchMyExpenses,
  fetchGroupBalances,
  settleUp,
} from '../../redux/slices/expenseSlice';
import AddExpenseModal from './AddExpenseModal';
import CalculatorModal from './CalculatorModal';
import CreateGroupModal from './CreateGroupModal';
import GroupCard from './GroupCard';

export default function SplitExpenses() {
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const { profile: userProfile } = useSelector((state) => state.user);
  const {
    groups,
    expenses,
    balances: reduxBalances,
    isLoading,
    isCreating,
  } = useSelector((state) => state.expense);

  // Local state
  const [activeTab, setActiveTab] = useState('expenses');
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Form states
  const [newGroup, setNewGroup] = useState({ name: '', members: [] });
  const [memberSearch, setMemberSearch] = useState('');
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    paidBy: '',
    splitBetween: [],
    groupId: '',
    category: 'food'
  });

  // Fetch data on mount
  useEffect(() => {
    if (getToken) {
      dispatch(fetchMyExpenseGroups(getToken));
      dispatch(fetchMyExpenses(getToken));
    }
  }, [dispatch, getToken]);

  // Calculate balances locally for display
  const calculateBalances = () => {
    const balanceMap = {};

    expenses.forEach(expense => {
      expense.splitBetween?.forEach(member => {
        const memberId = member.userId || member._id;
        if (!balanceMap[memberId]) {
          balanceMap[memberId] = { name: member.name, owes: 0, owed: 0 };
        }

        const payerId = expense.paidBy?._id || expense.paidBy;
        if (payerId === memberId) {
          // This person paid, so others owe them
          balanceMap[memberId].owed += expense.amount - member.amount;
        } else {
          // This person owes the payer
          balanceMap[memberId].owes += member.amount;
        }
      });
    });

    return balanceMap;
  };

  const balances = calculateBalances();

  // Get your total balance
  const userId = userProfile?._id;
  const yourBalance = userId && balances[userId]
    ? balances[userId].owed - balances[userId].owes
    : 0;

  const categories = [
    { id: 'food', label: 'Food & Drinks', emoji: '🍕' },
    { id: 'accommodation', label: 'Accommodation', emoji: '🏨' },
    { id: 'transport', label: 'Transport', emoji: '🚗' },
    { id: 'activity', label: 'Activities', emoji: '🎯' },
    { id: 'shopping', label: 'Shopping', emoji: '🛍️' },
    { id: 'other', label: 'Other', emoji: '📦' },
  ];

  const handleCreateGroup = async () => {
    if (!newGroup.name.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    try {
      const result = await dispatch(
        createExpenseGroup({
          getToken,
          groupData: {
            name: newGroup.name,
            members: newGroup.members,
          },
        })
      ).unwrap();

      setNewGroup({ name: '', members: [] });
      setIsCreateGroupOpen(false);
      toast.success('Group created successfully!');
    } catch (error) {
      toast.error(error || 'Failed to create group');
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.description.trim() || !newExpense.amount || !newExpense.groupId) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const result = await dispatch(
        createExpense({
          getToken,
          expenseData: {
            description: newExpense.description,
            amount: parseFloat(newExpense.amount),
            groupId: newExpense.groupId,
            category: newExpense.category,
          },
        })
      ).unwrap();

      setNewExpense({
        description: '',
        amount: '',
        paidBy: '',
        splitBetween: [],
        groupId: '',
        category: 'food'
      });
      setIsAddExpenseOpen(false);
      toast.success('Expense added successfully!');
    } catch (error) {
      toast.error(error || 'Failed to add expense');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await dispatch(deleteExpenseGroup({ getToken, groupId })).unwrap();
      toast.success('Group deleted successfully!');
    } catch (error) {
      toast.error(error || 'Failed to delete group');
    }
  };

  const handleLeaveGroup = async (groupId) => {
    try {
      await dispatch(leaveExpenseGroup({ getToken, groupId })).unwrap();
      toast.success('You have left the group');
    } catch (error) {
      toast.error(error || 'Failed to leave group');
    }
  };

  const tabs = [
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'settle', label: 'Settle Up', icon: Wallet },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 pt-28 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg shadow-violet-500/30">
                <Split className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Split Expenses
              </h1>
            </div>
            <p className="text-gray-500 ml-1">Manage and split travel expenses with your group</p>
          </div>

          {/* Balance Summary Card */}
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 min-w-[280px]">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-xl ${yourBalance >= 0 ? 'bg-violet-100' : 'bg-red-100'}`}>
                <CircleDollarSign className={`w-5 h-5 ${yourBalance >= 0 ? 'text-violet-600' : 'text-red-600'}`} />
              </div>
              <span className="text-sm font-medium text-gray-500">Your Balance</span>
            </div>
            <div className={`text-3xl font-bold ${yourBalance >= 0 ? 'text-violet-600' : 'text-red-600'}`}>
              {yourBalance >= 0 ? '+' : '-'}₹{Math.abs(yourBalance).toLocaleString()}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {yourBalance >= 0 ? 'You are owed this amount' : 'You owe this amount'}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="group flex items-center gap-3 p-4 bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-2xl shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="p-2 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <span className="font-semibold">Add Expense</span>
          </button>

          <button
            onClick={() => setIsCreateGroupOpen(true)}
            className="group flex items-center gap-3 p-4 bg-white border-2 border-gray-100 text-gray-700 rounded-2xl hover:border-violet-200 hover:bg-violet-50 hover:-translate-y-1 transition-all duration-300 shadow-sm"
          >
            <div className="p-2 bg-gray-100 rounded-xl group-hover:bg-violet-100 transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <span className="font-semibold">New Group</span>
          </button>

          <button
            onClick={() => setIsCalculatorOpen(true)}
            className="group flex items-center gap-3 p-4 bg-white border-2 border-gray-100 text-gray-700 rounded-2xl hover:border-purple-200 hover:bg-purple-50 hover:-translate-y-1 transition-all duration-300 shadow-sm"
          >
            <div className="p-2 bg-gray-100 rounded-xl group-hover:bg-purple-100 transition-colors">
              <Calculator className="w-5 h-5" />
            </div>
            <span className="font-semibold">Calculator</span>
          </button>

          <button className="group flex items-center gap-3 p-4 bg-white border-2 border-gray-100 text-gray-700 rounded-2xl hover:border-amber-200 hover:bg-amber-50 hover:-translate-y-1 transition-all duration-300 shadow-sm">
            <div className="p-2 bg-gray-100 rounded-xl group-hover:bg-amber-100 transition-colors">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-semibold">AI Split</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-2xl p-2 shadow-sm border border-gray-100 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {activeTab === 'expenses' && (
              <>
                {expenses.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                    <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Receipt className="w-10 h-10 text-violet-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No expenses yet</h3>
                    <p className="text-gray-500 mb-6">Start adding expenses to split with your group</p>
                    <button
                      onClick={() => setIsAddExpenseOpen(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/30 transition-all"
                    >
                      <Plus className="w-5 h-5" />
                      Add First Expense
                    </button>
                  </div>
                ) : (
                  expenses.map(expense => (
                    <div
                      key={expense._id}
                      className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl flex items-center justify-center text-2xl">
                            {categories.find(c => c.id === expense.category)?.emoji || '📦'}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800">{expense.description}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                              <span className="px-2 py-0.5 bg-violet-50 text-violet-600 rounded-full text-xs font-medium">
                                {expense.groupName}
                              </span>
                              <span>•</span>
                              <Clock className="w-3.5 h-3.5" />
                              <span>Today</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">₹{expense.amount.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">
                            Paid by <span className="font-medium text-violet-600">{expense.paidBy.name}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Split between:</span>
                        <div className="flex -space-x-2">
                          {expense.splitBetween.slice(0, 4).map((member, idx) => (
                            <div
                              key={member._id}
                              className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm"
                              title={`${member.name}: ₹${member.amount}`}
                            >
                              {member.name[0]}
                            </div>
                          ))}
                          {expense.splitBetween.length > 4 && (
                            <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-gray-600 text-xs font-bold">
                              +{expense.splitBetween.length - 4}
                            </div>
                          )}
                        </div>
                        <span className="ml-auto text-sm text-gray-500">
                          ₹{(expense.amount / expense.splitBetween.length).toFixed(0)} each
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'groups' && (
              <>
                {groups.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-10 h-10 text-purple-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No groups yet</h3>
                    <p className="text-gray-500 mb-6">Create a group to start splitting expenses</p>
                    <button
                      onClick={() => setIsCreateGroupOpen(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/30 transition-all"
                    >
                      <Plus className="w-5 h-5" />
                      Create First Group
                    </button>
                  </div>
                ) : (
                  groups.map(group => (
                    <GroupCard
                      key={group._id}
                      group={group}
                      onClick={() => setSelectedGroup(group)}
                      onDelete={handleDeleteGroup}
                      onLeave={handleLeaveGroup}
                      isCreator={group.createdBy === userProfile?._id || group.createdBy?._id === userProfile?._id}
                    />
                  ))
                )}
              </>
            )}

            {activeTab === 'settle' && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Settlement Suggestions</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center text-white font-bold">
                        Y
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">You owe Rahul</p>
                        <p className="text-sm text-gray-500">For Goa Trip expenses</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-red-600">₹1,200</span>
                      <button className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors text-sm">
                        Settle
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold">
                        P
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Priya owes You</p>
                        <p className="text-sm text-gray-500">For Goa Trip expenses</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-violet-600">₹800</span>
                      <button className="px-4 py-2 bg-violet-500 text-white rounded-lg font-medium hover:bg-violet-600 transition-colors text-sm">
                        Remind
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                  <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    <h4 className="font-semibold text-purple-800">AI Optimization</h4>
                  </div>
                  <p className="text-sm text-purple-600">
                    Our AI suggests you can minimize transactions! Instead of 3 separate payments,
                    you can settle with just 1 payment of ₹400 to Rahul.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Summary */}
          <div className="space-y-4">
            {/* Group Overview */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-violet-500" />
                Your Groups
              </h3>
              <div className="space-y-3">
                {groups.map(group => (
                  <div
                    key={group._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-violet-50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedGroup(group);
                      setActiveTab('groups');
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                        {group.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{group.name}</p>
                        <p className="text-xs text-gray-500">{group.members.length} members</p>
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90" />
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {expenses.slice(0, 3).map(expense => (
                  <div key={expense._id} className="flex items-center gap-3 p-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                      {categories.find(c => c.id === expense.category)?.emoji || '📦'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{expense.description}</p>
                      <p className="text-xs text-gray-500">by {expense.paidBy.name}</p>
                    </div>
                    <span className="font-bold text-gray-900 text-sm">₹{expense.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-bold">Pro Tip</h3>
              </div>
              <p className="text-sm text-violet-100">
                Add expenses as you go! It's easier to track shared costs during your trip rather than calculating everything at the end.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Group Modal */}
      {isCreateGroupOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Create New Group</h2>
                <button
                  onClick={() => setIsCreateGroupOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
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
                <p className="text-xs text-gray-500 mt-2">You can add members from your connections</p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setIsCreateGroupOpen(false)}
                className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/30 transition-all"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Add Expense</h2>
                <button
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  placeholder="What was this expense for?"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all text-lg font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Group</label>
                <select
                  value={newExpense.groupId}
                  onChange={(e) => setNewExpense({ ...newExpense, groupId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                >
                  <option value="">Choose a group</option>
                  {groups.map(group => (
                    <option key={group._id} value={group._id}>{group.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setNewExpense({ ...newExpense, category: cat.id })}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        newExpense.category === cat.id
                          ? 'border-violet-500 bg-violet-50'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <span className="text-xl block mb-1">{cat.emoji}</span>
                      <span className="text-xs text-gray-600">{cat.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white rounded-b-3xl">
              <button
                onClick={() => setIsAddExpenseOpen(false)}
                className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddExpense}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/30 transition-all"
              >
                Add Expense
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calculator Modal */}
      <CalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        newGroup={newGroup}
        setNewGroup={setNewGroup}
        memberSearch={memberSearch}
        setMemberSearch={setMemberSearch}
        onSubmit={handleCreateGroup}
        isCreating={isCreating}
      />
    </div>
  );
}
