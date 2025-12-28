import {
  ArrowRight,
  Users,
} from 'lucide-react';

export default function GroupCard({ group, onClick }) {
  return (
    <div
      className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-emerald-500/30">
            {group.name[0]}
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">{group.name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <Users className="w-4 h-4" />
              <span>{group.members.length} members</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total Expenses</p>
          <p className="text-xl font-bold text-gray-900">₹{group.totalExpenses.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
        <div className="flex -space-x-2">
          {group.members.slice(0, 5).map((member) => (
            <div
              key={member._id}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-white flex items-center justify-center text-gray-600 text-xs font-bold overflow-hidden"
            >
              {member.profileImage ? (
                <img src={member.profileImage} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                member.name[0]
              )}
            </div>
          ))}
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}
