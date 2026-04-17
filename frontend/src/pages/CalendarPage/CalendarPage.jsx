import { useState, useEffect } from 'react';
import { checkUser } from '../../firebase/authService';
import apiClient from '../../api/apiClient';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorScreen from '../../components/ErrorScreen';
import './CalendarPage.css';
import CalendarInfo from './CalendarInfo/CalendarInfo';
import CalendarView from './CalendarView/CalendarView';
import { parseLocalDate, formatDateLocal } from '../../utils/calendarUtils';

const CalendarPage = () => {
  const [user, setUser] = useState(null);
  const [date, setDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isInfoActive, setIsInfoActive] = useState(false);
  const [isEditingPeriod, setIsEditingPeriod] = useState(false);
  const [periodDays, setPeriodDays] = useState([]);
  const [currentPeriod, setCurrentPeriod] = useState(null);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });

  // 🔹 Auth
  useEffect(() => {
    const unsubscribe = checkUser(setUser);
    return () => unsubscribe();
  }, []);

  // 🔹 Calendar days
  const {
    data: calendarDays,
    error,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['calendar', user?.uid, visibleMonth.year, visibleMonth.month],
    queryFn: async () => {
      const res = await apiClient.get(
        `/calendar?year=${visibleMonth.year}&month=${visibleMonth.month}`
      );
      return res.data;
    },
    enabled: !!user
  });

  // 🔹 Periods (solo para pintar / seleccionar)
  const { data: periods } = useQuery({
    queryKey: ['periods', user?.uid, visibleMonth.year, visibleMonth.month],
    queryFn: async () => {
      const res = await apiClient.get(
        `/periods?year=${visibleMonth.year}&month=${visibleMonth.month}`
      );
      return res.data;
    },
    enabled: !!user
  });

  // 🔹 Inicializar el actual periodo
  useEffect(() => {
    if (
      !currentPeriod &&
      periods &&
      Array.isArray(periods) &&
      periods.length > 0
    ) {
      setCurrentPeriod(periods[0]);
      return;
    }

    if (!currentPeriod) return;

    const days = [];
    let current = parseLocalDate(currentPeriod.startDate);
    const end = parseLocalDate(currentPeriod.endDate);

    while (current <= end) {
      days.push(formatDateLocal(current));
      current.setDate(current.getDate() + 1);
    }

    setPeriodDays(days);
  }, [currentPeriod, periods]);

  // 🔹 Limpiar al salir de edición
  useEffect(() => {
    if (!isEditingPeriod) {
      setPeriodDays([]);
    }
  }, [isEditingPeriod]);

  const handleMonthChange = ({ activeStartDate }) => {
    setDate(activeStartDate);
    setVisibleMonth({
      year: activeStartDate.getFullYear(),
      month: activeStartDate.getMonth() + 1
    });
  };

  // 🔹 Info del día
  const { data: cycleInfo } = useQuery({
    queryKey: ['calendar-day', user?.uid, selectedDate],
    queryFn: async () => {
      if (!selectedDate) return null;
      const formatted = formatDateLocal(selectedDate);
      const res = await apiClient.get(`/calendar/day?date=${formatted}`);
      return res.data;
    },
    enabled: !!user && !!selectedDate
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorScreen onRetry={() => refetch()} />;

  return (
    <div className="calendar-page">
      <CalendarView
        date={date}
        calendarDays={calendarDays}
        periods={periods}
        isInfoActive={isInfoActive}
        onMonthChange={handleMonthChange}
        periodDays={periodDays}
        isEditingPeriod={isEditingPeriod}
        setDate={setDate}
        setSelectedDate={setSelectedDate}
        setIsInfoActive={setIsInfoActive}
        setPeriodDays={setPeriodDays}
        setCurrentPeriod={setCurrentPeriod}
      />

      <CalendarInfo
        date={date}
        cycleInfo={cycleInfo}
        isEditingPeriod={isEditingPeriod}
        setIsEditingPeriod={setIsEditingPeriod}
        periodDays={periodDays}
        currentPeriod={currentPeriod}
        setPeriodDays={setPeriodDays}
      />
    </div>
  );
};

export default CalendarPage;
