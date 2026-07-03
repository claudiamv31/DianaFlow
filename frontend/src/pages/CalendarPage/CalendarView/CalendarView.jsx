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

    const isOvulationDay = dayInfo?.fertilityLevel === 'high';

    const isFertileDay = dayInfo?.fertilityLevel === 'medium';

    const isPredictedPeriodDay =
      nextPeriod &&
      dateString >= nextPeriod.startDate &&
      dateString <= nextPeriod.endDate;

    if (isSelected) {
      classes.push('calendar-day-selected');
    } else if (isToday) {
      classes.push('calendar-day-today');
    } else if (isOvulationDay) {
      classes.push('calendar-day-ovulation');
    } else if (isFertileDay) {
      classes.push('calendar-day-fertile');
    } else if (isPeriodDay) {
      classes.push('calendar-day-period');
    } else if (isPredictedPeriodDay) {
      classes.push('calendar-day-predicted');
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
        calendarType="gregory"
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
