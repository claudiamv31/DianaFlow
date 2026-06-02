import { useState } from 'react';
import apiClient from '../../api/apiClient';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import PeriodEditModal from '../../components/PeriodEditModal/PeriodEditModal';

const HistoryPeriod = ({ latestPeriods }) => {
  const [selectedPeriod, setSelectedPeriod] = useState(null);

    const saveLogMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient.put(`/periods`, payload);
      return res.data;
    },
    onSuccess: () => {
      setSelectedPeriod(null)
    },
    onError: (err) => {
      console.error(err);
    }
  });

  const handleSave = (payload) => {
    saveLogMutation.mutate(payload);
  };

  if (!latestPeriods || latestPeriods.length === 0) {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-headline font-bold text-2xl text-on-surface">
            Past Journeys
          </h3>
          <Link to="/archive" className="text-primary font-bold text-sm">View Archive</Link>
        </div>
        <p className="text-on-surface-variant text-sm">No periods found</p>
      </section>
    );
  }

  const formatDateLocal = (dateStr) => {
    if (!dateStr) return { month: '', day: '', formatted: '' };
    const parts = dateStr.split('-');
    if (parts.length < 3) return { month: '', day: '', formatted: '' };
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parts[2];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      month: months[monthIdx] || '',
      day: day,
      formatted: `${months[monthIdx]} ${parseInt(day, 10)}`
    };
  };

  const getPeriodRange = (period) => {
    const startInfo = formatDateLocal(period.startDate);
    if (!period.endDate) return `${startInfo.formatted} – Present`;
    const endInfo = formatDateLocal(period.endDate);
    return `${startInfo.formatted} – ${endInfo.formatted}`;
  };

  const getDurationText = (period) => {
    const duration = period.duration || (period.endDate
      ? Math.ceil((new Date(period.endDate) - new Date(period.startDate)) / (1000 * 60 * 60 * 24)) + 1
      : 1);
    return `${duration} Day${duration !== 1 ? 's' : ''}`;
  };

  const periods = latestPeriods.map((period, index) => {
    const startInfo = formatDateLocal(period.startDate);
    const rangeText = getPeriodRange(period);
    const durationText = getDurationText(period);

    return (
      <div
        key={period.id || index}
        className="group flex items-center justify-between p-6 bg-surface-container-low rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer"
        onClick={() => setSelectedPeriod(period)}
      >
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter">
              {startInfo.month}
            </span>
            <span className="text-2xl font-headline font-extrabold text-on-surface">
              {startInfo.day}
            </span>
          </div>
          <div className="h-8 w-px bg-outline-variant/30"></div>
          <div>
            <p className="font-bold text-on-surface">{rangeText}</p>
            <p className="text-xs text-on-surface-variant">Logged period journey</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-1 rounded-full bg-surface-container-highest text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            {durationText}
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
    <>
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-headline font-bold text-2xl text-on-surface">
            Past Journeys
          </h3>
          <Link to="/archive" className="text-primary/100 font-bold text-sm">View Archive</Link>
        </div>
        <div className="space-y-3">
          {periods}
        </div>
      </section>

      {selectedPeriod && (
        <PeriodEditModal
          period={selectedPeriod}
          onClose={() => setSelectedPeriod(null)}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default HistoryPeriod;
