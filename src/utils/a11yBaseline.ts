/**
 * Accessibility issues that already exist on the site under test, per page,
 * as axe rule ids (recorded on 2 Nov 2026). We can't fix the demo site, so the
 * tests fail only on NEW issues (a regression) instead of failing forever on
 * known ones. When a known issue disappears, the test adds a note so the
 * baseline can shrink.
 *
 *  - color-contrast: grey text on white below the 4.5:1 ratio (WCAG 1.4.3)
 *  - button-name:    icon-only buttons with no text or aria-label (WCAG 4.1.2)
 *  - link-name:      icon-only links (carousel arrows, social icons) (WCAG 2.4.4)
 */
export const KNOWN_A11Y_ISSUES: Record<string, string[]> = {
  home: ['button-name', 'color-contrast', 'link-name'],
  login: ['button-name', 'color-contrast'],
  products: ['button-name', 'color-contrast'],
  cart: ['button-name', 'color-contrast'],
};
