import { useLocale } from '../i18n/LocaleContext';
import { useTheme } from '../theme/ThemeContext';
import { THEME_PREFERENCES } from '../theme/theme';

const ThemeSelector = () => {
  const { t } = useLocale();
  const { themePreference, setThemePreference } = useTheme();

  return (
    <label className="relative inline-flex shrink-0 items-center text-sm text-on-surface-variant">
      <span className="sr-only">{t('theme.label')}</span>
      <select
        aria-label={t('theme.label')}
        className="appearance-none rounded-full bg-transparent py-2 pl-3 pr-8 text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        value={themePreference}
        onChange={(event) => setThemePreference(event.target.value)}
      >
        <option value={THEME_PREFERENCES.SYSTEM}>{t('theme.system')}</option>
        <option value={THEME_PREFERENCES.LIGHT}>{t('theme.light')}</option>
        <option value={THEME_PREFERENCES.DARK}>{t('theme.dark')}</option>
      </select>
      <span
        aria-hidden="true"
        className="material-symbols-outlined pointer-events-none absolute right-1 text-xl text-outline-variant"
      >
        expand_more
      </span>
    </label>
  );
};

export default ThemeSelector;
