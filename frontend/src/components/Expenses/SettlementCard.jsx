import { Sparkles } from 'lucide-react';

export default function SettlementCard({ settlement, type }) {
  const isOwed = type === 'owed';

  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border ${
      isOwed
        ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100'
        : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-100'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
          isOwed
            ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
            : 'bg-gradient-to-br from-red-400 to-orange-500'
        }`}>
          {settlement.user.name[0]}
        </div>
        <div>
          <p className="font-semibold text-gray-800">
            {isOwed ? `${settlement.user.name} owes You` : `You owe ${settlement.user.name}`}
          </p>
          <p className="text-sm text-gray-500">{settlement.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-xl font-bold ${isOwed ? 'text-emerald-600' : 'text-red-600'}`}>
          ₹{settlement.amount.toLocaleString()}
        </span>
        <button className={`px-4 py-2 text-white rounded-lg font-medium transition-colors text-sm ${
          isOwed
            ? 'bg-emerald-500 hover:bg-emerald-600'
            : 'bg-red-500 hover:bg-red-600'
        }`}>
          {isOwed ? 'Remind' : 'Settle'}
        </button>
      </div>
    </div>
  );
}

export function AIOptimizationCard({ suggestion }) {
  return (
    <div className="mt-6 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
      <div className="flex items-center gap-3 mb-2">
        <Sparkles className="w-5 h-5 text-purple-500" />
        <h4 className="font-semibold text-purple-800">AI Optimization</h4>
      </div>
      <p className="text-sm text-purple-600">{suggestion}</p>
    </div>
  );
}
