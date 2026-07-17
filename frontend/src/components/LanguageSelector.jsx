import { useLocale } from '../i18n/LocaleContext';
import { userSelectableLocales } from '../i18n/locales';

const LanguageSelector = ({ variant = 'compact' }) => {
  const { locale, setLocale, t } = useLocale();
  const isSettings = variant === 'settings';

  return (
    <label
      className={`relative inline-flex items-center text-sm text-[var(--label-color)] ${
        isSettings ? 'shrink-0' : 'gap-2'
      }`}
    >
      <span className="sr-only">{t('language.label')}</span>
      {!isSettings && (
        <span aria-hidden="true" className="material-symbols-outlined text-lg">
          language
        </span>
      )}
      <select
        aria-label={t('language.label')}
        className={
          isSettings
            ? 'appearance-none rounded-full bg-transparent py-2 pl-3 pr-8 text-sm font-semibold text-primary/100 focus:outline-none focus:ring-2 focus:ring-primary/20'
            : 'rounded-full border border-outline-variant/40 bg-surface-container-lowest px-3 py-2 text-sm font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30'
        }
        value={locale}
        onChange={(event) => setLocale(event.target.value)}
      >
        {userSelectableLocales.map(({ code, label }) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </select>
      {isSettings && (
        <span
          aria-hidden="true"
          className="material-symbols-outlined pointer-events-none absolute right-1 text-xl text-outline-variant"
        >
          expand_more
        </span>
      )}
    </label>
  );
};

export default LanguageSelector;
