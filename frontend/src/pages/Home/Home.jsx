import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checkUser } from '../../database/authService';
import apiClient from '../../api/apiClient';
import './Home.css';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorScreen from '../../components/ErrorScreen';
import CycleInsightsCard from './CycleInsightsCard/CycleInsigthCard';
import YourPeriodCard from './YourPeriod/YourPeriodCard';
import CurrentCycleCard from './CurrentCycleCard/CurrentCycleCard';
import LogTodayModal from '../../components/LogTodayModal/LogTodayModal';
import Button from '../../components/Button';
import { formatDateLocal } from '../../utils/calendarUtils';
import { refreshCycleQueries } from '../../utils/queryInvalidation';

const PHASE_MESSAGES = {
  Menstruation: "Listen to your body's need for rest. Energy is drawing inward for renewal.",
  Follicular: "A time of rising energy and fresh perspectives. Ideal for starting new projects.",
  Ovulation: "Your energy and communication are at their peak. Great for collaboration and sharing ideas.",
  Luteal: "Slow down and wrap up details. Focus on finishing tasks and self-care."
};

function Home() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isLoggingToday, setIsLoggingToday] = useState(false);

  useEffect(() => {
    const unsubscribe = checkUser((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const {
    data: statusOfPeriod,
    error,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['home', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const res = await apiClient.get(`/periods/home`, {
        validateStatus: (status) =>
          (status >= 200 && status < 300) || status === 404
      });
      if (res.status === 404) return null;

      return res.data;
    },
    enabled: !!user,
    retry: 2,
    staleTime: 1000 * 60,
    onError: (err) => {
      if (err.response?.status !== 404) {
        console.error(err);
      }
    }
  });

  const logTodayMutation = useMutation({
    mutationFn: async (flowIntensity) => {
      const todayStr = statusOfPeriod?.today || formatDateLocal(new Date());
      if (statusOfPeriod && statusOfPeriod.isActive) {
        // Today is within an active period, update day flow
        return await apiClient.put(`/periods/day`, {
          date: todayStr,
          flow: flowIntensity
        });
      } else if (flowIntensity > 0) {
        // Today is not in a period, start a new period today
        return await apiClient.post(`/periods`, {
          selectedDays: [
            {
              date: todayStr,
              flow: flowIntensity
            }
          ]
        });
      }
    },
    onSuccess: async () => {
      await refreshCycleQueries(queryClient);
      toast.success('Log saved successfully', {
        icon: '🌸'
      });
    },
    onError: (err) => {
      toast.error('Could not save log. Please try again.', {
        icon: '⚠️'
      });
    }
  });

  const getCycleMessage = (status) => {
    switch (status?.status) {
      case 'active_period':
        if (status?.daysLeftInPeriod === 0) {
          return 'Last day of your period';
        }
        return (
          <>
            You have <span className="days">{status?.daysLeftInPeriod} </span>
            days left of your period
          </>
        );
      case 'next_period':
        return (
          <>
            Your next period in <span className="days">{status.days} days</span>
          </>
        );
      case 'period_should_start_today':
        return (
          <>
            Your period should start <span className="days">today</span>.
          </>
        );
      case 'delayed':
        return (
          <>
            Period is late <span className="days">{status.days} days</span>
          </>
        );
      default:
        return <>No period recorded yet</>;
    }
  };

  const handleSaveToday = (flowIntensity) => {
    if (statusOfPeriod?.isActive || flowIntensity > 0) {
      logTodayMutation.mutate(flowIntensity);
    }
    setIsLoggingToday(false);
  };

  if (isLoading || statusOfPeriod === undefined) return <LoadingSpinner />;
  if (error) return <ErrorScreen onRetry={() => refetch()} />;

  const safeStatus = statusOfPeriod || {
    cycleStatus: { status: 'unknown' },
    previousCycle: null
  };

  const todayStr = safeStatus.today || formatDateLocal(new Date());
  const todayRecord = safeStatus.selectedDays?.find((d) => d.date === todayStr);
  const todayFlow = todayRecord ? todayRecord.flow : 0;

  return (
    <>
      <div className="homepage">
        {/* ── Hero section ── */}
        <section className="home-hero">
          {/* Orb */}
          <div className="home-orb">
            <p className="text-phase">
              {safeStatus.currentPhase
                ? safeStatus.currentPhase.toUpperCase()
                : 'NO PERIOD RECORDED'}
            </p>
            <p className="text-status">
              {getCycleMessage(safeStatus.cycleStatus)}
            </p>
          </div>

          {/* Dynamic Phase Message */}
          {safeStatus.currentPhase && PHASE_MESSAGES[safeStatus.currentPhase] && (
            <p className="text-sm italic text-gray-600 max-w-md text-center mt-2 px-4 animate-fade-in">
              "{PHASE_MESSAGES[safeStatus.currentPhase]}"
            </p>
          )}

          {/* Action button */}
          <Button
            variant="primary"
            className="w-48 mt-2"
            onClick={() => setIsLoggingToday(true)}
          >
            Log Today
          </Button>
        </section>

        {/* ── Responsive Info Cards ── */}
        {statusOfPeriod && (
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
            {/* Top Row */}
            <div className="flex flex-col md:flex-row gap-6 mt-8">
              <CurrentCycleCard
                periodDuration={safeStatus?.cycleStatus?.periodDuration}
                cycleDay={safeStatus?.cycleStatus?.cycleDay}
              />
              {safeStatus.previousCycle && (
                <CycleInsightsCard previousCycle={safeStatus.previousCycle} />
              )}
            </div>

            {/* Bottom Row */}
            <div className="mt-6 mb-8">
              <YourPeriodCard period={safeStatus} />
            </div>
          </div>
        )}
      </div>

      {isLoggingToday && (
        <LogTodayModal
          onClose={() => setIsLoggingToday(false)}
          onSave={handleSaveToday}
          initialFlow={todayFlow}
          todayDate={todayStr}
        />
      )}
    </>
  );
}

export default Home;
