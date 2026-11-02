/**
 * Accessibility issues that already exist on the site under test, per page,
 * as axe rule ids. We can't fix the demo site, so the tests fail only on NEW
 * issues (a regression) instead of failing forever on known ones. When a known
 * issue disappears, the test adds a note so the baseline can shrink.
 */
export const KNOWN_A11Y_ISSUES: Record<string, string[]> = {};
