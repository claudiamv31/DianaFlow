import apiClient from '../../api/apiClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { formatDateLocal } from '../../utils/calendarUtils';
import { refreshCycleQueries } from '../../utils/queryInvalidation';
import Button from '../Button';
import LoadingSpinner from '../LoadingSpinner';
import { useLocale } from '../../i18n/LocaleContext';

const EditLog = ({ onClose, selectedDate, cycleInfo, isPeriodActive }) => {
  const { t, locale } = useLocale();
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const queryClient = useQueryClient();
  const [currentFlowIntensity, setCurrentFlowIntensity] = useState(
    cycleInfo?.flow || 0
  );

  const saveLogMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient.put(`/periods/day`, payload);
      return res.data;
    },
    onSuccess: async () => {
      await refreshCycleQueries(queryClient);
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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-on-surface/10 backdrop-blur-sm transition-opacity duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget && !saveLogMutation.isPending)
          handleCancel();
      }}
    >
      <div
        className="bg-surface-container-lowest w-full max-w-lg shadow-[0_12px_32px_rgba(52,50,47,0.06)] overflow-hidden flex flex-col relative"
        style={{ maxHeight: '90vh', borderRadius: '3rem' }}
      >
        {/* Header */}
        <div className="px-8 pt-10 pb-4 flex items-center justify-between">
          <div>
            <h2 className="font-headline font-bold text-2xl text-on-surface">
              {t('log.editDaily')}
            </h2>
            <p className="text-sm font-semibold tracking-widest uppercase text-primary/70 mt-1">
              {selectedDate?.toLocaleDateString(locale, {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high hover:bg-surface-variant transition-colors group"
            onClick={handleCancel}
            disabled={saveLogMutation.isPending}
          >
            <span className="material-symbols-outlined text-on-surface-variant group-active:scale-90 transition-transform">
              close
            </span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="px-8 pb-4 overflow-y-auto flex-1">
          <p className="text-on-surface-variant text-sm mb-8 px-2">
            {t('cycle.dayValue', { count: cycleInfo?.cycleDay })} —{' '}
            {cycleInfo?.phase ? t(`phase.${cycleInfo.phase}`) : '--'}
          </p>

          <section className="mb-4">
            <h3 className="font-headline text-on-surface text-lg font-bold mb-6 px-2">
              {t('log.flowIntensity')}
            </h3>
            <div className="flex justify-between items-center px-4">
              <div className="flex flex-col items-center gap-3 group cursor-pointer">
                <div
                  className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-colors ${addClassIfSelected(0)}`}
                  onClick={() => {
                    if (!saveLogMutation.isPending) setCurrentFlowIntensity(0);
                  }}
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
                  {t('common.none')}
                </span>
              </div>
              <div className="flex flex-col items-center gap-3 group cursor-pointer">
                <div
                  className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-colors ${addClassIfSelected(1)}`}
                  onClick={() => {
                    if (!saveLogMutation.isPending) setCurrentFlowIntensity(1);
                  }}
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
                  {t('common.light')}
                </span>
              </div>
              <div className="flex flex-col items-center gap-3 group cursor-pointer">
                <div
                  className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-colors ${addClassIfSelected(2)}`}
                  onClick={() => {
                    if (!saveLogMutation.isPending) setCurrentFlowIntensity(2);
                  }}
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
                  {t('common.medium')}
                </span>
              </div>
              <div className="flex flex-col items-center gap-3 group cursor-pointer">
                <div
                  className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-colors ${addClassIfSelected(3)}`}
                  onClick={() => {
                    if (!saveLogMutation.isPending) setCurrentFlowIntensity(3);
                  }}
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
                  {t('common.heavy')}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Action Buttons (Fixed at bottom) */}
        <div className="px-8 pb-8 pt-4 bg-surface-container-lowest mt-auto">
          <div className="grid grid-cols-2 gap-4 px-2">
            <button
              className="h-14 w-full flex items-center justify-center font-headline font-bold text-primary/100 hover:bg-surface-container-high transition-all rounded-full active:scale-95"
              onClick={handleCancel}
              disabled={saveLogMutation.isPending}
            >
              {t('common.cancel')}
            </button>
            <Button
              className="w-full"
              variant="primary"
              onClick={handleSaveLog}
              disabled={saveLogMutation.isPending}
            >
              {saveLogMutation.isPending ? (
                <LoadingSpinner
                  size="sm"
                  layout="inline"
                  tone="current"
                  label={t('log.saving')}
                />
              ) : (
                t('log.save')
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditLog;
