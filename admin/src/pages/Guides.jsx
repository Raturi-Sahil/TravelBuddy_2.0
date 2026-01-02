import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ChevronLeft, ChevronRight, Star, MapPin, Power } from 'lucide-react';
import toast from 'react-hot-toast';
import { getGuides, verifyGuide, toggleGuideStatus } from '../services/api';

const Guides = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    fetchGuides();
  }, [pagination.page]);

  const fetchGuides = async () => {
    try {
      const response = await getGuides({ page: pagination.page, limit: 10 });
      setGuides(response.data.data.guides);
      setPagination(response.data.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch guides');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, isVerified) => {
    try {
      await verifyGuide(id, isVerified);
      toast.success(`Guide ${isVerified ? 'verified' : 'unverified'} successfully`);
      fetchGuides();
    } catch (error) {
      toast.error('Failed to update guide verification');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleGuideStatus(id);
      toast.success('Guide status updated');
      fetchGuides();
    } catch (error) {
      toast.error('Failed to update guide status');
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
          <h1 className="text-xl font-semibold text-white">Local Guides</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage guide verification and status</p>
        </div>
      </div>

      {/* Data Table */}
      <div className="border border-[#27272a] rounded-lg overflow-hidden bg-[#09090b]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#09090b] text-zinc-500 font-medium border-b border-[#27272a]">
              <tr>
                <th className="px-6 py-3 font-medium">Guide Profile</th>
                <th className="px-6 py-3 font-medium">Location</th>
                <th className="px-6 py-3 font-medium">Pricing</th>
                <th className="px-6 py-3 font-medium">Rating</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]">
              {guides.map((guide) => (
                <tr key={guide._id} className="hover:bg-[#27272a]/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {guide.user?.profileImage ? (
                        <img src={guide.user.profileImage} alt={guide.user.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-zinc-800 transition-all" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-400">
                          {guide.user?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-zinc-200 group-hover:text-white transition-colors">{guide.user?.name || 'Unknown'}</p>
                        <p className="text-xs text-zinc-500">{guide.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                      <MapPin className="w-3.5 h-3.5" />
                      {guide.city}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-zinc-300">
                    ₹{guide.pricePerDay?.toLocaleString()}<span className="text-zinc-600">/day</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-zinc-200 font-medium">{guide.averageRating?.toFixed(1) || '0.0'}</span>
                      <span className="text-zinc-600 text-xs">({guide.totalReviews || 0})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                        guide.isVerified 
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {guide.isVerified ? 'Verified' : 'Pending'}
                      </span>
                      {!guide.isActive && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px] font-medium border border-red-500/20">
                          Inactive
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!guide.isVerified ? (
                        <button 
                          onClick={() => handleVerify(guide._id, true)}
                          className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded hover:bg-emerald-500/20 transition-colors text-xs"
                          title="Verify Guide"
                        >
                          <CheckCircle className="w-3 h-3" /> Verify
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleVerify(guide._id, false)}
                          className="p-1.5 text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 rounded transition-colors"
                          title="Unverify Guide"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleToggleStatus(guide._id)}
                        className={`p-1.5 rounded transition-colors ${
                          guide.isActive 
                            ? 'text-zinc-400 hover:text-red-400 hover:bg-red-500/10' 
                            : 'text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10'
                        }`}
                        title={guide.isActive ? 'Deactivate' : 'Activate'}
                      >
                        <Power className="w-4 h-4" />
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

export default Guides;
