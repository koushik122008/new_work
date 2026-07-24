const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  let hasErrors = false;
  page.on('pageerror', error => {
    console.error('Page error:', error);
    hasErrors = true;
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('Console error:', msg.text());
      hasErrors = true;
    }
  });

  await page.goto('http://localhost:8000/index.html');
  await page.waitForTimeout(2000); // Wait for some frames to run

  await browser.close();

  if (hasErrors) {
    process.exit(1);
  } else {
    console.log("No console errors detected.");
    process.exit(0);
  }
})();
