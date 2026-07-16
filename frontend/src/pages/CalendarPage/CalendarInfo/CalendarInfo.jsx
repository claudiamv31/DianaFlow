import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/apiClient';
import PrimaryButton from '../../../components/PrimaryButton';
import { refreshCycleQueries } from '../../../utils/queryInvalidation';
import LoadingSpinner from '../../../components/LoadingSpinner';
import './CalendarInfo.css';
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
    <div className="calendar-info">
      {!cycleInfo ? (
        <LoadingSpinner layout="center" size="md" />
      ) : (
        <div className="day-info">
          <p>
            <strong>{date.toLocaleDateString(locale, options)}</strong>
          </p>
          <p>{t('calendar.cycleDay', { count: cycleInfo.cycleDay })}</p>
          <p>{t(`phase.${cycleInfo.phase}`)}</p>
          <p>
            {t(`fertility.${cycleInfo.fertilityLevel}`)}{' '}
            {t('calendar.pregnancyPossibility')}
          </p>
        </div>
      )}

      <div className="update-button">
        {!isEditingPeriod ? (
          <PrimaryButton
            disabled={isSavingPeriod}
            onClick={(e) => {
              e.preventDefault();
              setIsEditingPeriod(true);
            }}
          >
            {t('calendar.updateStatus')}
          </PrimaryButton>
        ) : (
          <div style={{ display: 'flex', gap: '10px' }}>
            <PrimaryButton onClick={handleSavePeriod} disabled={isSavingPeriod}>
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
            </PrimaryButton>
            <PrimaryButton
              onClick={() => {
                setPeriodDays([]);
                setIsEditingPeriod(false);
              }}
              style={{ backgroundColor: '#999' }}
              disabled={isSavingPeriod}
            >
              {t('common.cancel')}
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarInfo;
