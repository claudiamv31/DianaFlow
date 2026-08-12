import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { normalizePhaseCode, phaseTranslationKey } from '../../i18n/domainCodes';

function Home() {
  const queryClient = useQueryClient();
  const { t, locale } = useLocale();
  const [isLoggingToday, setIsLoggingToday] = useState(false);
  const [isLoggingNewPeriod, setIsLoggingNewPeriod] = useState(false);

  const {
    data: statusOfPeriod,
    error,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['home'],
    queryFn: async () => {
      const res = await apiClient.get(`/periods/home`, {
        validateStatus: (status) =>
          (status >= 200 && status < 300) || status === 404
      });
      if (res.status === 404) return null;

      return res.data;
    },
    retry: 2,
    staleTime: 1000 * 60,
    onError: (err) => {
      if (err.response?.status !== 404) {
        console.error(err);
      }
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
  const suggestedPeriodDuration =
    safeStatus.durationDays || safeStatus.cycleStatus?.periodDuration || 5;
  const currentPhase = normalizePhaseCode(safeStatus.currentPhase);

  return (
    <>
      <div className="homepage">
        {/* ── Hero section ── */}
        <section className="home-hero">
          {/* Orb */}
          <div className="home-orb">
            <p className="text-phase">
              {currentPhase
                ? t(phaseTranslationKey(currentPhase)).toLocaleUpperCase(locale)
                : t('home.noPeriod').toLocaleUpperCase(locale)}
            </p>
            <p className="text-status">
              {getCycleMessage(safeStatus.cycleStatus)}
            </p>
          </div>

          {/* Dynamic Phase Message */}
          {currentPhase && (
            <p className="text-sm italic text-on-surface-variant max-w-md text-center mt-2 px-4 animate-fade-in">
              “{t(`home.phase.${currentPhase}`)}”
            </p>
          )}

          {/* Daily tracking actions */}
          <div className="grid w-full max-w-md grid-cols-1 gap-2 sm:grid-cols-2 mt-2">
            <Button
              variant="secondary"
              className="group min-h-12 w-full !rounded-2xl !px-3 shadow-sm border border-outline-variant/30"
              onClick={() => setIsLoggingToday(true)}
            >
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-2xl !text-on-surface transition-transform group-hover:scale-110">self_improvement</span>
                <span>{t('symptoms.logToday')}</span>
              </span>
            </Button>
            <Button
              variant="primary"
              className="group min-h-12 w-full !rounded-2xl !px-3 shadow-md shadow-primary/20"
              onClick={() => setIsLoggingNewPeriod(true)}
            >
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-2xl !text-on-primary transition-transform group-hover:scale-110">water_drop</span>
                <span>{t('home.logPeriod')}</span>
              </span>
            </Button>
          </div>
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
          todayDate={todayStr}
          onSaved={() => { setIsLoggingToday(false); queryClient.invalidateQueries({ queryKey: ['calendar-day'] }); toast.success(t('symptoms.saved')); }}
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
