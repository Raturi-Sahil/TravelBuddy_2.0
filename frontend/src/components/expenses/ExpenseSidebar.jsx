import {
  ChevronDown,
  Clock,
  Sparkles,
  Users,
} from 'lucide-react';

export function GroupsSidebar({ groups, onGroupClick, setActiveTab }) {
  return (
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
              onGroupClick(group);
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
  );
}

export function RecentActivitySidebar({ expenses, categories }) {
  return (
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
  );
}

export function ProTipCard() {
  return (
    <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-5 text-white">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5" />
        <h3 className="font-bold">Pro Tip</h3>
      </div>
      <p className="text-sm text-violet-100">
        Add expenses as you go! It's easier to track shared costs during your trip rather than calculating everything at the end.
      </p>
    </div>
  );
}
