import { fireEvent, render, screen } from '@testing-library/react';
import LogTodayModal from './LogTodayModal';
import apiClient from '../../api/apiClient';

jest.mock('../../api/apiClient', () => ({
  get: jest.fn(),
  post: jest.fn()
}));

jest.mock('../../i18n/LocaleContext', () => ({
  useLocale: () => ({
    locale: 'en-US',
    t: (key) => key
  })
}));

describe('LogTodayModal', () => {
  beforeEach(() => {
    apiClient.get.mockImplementation((url) => {
      if (url.includes('/catalog')) {
        return Promise.resolve({ data: [{ id: 1, code: 'headache', category: 'physical', allowsSeverity: true }] });
      }
      return Promise.resolve({ data: [] });
    });
  });

  it('keeps a symptom selected after clicking it', async () => {
    render(<LogTodayModal todayDate="2026-08-11" onClose={jest.fn()} />);

    const symptom = await screen.findByRole('button', { name: 'symptom.headache' });
    fireEvent.click(symptom);

    expect(await screen.findByRole('button', { name: 'severity.mild' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /symptom\.headache/ })).toHaveTextContent('✓');
  });

  it('shows severity controls only for symptoms that allow it', async () => {
    apiClient.get.mockImplementation((url) => {
      if (url.includes('/catalog')) {
        return Promise.resolve({ data: [
          { id: 1, code: 'headache', category: 'physical', allowsSeverity: true },
          { id: 2, code: 'fatigue', category: 'physical', allowsSeverity: false }
        ] });
      }
      return Promise.resolve({ data: [] });
    });

    render(<LogTodayModal todayDate="2026-08-11" onClose={jest.fn()} />);

    fireEvent.click(await screen.findByRole('button', { name: 'symptom.headache' }));
    fireEvent.click(screen.getByRole('button', { name: 'symptom.fatigue' }));

    expect(screen.getByRole('group', { name: 'symptoms.severityLabel' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'severity.mild' })).toHaveLength(1);
  });

  it('uses theme-aware colors for the close button', async () => {
    render(<LogTodayModal todayDate="2026-08-11" onClose={jest.fn()} />);
    await screen.findByRole('button', { name: 'symptom.headache' });

    expect(screen.getByRole('button', { name: 'common.close' })).toHaveClass(
      'bg-surface-container-high',
      'text-on-surface'
    );
  });
});
