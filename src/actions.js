const fs = require('fs');
const path = require('path');
const { randomDelay, humanType, humanScroll } = require('./humanizer');

// Load comments from JSON
const commentsPath = path.join(__dirname, '../data/comments.json');
const comments = JSON.parse(fs.readFileSync(commentsPath, 'utf8'));

// Helper to get a random comment
function getRandomComment() {
    const index = Math.floor(Math.random() * comments.length);
    return comments[index];
}

// Function to click the first reel thumbnail on a page/profile grid to enter full-screen player
async function openFirstReel(page) {
    try {
        const reelLinkSelector = 'a[href*="/reel/"]';
        await page.waitForSelector(reelLinkSelector, { timeout: 8000 });

        const clicked = await page.evaluate((selector) => {
            const firstReel = document.querySelector(selector);
            if (firstReel) {
                firstReel.click();
                return true;
            }
            return false;
        }, reelLinkSelector);

        if (clicked) {
            console.log('🎬 Clicked the first reel thumbnail to open full-screen player!');
        } else {
            console.log('⚠️ Could not find any reel thumbnails on this page.');
        }

        await randomDelay(4000, 6000);
    } catch (error) {
        console.log('⚠️ Error opening the first reel from grid:', error.message);
    }
}

// Function to Like the current Reel
async function likeReel(page) {
    try {
        const likeButtonSelector = 'div[aria-label="Like"], div[aria-label="Like element"]';
        await page.waitForSelector(likeButtonSelector, { timeout: 5000 });

        const liked = await page.evaluate((selector) => {
            const btn = document.querySelector(selector);
            if (btn) {
                btn.click();
                return true;
            }
            return false;
        }, likeButtonSelector);

        if (liked) {
            console.log('❤️ Liked a reel successfully!');
        } else {
            console.log('⚠️ Like button element not found.');
        }

        await randomDelay(1000, 2000);
    } catch (error) {
        console.log('⚠️ Could not find like button or already liked.');
    }
}

// Function to Comment on the current Reel (Opens comment drawer first if needed)
async function commentOnReel(page) {
    try {
        const commentText = getRandomComment();
        const commentBoxSelector = 'div[aria-label="Write a comment"], div[contenteditable="true"][role="textbox"]';

        // Check if comment box is already open; if not, click the comment button to open the drawer
        let boxVisible = await page.$(commentBoxSelector);
        if (!boxVisible) {
            const commentButtonSelector = 'div[aria-label="Comment"], div[aria-label*="comment"]';
            try {
                await page.waitForSelector(commentButtonSelector, { timeout: 3000 });
                await page.evaluate((sel) => {
                    const btn = document.querySelector(sel);
                    if (btn) btn.click();
                }, commentButtonSelector);
                await randomDelay(1500, 2500); // Wait for drawer to slide open
            } catch (e) {
                // Proceed if button selector varies
            }
        }

        await page.waitForSelector(commentBoxSelector, { timeout: 5000 });
        await humanType(page, commentBoxSelector, commentText);

        await page.keyboard.press('Enter');
        console.log(`💬 Commented: "${commentText}"`);

        await randomDelay(2000, 4000);
    } catch (error) {
        console.log('⚠️ Could not post comment on this reel.');
    }
}

module.exports = { openFirstReel, likeReel, commentOnReel, humanScroll };