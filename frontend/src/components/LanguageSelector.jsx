import { useLocale } from '../i18n/LocaleContext';
import { locales } from '../i18n/locales';

const LanguageSelector = () => {
  const { locale, setLocale, t } = useLocale();

  return (
    <label className="inline-flex items-center gap-2 text-sm text-[var(--label-color)]">
      <span className="sr-only">{t('language.label')}</span>
      <span aria-hidden="true" className="material-symbols-outlined text-lg">
        language
      </span>
      <select
        aria-label={t('language.label')}
        className="rounded-full border border-outline-variant/40 bg-white px-3 py-2 text-sm font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
        value={locale}
        onChange={(event) => setLocale(event.target.value)}
      >
        {locales.map(({ id, labelKey }) => (
          <option key={id} value={id}>
            {t(labelKey)}
          </option>
        ))}
      </select>
    </label>
  );
};

export default LanguageSelector;
