import { useLocale } from '../../../i18n/LocaleContext';

const YourPeriodCard = ({ period }) => {
  const { t, locale } = useLocale();
  const focusText =
    locale === 'en' && period?.dailyFocus
      ? period.dailyFocus
      : period?.currentPhase
        ? t(`home.phase.${period.currentPhase}`)
        : t('focus.default');

  return (
    // Replaced 'md:col-span-2' with 'w-full' to fix the mobile layout width
    <div className="w-full bg-gradient-to-br from-secondary-container/50 to-tertiary-container/50 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6 mt-4">
      <div className="flex-1 w-full">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="material-symbols-outlined text-secondary"
            data-icon="self_improvement"
          >
            self_improvement
          </span>
          <h3 className="font-headline text-lg font-bold text-on-surface">
            {t('focus.title')}
          </h3>
        </div>
        <p className="text-on-surface-variant text-sm mb-4">{focusText}</p>
      </div>
    </div>
  );
};

export default YourPeriodCard;
