import { useState, useEffect, useMemo } from 'react';
import Button from '../Button';

const PeriodEditModal = ({ period, onClose, onSave }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const [startDate, setStartDate] = useState('');
  const [selectedDates, setSelectedDates] = useState([]);
  const [bleedingDays, setBleedingDays] = useState(1);

  useEffect(() => {
    if (period) {
      setStartDate(period.startDate || '');
      setBleedingDays(period.duration || 1);
      setSelectedDates(period.selectedDays || []);
    }
  }, [period]);

  // Compute the earliest selectable start date: three days before the end of the previous period.
  // `period.previousEndDate` should be provided by the parent when there is a preceding period.
  // If not available, allow any date.
  const minStartDate = useMemo(() => {
    if (!period?.previousEndDate) return '';
    const end = new Date(period.previousEndDate);
    end.setDate(end.getDate() - 3);
    // Return in YYYY-MM-DD format for the input's `min` attribute.
    return end.toISOString().split('T')[0];
  }, [period]);
  // Update selectedDates whenever startDate or bleedingDays change
  useEffect(() => {
    if (!startDate) {
      setSelectedDates([]);
      return;
    }
    const dates = [];
    for (let i = 0; i < bleedingDays; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    setSelectedDates(dates);
  }, [startDate, bleedingDays]);
  if (!period) return null;

  const handleSave = () => {
    onSave({
      PeriodId: period.id,
      SelectedDays: selectedDates.map((date) => ({
        date,
        flow: 1
      }))
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-on-surface/10 backdrop-blur-sm transition-opacity duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-surface-container-lowest w-full max-w-lg shadow-[0_12px_32px_rgba(52,50,47,0.06)] overflow-hidden flex flex-col relative"
        style={{ maxHeight: '90vh', borderRadius: '3rem' }}
      >
        {/* Header */}
        <div className="px-8 pt-10 pb-4 flex items-center justify-between">
          <h2 className="font-headline font-bold text-2xl text-on-surface">
            Edit your Period
          </h2>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high hover:bg-surface-variant transition-colors group"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-on-surface-variant group-active:scale-90 transition-transform">
              close
            </span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="px-8 pb-4 overflow-y-auto flex-1">
          <p className="text-on-surface-variant text-sm mb-8 px-2">
            Select the start date of your period and how many days the bleeding
            lasted.
          </p>

          <div className="space-y-6 mb-4">
            {/* Fecha de inicio */}
            <div className="space-y-2">
              <label
                className="block text-xs font-bold text-primary/100 tracking-widest uppercase px-2"
                htmlFor="modal-start-date"
              >
                Start Date
              </label>
              <div className="relative">
                <input
                  className="w-full h-14 px-6 bg-surface-container-low border-none rounded-full text-on-surface/100 font-medium focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                  id="modal-start-date"
                  type="date"
                  value={startDate}
                  min={minStartDate || ''}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-primary/100 pointer-events-none">
                  calendar_today
                </span>
              </div>
            </div>

            {/* Días de sangrado */}
            <div className="space-y-2">
              <label
                className="block text-xs font-bold text-primary/100 tracking-widest uppercase px-2"
                htmlFor="modal-bleeding-days"
              >
                Bleeding days
              </label>
              <div className="flex items-center gap-4 bg-surface-container-low rounded-full p-2 h-14">
                <button
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-primary/100 hover:bg-primary/10 transition-colors shadow-sm"
                  type="button"
                  onClick={() => setBleedingDays((d) => Math.max(1, d - 1))}
                >
                  <span className="material-symbols-outlined">remove</span>
                </button>
                <input
                  className="flex-1 bg-transparent border-none text-center font-headline font-bold text-xl text-on-surface focus:ring-0"
                  id="modal-bleeding-days"
                  type="number"
                  min="1"
                  max="15"
                  value={bleedingDays}
                  onChange={(e) =>
                    setBleedingDays(
                      Math.min(15, Math.max(1, parseInt(e.target.value) || 1))
                    )
                  }
                />
                <button
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-primary/100 hover:bg-primary/10 transition-colors shadow-sm"
                  type="button"
                  onClick={() => setBleedingDays((d) => Math.min(15, d + 1))}
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons (Fixed at bottom) */}
        <div className="px-8 pb-8 pt-4 bg-surface-container-lowest mt-auto">
          <div className="grid grid-cols-2 gap-4 px-2">
            <button
              className="h-14 w-full flex items-center justify-center font-headline font-bold text-primary/100 hover:bg-surface-container-high transition-all rounded-full active:scale-95"
              onClick={onClose}
            >
              Cancel
            </button>
            <Button className="w-full" variant="primary" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeriodEditModal;
