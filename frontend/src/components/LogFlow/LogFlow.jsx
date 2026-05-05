import { useMemo, useState } from 'react';
import { FaTint, FaRegSmileBeam, FaTimes } from 'react-icons/fa';
import PrimaryButton from '../PrimaryButton';
import Calendar from 'react-calendar';
import { formatDateLocal, parseLocalDate } from '../../utils/calendarUtils';
import './LogFlow.css';

function LogFlow({ onClose, onSave, initialDate, previousCycle, endDate }) {
  const initialStartDate = parseLocalDate(initialDate) || new Date();
  const initialDuration = previousCycle?.duration || 5;
  const [activeMonth, setActiveMonth] = useState(() => new Date(initialStartDate));
  const [selectedFlow, setSelectedFlow] = useState('Medium');
  const [range, setRange] = useState(() => {
    const start = new Date(initialStartDate);
    const dates = [];
    if (endDate && initialDate) {
      const sDate = parseLocalDate(initialDate);
      const eDate = parseLocalDate(endDate);
      for(let i = sDate; i <= eDate; i.setDate(i.getDate() + 1)){
        dates.push(formatDateLocal(i));
      }
    }else{
      for (let i = 0; i < initialDuration; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        dates.push(formatDateLocal(date));
      }
    }
    return dates;
  });

  const selectedDays = useMemo(() => {
    return [...range].sort();
  }, [range]);

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
    const today = formatDateLocal(new Date());
    const isSelected = range.includes(dateString);

    let classes = [];
    if (isSelected) classes.push('period-tile', 'period-middle');
    if (dateString === today) classes.push('period-today');
    
    return classes.length ? classes.join(' ') : null;
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
