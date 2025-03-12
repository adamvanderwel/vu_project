import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, AlertOctagon, Check, X } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isEqual, isBefore, isAfter, differenceInDays } from 'date-fns';
import { nl } from 'date-fns/locale';

interface DatePickerProps {
  selectedDates: Date[];
  onDateSelect: (dates: Date[]) => void;
  defaultSelectionMode?: 'single' | 'multiple';
  onModeChange?: (mode: 'single' | 'multiple') => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({ 
  selectedDates, 
  onDateSelect,
  defaultSelectionMode = 'single',
  onModeChange
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectionMode, setSelectionMode] = useState<'single' | 'multiple'>(defaultSelectionMode);
  const [error, setError] = useState<string | null>(null);

  // Track dates being selected but not yet confirmed in multi-day mode
  const [tempSelectedDates, setTempSelectedDates] = useState<Date[]>(selectedDates);
  
  // Update tempSelectedDates when selectedDates change from outside
  useEffect(() => {
    setTempSelectedDates(selectedDates);
  }, [selectedDates]);
  
  const MAX_DAYS_SELECTION = 6;

  const handleDateClick = (day: Date) => {
    setError(null);
    
    if (selectionMode === 'single') {
      // In single mode, apply selection immediately
      onDateSelect([day]);
    } else {
      // For multiple selection mode, update temporary selection first
      const dateExists = tempSelectedDates.some(date => isEqual(date, day));
      
      if (dateExists) {
        // If date is already selected, remove it
        setTempSelectedDates(tempSelectedDates.filter(date => !isEqual(date, day)));
      } else {
        // Check if adding this date would exceed the limit for range selection
        if (tempSelectedDates.length === 2) {
          // We already have two dates, so we're restarting the selection
          // but we stay in multiple mode
          setTempSelectedDates([day]);
          return;
        }
        
        if (tempSelectedDates.length === 1) {
          // We're selecting the second date to form a range
          const firstDate = tempSelectedDates[0];
          const daysDifference = Math.abs(differenceInDays(firstDate, day));
          
          // Check if the range exceeds the maximum allowed days
          if (daysDifference > MAX_DAYS_SELECTION - 1) {
            setError(`Please select a range of maximum ${MAX_DAYS_SELECTION} days`);
            return;
          }
          
          // Create a continuous range of dates between first and second selection
          let startDate, endDate;
          if (isBefore(firstDate, day)) {
            startDate = firstDate;
            endDate = day;
          } else {
            startDate = day;
            endDate = firstDate;
          }
          
          const datesInRange = eachDayOfInterval({ start: startDate, end: endDate });
          setTempSelectedDates(datesInRange);
        } else {
          // Starting a new selection but staying in multiple mode
          setTempSelectedDates([day]);
        }
      }
    }
  };

  // Handle confirming the selection
  const handleConfirmSelection = () => {
    if (tempSelectedDates.length > 0) {
      onDateSelect(tempSelectedDates);
    }
  };

  // Handle canceling the selection
  const handleCancelSelection = () => {
    // Reset to the original confirmed dates
    setTempSelectedDates(selectedDates);
  };

  const handleModeChange = (mode: 'single' | 'multiple') => {
    setSelectionMode(mode);
    setError(null);
    
    // Notify parent component of mode change
    if (onModeChange) {
      onModeChange(mode);
    }
    
    if (mode === 'single' && tempSelectedDates.length > 1) {
      // When switching to single mode, reset to just the confirmed selection
      setTempSelectedDates(selectedDates.length > 0 ? [selectedDates[0]] : []);
    } else {
      // When switching to multiple mode, reset temporary selection to match confirmed selection
      setTempSelectedDates(selectedDates);
    }
    // We don't need any code here to switch back to 'single' mode automatically
  };

  // Generate the date range display string
  const getDateRangeString = () => {
    // Use tempSelectedDates for display in the calendar
    const displayDates = tempSelectedDates.length > 0 ? tempSelectedDates : selectedDates;
    
    if (displayDates.length === 0) return '';
    if (displayDates.length === 1) {
      return format(displayDates[0], 'd MMM yyyy', { locale: nl });
    }
    
    // Sort dates chronologically
    const sortedDates = [...displayDates].sort((a, b) => a.getTime() - b.getTime());
    return `${format(sortedDates[0], 'd MMM', { locale: nl })} - ${format(sortedDates[sortedDates.length - 1], 'd MMM', { locale: nl })} ${format(sortedDates[0], 'yyyy')}`;
  };

  const renderCalendarHeader = () => {
    return (
      <div className="flex items-center justify-between px-3 pt-4 pb-2">
        <div className="text-center font-bold text-xl">
          {format(currentMonth, 'MMMM', { locale: nl })}
          <div className="text-2xl font-bold">
            {format(currentMonth, 'yyyy')}
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  const renderDayNames = () => {
    const weekDays = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];
    
    return (
      <div className="grid grid-cols-7 text-center pb-1">
        {weekDays.map((day) => (
          <div key={day} className="text-gray-500 text-sm">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Calculate days from previous month to fill first row
    let firstDayOfMonth = monthStart.getDay(); // 0 = Sunday, 1 = Monday, etc.
    firstDayOfMonth = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Adjust for Monday start (0 = Monday)
    
    // Create a 6x7 grid (6 weeks, 7 days per week)
    const totalDaysToShow = 42; // 6 rows of 7 days
    const calendarDays = Array(totalDaysToShow).fill(null);
    
    // Fill in the days of the month
    daysInMonth.forEach((day, index) => {
      calendarDays[firstDayOfMonth + index] = day;
    });

    // Organize into rows for the grid
    const rows = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      rows.push(calendarDays.slice(i, i + 7));
    }

    // Sort selected dates to find range bounds
    const sortedSelectedDates = [...tempSelectedDates].sort((a, b) => a.getTime() - b.getTime());
    const firstSelectedDate = sortedSelectedDates[0];
    const lastSelectedDate = sortedSelectedDates[sortedSelectedDates.length - 1];

    return rows.map((row, rowIndex) => (
      <div key={`row-${rowIndex}`} className="grid grid-cols-7 text-center">
        {row.map((day, dayIndex) => {
          if (!day) {
            return <div key={`empty-${dayIndex}`} className="py-1" />;
          }

          const isSelected = tempSelectedDates.some(date => isEqual(date, day));
          const isInCurrentMonth = isSameMonth(day, currentMonth);
          
          // Check if this day is part of a range (between first and last selected date)
          const isFirstSelected = firstSelectedDate && isEqual(day, firstSelectedDate);
          const isLastSelected = lastSelectedDate && isEqual(day, lastSelectedDate);
          const isInRange = tempSelectedDates.length > 1 && 
            isAfter(day, firstSelectedDate) && isBefore(day, lastSelectedDate);

          // Determine edge styles for range selection
          let rangeClasses = '';
          if (isFirstSelected && tempSelectedDates.length > 1) {
            rangeClasses = 'bg-blue-500 text-white rounded-l-full';
          } else if (isLastSelected && tempSelectedDates.length > 1) {
            rangeClasses = 'bg-blue-500 text-white rounded-r-full';
          } else if (isInRange) {
            rangeClasses = 'bg-blue-100 text-blue-800 hover:bg-blue-200';
          } else if (isSelected) {
            rangeClasses = 'bg-blue-500 text-white';
          } else {
            rangeClasses = isToday(day) ? 'border border-blue-500' : '';
          }

          return (
            <div 
              key={`day-${dayIndex}`} 
              className={`relative py-1 cursor-pointer ${!isInCurrentMonth ? 'text-gray-300' : ''}`}
            >
              <button
                onClick={() => isInCurrentMonth && handleDateClick(day)}
                disabled={!isInCurrentMonth}
                className={`
                  w-8 h-8 transition-all duration-200 ease-in-out
                  flex items-center justify-center text-sm
                  ${isInRange ? 'bg-blue-100 hover:bg-blue-200' : ''}
                  ${(isFirstSelected || isLastSelected) ? 'bg-blue-500 text-white z-10 relative' : ''}
                  ${isSelected && !isFirstSelected && !isLastSelected ? 'rounded-full bg-blue-500 text-white' : ''}
                  ${isInCurrentMonth && !isSelected && !isInRange ? 'hover:bg-gray-100' : ''}
                  ${isToday(day) && !isSelected && !isInRange ? 'border border-blue-500' : ''}
                `}
              >
                {format(day, 'd')}
              </button>

              {/* Range line behind the dates */}
              {isInRange && (
                <div className="absolute inset-0 flex items-center justify-center z-0">
                  <div className="h-2 bg-blue-100 w-full" />
                </div>
              )}

              {/* Show range start marker */}
              {isFirstSelected && tempSelectedDates.length > 1 && (
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 h-2 bg-blue-100 w-1/2 z-0" />
              )}

              {/* Show range end marker */}
              {isLastSelected && tempSelectedDates.length > 1 && (
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-2 bg-blue-100 w-1/2 z-0" />
              )}
            </div>
          );
        })}
      </div>
    ));
  };

  // Determine if there are pending changes (temp selection differs from confirmed selection)
  const hasPendingChanges = () => {
    if (tempSelectedDates.length !== selectedDates.length) return true;
    
    // Check if any dates are different
    return tempSelectedDates.some(tempDate => 
      !selectedDates.some(selectedDate => isEqual(tempDate, selectedDate))
    );
  };

  // Check if confirm button should be enabled
  const canConfirm = selectionMode === 'multiple' && tempSelectedDates.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden w-[280px]">
      {/* Date range display at top */}
      <div className="px-3 py-2 border-b flex items-center gap-2 bg-gray-50">
        <Calendar className="w-5 h-5 text-blue-500" />
        <span className="text-sm font-medium text-gray-700">
          {selectionMode === 'multiple' && hasPendingChanges() 
            ? 'Pending selection...' 
            : getDateRangeString()}
        </span>
      </div>

      {renderCalendarHeader()}
      
      <div className="px-3 pb-4">
        <div className="flex mb-2 rounded-md overflow-hidden border">
          <button
            onClick={() => handleModeChange('single')}
            className={`px-3 py-1 text-sm flex-1 font-medium transition-colors ${selectionMode === 'single' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Single day
          </button>
          <button
            onClick={() => handleModeChange('multiple')}
            className={`px-3 py-1 text-sm flex-1 font-medium transition-colors ${selectionMode === 'multiple' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Multiple days
          </button>
        </div>
        
        {error && (
          <div className="mb-2 text-sm text-red-600 bg-red-50 p-2 rounded flex items-center gap-1">
            <AlertOctagon className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
        
        {selectionMode === 'multiple' && (
          <div className="mb-2 text-xs text-gray-500 italic">
            Select up to {MAX_DAYS_SELECTION} days in a range
          </div>
        )}
        
        {renderDayNames()}
        {renderDays()}
        
        {selectionMode === 'multiple' && (
          <div className="mt-3 flex gap-2 justify-end">
            <button
              onClick={handleCancelSelection}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm flex items-center gap-1 hover:bg-gray-50 transition-colors"
              disabled={!hasPendingChanges()}
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleConfirmSelection}
              className={`px-3 py-1.5 rounded text-sm flex items-center gap-1 transition-colors ${
                canConfirm ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!canConfirm}
            >
              <Check className="w-4 h-4" />
              <span>Confirm</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}; 