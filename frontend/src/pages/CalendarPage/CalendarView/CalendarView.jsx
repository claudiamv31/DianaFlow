import Calendar from 'react-calendar';
import { formatDateLocal } from '../../../utils/calendarUtils';
import './CalendarView.css';

const CalendarView = ({
  date: activeMonthDate,
  selectedDate,
  calendarDays,
  periods,
  onMonthChange,
  periodDays,
  isEditingPeriod,
  highlightPeriodDays = [],
  setDate,
  setSelectedDate,
  setPeriodDays,
  setCurrentPeriod,
  nextPeriod
}) => {
  const tileClassName = ({ date, activeStartDate }) => {
    const dateString = formatDateLocal(date);
    const today = formatDateLocal(new Date());
    const dayInfo = calendarDays?.find((d) => d.date === dateString);

    let classes = [];

    const isNeighboringMonth =
      activeStartDate && date.getMonth() !== activeStartDate.getMonth();

    const isToday = dateString === today && !isNeighboringMonth;
    const isSelected =
      selectedDate &&
      dateString === formatDateLocal(selectedDate) &&
      !isNeighboringMonth;
    const isPeriodDay =
      periodDays.includes(dateString) ||
      dayInfo?.isPeriod ||
      highlightPeriodDays?.includes(dateString);

    const isPredictedPeriodDay =
      nextPeriod &&
      dateString >= nextPeriod.startDate &&
      dateString <= nextPeriod.endDate;

    if (isSelected) {
      // Selected date: Solid lilac
      classes.push('!bg-secondary !text-white !rounded-full !border-none');
    } else if (isToday) {
      // Today (not selected): only borders
      classes.push(
        '!bg-transparent !border !border-solid !border-secondary !text-on-surface !rounded-full'
      );
    } else if (isPeriodDay) {
      // Period days: light pink background
      classes.push('!bg-primary/20 !border !border-primary/70 !rounded-full');
    } else if (isPredictedPeriodDay) {
      // Predicted period days: dashed border
      classes.push(
        '!border-2 !border-dashed !border-primary/40 !rounded-full !bg-transparent'
      );
    }

    return classes.length ? classes.join(' ') : null;
  };

  const findPeriodByDate = (dateStr) => {
    return periods?.find((p) => dateStr >= p.startDate && dateStr <= p.endDate);
  };

  const handleDayClick = (day) => {
    const dateStr = formatDateLocal(day);

    setDate(day);
    setSelectedDate(day);

    // 📅 Modo edición: solo seleccionar/deseleccionar días
    if (isEditingPeriod) {
      setPeriodDays((prev) =>
        prev.includes(dateStr)
          ? prev.filter((d) => d !== dateStr)
          : [...prev, dateStr]
      );
      return;
    }

    // 🩸 Modo normal: buscar período existente
    const period = findPeriodByDate(dateStr);
    setCurrentPeriod(period || null);
  };

  return (
    <div className={`calendar-view`}>
      <Calendar
        value={selectedDate}
        activeStartDate={activeMonthDate}
        onClickDay={handleDayClick}
        onActiveStartDateChange={onMonthChange}
        showNeighboringMonth={true}
        locale="en-US"
        formatShortWeekday={(locale, date) =>
          date
            .toLocaleDateString(locale, { weekday: 'short' })
            .slice(0, 1)
            .toUpperCase()
        }
        tileClassName={({ date, view, activeStartDate }) =>
          view === 'month' ? tileClassName({ date, activeStartDate }) : null
        }
      />
    </div>
  );
};

export default CalendarView;
