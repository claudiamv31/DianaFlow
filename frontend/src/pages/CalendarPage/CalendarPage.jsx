import { useState, useEffect } from 'react';
import { checkUser } from '../../database/authService';
import apiClient from '../../api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorScreen from '../../components/ErrorScreen';
import toast from 'react-hot-toast';
import './CalendarPage.css';
import LegendCard from './LegendCard/LegendCard';
import CalendarView from './CalendarView/CalendarView';
import { parseLocalDate, formatDateLocal } from '../../utils/calendarUtils';
import { refreshCycleQueries } from '../../utils/queryInvalidation';
import LogFlow from '../../components/LogFlow/LogFlow';
import DailyInsigths from './DailyInsights/DailyInsights';
import EditLog from '../../components/EditLog/EditLog';

const CalendarPage = () => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [date, setDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isEditingPeriod, setIsEditingPeriod] = useState(false);
  const [periodDays, setPeriodDays] = useState([]);
  const [currentPeriod, setCurrentPeriod] = useState(null);
  const [isDailyLogActive, setIsDailyLogActive] = useState(false);
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
    queryKey: ['calendar', user?.id, visibleMonth.year, visibleMonth.month],
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
    queryKey: ['periods', user?.id, visibleMonth.year, visibleMonth.month],
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
      // Find period that covers selectedDate
      const dateStr = formatDateLocal(selectedDate);
      const period = periods.find((p) => dateStr >= p.startDate && dateStr <= p.endDate);
      setCurrentPeriod(period || periods[0]);
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
  }, [currentPeriod, periods, selectedDate]);

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
    queryKey: ['calendar-day', user?.id, selectedDate],
    queryFn: async () => {
      if (!selectedDate) return null;
      const formatted = formatDateLocal(selectedDate);
      const res = await apiClient.get(`/calendar/day?date=${formatted}`);
      return res.data;
    },
    enabled: !!user && !!selectedDate
  });

  const { data: nextPeriod } = useQuery({
    queryKey: ['next-cycle', user?.id],
    queryFn: async () => {
      const res = await apiClient.get(`/periods/next`);
      return res.data;
    },
    enabled: !!user
  });

  const saveCycle = useMutation({
    mutationFn: async (payload) => {
      let res;
      if (payload.periodId != null) {
        res = await apiClient.put(`/periods`, payload);
      } else {
        res = await apiClient.post(`/periods`, payload);
      }
      return res.data;
    },
    onSuccess: async () => {
      await refreshCycleQueries(queryClient);
      toast.success('Cycle saved correctly', {
        icon: '🌸'
      });
    },
    onError: (err) => {
      toast.error('There was a problem saving your cycle, retry later', {
        icon: '⚠️'
      });
    }
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorScreen onRetry={() => refetch()} />;


  return (
    <>
      <div className="calendar-page">
        <h2 className="title">Cycle Rhythm</h2>
        <h3 className="subtitle">Your sanctuary of flow and focus.</h3>
        <div className="calendar-page-container">
          <div className="calendar-view-container">
            <CalendarView
              date={date}
              selectedDate={selectedDate}
              calendarDays={calendarDays}
              periods={periods}
              onMonthChange={handleMonthChange}
              periodDays={periodDays}
              isEditingPeriod={isEditingPeriod}
              setDate={setDate}
              setSelectedDate={setSelectedDate}
              setPeriodDays={setPeriodDays}
              setCurrentPeriod={setCurrentPeriod}
              nextPeriod={nextPeriod}
            />
          </div>
          <div className="cards-container">
            <DailyInsigths
              cycleInfo={cycleInfo}
              setIsEditingPeriod={setIsEditingPeriod}
              selectedDate={selectedDate}
              setIsDailyLogActive={setIsDailyLogActive}
              isPeriod={cycleInfo?.isPeriod}
            />
            <LegendCard />
          </div>
        </div>
      </div>

      {isDailyLogActive && (
        <EditLog
          onClose={() => setIsDailyLogActive(false)}
          selectedDate={selectedDate}
          isPeriodActive={cycleInfo?.isPeriod}
          cycleInfo={cycleInfo}
        />
      )}

      {isEditingPeriod && (
        <LogFlow
          onClose={() => setIsEditingPeriod(false)}
          onSave={(data) => {
            saveCycle.mutate({
              selectedDays: data.SelectedDays.map((d) => ({
                date: d,
                flow: 2
              })),
              periodId:
                currentPeriod && !data.shouldCreateNewPeriod
                  ? Number(currentPeriod.id)
                  : null
            });
            setIsEditingPeriod(false);
          }}
          initialDate={currentPeriod ? currentPeriod.startDate : formatDateLocal(selectedDate)}
          endDate={currentPeriod ? currentPeriod.endDate : formatDateLocal(selectedDate)}
          initialSelectedDays={currentPeriod ? currentPeriod.selectedDays : []}
          isInActivePeriod={!!currentPeriod}
          durationDays={currentPeriod ? (currentPeriod.duration || 5) : 5}
        />
      )}
    </>
  );
};

export default CalendarPage;
