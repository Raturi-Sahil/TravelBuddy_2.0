import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, IndianRupee, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { getGuideBookings } from '../services/api';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [pagination.page, statusFilter]);

  const fetchBookings = async () => {
    try {
      const response = await getGuideBookings({ 
        page: pagination.page, 
        limit: 10,
        status: statusFilter || undefined
      });
      setBookings(response.data.data.bookings);
      setPagination(response.data.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
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
          <h1 className="text-xl font-semibold text-white">Guide Bookings</h1>
          <p className="text-sm text-zinc-500 mt-1">Track and manage booking requests</p>
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <select 
            className="h-9 pl-9 pr-8 bg-[#09090b] border border-[#27272a] rounded-md text-sm text-white focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all cursor-pointer appearance-none"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="border border-[#27272a] rounded-lg overflow-hidden bg-[#09090b]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#09090b] text-zinc-500 font-medium border-b border-[#27272a]">
              <tr>
                <th className="px-6 py-3 font-medium">Guide</th>
                <th className="px-6 py-3 font-medium">Traveler</th>
                <th className="px-6 py-3 font-medium">Trip Duration</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]">
              {bookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-[#27272a]/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {booking.guide?.user?.profileImage ? (
                        <img src={booking.guide.user.profileImage} alt={booking.guide.user.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-zinc-800 transition-all" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-400">
                          {booking.guide?.user?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                      <span className="text-zinc-200 font-medium">{booking.guide?.user?.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {booking.traveler?.profileImage ? (
                        <img src={booking.traveler.profileImage} alt={booking.traveler.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-zinc-800 transition-all" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-400">
                          {booking.traveler?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                      <span className="text-zinc-200 font-medium">{booking.traveler?.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-zinc-300 text-xs font-mono">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                      </div>
                      <span className="text-xs text-zinc-500 px-5">{booking.numberOfDays} days</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-0.5 text-zinc-200 font-medium font-mono">
                      <IndianRupee className="w-3.5 h-3.5 text-zinc-500" />
                      {booking.totalPrice?.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border capitalize ${
                      booking.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      booking.status === 'confirmed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      booking.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border capitalize ${
                      booking.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      booking.paymentStatus === 'refunded' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {booking.paymentStatus}
                    </span>
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

export default Bookings;
