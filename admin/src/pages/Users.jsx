import { useState, useEffect } from 'react';
import { Search, Eye, Trash2, ChevronLeft, ChevronRight, X, MoreHorizontal, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { getUsers, deleteUser } from '../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, search]);

  const fetchUsers = async () => {
    try {
      const response = await getUsers({ page: pagination.page, limit: 10, search });
      setUsers(response.data.data.users);
      setPagination(response.data.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this user? This will also delete their posts and activities.')) return;
    
    try {
      await deleteUser(id);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-zinc-600 border-t-zinc-200 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Users</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage and view user accounts</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative group">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-zinc-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="h-9 w-64 bg-[#09090b] border border-[#27272a] rounded-md pl-9 pr-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all"
              value={search}
              onChange={handleSearch}
            />
          </div>
          <button className="h-9 w-9 flex items-center justify-center border border-[#27272a] rounded-md text-zinc-500 hover:text-white hover:bg-[#27272a] transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="border border-[#27272a] rounded-lg overflow-hidden bg-[#09090b]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#09090b] text-zinc-500 font-medium border-b border-[#27272a]">
              <tr>
                <th className="px-6 py-3 font-medium">User</th>
                <th className="px-6 py-3 font-medium">Contact</th>
                <th className="px-6 py-3 font-medium">Plan</th>
                <th className="px-6 py-3 font-medium">Joined</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]">
              {users.map((user) => (
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
                      <div>
                        <p className="font-medium text-zinc-200 group-hover:text-white transition-colors">{user.name}</p>
                        <p className="text-xs text-zinc-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-zinc-400 font-mono text-xs">{user.countryCode} {user.mobile}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                      user.planType === 'Premium' 
                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}>
                      {user.planType || 'Free'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 font-mono text-xs">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setSelectedUser(user)}
                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-[#27272a] rounded transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(user._id)}
                        className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-[#27272a] flex items-center justify-between">
          <p className="text-xs text-zinc-500">
            Showing <span className="font-medium text-zinc-300">{(pagination.page - 1) * 10 + 1}</span> to <span className="font-medium text-zinc-300">{Math.min(pagination.page * 10, pagination.total)}</span> of <span className="font-medium text-zinc-300">{pagination.total}</span> users
          </p>
          <div className="flex items-center gap-1">
            <button 
              className="p-1.5 rounded border border-[#27272a] text-zinc-500 hover:text-white hover:bg-[#27272a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              className="p-1.5 rounded border border-[#27272a] text-zinc-500 hover:text-white hover:bg-[#27272a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={pagination.page === pagination.pages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedUser(null)}
        >
          <div 
            className="w-full max-w-lg bg-[#09090b] border border-[#27272a] rounded-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272a]">
              <h3 className="text-base font-semibold text-white">User Details</h3>
              <button 
                onClick={() => setSelectedUser(null)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                {selectedUser.profileImage ? (
                  <img src={selectedUser.profileImage} alt={selectedUser.name} className="w-16 h-16 rounded-full object-cover ring-4 ring-[#27272a]" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-xl font-semibold text-zinc-400 ring-4 ring-[#27272a]">
                    {selectedUser.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-bold text-white">{selectedUser.name}</h2>
                  <p className="text-sm text-zinc-500">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded border border-[#27272a] bg-[#27272a]/20">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1">Mobile</p>
                  <p className="text-sm text-zinc-300 font-mono">{selectedUser.countryCode} {selectedUser.mobile}</p>
                </div>
                <div className="p-3 rounded border border-[#27272a] bg-[#27272a]/20">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1">Gender</p>
                  <p className="text-sm text-zinc-300 capitalize">{selectedUser.gender || 'Not specified'}</p>
                </div>
                <div className="p-3 rounded border border-[#27272a] bg-[#27272a]/20">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1">Travel Style</p>
                  <p className="text-sm text-zinc-300 capitalize">{selectedUser.travelStyle || 'Not set'}</p>
                </div>
                <div className="p-3 rounded border border-[#27272a] bg-[#27272a]/20">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1">Account Type</p>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                    selectedUser.planType === 'Premium' 
                      ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}>
                    {selectedUser.planType || 'Free'}
                  </span>
                </div>
                <div className="col-span-2 p-3 rounded border border-[#27272a] bg-[#27272a]/20">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1">Bio</p>
                  <p className="text-sm text-zinc-300">{selectedUser.bio || 'No bio provided'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
