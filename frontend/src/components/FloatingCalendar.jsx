import { motion, AnimatePresence } from 'framer-motion';
import Calendar from 'react-calendar';
import PropTypes from 'prop-types';
import './FloatingCalendar.css';

const FloatingCalendar = ({ show, onClose, onSelectDate, date, onSave }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="calendar-overlay"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="calendar-container"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Calendar value={date} onChange={onSelectDate} />

            {date && (
              <button
                className="calendar-save-btn"
                type="button"
                onClick={() => {
                  onSave();
                  onClose();
                }}
              >
                Save Cycle
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

FloatingCalendar.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelectDate: PropTypes.func.isRequired,
  date: PropTypes.any,
  onSave: PropTypes.func.isRequired
};

export default FloatingCalendar;
