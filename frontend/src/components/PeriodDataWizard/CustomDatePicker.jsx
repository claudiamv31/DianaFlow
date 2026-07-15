import { useState, useEffect, useRef } from 'react';
import { useLocale } from '../../i18n/LocaleContext';

const CustomDatePicker = ({ value, onChange, maxDate }) => {
  const { t, locale } = useLocale();
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    value ? new Date(value) : new Date()
  );
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  const monthNames = Array.from({ length: 12 }, (_, month) =>
    new Intl.DateTimeFormat(locale, { month: 'long' }).format(
      new Date(2024, month, 1)
    )
  );

  const daysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getDaysArray = () => {
    const days = [];
    const firstDay = firstDayOfMonth(currentMonth);
    const daysCount = daysInMonth(currentMonth);

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysCount; i++) {
      days.push(i);
    }

    return days;
  };

  const handleDateClick = (day) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateString = selectedDate.toISOString().split('T')[0];
    onChange(dateString);
    setShowCalendar(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  useEffect(() => {
    if (showCalendar && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const calendarWidth = Math.min(320, window.innerWidth - 32); // 320px or less with 16px padding
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const calendarHeight = 400; // approximate height of calendar
      
      let top;
      if (spaceBelow > calendarHeight + 20) {
        // Show below if enough space
        top = rect.bottom + 10;
      } else if (spaceAbove > calendarHeight + 20) {
        // Show above if not enough below
        top = rect.top - calendarHeight - 10;
      } else {
        // Default: show below (will scroll if needed)
        top = rect.bottom + 10;
      }
      
      // Calculate left position - center it or adjust to fit screen
      let left = rect.left - (calendarWidth - rect.width) / 2;
      left = Math.max(16, Math.min(left, window.innerWidth - calendarWidth - 16));
      
      setCalendarPosition({
        top: Math.max(16, top),
        left
      });
    }
  }, [showCalendar]);

  const days = getDaysArray();
  const maxDateObj = maxDate ? new Date(maxDate + 'T00:00:00') : new Date();

  return (
    <div className="relative w-full">
      <div
        ref={triggerRef}
        className="w-full h-14 px-6 bg-surface-container-low border-2 border-transparent rounded-full text-on-surface/100 font-medium hover:border-primary/20 focus:ring-0 focus:border-primary/60 transition-all appearance-none cursor-pointer flex items-center justify-between group"
        onClick={() => setShowCalendar(!showCalendar)}
      >
        <span className={value ? 'text-on-surface' : 'text-on-surface-variant'}>
          {value ? formatDisplayDate(value) : t('common.selectDate')}
        </span>
        <span className="material-symbols-outlined text-primary/100 group-hover:scale-110 transition-transform">
          calendar_today
        </span>
      </div>

      {showCalendar && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowCalendar(false)}
          />
          <div
            className="fixed z-50 bg-surface-container-lowest border border-surface-container-high rounded-2xl md:rounded-3xl shadow-2xl"
            style={{
              top: `${calendarPosition.top}px`,
              left: `${calendarPosition.left}px`,
              width: `min(calc(100vw - 24px), 300px)`,
              maxHeight: `min(90vh, 500px)`,
              overflow: 'auto',
              padding: '12px'
            }}
          >
            {/* Month/Year Header */}
            <div className="flex items-center justify-between mb-2 md:mb-4 gap-1">
              <button
                onClick={handlePrevMonth}
                className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors flex-shrink-0"
              >
                <span className="material-symbols-outlined text-on-surface text-[18px]">chevron_left</span>
              </button>
              <h3 className="font-headline font-bold text-xs md:text-lg text-on-surface text-center flex-1 whitespace-nowrap">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <button
                onClick={handleNextMonth}
                className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors flex-shrink-0"
              >
                <span className="material-symbols-outlined text-on-surface text-[18px]">chevron_right</span>
              </button>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-0.5 md:gap-2 mb-1 md:mb-3">
              {Array.from({ length: 7 }, (_, day) =>
                new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(
                  new Date(2024, 0, 7 + day)
                )
              ).map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-bold text-on-surface-variant uppercase"
                >
                  {day.slice(0, 1)}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-0.5 md:gap-2">
              {days.map((day, index) => {
                const isCurrentDay = day === new Date().getDate() &&
                  currentMonth.getMonth() === new Date().getMonth() &&
                  currentMonth.getFullYear() === new Date().getFullYear();

                const dateObj = day
                  ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                  : null;

                const isDisabled = dateObj && dateObj > maxDateObj;
                const isSelected = day && value === dateObj?.toISOString().split('T')[0];

                return (
                  <div key={index} className="aspect-square flex items-center justify-center">
                    {day ? (
                      <button
                        onClick={() => handleDateClick(day)}
                        disabled={isDisabled}
                        className={`w-full h-full rounded-full font-medium text-[11px] md:text-sm transition-all flex items-center justify-center ${
                          isSelected
                            ? 'bg-primary/100 text-white font-bold'
                            : isCurrentDay
                            ? 'bg-primary/20 text-primary/100 font-bold'
                            : isDisabled
                            ? 'text-on-surface-variant/30 cursor-not-allowed'
                            : 'text-on-surface hover:bg-surface-container-high'
                        }`}
                      >
                        {day}
                      </button>
                    ) : (
                      <div />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Close button */}
            <button
              onClick={() => setShowCalendar(false)}
              className="w-full mt-2 md:mt-4 h-8 md:h-10 flex items-center justify-center font-headline font-bold text-xs md:text-sm text-primary/100 hover:bg-surface-container-high transition-all rounded-full"
            >
              {t('common.done')}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomDatePicker;
