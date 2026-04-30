import { useMemo, useState } from 'react';
import { FaTint, FaRegSmileBeam, FaTimes } from 'react-icons/fa';
import PrimaryButton from '../PrimaryButton';
import FloatingCalendar from '../FloatingCalendar';
import Calendar from 'react-calendar';
import { formatDateLocal, parseLocalDate } from '../../utils/calendarUtils';
import './LogFlow.css';

function LogFlow({ onClose, onSave, initialDate, previousCycle }) {
  const initialStartDate = parseLocalDate(initialDate) || new Date();
  const initialDuration = previousCycle?.duration || 5;
  const [activeMonth, setActiveMonth] = useState(() => new Date(initialStartDate));
  const [selectedFlow, setSelectedFlow] = useState('Medium');
  const [range, setRange] = useState(() => {
    const start = new Date(initialStartDate);
    const dates = [];
    for (let i = 0; i < initialDuration; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(formatDateLocal(date));
    }
    return dates;
  });

  const selectedDays = useMemo(() => {
    return [...range].sort();
  }, [range]);

  const firstDayPeriod = selectedDays[0];
  const endDayPeriod = selectedDays[selectedDays.length - 1];

  const handleDayClick = (day) => {
    const clickedString = formatDateLocal(day);

    setRange(prev => {
      if (prev.includes(clickedString)) {
        return prev.filter(d => d !== clickedString);
      }
      return [...prev, clickedString];
    });
  };

  const onMonthChange = ({ activeStartDate }) => {
    setActiveMonth(activeStartDate);
  };

  const handleSave = () => {
    onSave({
      SelectedDays: selectedDays
    });
  };

  const tileClassName = ({ date }) => {
    const dateString = formatDateLocal(date);
    if (!range.includes(dateString)) return null;
    return 'period-tile period-middle';
  };

  return (
    <div className="log-flow-overlay">
      <div className="log-flow-container">
        <header className="log-header">
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </header>

        <div className="log-scroll-content">
          <h2>Log your flow</h2>
          <h3>Select your period dates</h3>

          <Calendar
            key={range.join(',')}
            onClickDay={handleDayClick}
            activeStartDate={activeMonth}
            onActiveStartDateChange={onMonthChange}
            showNeighboringMonth={false}
            locale="en-US"
            formatShortWeekday={(locale, date) =>
              date
                .toLocaleDateString(locale, { weekday: 'short' })
                .slice(0, 1)
                .toUpperCase()
            }
            tileClassName={({ date, view }) =>
              view === 'month' ? tileClassName({ date }) : null
            }
          />
          {/* <section className="input-group">
            <h3>
              <FaTint /> How is your flow?
            </h3>
            <div className="options-grid">
              {['Light', 'Medium', 'Heavy', 'Spotting'].map((level) => (
                <button
                  key={level}
                  className={`option-btn ${selectedFlow === level ? 'active' : ''}`}
                  onClick={() => setSelectedFlow(level)}
                >
                  {level}
                </button>
              ))}
            </div>
          </section> */}
        </div>
        <footer className="log-footer">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <PrimaryButton onClick={handleSave}>Save Entry</PrimaryButton>
        </footer>
      </div>
    </div>
  );
}

export default LogFlow;
