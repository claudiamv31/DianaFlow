# Frontend Styling Guide

Tailwind is the default styling system for DianaFlow-owned UI. Plain CSS is an explicit escape hatch or a temporarily registered legacy file, not an equivalent first choice. The architectural rationale is recorded in [ADR-0001](./adr/0001-use-tailwind-by-default-with-css-escape-hatches.md).

## Decision tree

1. If an existing shared React component owns the visual pattern, use or extend that component through an explicit variant.
2. Otherwise, compose Tailwind utilities in the component for layout, spacing, typography, semantic colors, responsive behavior, and interaction states.
3. Use a co-located CSS file only when the rule requires selectors the component cannot apply directly, such as pseudo-elements, keyframes, browser-specific selectors, or third-party DOM.
4. Put overrides shared by a third-party package in `src/styles/vendor/`.
5. Register every plain CSS file in `styling-contract.json` with its ownership category and reason. New `legacy` entries are not allowed in review.

Do not let Tailwind and plain CSS own the same property on the same element. Do not create general-purpose CSS utilities with `@apply`; share recurring application patterns through React components instead.

## File ownership

- `src/styles/tokens.css` contains semantic theme variables and non-color design tokens.
- `src/styles/base.css` contains Tailwind directives and document-wide element defaults.
- `src/styles/vendor/` contains shared third-party overrides.
- Component-adjacent CSS contains only a component-owned escape hatch or registered legacy rules awaiting staged migration. Selectors must be scoped beneath the component root.

## Tokens and Tailwind values

Use semantic Tailwind colors such as `text-on-surface`, `bg-surface-container`, and `border-outline`. Plain CSS references the same source through `rgb(var(--color-...))`. Light and dark appearances redefine the same token names in `tokens.css`.

Raw hex, RGB, or HSL design colors are prohibited outside `tokens.css`. A technical value that cannot be a semantic token must be registered narrowly in `rawColorExceptions` with a reason.

Prefer the configured Tailwind scales. An arbitrary structural value is acceptable when it is genuinely one-off; if it repeats three times, promote it to `tailwind.config.js` with a meaningful name or encapsulate it in a shared component. Arbitrary raw colors are never allowed.

## Migration checklist

- Preserve behavior, responsive layout, light and dark appearances, focus states, and reduced-motion behavior.
- Keep redesigns separate from styling-ownership migrations.
- Remove a `legacy` registry entry when its file is migrated; do not replace it with a new generic stylesheet.
- Run `npm run lint`, focused component tests, the full test suite, and `npm run build`.
- Visually check representative mobile and desktop screens in both resolved Theme Preference appearances.
