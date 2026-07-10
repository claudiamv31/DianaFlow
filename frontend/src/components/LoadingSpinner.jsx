import { useEffect, useState } from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({
  size = 'md',
  layout = 'page',
  tone = 'default',
  label = 'Loading',
  showLabel = false,
  className = ''
}) => {
  const [isColdStartRetrying, setIsColdStartRetrying] = useState(false);
  const statusLabel = isColdStartRetrying ? 'Waking up DianaFlow...' : label;
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
