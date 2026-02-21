const { test, expect } = require('@playwright/test');

test.describe('Focus styles verification', () => {
  test('verify focus styles on interactive elements', async ({ page }) => {
    // Assumes server is running on port 8000, consistent with other tests
    await page.goto('http://127.0.0.1:8000/index.html');

    // Verify .note-btn has focus-visible rule
    const noteBtnHasFocusStyle = await page.evaluate(() => {
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.selectorText && rule.selectorText.includes('.note-btn:focus-visible')) {
              return true;
            }
          }
        } catch (e) {}
      }
      return false;
    });
    expect(noteBtnHasFocusStyle).toBe(true);

    // Verify .amb-tab has focus-visible rule
    const ambTabHasFocusStyle = await page.evaluate(() => {
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.selectorText && rule.selectorText.includes('.amb-tab:focus-visible')) {
              return true;
            }
          }
        } catch (e) {}
      }
      return false;
    });
    expect(ambTabHasFocusStyle).toBe(true);

    // Verify .mode-btn has focus-visible rule
    const modeBtnHasFocusStyle = await page.evaluate(() => {
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.selectorText && rule.selectorText.includes('.mode-btn:focus-visible')) {
              return true;
            }
          }
        } catch (e) {}
      }
      return false;
    });
    expect(modeBtnHasFocusStyle).toBe(true);

    // Verify .btn has focus-visible rule
    const btnHasFocusStyle = await page.evaluate(() => {
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.selectorText && rule.selectorText.includes('.btn:focus-visible')) {
              return true;
            }
          }
        } catch (e) {}
      }
      return false;
    });
    expect(btnHasFocusStyle).toBe(true);
  });
});
