import { useState, useEffect } from 'react';
import { Trash2, XCircle, ChevronLeft, ChevronRight, Users, Calendar, MapPin, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { getActivities, cancelActivity, deleteActivity } from '../services/api';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    fetchActivities();
  }, [pagination.page]);

  const fetchActivities = async () => {
    try {
      const response = await getActivities({ page: pagination.page, limit: 10 });
      setActivities(response.data.data.activities);
      setPagination(response.data.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    const reason = prompt('Enter cancellation reason:');
    if (!reason) return;
    
    try {
      await cancelActivity(id, reason);
      toast.success('Activity cancelled successfully');
      fetchActivities();
    } catch (error) {
      toast.error('Failed to cancel activity');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this activity?')) return;
    
    try {
      await deleteActivity(id);
      toast.success('Activity deleted successfully');
      fetchActivities();
    } catch (error) {
      toast.error('Failed to delete activity');
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Activities</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage scheduled activities and events</p>
        </div>
        <button className="h-9 w-9 flex items-center justify-center border border-[#27272a] rounded-md text-zinc-500 hover:text-white hover:bg-[#27272a] transition-colors">
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Data Table */}
      <div className="border border-[#27272a] rounded-lg overflow-hidden bg-[#09090b]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#09090b] text-zinc-500 font-medium border-b border-[#27272a]">
              <tr>
                <th className="px-6 py-3 font-medium">Activity</th>
                <th className="px-6 py-3 font-medium">Creator</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Participants</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]">
              {activities.map((activity) => (
                <tr key={activity._id} className="hover:bg-[#27272a]/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-zinc-200">{activity.title}</p>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-500">
                        <MapPin className="w-3 h-3" />
                        {activity.category}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {activity.createdBy?.profileImage ? (
                        <img src={activity.createdBy.profileImage} alt={activity.createdBy.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-zinc-800 transition-all" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-400">
                          {activity.createdBy?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                      <span className="text-zinc-300 font-medium">{activity.createdBy?.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(activity.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-mono">
                      <Users className="w-3.5 h-3.5" />
                      <span>{activity.participants?.length || 0} / {activity.maxCapacity}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                      activity.isCancelled 
                        ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                      {activity.isCancelled ? 'Cancelled' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!activity.isCancelled && (
                        <button 
                          onClick={() => handleCancel(activity._id)}
                          className="p-1.5 text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 rounded transition-colors"
                          title="Cancel Activity"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(activity._id)}
                        className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        title="Delete Activity"
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
            Page <span className="font-medium text-zinc-300">{pagination.page}</span> of <span className="font-medium text-zinc-300">{pagination.pages}</span>
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
    </div>
  );
};

export default Activities;
