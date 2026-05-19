const VisualInsights = () => {
  return (
    <div className="bg-surface-container-lowest p-8 rounded-lg shadow-[0_12px_32px_rgba(52,50,47,0.04)] space-y-6 h-full w-full">
        <div class="flex justify-between items-end">
          <div>
            <h3 class="font-headline font-bold text-xl text-on-surface">
              Cycle Regularity
            </h3>
            <p class="text-on-surface-variant text-sm">
              Last 6 months length tracking
            </p>
          </div>
          <div class="flex gap-2">
            <span class="w-3 h-3 rounded-full bg-primary-fixed"></span>
            <span class="text-[10px] uppercase tracking-tighter font-bold text-on-surface-variant">
              Cycle Days
            </span>
          </div>
        </div>
        <div class="flex items-end justify-between h-48 pt-4">
          <div class="flex flex-col items-center gap-3 w-full">
            <div
              class="w-full max-w-[40px] bg-surface-container rounded-t-full transition-all hover:bg-primary-container"
              style={{ height: '85%' }}
            ></div>
            <span class="text-[10px] font-bold text-on-surface-variant uppercase">
              Sep
            </span>
          </div>
          <div class="flex flex-col items-center gap-3 w-full">
            <div
              class="w-full max-w-[40px] bg-surface-container rounded-t-full transition-all hover:bg-primary-container"
              style={{ height: '90%' }}
            ></div>
            <span class="text-[10px] font-bold text-on-surface-variant uppercase">
              Oct
            </span>
          </div>
          <div class="flex flex-col items-center gap-3 w-full">
            <div
              class="w-full max-w-[40px] bg-primary rounded-t-full shadow-lg"
              style={{ height: '82%' }}
            ></div>
            <span class="text-[10px] font-bold text-on-surface-variant uppercase">
              Nov
            </span>
          </div>
          <div class="flex flex-col items-center gap-3 w-full">
            <div
              class="w-full max-w-[40px] bg-surface-container rounded-t-full transition-all hover:bg-primary-container"
              style={{ height: '88%' }}
            ></div>
            <span class="text-[10px] font-bold text-on-surface-variant uppercase">
              Dec
            </span>
          </div>
          <div class="flex flex-col items-center gap-3 w-full">
            <div
              class="w-full max-w-[40px] bg-surface-container rounded-t-full transition-all hover:bg-primary-container"
              style={{ height: '84%' }}
            ></div>
            <span class="text-[10px] font-bold text-on-surface-variant uppercase">
              Jan
            </span>
          </div>
          <div class="flex flex-col items-center gap-3 w-full">
            <div
              class="w-full max-w-[40px] bg-surface-container rounded-t-full transition-all hover:bg-primary-container"
              style={{ height: '92%' }}
            ></div>
            <span class="text-[10px] font-bold text-on-surface-variant uppercase">
              Feb
            </span>
          </div>
        </div>
    </div>
  );
};

export default VisualInsights;
