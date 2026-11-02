import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../../src/fixtures/test';
import { KNOWN_A11Y_ISSUES } from '../../src/utils/a11yBaseline';

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'login', path: '/login' },
  { name: 'products', path: '/products' },
  { name: 'cart', path: '/view_cart' },
];

test.describe('Accessibility (WCAG 2.1 A and AA)', { tag: '@a11y' }, () => {
  for (const { name, path } of PAGES) {
    test(`${name} page has no new accessibility issues`, async ({ page }, testInfo) => {
      await page.goto(path);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      // Full axe output in the report, for whoever fixes the issues
      await testInfo.attach(`axe-${name}.json`, {
        body: JSON.stringify(results.violations, null, 2),
        contentType: 'application/json',
      });

      const known = new Set(KNOWN_A11Y_ISSUES[name] ?? []);
      const found = results.violations.map((v) => v.id);
      const fixed = [...known].filter((id) => !found.includes(id));
      if (fixed.length) {
        testInfo.annotations.push({ type: 'a11y-fixed', description: `No longer found, remove from baseline: ${fixed.join(', ')}` });
      }

      const newIssues = results.violations
        .filter((v) => !known.has(v.id))
        .map((v) => `${v.id} (${v.impact}, ${v.nodes.length} elements): ${v.help}`);
      expect(newIssues, `New accessibility issues on the ${name} page`).toEqual([]);
    });
  }
});
