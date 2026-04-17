import { parseLocalDate, formatDateMexican } from '../../utils/calendarUtils';

const HistoryPeriod = ({ latestPeriods }) => {
  const periods = latestPeriods.map((period, index) => {
    return (
      <div key={index}>
        <p>{period.startDate}</p>
        <p>{period.endDate}</p>
      </div>
    );
  });

  return latestPeriods ? <div>{periods}</div> : <p></p>;
};

export default HistoryPeriod;
