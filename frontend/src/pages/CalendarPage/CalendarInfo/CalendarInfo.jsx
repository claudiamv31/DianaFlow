import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/apiClient';
import Button from '../../../components/Button';
import { refreshCycleQueries } from '../../../utils/queryInvalidation';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { useLocale } from '../../../i18n/LocaleContext';

const CalendarInfo = ({
  date,
  cycleInfo,
  isEditingPeriod,
  setIsEditingPeriod,
  periodDays,
  currentPeriod,
  setPeriodDays
}) => {
  const { t, locale } = useLocale();
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  const queryClient = useQueryClient();

  const handleSavePeriod = () => {
    if (periodDays.length === 0) return;

    const sorted = [...periodDays].sort();

    // Verificar si el período original fue completamente deseleccionado
    const originalPeriodDeselected =
      currentPeriod &&
      !periodDays.some(
        (day) => day >= currentPeriod.startDate && day <= currentPeriod.endDate
      );

    // Si el período original fue deseleccionado, eliminarlo primero
    if (originalPeriodDeselected) {
      deletePeriodMutation.mutate(currentPeriod.id, {
        onSuccess: () => {
          // Después de eliminar, hacer el upsert del nuevo período
          const payload = {
            periodId: null,
            startDate: sorted[0],
            endDate: sorted[sorted.length - 1]
          };
          upsertPeriodMutation.mutate(payload);
        }
      });
    } else {
      // Si no fue deseleccionado, solo actualizar con upsert
      const payload = {
        periodId: currentPeriod?.id ?? null,
        startDate: sorted[0],
        endDate: sorted[sorted.length - 1]
      };
      upsertPeriodMutation.mutate(payload);
    }
  };

  const deletePeriodMutation = useMutation({
    mutationFn: async (periodId) => {
      return apiClient.delete(`/periods/${periodId}`);
    },
    onError: (error) => {
      console.error('Error eliminando período:', error);
    }
  });

  const upsertPeriodMutation = useMutation({
    mutationFn: async (payload) => {
      return apiClient.post('/calendar/upsert', payload);
    },
    onSuccess: async () => {
      await refreshCycleQueries(queryClient);
      setIsEditingPeriod(false);
      setPeriodDays([]);
    }
  });

  const isSavingPeriod =
    deletePeriodMutation.isPending || upsertPeriodMutation.isPending;

  return (
    <div className="my-4 flex w-60 basis-60 flex-col rounded-[0.625rem] bg-surface-container-lowest p-4 shadow-[-6px_0_20px_rgb(var(--color-shadow)/0.05)]">
      {!cycleInfo ? (
        <LoadingSpinner layout="center" size="md" />
      ) : (
        <div className="w-full">
          <p className="m-0">
            <strong>{date.toLocaleDateString(locale, options)}</strong>
          </p>
          <p className="m-0">
            {t('calendar.cycleDay', { count: cycleInfo.cycleDay })}
          </p>
          <p className="m-0">{t(`phase.${cycleInfo.phase}`)}</p>
          <p className="m-0">
            {t(`fertility.${cycleInfo.fertilityLevel}`)}{' '}
            {t('calendar.pregnancyPossibility')}
          </p>
        </div>
      )}

      <div className="mt-auto w-full text-center">
        {!isEditingPeriod ? (
          <Button
            className="mx-auto w-[70%]"
            disabled={isSavingPeriod}
            onClick={(e) => {
              e.preventDefault();
              setIsEditingPeriod(true);
            }}
          >
            {t('calendar.updateStatus')}
          </Button>
        ) : (
          <div className="flex gap-2.5">
            <Button
              className="w-[70%]"
              onClick={handleSavePeriod}
              disabled={isSavingPeriod}
            >
              {isSavingPeriod ? (
                <LoadingSpinner
                  size="sm"
                  layout="inline"
                  tone="current"
                  label={t('period.saving')}
                />
              ) : (
                t('common.save')
              )}
            </Button>
            <Button
              className="w-[70%]"
              variant="secondary"
              onClick={() => {
                setPeriodDays([]);
                setIsEditingPeriod(false);
              }}
              disabled={isSavingPeriod}
            >
              {t('common.cancel')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarInfo;
