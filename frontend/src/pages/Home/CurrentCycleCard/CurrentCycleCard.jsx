import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faDroplet } from '@fortawesome/free-solid-svg-icons';
import './CurrentCycleCard.css';

const CurrentCycleCard = ({ periodDuration, cycleDay }) => {
  return (
    <div className="current-cycle-card">
      <h2 className="mb-4">Current Cycle</h2>
      <div className="current-cycle-info">
        {/* Tag label */}
        <p className="current-cycle-label">Cycle Details</p>

        {/* Period Duration */}
        <div className="current-cycle-row">
          <div className="current-cycle-icon duration-icon bg-primary-color/100">
            <FontAwesomeIcon icon={faDroplet} />
          </div>
          <div>
            <p className="current-cycle-meta">Period Duration</p>
            <p className="current-cycle-value">{periodDuration ?? '—'} days</p>
          </div>
        </div>

        {/* Cycle Day */}
        <div className="current-cycle-row">
          <div className="current-cycle-icon day-icon">
            <FontAwesomeIcon icon={faCalendarDays} />
          </div>
          <div>
            <p className="current-cycle-meta">Day of Cycle</p>
            <p className="current-cycle-value">Day {cycleDay ?? '—'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentCycleCard;
