import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faClover } from '@fortawesome/free-solid-svg-icons';
import { formatDateDayMonthYear } from '../../../utils/calendarUtils';
import { useLocale } from '../../../i18n/LocaleContext';
import { regularityTranslationKey } from '../../../i18n/domainCodes';

const CycleInsightsCard = ({ previousCycle }) => {
  const { t, locale } = useLocale();
  return (
    <div className="flex-1 w-full">
      <h2 className="text-base font-bold mb-4 text-on-surface">
        {t('insights.title')}
      </h2>

      <div className="bg-accent-surface rounded-3xl p-4 sm:p-5">
        <p className="text-[0.7rem] pl-4 text-on-surface-variant uppercase tracking-widest mb-4">
          {t('insights.previousSummary')}
        </p>

        {/* Previous cycle summary */}
        <div
          data-testid="cycle-summary-grid"
          className="grid grid-cols-2 items-stretch gap-4 mx-2 sm:mx-4 my-6 text-[0.8rem] text-on-surface-variant"
        >
          <div
            data-testid="cycle-summary-item"
            className="min-w-0 px-3 py-2 sm:px-4"
          >
            <p className="text-xl sm:text-2xl leading-tight font-bold text-primary">
              {t('cycle.durationValue', { count: previousCycle.cycleLength })}
            </p>
            <p className="mt-1">{t('insights.cycleLength')}</p>
          </div>
          <div
            data-testid="cycle-summary-item"
            className="min-w-0 px-3 py-2 sm:px-4"
          >
            <p className="text-xl sm:text-2xl leading-tight font-bold text-secondary">
              {t(regularityTranslationKey(previousCycle.consistency))}
            </p>
            <p className="mt-1">{t('insights.consistency')}</p>
          </div>
          <div
            data-testid="cycle-summary-item"
            className="min-w-0 flex flex-col justify-between py-4 px-3 sm:px-4 bg-navigation-surface rounded-2xl"
          >
            <FontAwesomeIcon
              icon={faCalendarDays}
              className="text-2xl mb-2 text-primary"
            />
            <p className="text-base leading-tight font-bold text-on-surface">
              {t('cycle.durationValue', { count: previousCycle.days })}
            </p>
            <p className="mt-1">{t('cycle.periodDuration')}</p>
          </div>

          <div
            data-testid="cycle-summary-item"
            className="min-w-0 flex flex-col justify-between py-4 px-3 sm:px-4 bg-navigation-surface rounded-2xl"
          >
            <FontAwesomeIcon
              icon={faClover}
              className="text-2xl mb-2 text-secondary"
            />
            <p className="text-base leading-tight font-bold text-on-surface">
              {formatDateDayMonthYear(previousCycle.startDate, locale)}
            </p>
            <p className="mt-1">{t('insights.firstDay')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CycleInsightsCard;
