import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarDays,
  faClover,
  faDroplet
} from '@fortawesome/free-solid-svg-icons';
import { useLocale } from '../../../i18n/LocaleContext';

const fertilityDetails = {
  high: {
    valueKey: 'fertility.peak',
    descriptionKey: 'fertility.highDescription',
    valueClassName: 'text-fertility',
    iconClassName: 'bg-fertility/10 text-fertility'
  },
  medium: {
    valueKey: 'fertility.fertile',
    descriptionKey: 'fertility.mediumDescription',
    valueClassName: 'text-fertility',
    iconClassName: 'bg-fertility/10 text-fertility'
  },
  low: {
    valueKey: 'fertility.low',
    descriptionKey: 'fertility.lowDescription',
    valueClassName: 'text-on-surface',
    iconClassName: 'bg-fertility/10 text-fertility'
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
  const { t } = useLocale();
  const displayFertilityLevel =
    estimateFertilityLevel(cycleDay, cycleLength) || fertilityLevel;
  const fertility = getFertilityDetails(displayFertilityLevel);

  const cycleDetails = [
    {
      label: t('cycle.periodDuration'),
      value:
        periodDuration != null
          ? t('cycle.durationValue', { count: periodDuration })
          : '--',
      icon: faDroplet,
      valueClassName: 'text-on-surface',
      iconClassName: 'bg-primary/10 text-primary/100'
    },
    {
      label: t('cycle.dayOfCycle'),
      value: cycleDay != null ? t('cycle.dayValue', { count: cycleDay }) : '--',
      icon: faCalendarDays,
      valueClassName: 'text-on-surface',
      iconClassName: 'bg-secondary/10 text-secondary/100'
    },
    {
      label: t('cycle.fertilityLevel'),
      value: t(fertility.valueKey),
      description: t(fertility.descriptionKey),
      icon: faClover,
      valueClassName: fertility.valueClassName,
      iconClassName: fertility.iconClassName
    }
  ];

  return (
    <div className="flex-1 w-full">
      <h2 className="text-base font-bold mb-4 text-on-surface">
        {t('cycle.current')}
      </h2>

      <div className="bg-accent-surface rounded-3xl p-4 sm:p-5">
        <p className="text-[0.7rem] pl-2 text-on-surface-variant uppercase tracking-widest mb-4">
          {t('cycle.details')}
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
                <p className="text-[0.65rem] uppercase tracking-widest text-on-surface-variant opacity-70 mb-1">
                  {item.label}
                </p>
                <p
                  className={`text-[1.05rem] font-bold leading-tight ${item.valueClassName}`}
                >
                  {item.value}
                </p>
                {item.description && (
                  <p className="mt-1 text-xs leading-snug text-on-surface-variant">
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
