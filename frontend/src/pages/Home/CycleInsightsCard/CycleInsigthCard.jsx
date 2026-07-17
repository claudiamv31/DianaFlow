import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faClover } from '@fortawesome/free-solid-svg-icons';
import { formatDateDayMonthYear } from '../../../utils/calendarUtils';
import { useLocale } from '../../../i18n/LocaleContext';

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

        {/* Cycle Length & Consistency */}
        <div className="flex flex-row justify-between mx-4 my-6 text-[0.8rem] text-on-surface-variant">
          <div>
            <p className="text-2xl font-bold text-primary">
              {t('cycle.durationValue', { count: previousCycle.cycleLength })}
            </p>
            <p>{t('insights.cycleLength')}</p>
          </div>
          <div>
            <p className="text-[1.3rem] font-bold text-secondary">
              {t(`regularity.${previousCycle.consistency}`)}
            </p>
            <p>{t('insights.consistency')}</p>
          </div>
        </div>

        {/* Period Info Sub-cards - UPDATED TO WRAP ON SMALL SCREENS */}
        <div className="flex flex-col sm:flex-row gap-4 mx-2 sm:mx-4 mt-6">
          <div className="flex-1 flex flex-col justify-between text-[0.8rem] text-on-surface-variant py-4 px-3 sm:px-4 bg-navigation-surface rounded-2xl">
            <FontAwesomeIcon
              icon={faCalendarDays}
              className="text-2xl mb-2 text-primary"
            />
            <p className="text-base font-bold text-on-surface">
              {t('cycle.durationValue', { count: previousCycle.days })}
            </p>
            <p>{t('cycle.periodDuration')}</p>
          </div>

          <div className="flex-1 flex flex-col justify-between text-[0.8rem] text-on-surface-variant py-4 px-3 sm:px-4 bg-navigation-surface rounded-2xl">
            <FontAwesomeIcon
              icon={faClover}
              className="text-2xl mb-2 text-secondary"
            />
            <p className="text-base font-bold text-on-surface">
              {formatDateDayMonthYear(previousCycle.startDate, locale)}
            </p>
            <p>{t('insights.firstDay')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CycleInsightsCard;
