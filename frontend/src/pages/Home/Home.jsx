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
        return (
          <>
            Periodo en<span className="days">{status.days} días</span>
          </>
        );
      case 'next_period':
        return (
          <>
            Tu próximo periodo en{' '}
            <span className="days">{status.days} días</span>
          </>
        );
      case 'period_should_start_today':
        return (
          <>
            Tu periodo debería empezar <span className="days">hoy</span>.
          </>
        );
      case 'delayed':
        return (
          <>
            Tu periodo se ha retrasado{' '}
            <span className="days">{status.days} días</span>
          </>
        );
      default:
        return <>Registra tu ciclo para ver predicciones</>;
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
          />
        </div>
      ) : (
        <div className="homepage">
          {/* ── Hero section ── */}
          <section className="home-hero">
            {/* Orb */}
            <div className="home-orb">
              <p className="text-phase">
                {safeStatus.currentPhase
                  ? safeStatus.currentPhase.toUpperCase()
                  : 'SIN PERÍODO'}
              </p>
              <p className="text-status">
                {getCycleMessage(safeStatus.cycleStatus)}
              </p>
              <p className="text-cycle">
                {safeStatus.cycleStatus.status === 'active_period'
                  ? 'Día ' + safeStatus.cycleStatus.days
                  : ''}
              </p>
            </div>
            {/* Action button */}
            <Button
              variant="primary"
              className="w-48"
              onClick={() => setIsLogging(!isLogging)}
            >
              {periodButtonText}
            </Button>
          </section>

          {/* ── Info cards side by side ── */}
          {safeStatus.previousCycle && (
            <>
              <div className="homepage-info">
                <CurrentCycleCard
                  periodDuration={null}
                  cycleDay={null}
                />
                <CycleInsightsCard previousCycle={safeStatus.previousCycle} />
              </div>
              <div className="homepage-phase">
                <YourPeriodCard />
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default Home;
