import { fireEvent, render, screen } from '@testing-library/react';
import LanguageSelector from '../components/LanguageSelector';
import { LocaleProvider, useLocale } from './LocaleContext';

const TranslatedNavigation = () => {
  const { t } = useLocale();
  return <span>{t('nav.home')}</span>;
};

const PluralizedDuration = ({ count }) => {
  const { t } = useLocale();
  return <span>{t('cycle.durationValue', { count })}</span>;
};

describe('language selection', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.spyOn(window.navigator, 'languages', 'get').mockReturnValue(['en-US']);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('uses English by default', () => {
    render(
      <LocaleProvider>
        <LanguageSelector />
        <TranslatedNavigation />
      </LocaleProvider>
    );

    expect(screen.getByRole('combobox', { name: 'Language' })).toHaveValue(
      'en-US'
    );
  });

  test('switches to Spanish and remembers the selection', () => {
    const { unmount } = render(
      <LocaleProvider>
        <LanguageSelector />
        <TranslatedNavigation />
      </LocaleProvider>
    );

    fireEvent.change(screen.getByRole('combobox', { name: 'Language' }), {
      target: { value: 'es-MX' }
    });

    expect(screen.getByRole('combobox', { name: 'Idioma' })).toHaveValue(
      'es-MX'
    );
    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('lang', 'es-MX');
    unmount();

    render(
      <LocaleProvider>
        <LanguageSelector />
      </LocaleProvider>
    );

    expect(screen.getByRole('combobox', { name: 'Idioma' })).toHaveValue(
      'es-MX'
    );
  });

  test('matches a first-time visitor to a supported browser language', () => {
    jest.spyOn(window.navigator, 'languages', 'get').mockReturnValue(['es-ES']);

    render(
      <LocaleProvider>
        <LanguageSelector />
      </LocaleProvider>
    );

    expect(screen.getByRole('combobox', { name: 'Idioma' })).toHaveValue(
      'es-MX'
    );
    expect(document.documentElement).toHaveAttribute('dir', 'ltr');
  });

  test('uses locale-aware plural forms', () => {
    const { rerender } = render(
      <LocaleProvider>
        <PluralizedDuration count={1} />
      </LocaleProvider>
    );

    expect(screen.getByText('1 day')).toBeInTheDocument();

    rerender(
      <LocaleProvider>
        <PluralizedDuration count={2} />
      </LocaleProvider>
    );
    expect(screen.getByText('2 days')).toBeInTheDocument();
  });
});
