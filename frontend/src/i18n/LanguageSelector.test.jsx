import { fireEvent, render, screen } from '@testing-library/react';
import LanguageSelector from '../components/LanguageSelector';
import { LocaleProvider, useLocale } from './LocaleContext';

const TranslatedNavigation = () => {
  const { t } = useLocale();
  return <span>{t('nav.home')}</span>;
};

describe('language selection', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('uses English by default', () => {
    render(
      <LocaleProvider>
        <LanguageSelector />
        <TranslatedNavigation />
      </LocaleProvider>
    );

    expect(screen.getByRole('combobox', { name: 'Language' })).toHaveValue(
      'en'
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
      target: { value: 'es' }
    });

    expect(screen.getByRole('combobox', { name: 'Idioma' })).toHaveValue('es');
    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('lang', 'es');
    unmount();

    render(
      <LocaleProvider>
        <LanguageSelector />
      </LocaleProvider>
    );

    expect(screen.getByRole('combobox', { name: 'Idioma' })).toHaveValue('es');
  });
});
