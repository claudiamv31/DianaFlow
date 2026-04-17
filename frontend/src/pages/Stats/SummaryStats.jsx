import { parseLocalDate, formatDateMexican } from '../../utils/calendarUtils';

const SummaryStats = ({ dataSummary }) => {
  if (dataSummary?.lastPeriodStart) {
    const parsed = parseLocalDate(dataSummary.lastPeriodStart);
    console.log('Fecha parseada:', parsed);
  }

  return dataSummary ? (
    <div>
      <h2>My Cycles</h2>
      <p>{dataSummary.totalPeriods} cycles in total</p>
      <p>{dataSummary.avgPeriodLength} Days. Average of period</p>
      <p>{dataSummary.avgCycleLength} Days. Average of Cycle</p>
      <p>
        {dataSummary.lastPeriodStart
          ? formatDateMexican(parseLocalDate(dataSummary.lastPeriodStart))
          : 'Sin datos'}
      </p>
    </div>
  ) : (
    <p>Cargando datos...</p>
  );
};

export default SummaryStats;
