import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faDroplet } from '@fortawesome/free-solid-svg-icons';

const CurrentCycleCard = ({ periodDuration, cycleDay }) => {
  return (
    <div className="flex-1 w-full">
      <h2 className="text-base font-bold mb-4 text-[var(--text-color)]">
        Current Cycle
      </h2>

      <div className="bg-[var(--accent-color)] rounded-3xl p-5">
        <p className="text-[0.7rem] pl-2 text-[var(--label-color)] uppercase tracking-widest mb-4">
          Cycle Details
        </p>

        {/* Period Duration */}
        <div className="flex flex-row items-center gap-4 my-4 mx-2">
          {/* Restored Custom Color for Duration Icon */}
          <div className="w-11 h-11 rounded-full flex items-center justify-center text-lg shrink-0 bg-[#904958]/10 text-[#904958]">
            <FontAwesomeIcon icon={faDroplet} />
          </div>
          <div>
            <p className="text-[0.7rem] uppercase tracking-widest text-[var(--label-color)] opacity-70 mb-0.5">
              Period Duration
            </p>
            <p className="text-[1.1rem] font-bold text-[var(--text-color)]">
              {periodDuration ?? '—'} days
            </p>
          </div>
        </div>

        {/* Cycle Day */}
        <div className="flex flex-row items-center gap-4 my-4 mx-2">
          {/* Restored Custom Color for Day Icon */}
          <div className="w-11 h-11 rounded-full flex items-center justify-center text-lg shrink-0 bg-[var(--purple-color)]/10 text-[var(--purple-color)]">
            <FontAwesomeIcon icon={faCalendarDays} />
          </div>
          <div>
            <p className="text-[0.7rem] uppercase tracking-widest text-[var(--label-color)] opacity-70 mb-0.5">
              Day of Cycle
            </p>
            <p className="text-[1.1rem] font-bold text-[var(--text-color)]">
              Day {cycleDay ?? '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentCycleCard;
