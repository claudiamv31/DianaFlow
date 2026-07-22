import { render, screen } from '@testing-library/react';
import { LocaleProvider } from '../../../i18n/LocaleContext';
import CycleInsightsCard from './CycleInsigthCard';

describe('CycleInsightsCard', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('renders a translated regularity label for API enum casing', () => {
    render(
      <LocaleProvider>
        <CycleInsightsCard
          previousCycle={{
            cycleLength: 28,
            consistency: 'Regular',
            days: 5,
            startDate: '2026-07-01'
          }}
        />
      </LocaleProvider>
    );

    expect(screen.getByText('Regular')).toBeInTheDocument();
    expect(screen.queryByText('regularity.Regular')).not.toBeInTheDocument();
  });
});
