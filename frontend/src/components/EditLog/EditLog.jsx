import apiClient from '../../api/apiClient';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { formatDateLocal } from '../../utils/calendarUtils';

const EditLog = ({ onClose, selectedDate, cycleInfo, isPeriodActive }) => {
  const [currentFlowIntensity, setCurrentFlowIntensity] = useState(
    cycleInfo?.flow || 0
  );

  const saveLogMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient.put(`/periods/day`, payload);
      return res.data;
    },
    onSuccess: () => {
      if (onClose) onClose();
    },
    onError: (err) => {
      console.error(err);
    }
  });

  const handleSaveLog = () => {
    if (!isPeriodActive) if (onClose) onClose();
    const payload = {
      date: formatDateLocal(selectedDate || new Date()),
      flow: currentFlowIntensity
    };
    saveLogMutation.mutate(payload);
  };

  const handleCancel = () => {
    if (onClose) onClose();
  };

  const addClassIfSelected = (intensity) => {
    if (currentFlowIntensity === intensity) {
      return 'border-primary-container bg-primary-container/10 flex items-center justify-center !text-primary';
    }
    return 'border-surface-container-highest text-on-surface-variant group-hover:bg-surface-container-low';
  };

  const addClassTextSelected = (intensity) => {
    if (currentFlowIntensity === intensity) {
      return 'text-primary/70';
    }
    return 'text-on-surface-variant';
  };

  return (
    <>
      <div className="fixed inset-0 bg-blurred-calendar grayscale-[0.2] blur-xl opacity-40 scale-105"></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/5 backdrop-blur-sm p-4 md:p-8">
        <div className="bg-surface-container-lowest w-full max-w-lg max-h-[921px] overflow-y-auto rounded-xl shadow-[0_12px_32px_rgba(52,50,47,0.06)] flex flex-col relative">
          <div className="px-8 pt-10 pb-6 text-center">
            <p className="font-display text-primary/70 text-sm font-semibold tracking-widest uppercase mb-1">
              Edit Daily Log
            </p>
            <h1 className="font-display text-on-surface text-3xl font-bold tracking-tight">
              {selectedDate?.toLocaleDateString('en-US', {
                weekday: 'long',
                year: undefined,
                month: 'short',
                day: 'numeric'
              })}
            </h1>
            <p className="text-on-surface-variant font-medium mt-1">
              Day {cycleInfo?.cycleDay} — {cycleInfo?.phase}
            </p>
          </div>
          <div className="px-8 pb-10 space-y-10">
            <section>
              <h2 className="font-display text-on-surface text-lg font-bold mb-6 flex items-center gap-2">
                Flow Intensity
              </h2>
              <div className="flex justify-between items-center px-4">
                <div className="flex flex-col items-center gap-3 group cursor-pointer">
                  <div
                    className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-colors ${addClassIfSelected(0)}`}
                    onClick={() => setCurrentFlowIntensity(0)}
                  >
                    <span
                      className="material-symbols-outlined text-3xl"
                      data-icon="block"
                    >
                      block
                    </span>
                  </div>
                  <span
                    className={`font-label text-xs font-semibold uppercase tracking-tighter ${addClassTextSelected(
                      0
                    )}`}
                  >
                    None
                  </span>
                </div>
                <div className="flex flex-col items-center gap-3 group cursor-pointer">
                  <div
                    className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-colors ${addClassIfSelected(1)}`}
                    onClick={() => setCurrentFlowIntensity(1)}
                  >
                    <span
                      className="material-symbols-outlined text-3xl"
                      data-icon="water_drop"
                    >
                      water_drop
                    </span>
                  </div>
                  <span
                    className={`font-label text-xs font-semibold uppercase tracking-tighter ${addClassTextSelected(1)}`}
                  >
                    Light
                  </span>
                </div>
                <div className="flex flex-col items-center gap-3 group cursor-pointer">
                  <div
                    className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-colors ${addClassIfSelected(2)}`}
                    onClick={() => setCurrentFlowIntensity(2)}
                  >
                    <div className="flex gap-[-4px]">
                      <span
                        className="material-symbols-outlined text-2xl"
                        data-icon="water_drop"
                      >
                        water_drop
                      </span>
                      <span
                        className="material-symbols-outlined text-2xl"
                        data-icon="water_drop"
                      >
                        water_drop
                      </span>
                    </div>
                  </div>
                  <span
                    className={`font-label text-xs font-semibold uppercase tracking-tighter ${addClassTextSelected(2)}`}
                  >
                    Medium
                  </span>
                </div>
                <div className="flex flex-col items-center gap-3 group cursor-pointer">
                  <div
                    className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-colors ${addClassIfSelected(3)}`}
                    onClick={() => setCurrentFlowIntensity(3)}
                  >
                    <span
                      className="material-symbols-outlined text-4xl"
                      data-icon="opacity"
                    >
                      opacity
                    </span>
                  </div>
                  <span
                    className={`font-label text-xs font-semibold uppercase tracking-tighter ${addClassTextSelected(3)}`}
                  >
                    Heavy
                  </span>
                </div>
              </div>
            </section>
            <div className="flex flex-col gap-4 pt-4">
              <button
                className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-display font-semibold py-3 rounded-full shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                onClick={handleSaveLog}
              >
                <span className="material-symbols-outlined" data-icon="check">
                  check
                </span>
                Save Daily Log
              </button>
              <button
                className="w-full text-on-surface-variant font-label font-semibold text-sm uppercase tracking-widest py-2 hover:text-on-surface transition-colors"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditLog;
