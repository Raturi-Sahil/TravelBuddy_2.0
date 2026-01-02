import { useState, useEffect } from 'react';
import { Trash2, XCircle, ChevronLeft, ChevronRight, Users, Calendar, MapPin } from 'lucide-react';
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Activities</h1>
          <p className="text-zinc-500 mt-1">{pagination.total} total activities</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#16162a]/60 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1e1e3f]">
                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Activity</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Creator</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Date</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Participants</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity._id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-white">{activity.title}</p>
                      <p className="text-sm text-zinc-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {activity.category}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      {activity.createdBy?.profileImage ? (
                        <img src={activity.createdBy.profileImage} alt={activity.createdBy.name} className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                          {activity.createdBy?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                      <span className="text-white">{activity.createdBy?.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <Calendar className="w-4 h-4" />
                      {new Date(activity.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <Users className="w-4 h-4" />
                      <span>{activity.participants?.length || 0} / {activity.maxCapacity}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      activity.isCancelled 
                        ? 'bg-red-500/10 text-red-400' 
                        : 'bg-green-500/10 text-green-400'
                    }`}>
                      {activity.isCancelled ? 'Cancelled' : 'Active'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {!activity.isCancelled && (
                        <button 
                          onClick={() => handleCancel(activity._id)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 text-zinc-400 hover:bg-amber-500/20 hover:text-amber-400 transition-all"
                          title="Cancel Activity"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(activity._id)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 text-zinc-400 hover:bg-red-500/20 hover:text-red-400 transition-all"
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
    </div>
  );
};

export default Activities;
