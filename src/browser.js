const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const path = require('path');

// Apply stealth plugin to Playwright
chromium.use(stealth);

async function launchBrowser() {
    // Define path for persistent session data (keeps you logged into Facebook)
    const userDataDir = path.join(__dirname, '../session');

    // Launch persistent context (opens Chrome with your saved cookies/login state)
    const browserContext = await chromium.launchPersistentContext(userDataDir, {
        headless: false, // Set to true if you want it to run invisibly in the background later
        slowMo: 50,      // Slows down actions slightly to look more human
        args: [
            '--disable-blink-features=AutomationControlled',
            '--start-maximized'
        ],
        viewport: null   // Allows browser to use full maximized window size
    });

    // Get the first active page or create one if none exist
    const pages = browserContext.pages();
    const page = pages.length > 0 ? pages[0] : await browserContext.newPage();

    return { browserContext, page };
}

module.exports = { launchBrowser };