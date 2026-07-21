# Use Tailwind by Default with CSS Escape Hatches

DianaFlow frontend styling will use Tailwind utilities by default for application-owned layout, spacing, typography, semantic colors, responsive behavior, and interaction states. Plain CSS is reserved for centralized theme and base definitions, third-party markup, Bootstrap compatibility, animations, pseudo-elements, browser-specific selectors, and exceptional styling that Tailwind cannot express clearly; the same property on the same element should not be owned by both Tailwind and plain CSS. This hybrid boundary keeps new feature work predictable without forcing complex external or browser-controlled styling into unreadable utility expressions.

The convention applies immediately to new work. Existing styling will be migrated in stages: shared theme and compatibility foundations first, reusable components second, and page-specific styles when those pages are changed; legitimate escape-hatch CSS may remain.

The boundary will be explained in a frontend styling guide and protected with lightweight automated checks after the styling foundation is consolidated. Application-owned components will phase out Bootstrap and React Bootstrap so Tailwind remains their single styling system; this does not affect third-party widgets whose internal markup still requires scoped CSS.

The existing `--color-*` semantic tokens will become the only color source of truth and will continue to back Tailwind's semantic color utilities. Legacy token aliases, undefined variables, and raw component-level design colors will be removed; light and dark appearances will provide different values for the same semantic token names.

Allowed CSS will be organized by ownership: semantic variables in `src/styles/tokens.css`, Tailwind directives and document defaults in `src/styles/base.css`, and shared third-party overrides in `src/styles/vendor/`. A component-specific escape hatch may remain next to its component when its selectors are scoped beneath that component's root class. Page-specific rules and unrelated component rules will not live in global styles; any temporary Bootstrap compatibility stylesheet will be removed with Bootstrap.

Repeated application-owned visual patterns will be shared through React UI primitives with explicit variants, not through new CSS utility classes or general-purpose `@apply` abstractions. `@apply` is reserved for approved escape-hatch selectors that cannot receive Tailwind classes directly, such as third-party markup.

Tailwind arbitrary values are permitted only for genuinely one-off structural needs that the configured scale cannot express, and never for raw design colors. A repeated arbitrary value should be promoted to a named Tailwind token or encapsulated by a shared component; migrations should prefer the established scale rather than mechanically preserving insignificant legacy pixel differences.

Styling migrations will preserve existing behavior and visual appearance by default, including responsive layouts, both resolved Theme Preference appearances, focus states, and reduced-motion behavior. Small normalization onto the agreed Tailwind scale is allowed, but intentional visible redesigns must be separated from styling-ownership changes and documented explicitly.
