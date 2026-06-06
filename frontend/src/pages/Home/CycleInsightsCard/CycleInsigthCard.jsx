import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faClover } from '@fortawesome/free-solid-svg-icons';
import { formatDateDayMonthYear } from '../../../utils/calendarUtils';

const CycleInsightsCard = ({ previousCycle }) => {
  return (
    <div className="flex-1 w-full">
      <h2 className="text-base font-bold mb-4 text-[var(--text-color)]">
        Cycle Insights
      </h2>

      <div className="bg-[var(--accent-color)] rounded-3xl p-4 sm:p-5">
        <p className="text-[0.7rem] pl-4 text-[var(--label-color)] uppercase tracking-widest mb-4">
          Previous Cycle Summary
        </p>

        {/* Cycle Length & Consistency */}
        <div className="flex flex-row justify-between mx-4 my-6 text-[0.8rem] text-[var(--label-color)]">
          <div>
            <p className="text-2xl font-bold text-[var(--primary-color)]">
              {previousCycle.cycleLength} Days
            </p>
            <p>Cycle Length</p>
          </div>
          <div>
            <p className="text-[1.3rem] font-bold text-[var(--purple-color)]">
              {previousCycle.consistency}
            </p>
            <p>Consistency</p>
          </div>
        </div>

        {/* Period Info Sub-cards - UPDATED TO WRAP ON SMALL SCREENS */}
        <div className="flex flex-col sm:flex-row gap-4 mx-2 sm:mx-4 mt-6">
          <div className="flex-1 flex flex-col justify-between text-[0.8rem] text-[var(--label-color)] py-4 px-3 sm:px-4 bg-[var(--tags-content)] rounded-2xl">
            <FontAwesomeIcon
              icon={faCalendarDays}
              className="text-2xl mb-2 text-[var(--primary-color)]"
            />
            <p className="text-base font-bold text-[var(--text-color)]">
              {previousCycle.days} Days
            </p>
            <p>Period Duration</p>
          </div>

          <div className="flex-1 flex flex-col justify-between text-[0.8rem] text-[var(--label-color)] py-4 px-3 sm:px-4 bg-[var(--tags-content)] rounded-2xl">
            <FontAwesomeIcon
              icon={faClover}
              className="text-2xl mb-2 text-[var(--purple-color)]"
            />
            <p className="text-base font-bold text-[var(--text-color)]">
              {formatDateDayMonthYear(previousCycle.startDate)}
            </p>
            <p>First Day</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CycleInsightsCard;
