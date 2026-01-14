import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths} from 'date-fns';
import { Calendar as CalendarIcon,ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect,useRef, useState } from 'react';

const Calendar = ({
  value,
  onChange,
  label,
  placeholder = "Select date",
  minDate = null,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date());
  const calendarRef = useRef(null);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleDateClick = (day) => {
    // Check if date is before minDate
    if (minDate && isBefore(day, startOfDay(new Date(minDate)))) {
      return;
    }
    // Check if date is before today
    if (isBefore(day, startOfDay(new Date()))) {
      return;
    }
    onChange(format(day, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-t-xl">
      <button
        type="button"
        onClick={prevMonth}
        className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
      >
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>
      <span className="text-white font-semibold">
        {format(currentMonth, 'MMMM yyyy')}
      </span>
      <button
        type="button"
        onClick={nextMonth}
        className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
      >
        <ChevronRight className="w-5 h-5 text-white" />
      </button>
    </div>
  );

  const renderDays = () => {
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    return (
      <div className="grid grid-cols-7 gap-1 px-2 py-2 bg-gray-50">
        {days.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isSelected = value && isSameDay(day, new Date(value));
        const isTodayDate = isToday(day);
        const isPast = isBefore(day, startOfDay(new Date()));
        const isBeforeMin = minDate && isBefore(day, startOfDay(new Date(minDate)));
        const isDisabled = isPast || isBeforeMin;

        days.push(
          <button
            key={day.toString()}
            type="button"
            onClick={() => handleDateClick(cloneDay)}
            disabled={isDisabled}
            className={`
              aspect-square flex items-center justify-center text-sm rounded-lg transition-all
              ${!isCurrentMonth ? 'text-gray-300' : ''}
              ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-indigo-100 cursor-pointer'}
              ${isSelected ? 'bg-indigo-500 text-white hover:bg-indigo-600' : ''}
              ${isTodayDate && !isSelected ? 'ring-2 ring-indigo-300 font-semibold text-indigo-600' : ''}
              ${isCurrentMonth && !isSelected && !isDisabled ? 'text-gray-700' : ''}
            `}
          >
            {format(day, 'd')}
          </button>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1">
          {days}
        </div>
      );
      days = [];
    }

    return <div className="px-2 pb-3 space-y-1">{rows}</div>;
  };

  const displayValue = value
    ? format(new Date(value), 'MMM dd, yyyy')
    : placeholder;

  return (
    <div className={`relative ${className}`} ref={calendarRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      {/* Input Field */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-all text-left
          ${isOpen
            ? 'border-indigo-500 ring-2 ring-indigo-500/20'
            : 'border-gray-200 hover:border-gray-300'
          }
          ${value ? 'text-gray-900' : 'text-gray-400'}
          bg-white
        `}
      >
        <CalendarIcon className="w-5 h-5 text-gray-400" />
        <span className="flex-1">{displayValue}</span>
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {renderHeader()}
          {renderDays()}
          {renderCells()}

          {/* Quick Actions */}
          <div className="px-3 pb-3 flex gap-2">
            <button
              type="button"
              onClick={() => handleDateClick(new Date())}
              className="flex-1 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className="flex-1 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
