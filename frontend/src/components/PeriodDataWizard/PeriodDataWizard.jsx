import { useState } from 'react';
import Button from '../Button';
import CustomDatePicker from './CustomDatePicker';
import './PeriodDataWizard.css';
import { useLocale } from '../../i18n/LocaleContext';

const PeriodDataWizard = ({ onComplete }) => {
  const { t } = useLocale();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    daysOfPeriod: 5,
    daysOfCycle: 28,
    lastDayPeriod: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    {
      id: 'period-duration',
      question: t('wizard.periodQuestion'),
      description: t('wizard.periodDescription'),
      field: 'daysOfPeriod',
      type: 'number',
      min: 1,
      max: 15,
      unit: t('common.days')
    },
    {
      id: 'cycle-duration',
      question: t('wizard.cycleQuestion'),
      description: t('wizard.cycleDescription'),
      field: 'daysOfCycle',
      type: 'number',
      min: 15,
      max: 60,
      unit: t('common.days')
    },
    {
      id: 'last-period-date',
      question: t('wizard.lastPeriodQuestion'),
      description: t('wizard.lastPeriodDescription'),
      field: 'lastDayPeriod',
      type: 'date'
    }
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleInputChange = (e) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      [currentStepData.field]: value
    });
  };

  const isStepValid = () => {
    const fieldValue = formData[currentStepData.field];
    if (currentStepData.type === 'date') {
      return fieldValue !== '';
    }
    if (currentStepData.type === 'number') {
      const numValue = parseInt(fieldValue);
      return numValue >= currentStepData.min && numValue <= currentStepData.max;
    }
    return false;
  };

  const handleNext = () => {
    if (isStepValid()) {
      if (isLastStep) {
        handleSubmit();
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onComplete(formData);
    } catch (error) {
      console.error('Error submitting wizard:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-on-surface/10 backdrop-blur-sm transition-opacity duration-300">
      <div
        className="bg-surface-container-lowest w-full max-w-lg shadow-[0_12px_32px_rgba(52,50,47,0.06)] overflow-hidden flex flex-col relative"
        style={{ maxHeight: '90vh', borderRadius: '3rem' }}
      >
        {/* Header with Step Indicator */}
        <div className="px-8 pt-10 pb-4 flex items-center justify-between border-b border-surface-container-high">
          <div>
            <h2 className="font-headline font-bold text-2xl text-on-surface">
              {t('wizard.title')}
            </h2>
            <p className="text-xs text-on-surface-variant mt-1">
              {t('wizard.step', {
                current: currentStep + 1,
                total: steps.length
              })}
            </p>
          </div>
          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-all ${
                  index <= currentStep
                    ? 'bg-primary/100 w-6'
                    : 'bg-surface-container-high'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="px-8 py-10 overflow-y-auto flex-1 flex flex-col items-center justify-center min-h-[300px]">
          {/* Question */}
          <div className="text-center mb-8 w-full">
            <h3 className="font-headline font-bold text-2xl text-on-surface mb-3">
              {currentStepData.question}
            </h3>
            <p className="text-sm text-on-surface-variant">
              {currentStepData.description}
            </p>
          </div>

          {/* Input Field */}
          <div className="w-full max-w-xs mb-8">
            {currentStepData.type === 'number' ? (
              <div className="space-y-3">
                <div className="flex items-center gap-4 bg-surface-container-low rounded-full p-2 h-16">
                  <button
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-primary/100 hover:bg-primary/10 transition-colors shadow-sm"
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        [currentStepData.field]: Math.max(
                          currentStepData.min,
                          parseInt(formData[currentStepData.field]) - 1
                        )
                      })
                    }
                  >
                    <span className="material-symbols-outlined">remove</span>
                  </button>
                  <input
                    className="flex-1 bg-transparent border-none text-center font-headline font-bold text-3xl text-on-surface focus:ring-0 focus:outline-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0"
                    style={{ MozAppearance: 'textfield' }}
                    type="number"
                    min={currentStepData.min}
                    max={currentStepData.max}
                    value={formData[currentStepData.field]}
                    onChange={handleInputChange}
                  />
                  <button
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-primary/100 hover:bg-primary/10 transition-colors shadow-sm"
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        [currentStepData.field]: Math.min(
                          currentStepData.max,
                          parseInt(formData[currentStepData.field]) + 1
                        )
                      })
                    }
                  >
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
                <p className="text-center text-sm text-on-surface-variant">
                  {currentStepData.min} - {currentStepData.max}{' '}
                  {currentStepData.unit}
                </p>
              </div>
            ) : (
              <div className="space-y-2 w-full">
                <CustomDatePicker
                  value={formData[currentStepData.field]}
                  onChange={(dateValue) =>
                    setFormData({
                      ...formData,
                      [currentStepData.field]: dateValue
                    })
                  }
                  maxDate={new Date().toISOString().split('T')[0]}
                />
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons (Fixed at bottom) */}
        <div className="px-8 pb-8 pt-4 bg-surface-container-lowest border-t border-surface-container-high">
          <div className="grid grid-cols-2 gap-4 px-2">
            <button
              className="h-14 w-full flex items-center justify-center font-headline font-bold text-primary/100 hover:bg-surface-container-high transition-all rounded-full active:scale-95 disabled:opacity-50"
              onClick={handlePrevious}
              disabled={isFirstStep}
            >
              {t('common.previous')}
            </button>
            <Button
              className="w-full"
              variant="primary"
              onClick={handleNext}
              disabled={!isStepValid() || isSubmitting}
            >
              {isLastStep ? t('common.complete') : t('common.next')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeriodDataWizard;
