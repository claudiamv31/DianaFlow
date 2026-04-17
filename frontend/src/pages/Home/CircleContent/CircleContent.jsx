import './CircleContent.css';

const CircleContent = ({ status }) => {
  if (!status) {
    return <div className="inner-circle-content">No data available</div>;
  }

  const { cycleStatus } = status;

  return (
    <div className="inner-circle-content">
      <p className="phase-label">Luteal Phase</p>
      <strong className="main-status">
        {cycleStatus.status === 'active_period'
          ? `Day ${cycleStatus.days}`
          : `Period in ${cycleStatus.days} Days`}
      </strong>
      <p className="day-counter">Day 24 of 28</p>
    </div>
  );
};

export default CircleContent;
