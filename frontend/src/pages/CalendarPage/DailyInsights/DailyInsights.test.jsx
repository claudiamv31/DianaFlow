import { render, screen } from '@testing-library/react';
import { LocaleProvider } from '../../../i18n/LocaleContext';
import DailyInsights from './DailyInsights';

describe('DailyInsights actions', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('uses subdued semantic text for the edit-period action', () => {
    render(
      <LocaleProvider>
        <DailyInsights
          cycleInfo={{
            date: '2026-07-21',
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

    const editButton = screen.getByRole('button', {
      name: 'Edit Period Dates'
    });
    expect(editButton).toHaveClass('text-on-surface-variant');
    expect(editButton).not.toHaveClass('!text-primary/70');
  });
});
