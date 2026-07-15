import { useState, useEffect } from 'react';
import Button from '../Button';
import { formatLongDate } from '../../utils/calendarUtils';
import LoadingSpinner from '../LoadingSpinner';
import { useLocale } from '../../i18n/LocaleContext';

const LogTodayModal = ({
  onClose,
  onSave,
  initialFlow = 0,
  todayDate,
  isSaving = false
}) => {
  const { t, locale } = useLocale();
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const [currentFlowIntensity, setCurrentFlowIntensity] = useState(initialFlow);

  const handleSave = () => {
    onSave(currentFlowIntensity);
  };

  const addClassIfSelected = (intensity) => {
    if (currentFlowIntensity === intensity) {
      return 'border-[var(--primary-color)] bg-[var(--primary-color)]/10 flex items-center justify-center !text-[var(--primary-color)]';
    }
    return 'border-gray-200 text-gray-500 hover:bg-gray-50';
  };

  const addClassTextSelected = (intensity) => {
    if (currentFlowIntensity === intensity) {
      return 'text-[var(--primary-color)] font-bold';
    }
    return 'text-gray-500';
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/20 backdrop-blur-sm transition-opacity duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) onClose();
      }}
    >
      <div
        className="bg-white w-full max-w-lg shadow-[0_12px_32px_rgba(52,50,47,0.06)] overflow-hidden flex flex-col relative border border-gray-100"
        style={{ maxHeight: '90vh', borderRadius: '2.5rem' }}
      >
        {/* Header */}
        <div className="px-8 pt-10 pb-4 flex items-center justify-between">
          <div>
            <h2 className="font-headline font-bold text-2xl text-[var(--text-color)]">
              {t('home.logToday')}
            </h2>
            <p className="text-sm font-semibold tracking-widest uppercase text-[var(--primary-color)] mt-1">
              {formatLongDate(todayDate || new Date(), locale)}
            </p>
          </div>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors group"
            onClick={onClose}
            disabled={isSaving}
          >
            <span className="material-symbols-outlined text-gray-600 group-active:scale-90 transition-transform">
              close
            </span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="px-8 pb-4 overflow-y-auto flex-1">
          <p className="text-gray-500 text-sm mb-8 px-2">
            {t('log.selectTodayFlow')}
          </p>

          <section className="mb-4">
            <div className="flex justify-between items-center px-4 gap-2">
              {/* None */}
              <div
                className="flex flex-col items-center gap-3 cursor-pointer flex-1"
                onClick={() => {
                  if (!isSaving) setCurrentFlowIntensity(0);
                }}
              >
                <div
                  className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-colors ${addClassIfSelected(0)}`}
                >
                  <span
                    className="material-symbols-outlined text-3xl"
                    data-icon="block"
                  >
                    block
                  </span>
                </div>
                <span
                  className={`font-label text-xs uppercase tracking-tighter ${addClassTextSelected(0)}`}
                >
                  {t('common.none')}
                </span>
              </div>

              {/* Light */}
              <div
                className="flex flex-col items-center gap-3 cursor-pointer flex-1"
                onClick={() => {
                  if (!isSaving) setCurrentFlowIntensity(1);
                }}
              >
                <div
                  className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-colors ${addClassIfSelected(1)}`}
                >
                  <span
                    className="material-symbols-outlined text-3xl"
                    data-icon="water_drop"
                  >
                    water_drop
                  </span>
                </div>
                <span
                  className={`font-label text-xs uppercase tracking-tighter ${addClassTextSelected(1)}`}
                >
                  {t('common.light')}
                </span>
              </div>

              {/* Medium */}
              <div
                className="flex flex-col items-center gap-3 cursor-pointer flex-1"
                onClick={() => {
                  if (!isSaving) setCurrentFlowIntensity(2);
                }}
              >
                <div
                  className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-colors ${addClassIfSelected(2)}`}
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
                  className={`font-label text-xs uppercase tracking-tighter ${addClassTextSelected(2)}`}
                >
                  {t('common.medium')}
                </span>
              </div>

              {/* Heavy */}
              <div
                className="flex flex-col items-center gap-3 cursor-pointer flex-1"
                onClick={() => {
                  if (!isSaving) setCurrentFlowIntensity(3);
                }}
              >
                <div
                  className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-colors ${addClassIfSelected(3)}`}
                >
                  <span
                    className="material-symbols-outlined text-4xl"
                    data-icon="opacity"
                  >
                    opacity
                  </span>
                </div>
                <span
                  className={`font-label text-xs uppercase tracking-tighter ${addClassTextSelected(3)}`}
                >
                  {t('common.heavy')}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Action Buttons */}
        <div className="px-8 pb-8 pt-4 bg-white mt-auto">
          <div className="grid grid-cols-2 gap-4 px-2">
            <button
              className="h-14 w-full flex items-center justify-center font-headline font-bold text-gray-500 hover:bg-gray-100 transition-all rounded-full active:scale-95"
              onClick={onClose}
              disabled={isSaving}
            >
              {t('common.cancel')}
            </button>
            <Button
              className="w-full"
              variant="primary"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
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

export default LogTodayModal;
