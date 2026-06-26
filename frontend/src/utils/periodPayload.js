const DEFAULT_SETUP_FLOW = 2;

export const buildPeriodPayload = (
  startDate,
  duration,
  flow = DEFAULT_SETUP_FLOW
) => {
  const parsedDuration = Number.parseInt(duration, 10);

  if (!startDate || Number.isNaN(parsedDuration) || parsedDuration < 1) {
    return { selectedDays: [] };
  }

  const [year, month, day] = startDate.split('-').map(Number);

  if ([year, month, day].some((part) => !Number.isInteger(part))) {
    return { selectedDays: [] };
  }

  return {
    selectedDays: Array.from({ length: parsedDuration }, (_, index) => {
      const date = new Date(Date.UTC(year, month - 1, day + index));

      return {
        date: date.toISOString().slice(0, 10),
        flow
      };
    })
  };
};
