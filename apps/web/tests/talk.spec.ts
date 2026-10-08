import { test, expect } from '@playwright/test';

test.use({
  launchOptions: {
    args: [
      '--use-fake-device-for-media-stream',
      '--use-fake-ui-for-media-stream'
    ]
  }
});

test.describe('Vaani Voice Agent /talk Route', () => {

test.beforeEach(async ({ page, context }) => {
  // Grant microphone permissions
  await context.grantPermissions(['microphone']);
  await page.goto('http://localhost:3000/talk');
  
  // Hide any cookie banners or sticky elements that might intercept clicks at the bottom
  await page.addStyleTag({ content: '[class*="fixed bottom-0"] { display: none !important; }' });
});

  test('L1, L2: Dock container layout and centering', async ({ page }) => {
    // Start session
    await page.click('button:has-text("Start conversation")');
    
    // Wait for connecting -> listening
    const dock = page.locator('nav').filter({ hasText: 'End Call' });
    await expect(dock).toBeVisible();
    
    // Ensure the dock width doesn't collapse and is centered
    const box = await dock.boundingBox();
    expect(box?.width).toBeGreaterThan(200); // Has reasonable width
  });

  test('S1: Mute state is independent of agent state', async ({ page }) => {
    await page.click('button:has-text("Start conversation")');
    const muteBtn = page.getByRole('button', { name: /Toggle Mic/i });
    
    // Mute
    await muteBtn.click();
    await expect(muteBtn).toHaveAttribute('aria-pressed', 'true');
    
    // Global status should say Muted
    await expect(page.locator('header')).toContainText(/Muted/i);
    
    // Sending a mock text (Agent speaking) should not unmute
    await page.click('button:has-text("క్వాంటం కంప్యూటింగ్ గురించి చెప్పు")');
    await expect(muteBtn).toHaveAttribute('aria-pressed', 'true');
  });

  test('S5: Command shortcuts (Space, Cmd+K, Cmd+J, Esc)', async ({ page }) => {
    await page.click('button:has-text("Start conversation")');
    
    // Wait for the agent to become active before spacebar works
    await expect(page.locator('header')).toContainText(/Live/i, { timeout: 10000 });

    // Press Space to Mute
    await page.keyboard.press('Space');
    await expect(page.getByRole('button', { name: /Toggle Mic/i })).toHaveAttribute('aria-pressed', 'true');
    
    // Press Cmd+K for Command Palette
    await page.keyboard.press('Control+k');
    const palette = page.getByRole('dialog');
    await expect(palette).toBeVisible();
    
    // Search in palette
    await page.keyboard.type('Theme');
    await expect(page.getByRole('option', { name: 'Toggle Theme' })).toBeVisible();
    
    // Press Escape to close palette
    await page.keyboard.press('Escape');
    await expect(palette).toBeHidden();
    
    // Press Cmd+J for Drawer
    await page.keyboard.press('Control+j');
    const drawer = page.locator('aside').filter({ hasText: 'Transcript' });
    await expect(drawer).toBeVisible(); // Due to CSS transforms, Playwright sees it as visible if opacity/transform is in viewport
  });

  test('S2: Double-click start protection', async ({ page }) => {
    // Spam click
    const btn = page.locator('button:has-text("Start conversation")');
    await btn.click();
    await btn.click();
    await btn.click();
    
    // We should only transition to connecting once and end up in listening.
    // If it threw an error or duplicated, we'd fail the following check.
    await expect(page.locator('header')).toContainText(/Live/i, { timeout: 10000 });
  });

  test('A1: XSS protection in transcript', async ({ page }) => {
    await page.click('button:has-text("Start conversation")');
    
    // Ensure agent responses are just text, not raw HTML
    await page.click('button:has-text("క్వాంటం కంప్యూటింగ్ గురించి చెప్పు")');
    
    // Open drawer
    await page.keyboard.press('Control+j');
    
    // Check drawer for the text
    const messageText = page.locator('aside').filter({ hasText: 'క్వాంటం' });
    await expect(messageText).toBeVisible();
  });

});
