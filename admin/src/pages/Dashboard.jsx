import { useState, useEffect } from 'react';
import { Users, FileText, Calendar, MapPin, TrendingUp, ArrowUpRight } from 'lucide-react';
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444'];

  const statCards = [
    { label: 'Total Users', value: stats?.stats?.totalUsers || 0, icon: Users, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10' },
    { label: 'Total Posts', value: stats?.stats?.totalPosts || 0, icon: FileText, color: 'from-green-500 to-emerald-500', bg: 'bg-green-500/10' },
    { label: 'Activities', value: stats?.stats?.totalActivities || 0, icon: Calendar, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/10' },
    { label: 'Local Guides', value: stats?.stats?.totalGuides || 0, icon: MapPin, color: 'from-indigo-500 to-purple-500', bg: 'bg-indigo-500/10' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-zinc-500 mt-1">Welcome back! Here's what's happening.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-green-400 text-sm font-medium">Live Data</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div 
            key={index} 
            className="bg-[#16162a]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:border-white/10 hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="flex items-start justify-between">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 bg-gradient-to-r ${stat.color} bg-clip-text`} style={{ color: COLORS[index] }} />
              </div>
              <ArrowUpRight className="w-5 h-5 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-bold text-white">{stat.value.toLocaleString()}</h3>
              <p className="text-zinc-500 text-sm mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Growth Chart */}
        <div className="bg-[#16162a]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">User Growth</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.userGrowth || []}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    background: '#1e1e3f', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                  }}
                  labelStyle={{ color: '#fff' }}
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

        {/* Content Distribution */}
        <div className="bg-[#16162a]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Content Distribution</h3>
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.contentDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(stats?.contentDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: '#1e1e3f', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 -mt-4">
            {(stats?.contentDistribution || []).map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: COLORS[index] }} />
                <span className="text-sm text-zinc-400">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-[#16162a]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Recent Users</h3>
          <a href="/users" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">View all →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">User</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Email</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recentUsers || []).map((user) => (
                <tr key={user._id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      {user.profileImage ? (
                        <img src={user.profileImage} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium text-white">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-zinc-400">{user.email}</td>
                  <td className="py-4 px-4 text-zinc-500">{new Date(user.createdAt).toLocaleDateString()}</td>
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
