import { test, expect } from '@playwright/test';

test('Telugu text split does not break conjuncts', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Wait for preloader to finish
  await page.waitForTimeout(3000);

  // Check the heading elements, ensure they contain graphemes safely
  const headingSpans = page.locator('h1[lang="te"] span[aria-hidden="true"]');
  
  const spanCount = await headingSpans.count();
  
  // Specifically look for broken conjuncts like half-letters which show up as missing or replacement chars if split incorrectly
  for (let i = 0; i < spanCount; i++) {
    const text = await headingSpans.nth(i).innerText();
    
    // A broken Telugu conjunct might result in isolated halant (\u0C4D) at start or end of a span.
    // E.g., 'అర్థం' split by char -> 'అ', 'ర', '్', 'థ', 'ం'.
    // If we split by grapheme, 'ర్థ' will be a single segment.
    expect(text.startsWith('\u0C4D')).toBe(false);
  }
});
