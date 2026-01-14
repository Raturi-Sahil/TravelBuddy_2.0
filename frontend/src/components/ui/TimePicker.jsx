import { Clock } from 'lucide-react';
import { useEffect,useMemo,useRef, useState } from 'react';

const TimePicker = ({
  value,
  onChange,
  label,
  placeholder = "Select time",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const timePickerRef = useRef(null);

  // Parse value prop to derive hour, minute, and period
  // Using useMemo avoids cascading renders from useEffect + setState
  const { selectedHour, selectedMinute, selectedPeriod } = useMemo(() => {
    if (!value) {
      return { selectedHour: '', selectedMinute: '', selectedPeriod: 'AM' };
    }

    const [hours, minutes] = value.split(':');
    let hour = parseInt(hours, 10);
    let period = 'AM';

    if (hour >= 12) {
      period = 'PM';
      if (hour > 12) hour -= 12;
    } else {
      if (hour === 0) hour = 12;
    }

    return {
      selectedHour: hour.toString().padStart(2, '0'),
      selectedMinute: minutes,
      selectedPeriod: period
    };
  }, [value]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (timePickerRef.current && !timePickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];

  const handleTimeSelect = (hour, minute, period) => {
    let hour24 = parseInt(hour, 10);

    if (period === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hour24 === 12) {
      hour24 = 0;
    }

    const timeString = `${hour24.toString().padStart(2, '0')}:${minute}`;
    onChange(timeString);
  };

  const handleHourClick = (hour) => {
    // Use selected minute or default to '00'
    const minute = selectedMinute || '00';
    handleTimeSelect(hour, minute, selectedPeriod);
  };

  const handleMinuteClick = (minute) => {
    // Use selected hour or default to '12'
    const hour = selectedHour || '12';
    handleTimeSelect(hour, minute, selectedPeriod);
  };

  const handlePeriodClick = (period) => {
    // Only update if we have both hour and minute
    if (selectedHour && selectedMinute) {
      handleTimeSelect(selectedHour, selectedMinute, period);
    }
  };

  const formatDisplayTime = () => {
    if (!value) return placeholder;

    const [hours, minutes] = value.split(':');
    let hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';

    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;

    return `${hour}:${minutes} ${period}`;
  };

  return (
    <div className={`relative ${className}`} ref={timePickerRef}>
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
        <Clock className="w-5 h-5 text-gray-400" />
        <span className="flex-1">{formatDisplayTime()}</span>
      </button>

      {/* Time Picker Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-3 text-center">
            <span className="text-white font-semibold text-lg">
              {selectedHour && selectedMinute
                ? `${selectedHour}:${selectedMinute} ${selectedPeriod}`
                : 'Select Time'
              }
            </span>
          </div>

          {/* AM/PM Toggle */}
          <div className="flex gap-2 p-3 bg-gray-50 border-b border-gray-100">
            {['AM', 'PM'].map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => handlePeriodClick(period)}
                className={`
                  flex-1 py-2 rounded-lg font-semibold text-sm transition-all
                  ${selectedPeriod === period
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }
                `}
              >
                {period}
              </button>
            ))}
          </div>

          {/* Time Selection */}
          <div className="p-3 flex gap-3">
            {/* Hours */}
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 mb-2 text-center">Hour</p>
              <div className="grid grid-cols-4 gap-1">
                {hours.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => handleHourClick(hour)}
                    className={`
                      py-2 rounded-lg text-sm font-medium transition-all
                      ${selectedHour === hour
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-indigo-100'
                      }
                    `}
                  >
                    {hour}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="w-px bg-gray-200" />

            {/* Minutes */}
            <div className="w-20">
              <p className="text-xs font-medium text-gray-500 mb-2 text-center">Min</p>
              <div className="grid grid-cols-1 gap-1">
                {minutes.map((minute) => (
                  <button
                    key={minute}
                    type="button"
                    onClick={() => handleMinuteClick(minute)}
                    className={`
                      py-2 rounded-lg text-sm font-medium transition-all
                      ${selectedMinute === minute
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-indigo-100'
                      }
                    `}
                  >
                    :{minute}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="px-3 pb-3 flex gap-2">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                const hours = now.getHours().toString().padStart(2, '0');
                const minutes = (Math.round(now.getMinutes() / 15) * 15 % 60).toString().padStart(2, '0');
                onChange(`${hours}:${minutes}`);
                setIsOpen(false);
              }}
              className="flex-1 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              Now
            </button>
            <button
              type="button"
              onClick={() => {
                if (selectedHour && selectedMinute) {
                  setIsOpen(false);
                }
              }}
              className="flex-1 py-2 text-xs font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors"
            >
              Done
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

export default TimePicker;
