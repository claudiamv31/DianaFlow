import React from 'react';

const VisualInsights = ({ summary }) => {
  const periods = summary?.periods || [];

  // Parse and prepare period data. If the user has fewer than 6 logged periods,
  // we pad it with previous months to always show exactly 6 months.
  const displayPeriods = (() => {
    if (periods.length >= 6) {
      return [...periods]
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        .slice(-6)
        .map(p => ({ ...p, isReal: true }));
    }

    const sortedExisting = [...periods]
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      .map(p => ({ ...p, isReal: true }));

    const refDate = sortedExisting.length > 0
      ? new Date(sortedExisting[0].startDate)
      : new Date();

    const padded = [];
    const needed = 6 - sortedExisting.length;

    for (let i = needed; i > 0; i--) {
      // Calculate preceding months relative to refDate
      const padDate = new Date(refDate.getFullYear(), refDate.getMonth() - i, 1);
      const year = padDate.getFullYear();
      const month = String(padDate.getMonth() + 1).padStart(2, '0');
      const dateString = `${year}-${month}-01`;

      padded.push({
        startDate: dateString,
        duration: 0,
        isReal: false
      });
    }

    return [...padded, ...sortedExisting];
  })();

  const getMonthName = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length < 2) return '';
    const monthIndex = parseInt(parts[1], 10) - 1;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthIndex] || '';
  };

  return (
    <div className="bg-surface-container-lowest p-8 rounded-lg shadow-[0_12px_32px_rgba(52,50,47,0.04)] space-y-6 h-full w-full">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="font-headline font-bold text-xl text-on-surface">
              Cycle Regularity
            </h3>
            <p className="text-on-surface-variant text-sm">
              Last 6 periods length tracking
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <span className="w-3 h-3 rounded-full bg-primary/100"></span>
            <span className="text-[10px] uppercase tracking-tighter font-bold text-on-surface-variant">
              Cycle Days
            </span>
          </div>
        </div>
        <div className="flex items-end justify-between h-48 pt-4 gap-2">
          {displayPeriods.map((period, idx) => {
            const isReal = period.isReal;
            const duration = period.duration || 0;
            const month = getMonthName(period.startDate);
            
            // Real periods scale up to 10 days. Mock/empty periods show as a low 6% height track bar
            const heightPercent = isReal 
              ? Math.min(100, Math.max(15, (duration / 10) * 100))
              : 6;

            return (
              <div key={idx} className="flex flex-col items-center gap-3 w-full group">
                <div className="relative w-full flex justify-center items-end h-36">
                  {/* Tooltip on hover - only for actual period data */}
                  {isReal && (
                    <span className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-surface-container-highest text-on-surface text-[11px] px-2 py-1 rounded transition-opacity duration-200 whitespace-nowrap z-10 font-bold shadow-sm">
                      {duration} days
                    </span>
                  )}
                  <div
                    className={`w-full max-w-[40px] rounded-t-full transition-all duration-300 ${
                      isReal 
                        ? 'bg-primary/100 shadow-sm hover:brightness-110 hover:scale-105 cursor-pointer' 
                        : 'bg-surface-container'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  ></div>
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">
                  {month}
                </span>
              </div>
            );
          })}
        </div>
    </div>
  );
};

export default VisualInsights;

