import { useEffect, useState } from 'react';
import './LoadingSpinner.css';
import { useLocale } from '../i18n/LocaleContext';

const LoadingSpinner = ({
  size = 'md',
  layout = 'page',
  tone = 'default',
  label,
  showLabel = false,
  className = ''
}) => {
  const { t } = useLocale();
  const [isColdStartRetrying, setIsColdStartRetrying] = useState(false);
  const statusLabel = isColdStartRetrying
    ? t('common.wakingApp')
    : label || t('common.loading');
  const shouldShowLabel = showLabel || isColdStartRetrying;
  const classNames = [
    'loading-spinner',
    `loading-spinner--${size}`,
    `loading-spinner--${layout}`,
    `loading-spinner--${tone}`,
    className
  ]
    .filter(Boolean)
    .join(' ');

  useEffect(() => {
    const handleColdStartRetry = (event) => {
      setIsColdStartRetrying(event.detail?.isRetrying === true);
    };

    window.addEventListener('dianaflow:cold-start-retry', handleColdStartRetry);

    return () => {
      window.removeEventListener(
        'dianaflow:cold-start-retry',
        handleColdStartRetry
      );
    };
  }, []);

  return (
    <div
      className={classNames}
      role="status"
      aria-label={statusLabel}
      aria-live="polite"
    >
      <span className="loading-spinner__ring" aria-hidden="true" />
      {shouldShowLabel && (
        <span className="loading-spinner__label">{statusLabel}</span>
      )}
    </div>
  );
};

export default LoadingSpinner;
