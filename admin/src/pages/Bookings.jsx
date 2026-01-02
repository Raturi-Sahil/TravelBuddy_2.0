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

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-400';
      case 'confirmed': return 'bg-blue-500/10 text-blue-400';
      case 'pending': return 'bg-amber-500/10 text-amber-400';
      case 'cancelled': return 'bg-red-500/10 text-red-400';
      default: return 'bg-zinc-500/10 text-zinc-400';
    }
  };

  const getPaymentBadgeClass = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-500/10 text-green-400';
      case 'refunded': return 'bg-blue-500/10 text-blue-400';
      default: return 'bg-amber-500/10 text-amber-400';
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Guide Bookings</h1>
          <p className="text-zinc-500 mt-1">{pagination.total} total bookings</p>
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <select 
            className="appearance-none pl-10 pr-8 py-3 bg-[#16162a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
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

      {/* Table */}
      <div className="bg-[#16162a]/60 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1e1e3f]">
                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Guide</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Traveler</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Dates</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Duration</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Amount</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Payment</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      {booking.guide?.user?.profileImage ? (
                        <img src={booking.guide.user.profileImage} alt={booking.guide.user.name} className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                          {booking.guide?.user?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                      <span className="text-white">{booking.guide?.user?.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      {booking.traveler?.profileImage ? (
                        <img src={booking.traveler.profileImage} alt={booking.traveler.name} className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-sm font-semibold">
                          {booking.traveler?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                      <span className="text-white">{booking.traveler?.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-sm">
                      <Calendar className="w-4 h-4" />
                      {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-zinc-400">
                    {booking.numberOfDays} day{booking.numberOfDays > 1 ? 's' : ''}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-0.5 text-white font-semibold">
                      <IndianRupee className="w-4 h-4" />
                      {booking.totalPrice?.toLocaleString()}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadgeClass(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${getPaymentBadgeClass(booking.paymentStatus)}`}>
                      {booking.paymentStatus}
                    </span>
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

export default Bookings;
