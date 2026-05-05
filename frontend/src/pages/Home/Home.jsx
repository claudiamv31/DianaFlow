import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { checkUser } from '../../database/authService';
import apiClient from '../../api/apiClient';
import './Home.css';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorScreen from '../../components/ErrorScreen';
import PrimaryButton from '../../components/PrimaryButton';
import CycleInsightsCard from './CycleInsightsCard/CycleInsigthCard';
import YourPeriodCard from './YourPeriod/YourPeriodCard';
import LogFlow from '../../components/LogFlow/LogFlow';

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
        return (
          <>
            You have <span className="days">{status.days} days</span> left in
            your current period
          </>
        );
      case 'next_period':
        return (
          <>
            Your next period starts in{' '}
            <span className="days">{status.days} days</span>
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
            Your period is delayed by{' '}
            <span className="days">{status.days} days</span>
          </>
        );
      default:
        return <>Track your cycle to get predictions</>;
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
  }

  const periodButtonText = isLogging
    ? 'Close calendar'
    : safeStatus?.cycleStatus?.status === 'active_period'
      ? 'Update period'
      : 'Start period';

  return (
    <>
      {isLogging ? (
        <div className="logflow-container">
          <LogFlow
            previousCycle={safeStatus.previousCycle}
            onClose={() => setIsLogging(false)}
            onSave={(data) => {
              saveCycle.mutate({
                selectedDays: data.SelectedDays.map(d => ({ date: d, flow: 2 })),
                periodId: safeStatus.isActive ? safeStatus.periodId : null
              });
              setIsLogging(false);
            }}
            initialDate={safeStatus.startDate}
            endDate={safeStatus.endDate}
          />
        </div>
      ) : (
        <div className="homepage">
          <div className="status">
            <form id="update-period" onSubmit={(e) => e.preventDefault()}>
              <div className="home-status">
                <p className="text-phase bg-white/60">{safeStatus.currentPhase ? safeStatus.currentPhase.toUpperCase() : 'No active period'}</p>
                <p className="text-status">
                  {getCycleMessage(safeStatus.cycleStatus)}
                </p>
                <p className="text-cycle">{safeStatus.cycleStatus.status === 'active_period' ? 'Cycle Day ' + safeStatus.cycleStatus.days : ''}</p>

                <PrimaryButton
                  type="button"
                  onClick={() => setIsLogging(!isLogging)}
                >
                  {periodButtonText}
                </PrimaryButton>
              </div>
            </form>
          </div>
          <div className="homepage-info">
            {safeStatus.previousCycle && <><CycleInsightsCard previousCycle={safeStatus.previousCycle} /><YourPeriodCard /></>}
          </div>
        </div>
      )}
    </>
  );
}

export default Home;
