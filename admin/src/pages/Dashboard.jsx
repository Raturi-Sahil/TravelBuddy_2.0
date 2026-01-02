import { useState, useEffect } from 'react';
import { Users, FileText, Calendar, MapPin, ArrowUp, ArrowDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getDashboardStats } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await getDashboardStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="w-6 h-6 border-2 border-zinc-600 border-t-zinc-200 rounded-full animate-spin" />
      </div>
    );
  }

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444']; // Indigo, Emerald, Amber, Red

  const statCards = [
    { label: 'Total Users', value: stats?.stats?.totalUsers || 0, icon: Users, change: '+12%', trend: 'up' },
    { label: 'Total Posts', value: stats?.stats?.totalPosts || 0, icon: FileText, change: '+5%', trend: 'up' },
    { label: 'Activities', value: stats?.stats?.totalActivities || 0, icon: Calendar, change: '-2%', trend: 'down' },
    { label: 'Local Guides', value: stats?.stats?.totalGuides || 0, icon: MapPin, change: '0%', trend: 'neutral' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div 
            key={index} 
            className="group p-5 bg-[#09090b] border border-[#27272a] rounded-lg hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 group-hover:text-white transition-colors">
                <stat.icon className="w-4 h-4" />
              </span>
              <span className={`text-xs font-medium flex items-center gap-1 ${
                stat.trend === 'up' ? 'text-emerald-500' : 
                stat.trend === 'down' ? 'text-red-500' : 'text-zinc-500'
              }`}>
                {stat.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : stat.trend === 'down' ? <ArrowDown className="w-3 h-3" /> : null}
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">{stat.label}</p>
              <h3 className="text-2xl font-semibold text-white mt-1 tracking-tight">{stat.value.toLocaleString()}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth Chart - Spans 2 columns */}
        <div className="lg:col-span-2 p-6 bg-[#09090b] border border-[#27272a] rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-white">User Growth</h3>
            <select className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 rounded px-2 py-1 outline-none focus:border-zinc-700">
              <option>Last 6 months</option>
              <option>Last year</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.userGrowth || []}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#52525b" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#52525b" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: '#09090b', 
                    border: '1px solid #27272a',
                    borderRadius: '6px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
                    fontSize: '12px'
                  }}
                  itemStyle={{ color: '#e4e4e7' }}
                  labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorUsers)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Content Distribution - Spans 1 column */}
        <div className="p-6 bg-[#09090b] border border-[#27272a] rounded-lg flex flex-col">
          <h3 className="text-sm font-semibold text-white mb-2">Content Distribution</h3>
          <p className="text-xs text-zinc-500 mb-6">Breakdown of platform content types</p>
          <div className="flex-1 min-h-[200px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.contentDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {(stats?.contentDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: '#09090b', 
                    border: '1px solid #27272a',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                  itemStyle={{ color: '#e4e4e7' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <span className="block text-2xl font-bold text-white">
                  {(stats?.contentDistribution || []).reduce((acc, curr) => acc + curr.value, 0)}
                </span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Total</span>
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {(stats?.contentDistribution || []).map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: COLORS[index] }} />
                  <span className="text-zinc-400">{item.name}</span>
                </div>
                <span className="font-medium text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="border border-[#27272a] rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-[#27272a] flex items-center justify-between bg-[#09090b]">
          <h3 className="text-sm font-semibold text-white">Recent Signups</h3>
          <button className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">View All Users</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#09090b] text-zinc-500 font-medium border-b border-[#27272a]">
              <tr>
                <th className="px-6 py-3 font-medium">User Details</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Joined Date</th>
                <th className="px-6 py-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a] bg-[#09090b]">
              {(stats?.recentUsers || []).map((user) => (
                <tr key={user._id} className="hover:bg-[#27272a]/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.profileImage ? (
                        <img src={user.profileImage} alt={user.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-zinc-800 transition-all" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-400">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium text-zinc-200 group-hover:text-white transition-colors">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 font-mono text-xs">{user.email}</td>
                  <td className="px-6 py-4 text-zinc-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 text-[11px] font-medium border border-emerald-500/20">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
