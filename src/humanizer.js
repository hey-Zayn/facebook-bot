// Helper for random math delays between min and max
const randomDelay = (min, max) => {
    const ms = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, ms));
};

// Human-like typing with micro-pauses per keystroke
async function humanType(page, selector, text) {
    await page.click(selector);
    for (const char of text) {
        await page.type(selector, char, { delay: Math.random() * 100 + 50 }); // 50ms to 150ms per key
    }
}

// Facebook Reels scroll fix using keyboard PageDown simulation
async function humanScroll(page) {
    // Facebook snaps to the next reel when pressing PageDown or ArrowDown
    await page.keyboard.press('PageDown');
}

module.exports = { randomDelay, humanType, humanScroll };