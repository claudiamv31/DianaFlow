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
import LogFlow from '../../components/LogFlow/LogFlow';
import Button from '../../components/Button';
import { formatDateLocal } from '../../utils/calendarUtils';
import { refreshCycleQueries } from '../../utils/queryInvalidation';
import { useLocale } from '../../i18n/LocaleContext';
import { getErrorMessageKey } from '../../api/AppError';

function Home() {
  const queryClient = useQueryClient();
  const { t } = useLocale();
  const [user, setUser] = useState(null);
  const [isLoggingToday, setIsLoggingToday] = useState(false);
  const [isLoggingNewPeriod, setIsLoggingNewPeriod] = useState(false);

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
      if (!statusOfPeriod?.isActive) {
        throw new Error(t('home.flowActiveOnly'));
      }

      return await apiClient.put(`/periods/day`, {
        date: todayStr,
        flow: flowIntensity
      });
    },
    onSuccess: async () => {
      await refreshCycleQueries(queryClient);
      toast.success(t('home.logSaved'), {
        icon: '🌸'
      });
    },
    onError: (err) => {
      toast.error(t('home.logError'), {
        icon: '⚠️'
      });
    }
  });

  const savePeriodMutation = useMutation({
    mutationFn: async (selectedDays) => {
      return await apiClient.post(`/periods`, {
        selectedDays: selectedDays.map((date) => ({
          date,
          flow: 2
        }))
      });
    },
    onSuccess: async () => {
      await refreshCycleQueries(queryClient);
      toast.success(t('home.periodSaved'), {
        icon: '🌸'
      });
    },
    onError: () => {
      toast.error(t('home.periodError'), {
        icon: '⚠️'
      });
    }
  });

  const getCycleMessage = (status) => {
    switch (status?.status) {
      case 'active_period':
        if (status?.daysLeftInPeriod === 0) {
          return t('home.periodLastDay');
        }
        return (
          <>
            {t('home.periodDaysLeft', {
              count: status?.daysLeftInPeriod
            })}
          </>
        );
      case 'next_period':
        return (
          <>
            {t('home.nextPeriod', { count: status.days })}
          </>
        );
      case 'period_should_start_today':
        return (
          <>
            {t('home.periodToday')}
          </>
        );
      case 'delayed':
        return (
          <>
            {t('home.periodLate', { count: status.days })}
          </>
        );
      default:
        return <>{t('home.noPeriod')}</>;
    }
  };

  const handleSaveToday = (flowIntensity) => {
    if (statusOfPeriod?.isActive) {
      logTodayMutation.mutate(flowIntensity, {
        onSuccess: () => setIsLoggingToday(false)
      });
      return;
    }
    setIsLoggingToday(false);
    setIsLoggingNewPeriod(true);
  };

  if (isLoading || statusOfPeriod === undefined)
    return <LoadingSpinner label={t('common.loadingApp')} showLabel />;
  if (error)
    return (
      <ErrorScreen
        messageKey={getErrorMessageKey(error, 'error.loadingPage')}
        onRetry={() => refetch()}
      />
    );

  const safeStatus = statusOfPeriod || {
    cycleStatus: { status: 'unknown' },
    previousCycle: null
  };

  const todayStr = safeStatus.today || formatDateLocal(new Date());
  const todayRecord = safeStatus.selectedDays?.find((d) => d.date === todayStr);
  const todayFlow = todayRecord ? todayRecord.flow : 0;
  const isPeriodActive = safeStatus.isActive === true;
  const suggestedPeriodDuration =
    safeStatus.durationDays || safeStatus.cycleStatus?.periodDuration || 5;

  return (
    <>
      <div className="homepage">
        {/* ── Hero section ── */}
        <section className="home-hero">
          {/* Orb */}
          <div className="home-orb">
            <p className="text-phase">
              {safeStatus.currentPhase
                ? t(`phase.${safeStatus.currentPhase}`).toUpperCase()
                : t('home.noPeriod').toUpperCase()}
            </p>
            <p className="text-status">
              {getCycleMessage(safeStatus.cycleStatus)}
            </p>
          </div>

          {/* Dynamic Phase Message */}
          {safeStatus.currentPhase && (
            <p className="text-sm italic text-gray-600 max-w-md text-center mt-2 px-4 animate-fade-in">
              “{t(`home.phase.${safeStatus.currentPhase}`)}”
            </p>
          )}

          {/* Action button */}
          <Button
            variant="primary"
            className="w-48 mt-2"
            onClick={() => {
              if (isPeriodActive) {
                setIsLoggingToday(true);
                return;
              }

              setIsLoggingNewPeriod(true);
            }}
          >
            {isPeriodActive ? t('home.logToday') : t('home.logPeriod')}
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
                cycleLength={safeStatus?.cycleStatus?.cycleLength}
                fertilityLevel={safeStatus?.cycleStatus?.fertilityLevel}
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
          isSaving={logTodayMutation.isPending}
        />
      )}

      {isLoggingNewPeriod && (
        <LogFlow
          key={`home-new-${todayStr}`}
          onClose={() => setIsLoggingNewPeriod(false)}
          onSave={(data) => {
            savePeriodMutation.mutate(data.SelectedDays, {
              onSuccess: () => setIsLoggingNewPeriod(false)
            });
          }}
          initialDate={todayStr}
          endDate={todayStr}
          initialSelectedDays={[]}
          isInActivePeriod={false}
          durationDays={suggestedPeriodDuration}
          isSaving={savePeriodMutation.isPending}
        />
      )}
    </>
  );
}

export default Home;
