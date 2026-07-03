import { FaEdit } from 'react-icons/fa';
import { formatMonthDay, formatDateLocal } from '../../../utils/calendarUtils';

const phaseDayLabels = {
  Menstruation: 'Menstruation day',
  Follicular: 'Follicular phase day',
  Ovulation: 'Ovulation window day',
  Luteal: 'Luteal phase day'
};

const formatPhaseDay = (cycleInfo) => {
  if (!cycleInfo?.phaseDay || cycleInfo.phaseDay <= 0) {
    return 'Not enough data';
  }

  const hasPhaseLength =
    cycleInfo.phaseLength && cycleInfo.phaseDay <= cycleInfo.phaseLength;

  return hasPhaseLength
    ? `Day ${cycleInfo.phaseDay} of ${cycleInfo.phaseLength}`
    : `Day ${cycleInfo.phaseDay}`;
};

const DailyInsigths = ({
  cycleInfo,
  setIsEditingPeriod,
  setIsDailyLogActive,
  isPeriod
}) => {
  const isToday = cycleInfo?.date === formatDateLocal(new Date());
  const hasCycleDay = cycleInfo?.cycleDay && cycleInfo.cycleDay > 0;
  const phaseName = cycleInfo?.phase || 'Cycle';
  const phaseDayLabel = phaseDayLabels[cycleInfo?.phase] || 'Phase day';

  return (
    <div className="md:col-span-4 flex flex-col gap-6">
      <div className="bg-surface-container-highest/50 border border-outline-variant/30 p-6 rounded-lg animate-slide-in shadow-lg">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="font-label font-bold text-xs !text-primary uppercase tracking-widest mb-1">
              {cycleInfo?.date && formatMonthDay(cycleInfo.date)}
            </p>
            <h3 className="font-headline font-bold text-2xl text-on-surface">
              {phaseName &&
                `Cycle Day ${hasCycleDay ? cycleInfo.cycleDay : '--'}`}
            </h3>
          </div>
          {isToday && (
            <span className="!bg-secondary/10 !text-secondary px-3 py-1 rounded-full text-xs font-bold">
              Today
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
                {formatPhaseDay(cycleInfo)}
              </p>
              {cycleInfo?.isOvulation && (
                <p className="text-xs font-semibold !text-secondary mt-1">
                  Estimated ovulation day
                </p>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-label font-semibold uppercase tracking-widest text-on-surface-variant">
              Fertility probability
            </p>
            <p className="font-headline font-bold text-xl text-on-surface">
              {hasCycleDay
                ? cycleInfo.fertilityLevel.toString().charAt(0).toUpperCase() +
                  cycleInfo.fertilityLevel.toString().slice(1)
                : '--'}
            </p>
          </div>
        </div>

        <div className="mb-6 p-4 bg-white/60 rounded-lg border-l-4 !border-secondary">
          <p className="text-sm font-semibold !text-secondary mb-1 uppercase tracking-tight">
            Daily Insight
          </p>
          <p className="text-sm text-on-surface-variant">
            {cycleInfo?.dailyInsight ||
              'Track your cycle to get personalized insights'}
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
              Log Today
            </button>
          )}
          <button
            className="w-full py-3 rounded-full border !border-primary/30 !text-primary/70 font-headline font-semibold text-xs hover:!bg-primary/5 transition-colors uppercase tracking-wider"
            onClick={() => setIsEditingPeriod(true)}
          >
            {isPeriod ? 'Edit Period Dates' : 'Is your period starting?'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyInsigths;
