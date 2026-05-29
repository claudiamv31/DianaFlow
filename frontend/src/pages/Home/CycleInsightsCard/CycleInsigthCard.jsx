import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faClover } from '@fortawesome/free-solid-svg-icons';
import { formatDateDayMonthYear } from '../../../utils/calendarUtils';
import './CycleInsightsCard.css';

const CycleInsightsCard = ({ previousCycle }) => {
  return (
    <div className="cycle-insights">
      <div className="mb-4">
        <h2 className="card-title">Cycle Insights</h2>
      </div>
      <div className="cycle-insigts-info">
        <div className="insights-previous-cycle">
          <p>Previous Cycle Summary</p>
        </div>
        <div>
          <div div className="cycle-length">
            <div>
              <p className="days-cycle-length">
                {previousCycle.cycleLength} Days
              </p>
              <p>Cycle Length</p>
            </div>
            <div>
              <p className="consistency">{previousCycle.consistency}</p>
              <p>Consistency</p>
            </div>
          </div>
          <div>
            <div div className="period-info">
              <div className="info-card">
                <FontAwesomeIcon
                  icon={faCalendarDays}
                  className="nav-icon duration"
                />
                <p className="title">{previousCycle.days} Days</p>
                <p>Period Duration</p>
              </div>
              <div className="info-card">
                <FontAwesomeIcon
                  icon={faClover}
                  className="nav-icon start-day"
                />
                <p className="title">
                  {formatDateDayMonthYear(previousCycle.startDate)}
                </p>
                <p>First Day</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CycleInsightsCard;
