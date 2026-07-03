import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarDays,
  faClover,
  faDroplet
} from '@fortawesome/free-solid-svg-icons';

const fertilityDetails = {
  high: {
    value: 'Peak',
    description: 'Highest fertility estimate',
    valueClassName: 'text-fertility',
    iconClassName: 'bg-fertility/10 text-fertility'
  },
  medium: {
    value: 'Fertile',
    description: 'Elevated fertility estimate',
    valueClassName: 'text-fertility',
    iconClassName: 'bg-fertility/10 text-fertility'
  },
  low: {
    value: 'Low',
    description: 'Lower fertility estimate',
    valueClassName: 'text-[var(--text-color)]',
    iconClassName: 'bg-secondary/10 text-secondary'
  }
};

const getFertilityDetails = (fertilityLevel) => {
  const normalizedLevel = fertilityLevel?.toString().toLowerCase();
  return fertilityDetails[normalizedLevel] || fertilityDetails.low;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const estimateFertilityLevel = (cycleDay, cycleLength) => {
  const normalizedCycleDay = Number(cycleDay);
  const normalizedCycleLength =
    Number(cycleLength) > 0 ? Number(cycleLength) : 28;

  if (!Number.isFinite(normalizedCycleDay) || normalizedCycleDay <= 0) {
    return null;
  }

  const ovulationDay = clamp(
    normalizedCycleLength - 14,
    1,
    normalizedCycleLength
  );
  const fertileStart = clamp(ovulationDay - 5, 1, normalizedCycleLength);
  const fertileEnd = clamp(ovulationDay + 1, 1, normalizedCycleLength);

  if (normalizedCycleDay === ovulationDay) return 'high';
  if (normalizedCycleDay >= fertileStart && normalizedCycleDay <= fertileEnd) {
    return 'medium';
  }

  return 'low';
};

const CurrentCycleCard = ({
  periodDuration,
  cycleDay,
  cycleLength,
  fertilityLevel
}) => {
  const displayFertilityLevel =
    estimateFertilityLevel(cycleDay, cycleLength) || fertilityLevel;
  const fertility = getFertilityDetails(displayFertilityLevel);

  const cycleDetails = [
    {
      label: 'Period Duration',
      value: periodDuration != null ? `${periodDuration} days` : '--',
      icon: faDroplet,
      valueClassName: 'text-[var(--text-color)]',
      iconClassName: 'bg-primary/10 text-primary/100'
    },
    {
      label: 'Day of Cycle',
      value: cycleDay != null ? `Day ${cycleDay}` : '--',
      icon: faCalendarDays,
      valueClassName: 'text-[var(--text-color)]',
      iconClassName: 'bg-secondary/10 text-secondary/100'
    },
    {
      label: 'Fertility Level',
      value: fertility.value,
      description: fertility.description,
      icon: faClover,
      valueClassName: fertility.valueClassName,
      iconClassName: fertility.iconClassName
    }
  ];

  return (
    <div className="flex-1 w-full">
      <h2 className="text-base font-bold mb-4 text-[var(--text-color)]">
        Current Cycle
      </h2>

      <div className="bg-[var(--accent-color)] rounded-3xl p-4 sm:p-5">
        <p className="text-[0.7rem] pl-2 text-[var(--label-color)] uppercase tracking-widest mb-4">
          Cycle Details
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="list">
          {cycleDetails.map((item) => (
            <div
              key={item.label}
              className="flex min-w-0 items-start gap-3 rounded-2xl px-3 py-4 sm:px-4"
              role="listitem"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base ${item.iconClassName}`}
              >
                <FontAwesomeIcon icon={item.icon} />
              </div>
              <div className="min-w-0">
                <p className="text-[0.65rem] uppercase tracking-widest text-[var(--label-color)] opacity-70 mb-1">
                  {item.label}
                </p>
                <p
                  className={`text-[1.05rem] font-bold leading-tight ${item.valueClassName}`}
                >
                  {item.value}
                </p>
                {item.description && (
                  <p className="mt-1 text-xs leading-snug text-[var(--label-color)]">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CurrentCycleCard;
