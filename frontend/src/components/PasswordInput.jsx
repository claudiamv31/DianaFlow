import { useState } from 'react';
import { useLocale } from '../i18n/LocaleContext';

export default function PasswordInput({
  className = '',
  requiredMessage,
  ...inputProps
}) {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLocale();
  const toggleLabel = t(
    isVisible ? 'password.hidePassword' : 'password.showPassword'
  );

  return (
    <>
      <div className="relative">
        <input
          {...inputProps}
          type={isVisible ? 'text' : 'password'}
          className={`${className} pr-14 ${requiredMessage ? 'sm:pr-40' : ''}`}
        />
        {requiredMessage && (
          <span className="mx-1 mt-2 block text-xs font-semibold text-error sm:pointer-events-none sm:absolute sm:right-14 sm:top-1/2 sm:m-0 sm:-translate-y-1/2 sm:whitespace-nowrap sm:rounded-full sm:border sm:border-error/30 sm:bg-surface-container-lowest sm:px-2.5 sm:py-1 sm:font-bold sm:leading-none">
            {requiredMessage}
          </span>
        )}
        <button
          type="button"
          aria-label={toggleLabel}
          aria-pressed={isVisible}
          className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          onClick={() => setIsVisible((current) => !current)}
        >
          <span aria-hidden="true" className="material-symbols-outlined text-xl">
            {isVisible ? 'visibility_off' : 'visibility'}
          </span>
        </button>
      </div>
    </>
  );
}
