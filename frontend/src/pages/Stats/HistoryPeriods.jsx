const HistoryPeriod = ({ latestPeriods }) => {
  if (!latestPeriods || latestPeriods.length === 0) {
    return <p>No periods found</p>;
  }

  const periods = latestPeriods.map((period, index) => {
    return (
      <div className="group flex items-center justify-between p-6 bg-surface-container-low rounded-lg hover:bg-surface-container-high transition-colors">
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter">
              Feb
            </span>
            <span className="text-2xl font-headline font-extrabold text-on-surface">
              03
            </span>
          </div>
          <div className="h-8 w-px bg-outline-variant/30"></div>
          <div>
            <p className="font-bold text-on-surface">Feb 3 – Feb 7</p>
            <p className="text-xs text-on-surface-variant">
              Normal flow • 4 logged symptoms
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-1 rounded-full bg-surface-container-highest text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            5 Days
          </div>
          <span
            className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors"
            data-icon="chevron_right"
          >
            chevron_right
          </span>
        </div>
      </div>
    );
  });

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-headline font-bold text-2xl text-on-surface">
          Past Journeys
        </h3>
        <button className="text-primary font-bold text-sm">View Archive</button>
      </div>
      <div className="space-y-3"></div>
    </section>
  );
};

export default HistoryPeriod;
