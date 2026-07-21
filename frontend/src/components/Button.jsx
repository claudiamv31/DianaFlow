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
    'flex items-center justify-center gap-2 rounded-full border border-transparent bg-gradient-to-l from-primary-gradient-start to-primary px-6 py-3 font-headline text-base font-semibold text-on-primary outline-none transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:scale-100 disabled:opacity-50 dark:bg-none dark:bg-primary-container dark:shadow-action dark:hover:brightness-[0.94]';

  const variants = {
    primary: 'shadow-lg shadow-primary/20',
    outline: '',
    secondary: ''
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
