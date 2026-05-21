import { formatDateShort } from '../../utils/calendarUtils';

const SummaryStats = ({ summary }) => {
  if (!summary) return null;

  return (
    <>
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-low p-6 rounded-lg space-y-2 flex flex-col justify-between">
          <span className="text-primary-dim font-label text-xs uppercase tracking-widest font-semibold">
            Average Cycle
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-headline font-bold text-on-surface">
              {summary.averageCycleLength}
            </span>
            <span className="text-on-surface-variant text-sm font-medium">
              days
            </span>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-lg space-y-2 flex flex-col justify-between">
          <span className="text-primary-dim font-label text-xs uppercase tracking-widest font-semibold">
            Average Duration
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-headline font-bold text-on-surface">
              {summary.averagePeriodLength}
            </span>
            <span className="text-on-surface-variant text-sm font-medium">
              days
            </span>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-lg space-y-2 flex flex-col justify-between">
          <span className="text-primary-dim font-label text-xs uppercase tracking-widest font-semibold">
            Regularity
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-headline font-bold text-on-surface">
              {summary.regularity}
            </span>
            <span className="text-on-surface-variant text-sm font-medium">%</span>
          </div>
        </div>
        <div className="bg-primary-container/20 p-6 rounded-lg space-y-2 flex flex-col justify-between">
          <span className="text-primary/100 font-label text-xs uppercase tracking-widest font-semibold">
            Next Estimate
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-headline font-bold text-primary/100">
              {formatDateShort(summary.nextPeriodStart)}
            </span>
          </div>
        </div>
      </section>
    </>
  );
};

export default SummaryStats;
