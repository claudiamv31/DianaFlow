import { FaEdit } from 'react-icons/fa';
import { formatMonthDay, formatDateLocal } from '../../../utils/calendarUtils';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { useLocale } from '../../../i18n/LocaleContext';
import { translateGuidance } from '../../../i18n/guidance';
import { calendarPhaseDayTranslationKey } from '../../../i18n/domainCodes';

const formatPhaseDay = (cycleInfo, t) => {
  if (!cycleInfo?.phaseDay || cycleInfo.phaseDay <= 0) {
    return t('calendar.notEnoughData');
  }

  const hasPhaseLength =
    cycleInfo.phaseLength && cycleInfo.phaseDay <= cycleInfo.phaseLength;

  return hasPhaseLength
    ? t('calendar.dayOf', {
        day: cycleInfo.phaseDay,
        total: cycleInfo.phaseLength
      })
    : t('cycle.dayValue', { count: cycleInfo.phaseDay });
};

const DailyInsigths = ({
  cycleInfo,
  isLoading = false,
  setIsEditingPeriod,
  setIsDailyLogActive,
  isPeriod
}) => {
  const { t, locale } = useLocale();
  const isToday = cycleInfo?.date === formatDateLocal(new Date());
  const hasCycleDay = cycleInfo?.cycleDay && cycleInfo.cycleDay > 0;
  const phaseDayLabel = t(calendarPhaseDayTranslationKey(cycleInfo?.phase));

  if (isLoading) {
    return (
      <div className="md:col-span-4 flex flex-col gap-6">
        <div className="bg-surface-container-highest/50 border border-outline-variant/30 p-6 rounded-lg animate-slide-in shadow-lg">
          <LoadingSpinner layout="center" size="md" />
        </div>
      </div>
    );
  }

  return (
    <div className="md:col-span-4 flex flex-col gap-6">
      <div className="bg-surface-container-highest/50 border border-outline-variant/30 p-6 rounded-lg animate-slide-in shadow-lg">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="font-label font-bold text-xs !text-primary uppercase tracking-widest mb-1">
              {cycleInfo?.date && formatMonthDay(cycleInfo.date, locale)}
            </p>
            <h3 className="font-headline font-bold text-2xl text-on-surface">
              {t('calendar.cycleDay', {
                count: hasCycleDay ? cycleInfo.cycleDay : '--'
              })}
            </h3>
          </div>
          {isToday && (
            <span className="!bg-secondary/10 !text-secondary px-3 py-1 rounded-full text-xs font-bold">
              {t('calendar.today')}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 py-4 border-y border-outline-variant/30">
          <div className="flex flex-row items-center justify-between">
            <div>
              <p className="text-xs font-label font-semibold uppercase tracking-widest text-on-surface-variant">
                {phaseDayLabel}
              </p>
              <p className="font-headline font-bold text-xl text-on-surface">
                {formatPhaseDay(cycleInfo, t)}
              </p>
              {cycleInfo?.isOvulation && (
                <p className="text-xs font-semibold !text-secondary mt-1">
                  {t('calendar.estimatedOvulation')}
                </p>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-label font-semibold uppercase tracking-widest text-on-surface-variant">
              {t('calendar.fertilityProbability')}
            </p>
            <p className="font-headline font-bold text-xl text-on-surface">
              {hasCycleDay
                ? t(`fertility.${cycleInfo.fertilityLevel}`)
                : '--'}
            </p>
          </div>
        </div>

        <div className="mb-6 p-4 bg-surface-container-lowest/60 rounded-lg border-l-4 !border-secondary">
          <p className="text-sm font-semibold !text-secondary mb-1 uppercase tracking-tight">
            {t('calendar.dailyInsight')}
          </p>
          <p className="text-sm text-on-surface-variant">
            {translateGuidance(t, cycleInfo?.dailyInsightKey, 'insight')}
          </p>
        </div>
        <div className="flex flex-col gap-4">
          {isPeriod && (
            <button
              className="w-full py-3 rounded-full !bg-primary text-white font-headline font-bold text-base shadow-lg !shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              onClick={() => setIsDailyLogActive(true)}
            >
              <span className="material-symbols-outlined text-xl">
                <FaEdit />
              </span>
              {t('home.logToday')}
            </button>
          )}
          <button
            className="w-full py-3 rounded-full border !border-primary/30 !text-primary/70 font-headline font-semibold text-xs hover:!bg-primary/5 transition-colors uppercase tracking-wider"
            onClick={() => setIsEditingPeriod(true)}
          >
            {isPeriod ? t('calendar.editPeriodDates') : t('home.logPeriod')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyInsigths;
