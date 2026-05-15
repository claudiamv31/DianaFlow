import { FaEdit } from 'react-icons/fa';
import { formatMonthDay, formatDateLocal } from '../../../utils/calendarUtils';

const DailyInsigths = ({
  cycleInfo,
  setIsEditingPeriod,
  setIsDailyLogActive
}) => {
  const isToday = cycleInfo?.date === formatDateLocal(new Date());
  return (
    <div className="md:col-span-4 flex flex-col gap-6">
      <div className="bg-surface-container-highest/50 border border-outline-variant/30 p-6 rounded-lg animate-slide-in shadow-lg">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="font-label font-bold text-xs !text-primary uppercase tracking-widest mb-1">
              {cycleInfo?.date && formatMonthDay(cycleInfo.date)}
            </p>
            <h3 className="font-headline font-bold text-2xl text-on-surface">
              Day {cycleInfo?.day}: {cycleInfo?.phase}
            </h3>
          </div>
          {isToday && (
            <span className="!bg-secondary/10 !text-secondary px-3 py-1 rounded-full text-xs font-bold">
              Today
            </span>
          )}
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
          <button
            className="w-full py-3 rounded-full !bg-primary text-white font-headline font-bold text-base shadow-lg !shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            onClick={() => setIsDailyLogActive(true)}
          >
            <span className="material-symbols-outlined text-xl">
              <FaEdit />
            </span>
            Edit Log
          </button>
          <button
            className="w-full py-3 rounded-full border !border-primary/30 !text-primary/70 font-headline font-semibold text-xs hover:!bg-primary/5 transition-colors uppercase tracking-wider"
            onClick={() => setIsEditingPeriod(true)}
          >
            Is your period starting?
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyInsigths;
