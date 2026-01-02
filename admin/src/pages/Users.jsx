import { useState, useEffect } from 'react';
import { Search, Eye, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Users</h1>
          <p className="text-zinc-500 mt-1">{pagination.total} registered users</p>
        </div>
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            className="w-full pl-12 pr-4 py-3 bg-[#16162a] border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            placeholder="Search users..."
            value={search}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#16162a]/60 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1e1e3f]">
                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">User</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Mobile</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Plan</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Joined</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      {user.profileImage ? (
                        <img src={user.profileImage} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-sm text-zinc-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-zinc-400">
                    {user.countryCode} {user.mobile}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      user.planType === 'None' 
                        ? 'bg-zinc-500/10 text-zinc-400' 
                        : 'bg-green-500/10 text-green-400'
                    }`}>
                      {user.planType || 'None'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-zinc-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setSelectedUser(user)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 text-zinc-400 hover:bg-indigo-500/20 hover:text-indigo-400 transition-all"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(user._id)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 text-zinc-400 hover:bg-red-500/20 hover:text-red-400 transition-all"
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
        <div className="flex items-center justify-center gap-2 py-6 border-t border-white/5">
          <button 
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 text-zinc-400 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            disabled={pagination.page === 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                pagination.page === page
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white/5 text-zinc-400 hover:bg-white/10'
              }`}
              onClick={() => setPagination(prev => ({ ...prev, page }))}
            >
              {page}
            </button>
          ))}
          <button 
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 text-zinc-400 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            disabled={pagination.page === pagination.pages}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6"
          onClick={() => setSelectedUser(null)}
        >
          <div 
            className="bg-[#16162a] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h3 className="text-lg font-semibold text-white">User Details</h3>
              <button 
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                {selectedUser.profileImage ? (
                  <img src={selectedUser.profileImage} alt={selectedUser.name} className="w-20 h-20 rounded-full object-cover mx-auto" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-semibold mx-auto">
                    {selectedUser.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <h3 className="text-xl font-semibold text-white mt-4">{selectedUser.name}</h3>
                <p className="text-zinc-500">{selectedUser.email}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Mobile</p>
                  <p className="text-white">{selectedUser.countryCode} {selectedUser.mobile}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Gender</p>
                  <p className="text-white">{selectedUser.gender}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Travel Style</p>
                  <p className="text-white">{selectedUser.travelStyle}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Plan</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    selectedUser.planType === 'None' 
                      ? 'bg-zinc-500/10 text-zinc-400' 
                      : 'bg-green-500/10 text-green-400'
                  }`}>
                    {selectedUser.planType || 'None'}
                  </span>
                </div>
                <div className="col-span-2 bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Bio</p>
                  <p className="text-white">{selectedUser.bio || 'No bio provided'}</p>
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
