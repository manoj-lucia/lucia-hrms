'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: string;
  name?: string;
  id?: string;
}

export default function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  required = false,
  disabled = false,
  className = "",
  label,
  error,
  name,
  id
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => {
    if (value) {
      return new Date(value);
    }
    return new Date();
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Update current date when value changes
  useEffect(() => {
    if (value) {
      setCurrentDate(new Date(value));
    }
  }, [value]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate year options (from 1950 to current year + 10)
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let year = 1950; year <= currentYear + 10; year++) {
    yearOptions.push(year);
  }

  const formatDisplayDate = (date: string) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateString = newDate.toISOString().split('T')[0];
    onChange(dateString);
    setIsOpen(false);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleMonthChange = (month: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), month, 1));
  };

  const handleYearChange = (year: number) => {
    setCurrentDate(new Date(year, currentDate.getMonth(), 1));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    const selectedDate = new Date(value);
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="relative z-10" ref={dropdownRef}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type="text"
          name={name}
          id={id}
          value={formatDisplayDate(value)}
          placeholder={placeholder}
          readOnly
          required={required}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`block w-full px-4 py-2.5 pr-10 bg-white border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent rounded-md text-sm cursor-pointer ${
            error
              ? 'border-red-500 bg-red-50 focus:ring-red-500'
              : 'border-gray-300 focus:ring-[#0745fe]'
          } ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''} ${className}`}
        />

        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <CalendarIcon className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}

      {/* Calendar Dropdown */}
      {isOpen && (
        <div
          className="absolute z-[9999] top-full left-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-xl w-80 p-4"
          ref={dropdownRef}
        >
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex space-x-2">
                {/* Month Dropdown */}
                <select
                  value={currentDate.getMonth()}
                  onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                  className="text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0745fe] focus:border-transparent hover:border-gray-400 transition-colors"
                >
                  {monthNames.map((month, index) => (
                    <option key={index} value={index} className="text-gray-900 bg-white">
                      {month}
                    </option>
                  ))}
                </select>

                {/* Year Dropdown */}
                <select
                  value={currentDate.getFullYear()}
                  onChange={(e) => handleYearChange(parseInt(e.target.value))}
                  className="text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0745fe] focus:border-transparent hover:border-gray-400 transition-colors"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year} className="text-gray-900 bg-white">
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-1">
                <button
                  type="button"
                  onClick={goToPreviousMonth}
                  className="p-2 rounded-md hover:bg-gray-100 transition-colors text-[#0745fe]"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={goToNextMonth}
                  className="p-2 rounded-md hover:bg-gray-100 transition-colors text-[#0745fe]"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-2">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => (
              <div key={index} className="aspect-square">
                {day ? (
                  <button
                    type="button"
                    onClick={() => handleDateClick(day)}
                    className={`w-full h-full text-sm font-medium rounded-full transition-all duration-200 hover:bg-gray-100 ${
                      isSelected(day)
                        ? 'bg-[#0745fe] text-white hover:bg-[#0635d1] shadow-md'
                        : isToday(day)
                        ? 'bg-blue-50 text-[#0745fe] border border-[#0745fe]'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    {day}
                  </button>
                ) : (
                  <div className="w-full h-full"></div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                const todayString = today.toISOString().split('T')[0];
                onChange(todayString);
                setCurrentDate(today);
                setIsOpen(false);
              }}
              className="text-sm text-[#0745fe] hover:text-[#0635d1] font-medium"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
