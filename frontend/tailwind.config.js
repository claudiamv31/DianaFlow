const semanticColorNames = [
  'primary', 'on-secondary-container', 'outline', 'outline-variant',
  'secondary-container', 'error-dim', 'primary-dim', 'on-primary-container',
  'surface', 'on-primary-fixed', 'tertiary', 'error',
  'surface-container-lowest', 'on-secondary', 'on-surface-variant',
  'surface-container-high', 'background', 'on-tertiary', 'on-error',
  'on-primary', 'inverse-on-surface', 'surface-container-highest',
  'on-tertiary-container', 'primary-fixed', 'error-container',
  'surface-bright', 'surface-container', 'primary-container', 'secondary-dim',
  'surface-dim', 'secondary-fixed', 'surface-variant', 'tertiary-fixed',
  'inverse-primary', 'on-background', 'surface-container-low',
  'on-tertiary-fixed-variant', 'on-primary-fixed-variant',
  'tertiary-fixed-dim', 'tertiary-dim', 'secondary', 'fertility',
  'primary-fixed-dim', 'on-surface', 'on-secondary-fixed-variant',
  'tertiary-container', 'on-error-container', 'inverse-surface',
  'surface-tint', 'on-secondary-fixed', 'secondary-fixed-dim',
  'on-tertiary-fixed', 'primary-gradient-start', 'accent-surface',
  'navigation-surface', 'shadow'
];

const semanticColors = Object.fromEntries(
  semanticColorNames.map((name) => [
    name,
    `rgb(var(--color-${name}) / <alpha-value>)`
  ])
);

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: semanticColors,
      borderRadius: {
        DEFAULT: "1rem",
        lg: "2rem",
        xl: "3rem",
        full: "9999px"
      },
      fontFamily: {
        headline: ["Plus Jakarta Sans"],
        body: ["Manrope"],
        label: ["Manrope"]
      },
      boxShadow: {
        soft: '0 12px 32px rgb(var(--color-shadow) / 0.06)',
        subtle: '0 12px 32px rgb(var(--color-shadow) / 0.04)',
        avatar: '0 8px 24px rgb(var(--color-shadow) / 0.08)',
        action: '0 10px 28px rgb(var(--color-primary-container) / 0.16)',
        glass: '0 16px 36px rgb(var(--color-shadow) / 0.18)'
      }
    },
  },
  plugins: [],
}
