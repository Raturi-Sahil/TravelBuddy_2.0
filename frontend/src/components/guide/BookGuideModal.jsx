import { useAuth } from '@clerk/clerk-react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { createBooking } from '../../redux/slices/guideSlice';

const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const BookGuideModal = ({ guide, onClose }) => {
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.guide);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [notes, setNotes] = useState('');

  // Get available days from guide profile (0-6, Sunday-Saturday)
  const availableDays = useMemo(() => {
    return guide?.availability?.map(a => a.dayOfWeek) || [];
  }, [guide]);

  const availableDayNames = availableDays.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ');

  // Calculate number of available days in selected range
  const getBookingInfo = useMemo(() => {
    if (!startDate || !endDate) return { days: 0, validDays: 0, allAvailable: false };
    
    let current = new Date(startDate);
    let validDays = 0;
    let totalDays = 0;
    
    while (current <= endDate) {
      totalDays++;
      if (availableDays.includes(current.getDay())) {
        validDays++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return { 
      days: totalDays, 
      validDays, 
      allAvailable: validDays === totalDays 
    };
  }, [startDate, endDate, availableDays]);

  const numberOfDays = getBookingInfo.validDays;
  const totalPrice = numberOfDays * (guide?.pricePerDay || 0);

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    const days = [];
    
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      const isPast = date <= today;
      const isAvailable = availableDays.includes(dayOfWeek) && !isPast;
      
      // Check if date is in selected range
      let isInRange = false;
      let isStart = false;
      let isEnd = false;
      
      if (startDate && endDate) {
        isInRange = date >= startDate && date <= endDate;
        isStart = date.getTime() === startDate.getTime();
        isEnd = date.getTime() === endDate.getTime();
      } else if (startDate) {
        isStart = date.getTime() === startDate.getTime();
      }
      
      days.push({
        date,
        day,
        isPast,
        isAvailable,
        isInRange,
        isStart,
        isEnd,
      });
    }
    
    return days;
  }, [currentMonth, availableDays, startDate, endDate]);

  const handleDateClick = (dayInfo) => {
    if (!dayInfo || dayInfo.isPast) return;
    
    // Only allow clicking on available days
    if (!dayInfo.isAvailable) {
      toast.error('This day is not available');
      return;
    }

    const clickedTime = dayInfo.date.getTime();

    // Case 1: No selection yet - start fresh
    if (!startDate) {
      setStartDate(dayInfo.date);
      setEndDate(dayInfo.date);
      return;
    }

    const startTime = startDate.getTime();
    const endTime = endDate ? endDate.getTime() : startTime;

    // Case 2: Clicking on a single selected day - deselect everything
    if (startTime === endTime && clickedTime === startTime) {
      setStartDate(null);
      setEndDate(null);
      return;
    }

    // Case 3: Clicking on the END date of a range - shrink to just start date
    if (clickedTime === endTime && startTime !== endTime) {
      setEndDate(startDate);
      return;
    }

    // Case 4: Clicking on the START date of a range - shrink to just end date
    if (clickedTime === startTime && startTime !== endTime) {
      setStartDate(endDate);
      return;
    }

    // Case 5: Clicking before start - extend backwards
    if (clickedTime < startTime) {
      setStartDate(dayInfo.date);
      return;
    }
    
    // Case 6: Clicking after end - extend forwards
    if (clickedTime > endTime) {
      setEndDate(dayInfo.date);
      return;
    }

    // Case 7: Clicking within range - set as new end date (shrink)
    setEndDate(dayInfo.date);
  };

  const clearSelection = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      toast.error('Please select a date range (click start date, then end date)');
      return;
    }

    // Validate all days in range are available
    if (!getBookingInfo.allAvailable) {
      toast.error('Your selected range includes unavailable days. Please select only available days.');
      return;
    }

    try {
      await dispatch(
        createBooking({
          getToken,
          bookingData: {
            guideId: guide._id,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            numberOfDays,
            notes,
          },
        })
      ).unwrap();

      toast.success('Booking request sent successfully!');
      onClose();
      navigate('/my-guide-bookings');
    } catch (error) {
      toast.error(error || 'Failed to create booking');
    }
  };

  const isPrevDisabled = () => {
    const today = new Date();
    return currentMonth.getFullYear() === today.getFullYear() && 
           currentMonth.getMonth() <= today.getMonth();
  };

  const formatDateRange = () => {
    if (!startDate) return '';
    const options = { month: 'short', day: 'numeric' };
    if (!endDate) return startDate.toLocaleDateString('en-US', options);
    return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Book {guide?.user?.name}</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <form className="flex-1 overflow-y-auto" onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            {/* Available Days */}
            <div className="bg-orange-50 rounded-lg px-3 py-2 text-sm text-orange-700">
              <span className="font-medium">Available:</span> {availableDayNames || 'No days set'}
            </div>

            {/* Instructions */}
            <p className="text-xs text-gray-500 text-center">
              Click to select start date, then click again to select end date
            </p>

            {/* Compact Calendar */}
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  disabled={isPrevDisabled()}
                  className={`p-1 rounded ${isPrevDisabled() ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-200'}`}
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="font-semibold text-sm text-gray-900">
                  {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="p-1 text-gray-600 hover:bg-gray-200 rounded"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-0.5">
                {DAYS_OF_WEEK.map((day, i) => (
                  <div key={i} className={`text-center text-xs py-1 font-medium ${availableDays.includes(i) ? 'text-orange-600' : 'text-gray-400'}`}>
                    {day}
                  </div>
                ))}
                {calendarDays.map((dayInfo, i) => (
                  dayInfo ? (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleDateClick(dayInfo)}
                      disabled={dayInfo.isPast}
                      className={`h-8 rounded text-xs font-medium transition-all ${
                        dayInfo.isStart || dayInfo.isEnd
                          ? 'bg-orange-500 text-white'
                          : dayInfo.isInRange
                            ? 'bg-orange-200 text-orange-800'
                            : dayInfo.isAvailable
                              ? 'bg-white text-gray-900 hover:bg-orange-100 border border-gray-200'
                              : dayInfo.isPast
                                ? 'text-gray-300'
                                : 'text-gray-300 bg-gray-100'
                      }`}
                    >
                      {dayInfo.day}
                    </button>
                  ) : <div key={i} className="h-8" />
                ))}
              </div>
            </div>

            {/* Selected Range */}
            {startDate && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  <span className="font-medium">Selected:</span> {formatDateRange()}
                  {!endDate && <span className="text-orange-500 ml-1">(select end date)</span>}
                </span>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Clear
                </button>
              </div>
            )}

            {/* Validation Warning */}
            {startDate && endDate && !getBookingInfo.allAvailable && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-600">
                ⚠️ Your range includes {getBookingInfo.days - getBookingInfo.validDays} unavailable day(s). 
                Please select consecutive available days only as in one booking there cannot be unavailable days.
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any requests..."
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none"
              />
            </div>

            {/* Price Summary */}
            {numberOfDays > 0 && getBookingInfo.allAvailable && (
              <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">{numberOfDays} day{numberOfDays > 1 ? 's' : ''} × ₹{guide?.pricePerDay}</span>
                  <span className="font-bold text-orange-600">₹{totalPrice}</span>
                </div>
              </div>
            )}
          </div>

          {/* Fixed Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !startDate || !endDate || !getBookingInfo.allAvailable}
              className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
                loading || !startDate || !endDate || !getBookingInfo.allAvailable
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg'
              }`}
            >
              {loading ? 'Booking...' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookGuideModal;
