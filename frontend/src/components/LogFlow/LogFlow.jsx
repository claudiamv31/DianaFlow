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
  const [selectedFlow, setSelectedFlow] = useState('Medium');
  const [range, setRange] = useState(() => {
    const start = new Date(initialStartDate);
    const end = new Date(start);
    end.setDate(end.getDate() + initialDuration - 1);
    return { start, end };
  });

  const selectedDays = useMemo(() => {
    if (!range?.start || !range?.end) return [];
    const dates = [];
    const current = new Date(range.start);
    while (current <= range.end) {
      dates.push(formatDateLocal(new Date(current)));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }, [range]);

  const firstDayPeriod = selectedDays[0];
  const endDayPeriod = selectedDays[selectedDays.length - 1];
  const durationPeriod = selectedDays.length;

  const handleDayClick = (day) => {
    const clicked = new Date(day);
    const clickedString = formatDateLocal(clicked);
    const startString = formatDateLocal(range.start);
    const endString = formatDateLocal(range.end);

    if (selectedDays.length <= 1) {
      const newStart = selectedDays.length === 0 ? clicked : range.start;
      const newEnd = selectedDays.length === 0 ? clicked : clicked;
      if (selectedDays.length === 1 && clickedString < startString) {
        setRange({ start: clicked, end: range.start });
      } else if (selectedDays.length === 1) {
        setRange({ start: range.start, end: clicked });
      } else {
        setRange({ start: newStart, end: newEnd });
      }
      return;
    }

    if (clickedString < startString) {
      setRange({ start: clicked, end: range.end });
      return;
    }

    if (clickedString > endString) {
      setRange({ start: range.start, end: clicked });
      return;
    }

    const distanceToStart = clicked - range.start;
    const distanceToEnd = range.end - clicked;

    if (distanceToStart <= distanceToEnd) {
      setRange({ start: clicked, end: range.end });
    } else {
      setRange({ start: range.start, end: clicked });
    }
  };

  const onMonthChange = () => {
    // No cambiar la selección al navegar entre meses.
  };

  const handleSave = () => {
    onSave({
      StartDate: firstDayPeriod,
      EndDate: endDayPeriod,
      FlowLevel: selectedFlow
    });
  };

  const tileClassName = ({ date }) => {
    const dateString = formatDateLocal(date);
    if (!selectedDays.includes(dateString)) return null;
    if (dateString === firstDayPeriod) return 'period-edge period-start';
    if (dateString === endDayPeriod) return 'period-edge period-end';
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
            onClickDay={handleDayClick}
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
          <section className="input-group">
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
          </section>
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
