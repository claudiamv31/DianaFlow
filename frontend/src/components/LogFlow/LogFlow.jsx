import { useMemo, useState, useEffect } from 'react';
import { FaTint, FaRegSmileBeam, FaTimes } from 'react-icons/fa';
import Button from '../Button';
import Calendar from 'react-calendar';
import { formatDateLocal, parseLocalDate } from '../../utils/calendarUtils';
import './LogFlow.css';

function LogFlow({
  onClose,
  onSave,
  initialDate,
  previousCycle,
  endDate,
  isInActivePeriod,
  durationDays
}) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const initialStartDate = parseLocalDate(initialDate) || new Date();
  const initialDuration = previousCycle?.duration || durationDays || 5;
  const [activeMonth, setActiveMonth] = useState(
    () => new Date(initialStartDate)
  );
  const [selectedFlow, setSelectedFlow] = useState('Medium');
  const [range, setRange] = useState(() => {
    const start = new Date(initialStartDate);
    const dates = [];

    // If in active period with both start and end dates, use them
    if (isInActivePeriod && endDate && initialDate) {
      const sDate = parseLocalDate(initialDate);
      const eDate = parseLocalDate(endDate);
      for (let i = sDate; i <= eDate; i.setDate(i.getDate() + 1)) {
        dates.push(formatDateLocal(i));
      }
    }
    // If NOT in active period, pre-select from today + duration
    else if (!isInActivePeriod) {
      const today = new Date();
      for (let i = 0; i < initialDuration; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push(formatDateLocal(date));
      }
    }
    // Otherwise use the initial duration from the provided date
    else {
      for (let i = 0; i < initialDuration; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        dates.push(formatDateLocal(date));
      }
    }
    return dates;
  });

  const selectedDays = useMemo(() => {
    return [...range].sort();
  }, [range]);

  const handleDayClick = (day) => {
    const clickedString = formatDateLocal(day);

    setRange((prev) => {
      if (prev.includes(clickedString)) {
        return prev.filter((d) => d !== clickedString);
      }
      return [...prev, clickedString];
    });
  };

  const onMonthChange = ({ activeStartDate }) => {
    setActiveMonth(activeStartDate);
  };

  const handleSave = () => {
    onSave({
      SelectedDays: selectedDays
    });
  };

  const tileClassName = ({ date }) => {
    const dateString = formatDateLocal(date);
    const today = formatDateLocal(new Date());
    const isSelected = range.includes(dateString);

    let classes = [];
    if (isSelected) classes.push('period-tile', 'period-middle');
    if (dateString === today) classes.push('period-today');

    return classes.length ? classes.join(' ') : null;
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-on-surface/10 backdrop-blur-sm transition-opacity duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-surface-container-lowest w-full max-w-lg shadow-[0_12px_32px_rgba(52,50,47,0.06)] overflow-hidden flex flex-col relative"
        style={{ maxHeight: '90vh', borderRadius: '3rem' }}
      >
        {/* Header */}
        <div className="px-8 pt-10 pb-4 flex items-center justify-between">
          <h2 className="font-headline font-bold text-2xl text-on-surface">
            Log your flow
          </h2>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high hover:bg-surface-variant transition-colors group"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-on-surface-variant group-active:scale-90 transition-transform">
              close
            </span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="px-8 pb-4 overflow-y-auto flex-1">
          <p className="text-on-surface-variant text-sm mb-6 px-2">
            Select your period dates
          </p>

          <div className="mb-4 flex justify-center">
            <Calendar
              key={range.join(',')}
              onClickDay={handleDayClick}
              activeStartDate={activeMonth}
              onActiveStartDateChange={onMonthChange}
              showNeighboringMonth={false}
              locale="en-US"
              formatShortWeekday={(locale, date) =>
                date
                  .toLocaleDateString(locale, { weekday: 'short' })
                  .slice(0, 1)
                  .toUpperCase()
              }
              tileClassName={({ date, view }) =>
                view === 'month' ? tileClassName({ date }) : null
              }
            />
          </div>
        </div>

        {/* Action Buttons (Fixed at bottom) */}
        <div className="px-8 pb-8 pt-4 bg-surface-container-lowest mt-auto">
          <div className="grid grid-cols-2 gap-4 px-2">
            <button
              className="h-14 w-full flex items-center justify-center font-headline font-bold text-primary/100 hover:bg-surface-container-high transition-all rounded-full active:scale-95"
              onClick={onClose}
            >
              Cancel
            </button>
            <Button className="w-full" variant="primary" onClick={handleSave}>
              Save Entry
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LogFlow;
