import { useMemo, useState, useEffect } from 'react';
import Button from '../Button';
import Calendar from 'react-calendar';
import {
  formatCalendarWeekday,
  formatDateLocal,
  parseLocalDate
} from '../../utils/calendarUtils';
import './LogFlow.css';
import LoadingSpinner from '../LoadingSpinner';
import { useLocale } from '../../i18n/LocaleContext';

const DEFAULT_PERIOD_DURATION = 5;
const SAME_PERIOD_GAP_BUFFER_DAYS = 2;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

const normalizeDuration = (duration) => {
  const parsed = Number(duration);
  return Number.isFinite(parsed) && parsed > 0
    ? Math.round(parsed)
    : DEFAULT_PERIOD_DURATION;
};

const buildDateRange = (startDate, duration) => {
  const start = new Date(startDate);
  const dates = [];

  for (let i = 0; i < duration; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    dates.push(formatDateLocal(date));
  }

  return dates;
};

const daysBetween = (left, right) => {
  const leftDate = parseLocalDate(left) || new Date(left);
  const rightDate = parseLocalDate(right) || new Date(right);

  return Math.abs(
    Math.round(
      (leftDate.setHours(0, 0, 0, 0) - rightDate.setHours(0, 0, 0, 0)) /
        DAY_IN_MS
    )
  );
};

const normalizeSelectedDay = (day) => {
  if (typeof day === 'string') return day;
  return day?.date;
};

function LogFlow({
  onClose,
  onSave,
  initialDate,
  endDate,
  initialSelectedDays = [],
  isInActivePeriod,
  durationDays,
  isSaving = false
}) {
  const { t, dateLocale } = useLocale();
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const isEditingPeriod = isInActivePeriod && initialDate;
  const suggestedDuration = normalizeDuration(durationDays);
  const maxSamePeriodGap = suggestedDuration + SAME_PERIOD_GAP_BUFFER_DAYS;
  const savedPeriodDays = initialSelectedDays
    .map(normalizeSelectedDay)
    .filter(Boolean)
    .sort();
  const initialStartDate = initialDate
    ? parseLocalDate(initialDate)
    : new Date();
  const [activeMonth, setActiveMonth] = useState(
    () => new Date(initialStartDate)
  );
  const [hasAdjustedNewRange, setHasAdjustedNewRange] = useState(false);
  const [shouldCreateNewPeriod, setShouldCreateNewPeriod] = useState(false);

  const [range, setRange] = useState(() => {
    if (isEditingPeriod && savedPeriodDays.length > 0) {
      return savedPeriodDays;
    }

    if (isEditingPeriod && endDate) {
      const sDate = parseLocalDate(initialDate);
      const eDate = parseLocalDate(endDate);
      const dates = [];

      for (let i = sDate; i <= eDate; i.setDate(i.getDate() + 1)) {
        dates.push(formatDateLocal(i));
      }

      return dates;
    }

    return buildDateRange(initialStartDate, suggestedDuration);
  });

  const selectedDays = useMemo(() => {
    return [...range].sort();
  }, [range]);

  const handleDayClick = (day) => {
    const clickedString = formatDateLocal(day);

    const isSeparatePeriodDate =
      isEditingPeriod &&
      range.length > 0 &&
      Math.min(...range.map((date) => daysBetween(clickedString, date))) >
        maxSamePeriodGap;

    if (isSeparatePeriodDate) {
      setShouldCreateNewPeriod(true);
      setHasAdjustedNewRange(true);
      setRange(buildDateRange(day, suggestedDuration));
      setActiveMonth(new Date(day));
      return;
    }

    if ((!isEditingPeriod || shouldCreateNewPeriod) && !hasAdjustedNewRange) {
      setHasAdjustedNewRange(true);
      setRange(buildDateRange(day, suggestedDuration));
      return;
    }

    setRange((prev) => {
      if (
        (!isEditingPeriod || shouldCreateNewPeriod) &&
        !prev.includes(clickedString)
      ) {
        return buildDateRange(day, suggestedDuration);
      }

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
      SelectedDays: selectedDays,
      shouldCreateNewPeriod
    });
  };

  const tileClassName = ({ date }) => {
    const dateString = formatDateLocal(date);
    const today = formatDateLocal(new Date());
    const isSelected = range.includes(dateString);

    let classes = [];

    if (isSelected) {
      classes.push('log-flow-day-selected');
    } else if (dateString === today) {
      classes.push('log-flow-day-today');
    }

    return classes.length ? classes.join(' ') : null;
  };

  return (
    <div
      className="log-flow-modal fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-8 bg-on-surface/10 backdrop-blur-sm transition-opacity duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) onClose();
      }}
    >
      <div
        className="log-flow-dialog bg-surface-container-lowest w-full max-w-lg shadow-[0_12px_32px_rgba(52,50,47,0.06)] overflow-hidden flex flex-col relative"
      >
        {/* Header */}
        <div className="px-5 sm:px-8 pt-6 sm:pt-10 pb-4 flex items-center justify-between">
          <h2 className="font-headline font-bold text-2xl text-on-surface">
            {t('log.flowTitle')}
          </h2>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high hover:bg-surface-variant transition-colors group"
            onClick={onClose}
            disabled={isSaving}
          >
            <span className="material-symbols-outlined text-on-surface-variant group-active:scale-90 transition-transform">
              close
            </span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="log-flow-content px-5 sm:px-8 pb-4 overflow-y-auto flex-1">
          <p className="text-on-surface-variant text-sm mb-6 px-2">
            {t('log.selectPeriodDates')}
          </p>

          <div className="log-flow-calendar-wrap mb-4 flex justify-center">
            <Calendar
              className="log-flow-calendar"
              key={range.join(',')}
              onClickDay={handleDayClick}
              tileDisabled={() => isSaving}
              activeStartDate={activeMonth}
              onActiveStartDateChange={onMonthChange}
              calendarType="gregory"
              showNeighboringMonth={false}
              locale={dateLocale}
              formatShortWeekday={formatCalendarWeekday}
              tileClassName={({ date, view }) =>
                view === 'month' ? tileClassName({ date }) : null
              }
            />
          </div>
        </div>

        {/* Action Buttons (Fixed at bottom) */}
        <div className="px-5 sm:px-8 pb-6 sm:pb-8 pt-4 bg-surface-container-lowest mt-auto">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 px-0 sm:px-2">
            <button
              className="h-14 w-full flex items-center justify-center font-headline font-bold text-primary/100 hover:bg-surface-container-high transition-all rounded-full active:scale-95"
              onClick={onClose}
              disabled={isSaving}
            >
              {t('common.cancel')}
            </button>
            <Button
              className="w-full"
              variant="primary"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <LoadingSpinner
                  size="sm"
                  layout="inline"
                  tone="current"
                  label={t('log.savingEntry')}
                />
              ) : (
                t('log.saveEntry')
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LogFlow;
