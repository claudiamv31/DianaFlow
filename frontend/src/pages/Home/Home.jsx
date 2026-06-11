import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { checkUser } from '../../database/authService';
import apiClient from '../../api/apiClient';
import './Home.css';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorScreen from '../../components/ErrorScreen';
import CycleInsightsCard from './CycleInsightsCard/CycleInsigthCard';
import YourPeriodCard from './YourPeriod/YourPeriodCard';
import CurrentCycleCard from './CurrentCycleCard/CurrentCycleCard';
import LogFlow from '../../components/LogFlow/LogFlow';
import Button from '../../components/Button';

function Home() {
  const [user, setUser] = useState(null);
  const [isLogging, setIsLogging] = useState(false);

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

  const getCycleMessage = (status) => {
    switch (status?.status) {
      case 'active_period':
        if (status?.daysLeftInPeriod === 0) {
          return 'Last day of your period';
        }
        return (
          <>
            You have <span className="days">{status?.daysLeftInPeriod} </span>
            days left
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
    onSuccess: () => {
      refetch();
      toast.success('Cycle saved correctly', {
        icon: '🌸'
      });
    },
    onError: (err) => {
      toast.error(`There was a problem saving your cycle, retry later`, {
        icon: '⚠️'
      });
    }
  });

  if (isLoading || statusOfPeriod === undefined) return <LoadingSpinner />;
  if (error) return <ErrorScreen onRetry={() => refetch()} />;

  const safeStatus = statusOfPeriod || {
    cycleStatus: { status: 'unknown' },
    previousCycle: null
  };

  const periodButtonText = isLogging
    ? 'Close calendar'
    : safeStatus?.cycleStatus?.status === 'active_period'
      ? 'Edit Cycle'
      : 'Start period';

  console.log(safeStatus);

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
          {/* Action button */}
          <Button
            variant="primary"
            className="w-48"
            onClick={() => setIsLogging(true)}
          >
            {periodButtonText}
          </Button>
        </section>

        {/* ── Responsive Info Cards ── */}
        {safeStatus.previousCycle && (
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
            {/* Top Row: Stacks vertically on mobile (flex-col), side-by-side on desktop (md:flex-row) */}
            <div className="flex flex-col md:flex-row gap-6 mt-8">
              <CurrentCycleCard
                periodDuration={safeStatus?.cycleStatus?.periodDuration}
                cycleDay={safeStatus?.cycleStatus?.cycleDay}
              />
              <CycleInsightsCard previousCycle={safeStatus.previousCycle} />
            </div>

            {/* Bottom Row: Full width */}
            <div className="mt-6 mb-8">
              <YourPeriodCard period={safeStatus} />
            </div>
          </div>
        )}
      </div>

      {isLogging && (
        <LogFlow
          previousCycle={safeStatus.previousCycle}
          onClose={() => setIsLogging(false)}
          onSave={(data) => {
            saveCycle.mutate({
              selectedDays: data.SelectedDays.map((d) => ({
                date: d,
                flow: 2
              })),
              periodId: safeStatus.isActive ? safeStatus.periodId : null
            });
            setIsLogging(false);
          }}
          initialDate={safeStatus.startDate}
          endDate={safeStatus.endDate}
          isInActivePeriod={safeStatus.cycleStatus?.status === 'active_period'}
          durationDays={safeStatus.DurationDays}
        />
      )}
    </>
  );
}

export default Home;
