import {
  CircleDollarSign,
  Clock,
  Receipt,
} from 'lucide-react';

export default function ExpenseCard({ expense, categories }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
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
          {expense.splitBetween.slice(0, 4).map((member) => (
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
  );
}
