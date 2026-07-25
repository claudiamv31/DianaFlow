import React from 'react';

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
  ...props
}) {
  const baseStyle =
    'flex items-center justify-center gap-2 rounded-full px-6 py-3 font-headline text-base font-semibold outline-none transition-all duration-200 active:scale-[0.98] disabled:scale-100 disabled:opacity-50';

  const variants = {
    primary:
      'border border-transparent bg-gradient-to-l from-primary-gradient-start to-primary text-on-primary shadow-lg shadow-primary/20 hover:brightness-110 dark:bg-none dark:bg-primary-container dark:shadow-action dark:hover:brightness-[0.94]',
    outline:
      'border border-primary/30 bg-transparent text-primary hover:bg-primary/5',
    secondary:
      'border border-transparent bg-surface-container-high text-on-surface hover:bg-surface-variant'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
