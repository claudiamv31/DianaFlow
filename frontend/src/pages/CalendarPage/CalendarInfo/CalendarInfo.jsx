import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/apiClient';
import PrimaryButton from '../../../components/PrimaryButton';
import './CalendarInfo.css';

const CalendarInfo = ({
  date,
  cycleInfo,
  isEditingPeriod,
  setIsEditingPeriod,
  periodDays,
  currentPeriod,
  setPeriodDays
}) => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-day'] });

      setIsEditingPeriod(false);
      setPeriodDays([]);
    }
  });

  return (
    <div className="calendar-info">
      {!cycleInfo ? (
        <div className="calendar-info__placeholder">Loading day info…</div>
      ) : (
        <div className="day-info">
          <p>
            <strong>{date.toLocaleDateString('en-US', options)}</strong>
          </p>
          <p>Day {cycleInfo.cycleDay} of cycle</p>
          <p>{cycleInfo.phase}</p>
          <p>
            {cycleInfo.fertilityLevel.charAt(0).toUpperCase() +
              cycleInfo.fertilityLevel.slice(1)}{' '}
            possibility of pregnancy
          </p>
        </div>
      )}

      <div className="update-button">
        {!isEditingPeriod ? (
          <PrimaryButton
            onClick={(e) => {
              e.preventDefault();
              setIsEditingPeriod(true);
            }}
          >
            Update status
          </PrimaryButton>
        ) : (
          <div style={{ display: 'flex', gap: '10px' }}>
            <PrimaryButton onClick={handleSavePeriod}>Save</PrimaryButton>
            <PrimaryButton
              onClick={() => {
                setPeriodDays([]);
                setIsEditingPeriod(false);
              }}
              style={{ backgroundColor: '#999' }}
            >
              Cancel
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarInfo;
