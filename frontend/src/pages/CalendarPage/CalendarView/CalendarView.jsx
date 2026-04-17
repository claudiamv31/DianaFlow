import Calendar from 'react-calendar';
import { formatDateLocal } from '../../../utils/calendarUtils';
import './CalendarView.css';

const CalendarView = ({
  date,
  calendarDays,
  periods,
  isInfoActive,
  onMonthChange,
  periodDays,
  isEditingPeriod,
  highlightPeriodDays = [],
  setDate,
  setSelectedDate,
  setIsInfoActive,
  setPeriodDays,
  setCurrentPeriod,
  variant = 'full'
}) => {
  const findPeriodByDate = (dateStr) => {
    return periods?.find((p) => dateStr >= p.startDate && dateStr <= p.endDate);
  };

  const handleDayClick = (day) => {
    const dateStr = formatDateLocal(day);

    setDate(day);
    setSelectedDate(day);
    setIsInfoActive(true);

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
    <div
      className={`calendar ${
        isInfoActive ? 'calendar--inactive' : 'calendar--active'
      } ${variant === 'compact' ? 'calendar--compact' : 'calendar--full'}`}
    >
      <Calendar
        value={date}
        onClickDay={handleDayClick}
        onActiveStartDateChange={onMonthChange}
        showNeighboringMonth={false}
        locale="en-US"
        formatShortWeekday={(locale, date) =>
          date
            .toLocaleDateString(locale, { weekday: 'short' })
            .slice(0, 1)
            .toUpperCase()
        }
        tileClassName={({ date }) => {
          const dateStr = formatDateLocal(date);
          const dayInfo = calendarDays?.find((d) => d.date === dateStr);

          // Mostrar días seleccionados en modo edición
          if (isEditingPeriod && periodDays.includes(dateStr)) {
            return 'period-selected';
          }

          // Mostrar períodos existentes desde calendarDays
          if (dayInfo?.isPeriod) {
            return 'period-day';
          }

          // Mostrar períodos marcados manualmente (para Home / reutilización)
          if (highlightPeriodDays?.includes(dateStr)) {
            return 'period-day';
          }

          return null;
        }}
      />
    </div>
  );
};

export default CalendarView;
