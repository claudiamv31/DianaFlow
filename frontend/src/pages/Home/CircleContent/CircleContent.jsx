import './CircleContent.css';
import { useLocale } from '../../../i18n/LocaleContext';

const CircleContent = ({ status }) => {
  const { t } = useLocale();
  if (!status) {
    return <div className="inner-circle-content">{t('home.noData')}</div>;
  }

  const { cycleStatus } = status;

  return (
    <div className="inner-circle-content">
      <p className="phase-label">
        {status.currentPhase ? t(`phase.${status.currentPhase}`) : '--'}
      </p>
      <strong className="main-status">
        {cycleStatus.status === 'active_period'
          ? t('cycle.dayValue', { count: cycleStatus.days })
          : t('home.periodIn', { count: cycleStatus.days })}
      </strong>
      <p className="day-counter">
        {t('cycle.dayOfTotal', {
          day: cycleStatus.cycleDay,
          total: cycleStatus.cycleLength
        })}
      </p>
    </div>
  );
};

export default CircleContent;
