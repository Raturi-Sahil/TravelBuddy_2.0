import { useAuth } from '@clerk/clerk-react';
import {
  Calculator,
  CircleDollarSign,
  Plus,
  Receipt,
  Sparkles,
  Split,
  Users,
  Wallet,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

import {
  ExpenseCard,
  GroupCard,
  SettlementCard,
  AIOptimizationCard,
  CreateGroupModal,
  AddExpenseModal,
  GroupsSidebar,
  RecentActivitySidebar,
  ProTipCard,
} from '../../components/Expenses';

// Constants
const CATEGORIES = [
  { id: 'food', label: 'Food & Drinks', emoji: '🍕' },
  { id: 'accommodation', label: 'Accommodation', emoji: '🏨' },
  { id: 'transport', label: 'Transport', emoji: '🚗' },
  { id: 'activity', label: 'Activities', emoji: '🎯' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { id: 'other', label: 'Other', emoji: '📦' },
];

const TABS = [
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'groups', label: 'Groups', icon: Users },
  { id: 'settle', label: 'Settle Up', icon: Wallet },
];

export default function SplitExpenses() {
  const { getToken } = useAuth();
  const { profile: userProfile } = useSelector((state) => state.user);

  // State management
  const [groups, setGroups] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [activeTab, setActiveTab] = useState('expenses');
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
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

  // Load mock data
  useEffect(() => {
    setGroups([
      {
        _id: '1',
        name: 'Goa Trip 2024',
        members: [
          { _id: 'u1', name: 'You', profileImage: userProfile?.profileImage },
          { _id: 'u2', name: 'Rahul', profileImage: null },
          { _id: 'u3', name: 'Priya', profileImage: null },
        ],
        totalExpenses: 15000,
        createdAt: new Date()
      },
      {
        _id: '2',
        name: 'Kerala Backwaters',
        members: [
          { _id: 'u1', name: 'You', profileImage: userProfile?.profileImage },
          { _id: 'u4', name: 'Amit', profileImage: null },
        ],
        totalExpenses: 8500,
        createdAt: new Date()
      }
    ]);

    setExpenses([
      {
        _id: 'e1',
        description: 'Beach Shack Dinner',
        amount: 2400,
        paidBy: { _id: 'u1', name: 'You' },
        splitBetween: [
          { _id: 'u1', name: 'You', amount: 800 },
          { _id: 'u2', name: 'Rahul', amount: 800 },
          { _id: 'u3', name: 'Priya', amount: 800 },
        ],
        groupId: '1',
        groupName: 'Goa Trip 2024',
        category: 'food',
        createdAt: new Date()
      },
      {
        _id: 'e2',
        description: 'Hotel Stay - 2 Nights',
        amount: 6000,
        paidBy: { _id: 'u2', name: 'Rahul' },
        splitBetween: [
          { _id: 'u1', name: 'You', amount: 2000 },
          { _id: 'u2', name: 'Rahul', amount: 2000 },
          { _id: 'u3', name: 'Priya', amount: 2000 },
        ],
        groupId: '1',
        groupName: 'Goa Trip 2024',
        category: 'accommodation',
        createdAt: new Date()
      },
      {
        _id: 'e3',
        description: 'Scuba Diving',
        amount: 4500,
        paidBy: { _id: 'u3', name: 'Priya' },
        splitBetween: [
          { _id: 'u1', name: 'You', amount: 1500 },
          { _id: 'u2', name: 'Rahul', amount: 1500 },
          { _id: 'u3', name: 'Priya', amount: 1500 },
        ],
        groupId: '1',
        groupName: 'Goa Trip 2024',
        category: 'activity',
        createdAt: new Date()
      }
    ]);
  }, [userProfile]);

  // Calculate balances
  const calculateBalances = () => {
    const balances = {};

    expenses.forEach(expense => {
      expense.splitBetween.forEach(member => {
        if (!balances[member._id]) {
          balances[member._id] = { name: member.name, owes: 0, owed: 0 };
        }

        if (expense.paidBy._id === member._id) {
          balances[member._id].owed += expense.amount - member.amount;
        } else {
          balances[member._id].owes += member.amount;
        }
      });
    });

    return balances;
  };

  const balances = calculateBalances();
  const yourBalance = balances['u1'] ? balances['u1'].owed - balances['u1'].owes : 0;

  // Handlers
  const handleCreateGroup = () => {
    if (!newGroup.name.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    const group = {
      _id: Date.now().toString(),
      name: newGroup.name,
      members: [
        { _id: 'u1', name: 'You', profileImage: userProfile?.profileImage },
        ...newGroup.members
      ],
      totalExpenses: 0,
      createdAt: new Date()
    };

    setGroups([group, ...groups]);
    setNewGroup({ name: '', members: [] });
    setIsCreateGroupOpen(false);
    toast.success('Group created successfully!');
  };

  const handleAddExpense = () => {
    if (!newExpense.description.trim() || !newExpense.amount || !newExpense.groupId) {
      toast.error('Please fill all required fields');
      return;
    }

    const group = groups.find(g => g._id === newExpense.groupId);
    const expense = {
      _id: Date.now().toString(),
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      paidBy: { _id: 'u1', name: 'You' },
      splitBetween: group.members.map(m => ({
        ...m,
        amount: parseFloat(newExpense.amount) / group.members.length
      })),
      groupId: newExpense.groupId,
      groupName: group.name,
      category: newExpense.category,
      createdAt: new Date()
    };

    setExpenses([expense, ...expenses]);
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
  };

  // Mock settlements for demo
  const settlements = [
    {
      user: { _id: 'u2', name: 'Rahul' },
      amount: 1200,
      description: 'For Goa Trip expenses'
    },
    {
      user: { _id: 'u3', name: 'Priya' },
      amount: 800,
      description: 'For Goa Trip expenses'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 pt-28 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/30">
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
              <div className={`p-2 rounded-xl ${yourBalance >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
                <CircleDollarSign className={`w-5 h-5 ${yourBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`} />
              </div>
              <span className="text-sm font-medium text-gray-500">Your Balance</span>
            </div>
            <div className={`text-3xl font-bold ${yourBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
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
            className="group flex items-center gap-3 p-4 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="p-2 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <span className="font-semibold">Add Expense</span>
          </button>

          <button
            onClick={() => setIsCreateGroupOpen(true)}
            className="group flex items-center gap-3 p-4 bg-white border-2 border-gray-100 text-gray-700 rounded-2xl hover:border-emerald-200 hover:bg-emerald-50 hover:-translate-y-1 transition-all duration-300 shadow-sm"
          >
            <div className="p-2 bg-gray-100 rounded-xl group-hover:bg-emerald-100 transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <span className="font-semibold">New Group</span>
          </button>

          <button className="group flex items-center gap-3 p-4 bg-white border-2 border-gray-100 text-gray-700 rounded-2xl hover:border-purple-200 hover:bg-purple-50 hover:-translate-y-1 transition-all duration-300 shadow-sm">
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
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
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
                  <EmptyState
                    icon={Receipt}
                    title="No expenses yet"
                    description="Start adding expenses to split with your group"
                    buttonText="Add First Expense"
                    onButtonClick={() => setIsAddExpenseOpen(true)}
                  />
                ) : (
                  expenses.map(expense => (
                    <ExpenseCard
                      key={expense._id}
                      expense={expense}
                      categories={CATEGORIES}
                    />
                  ))
                )}
              </>
            )}

            {activeTab === 'groups' && (
              <>
                {groups.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="No groups yet"
                    description="Create a group to start splitting expenses"
                    buttonText="Create First Group"
                    onButtonClick={() => setIsCreateGroupOpen(true)}
                  />
                ) : (
                  groups.map(group => (
                    <GroupCard
                      key={group._id}
                      group={group}
                      onClick={() => setSelectedGroup(group)}
                    />
                  ))
                )}
              </>
            )}

            {activeTab === 'settle' && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Settlement Suggestions</h3>

                <div className="space-y-4">
                  <SettlementCard
                    settlement={settlements[0]}
                    type="owes"
                  />
                  <SettlementCard
                    settlement={settlements[1]}
                    type="owed"
                  />
                </div>

                <AIOptimizationCard
                  suggestion="Our AI suggests you can minimize transactions! Instead of 3 separate payments, you can settle with just 1 payment of ₹400 to Rahul."
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <GroupsSidebar
              groups={groups}
              onGroupClick={setSelectedGroup}
              setActiveTab={setActiveTab}
            />
            <RecentActivitySidebar
              expenses={expenses}
              categories={CATEGORIES}
            />
            <ProTipCard />
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        newGroup={newGroup}
        setNewGroup={setNewGroup}
        memberSearch={memberSearch}
        setMemberSearch={setMemberSearch}
        onSubmit={handleCreateGroup}
      />

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        newExpense={newExpense}
        setNewExpense={setNewExpense}
        groups={groups}
        categories={CATEGORIES}
        onSubmit={handleAddExpense}
      />
    </div>
  );
}

// Empty State Component
function EmptyState({ icon: Icon, title, description, buttonText, onButtonClick }) {
  return (
    <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-10 h-10 text-emerald-500" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6">{description}</p>
      <button
        onClick={onButtonClick}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
      >
        <Plus className="w-5 h-5" />
        {buttonText}
      </button>
    </div>
  );
}
