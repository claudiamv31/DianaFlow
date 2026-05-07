import './LogPeriodCard.css';

const LogPeriodCard = ({ isEditingPeriod, setIsEditingPeriod }) => {
  return (
    <div className="log-period-card-container">
      <h2>Logging a period?</h2>
      <p>Keeping your data updated helps us refine your future predictions and cycle insights.</p>
      <button className="log-button" onClick={() => setIsEditingPeriod(!isEditingPeriod)}>
        {isEditingPeriod ? 'Cancel' : 'Log period'}
      </button>
    </div>
  );
};

export default LogPeriodCard;