import React from 'react';

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // 'primary', 'outline', 'secondary'
  className = '',
  disabled = false,
  ...props
}) {
  const baseStyle =
    'py-3 px-6 rounded-full font-headline font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2 select-none active:scale-[0.98] outline-none';

  const variants = {
    primary: 'main-btn text-white shadow-lg shadow-primary/20 hover:bg-primary-dim disabled:opacity-50 disabled:scale-100',
    outline: 'main-btn text-primary/70 hover:bg-primary/5 disabled:opacity-50 disabled:scale-100',
    secondary: 'main-btn text-[#34322f] hover:bg-[#ECE7E3]/80 disabled:opacity-50 disabled:scale-100'
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
