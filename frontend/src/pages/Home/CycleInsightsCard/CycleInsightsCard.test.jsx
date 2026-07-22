import { render, screen, within } from '@testing-library/react';
import { LocaleProvider } from '../../../i18n/LocaleContext';
import { LOCALE_STORAGE_KEY } from '../../../i18n/locales';
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

  test('aligns all four Spanish summary values on one two-column grid', () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'es-MX');

    render(
      <LocaleProvider>
        <CycleInsightsCard
          previousCycle={{
            cycleLength: 29,
            consistency: 'regular',
            days: 6,
            startDate: '2026-06-22'
          }}
        />
      </LocaleProvider>
    );

    const summaryGrid = screen.getByTestId('cycle-summary-grid');
    expect(summaryGrid).toHaveClass('grid', 'grid-cols-2');
    expect(within(summaryGrid).getAllByTestId('cycle-summary-item')).toHaveLength(
      4
    );
  });
});
