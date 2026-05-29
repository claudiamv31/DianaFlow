import './CurrentCycleCard.css';

const CurrentCycleCard = ({ periodDuration, cycleDay }) => {
  return (
    <div className="current-cycle-card">
      <h2>Ciclo Actual</h2>
      <div className="current-cycle-info">
        {/* Tag label */}
        <p className="current-cycle-label">Detalles del Ciclo</p>

        {/* Period Duration */}
        <div className="current-cycle-row">
          <div className="current-cycle-icon duration-icon">🩸</div>
          <div>
            <p className="current-cycle-meta">Duración del periodo</p>
            <p className="current-cycle-value">{periodDuration ?? '—'} días</p>
          </div>
        </div>

        {/* Cycle Day */}
        <div className="current-cycle-row">
          <div className="current-cycle-icon day-icon">📅</div>
          <div>
            <p className="current-cycle-meta">Día del ciclo</p>
            <p className="current-cycle-value">Día {cycleDay ?? '—'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentCycleCard;
