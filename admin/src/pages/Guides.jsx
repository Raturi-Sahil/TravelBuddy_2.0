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
          <h1 className="text-3xl font-bold text-white">Local Guides</h1>
          <p className="text-zinc-500 mt-1">{pagination.total} registered guides</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#16162a]/60 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1e1e3f]">
                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Guide</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Location</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Price/Day</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Rating</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {guides.map((guide) => (
                <tr key={guide._id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      {guide.user?.profileImage ? (
                        <img src={guide.user.profileImage} alt={guide.user.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {guide.user?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-white">{guide.user?.name || 'Unknown'}</p>
                        <p className="text-sm text-zinc-500">{guide.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <MapPin className="w-4 h-4" />
                      {guide.city}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-semibold text-white">₹{guide.pricePerDay?.toLocaleString()}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-white">{guide.averageRating?.toFixed(1) || '0.0'}</span>
                      <span className="text-zinc-500 text-sm">({guide.totalReviews || 0})</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        guide.isVerified 
                          ? 'bg-green-500/10 text-green-400' 
                          : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {guide.isVerified ? 'Verified' : 'Pending'}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        guide.isActive 
                          ? 'bg-blue-500/10 text-blue-400' 
                          : 'bg-red-500/10 text-red-400'
                      }`}>
                        {guide.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {!guide.isVerified ? (
                        <button 
                          onClick={() => handleVerify(guide._id, true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-xs font-medium hover:bg-green-500/20 transition-all"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Verify
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleVerify(guide._id, false)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-500/10 text-zinc-400 rounded-lg text-xs font-medium hover:bg-zinc-500/20 transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Unverify
                        </button>
                      )}
                      <button 
                        onClick={() => handleToggleStatus(guide._id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          guide.isActive 
                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                            : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        {guide.isActive ? 'Disable' : 'Enable'}
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

export default Guides;
