import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons';
import Button from '../../../components/Button';
import { useEffect } from 'react';

const LogPeriodCard = ({ isEditingPeriod, setIsEditingPeriod }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleClose = () => {
    setIsEditingPeriod(false);
  };

  const handleSave = () => {
    // Save logic here
    setIsEditingPeriod(false);
  };

  if (!isEditingPeriod) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-on-surface/10 backdrop-blur-sm transition-opacity duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="bg-surface-container-lowest w-full max-w-lg shadow-[0_12px_32px_rgba(52,50,47,0.06)] overflow-hidden flex flex-col relative max-h-[90vh] rounded-[2rem] md:rounded-[3rem]">
        {/* Header - Adjusted mobile padding */}
        <div className="px-5 md:px-8 pt-8 md:pt-10 pb-4 flex items-center justify-between">
          <h2 className="font-headline font-bold text-xl md:text-2xl text-on-surface flex items-center gap-2">
            <FontAwesomeIcon
              icon={faCalendarDays}
              className="text-primary/80"
            />
            Logging a period?
          </h2>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high hover:bg-surface-variant transition-colors group"
            onClick={handleClose}
          >
            <span className="material-symbols-outlined text-on-surface-variant group-active:scale-90 transition-transform">
              close
            </span>
          </button>
        </div>

        {/* Content - Adjusted mobile padding */}
        <div className="px-5 md:px-8 pb-4 overflow-y-auto flex-1">
          <p className="text-on-surface-variant text-sm mb-8">
            Keeping your data updated helps us refine your future predictions
            and cycle insights.
          </p>
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="px-5 md:px-8 pb-6 md:pb-8 pt-4 bg-surface-container-lowest mt-auto">
          <div className="grid grid-cols-2 gap-4">
            <button
              className="h-14 w-full flex items-center justify-center font-headline font-bold text-primary/100 hover:bg-surface-container-high transition-all rounded-full active:scale-95"
              onClick={handleClose}
            >
              Cancel
            </button>
            <Button className="w-full" variant="primary" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogPeriodCard;
