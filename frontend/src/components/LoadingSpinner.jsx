import './LoadingSpinner.css';

const LoadingSpinner = ({
  size = 'md',
  layout = 'page',
  tone = 'default',
  label = 'Loading',
  className = ''
}) => {
  const classNames = [
    'loading-spinner',
    `loading-spinner--${size}`,
    `loading-spinner--${layout}`,
    `loading-spinner--${tone}`,
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames} role="status" aria-label={label} aria-live="polite">
      <span className="loading-spinner__ring" aria-hidden="true" />
    </div>
  );
};

export default LoadingSpinner;
