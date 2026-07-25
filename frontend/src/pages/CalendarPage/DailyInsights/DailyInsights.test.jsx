import { render, screen } from '@testing-library/react';
import { LocaleProvider } from '../../../i18n/LocaleContext';
import DailyInsights from './DailyInsights';

describe('DailyInsights actions', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('uses the shared primary button styling for Log Today', () => {
    render(
      <LocaleProvider>
        <DailyInsights
          cycleInfo={{
            date: '2026-07-22',
            cycleDay: 4,
            phase: 'menstruation',
            phaseDay: 4,
            phaseLength: 5,
            fertilityLevel: 'low'
          }}
          isPeriod
          setIsEditingPeriod={jest.fn()}
          setIsDailyLogActive={jest.fn()}
        />
      </LocaleProvider>
    );

    const logTodayButton = screen.getByRole('button', { name: 'Log Today' });
    expect(logTodayButton).toHaveClass(
      'bg-gradient-to-l',
      'from-primary-gradient-start',
      'to-primary'
    );
    expect(logTodayButton).not.toHaveClass('!bg-primary');
  });
});
