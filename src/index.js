const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { launchBrowser } = require('./browser');
const { randomDelay, humanScroll } = require('./humanizer');
const { openFirstReel, likeReel, commentOnReel } = require('./actions');
const settings = require('../config/settings');

// Load and filter valid target pages from JSON
const targetsPath = path.join(__dirname, '../data/targets.json');
const targetPages = JSON.parse(fs.readFileSync(targetsPath, 'utf8')).filter(url => url && url.trim().length > 0);

// Helper to wait for user input in terminal
function waitForUser(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }));
}

async function runBot() {
    console.log('🚀 Starting Facebook Reels Bot (Cyclical Mode)...');
    const { browserContext, page } = await launchBrowser();

    try {
        // 1. Initial Navigation to General Facebook Reels Feed (Fixed timeout with domcontentloaded)
        console.log('🌐 Navigating to Facebook Reels...');
        await page.goto(settings.urls.generalReels, { waitUntil: 'domcontentloaded' });
        await randomDelay(4000, 7000);

        // Check if redirected to login page
        if (page.url().includes('login') || page.url().includes('checkpoint')) {
            console.log('\n⚠️ It looks like you are not logged into Facebook!');
            console.log('👉 Please look at the opened browser window and log into your Facebook account manually.');
            await waitForUser('\n👉 Once you are fully logged in and can see your feed, press [ENTER] here in the terminal to continue...');
            console.log('✅ Resuming bot execution... Session saved!');
            await randomDelay(3000, 5000);
        }

        let cycleCount = 1;

        // Continuous Loop (Runs cycle after cycle)
        while (true) {
            console.log(`\n========================================`);
            console.log(`🔄 STARTING AUTOMATION CYCLE #${cycleCount}`);
            console.log(`========================================`);

            // --- Phase 1: General Reels Feed Exploration ---
            console.log('📺 [Phase 1] Exploring General Reels Feed...');
            await page.goto(settings.urls.generalReels, { waitUntil: 'domcontentloaded' });
            await randomDelay(4000, 6000);

            for (let i = 0; i < settings.limits.maxGeneralReelsPerSession; i++) {
                console.log(`--- General Reel [${i + 1} / ${settings.limits.maxGeneralReelsPerSession}] ---`);

                const watchTime = Math.floor(Math.random() * (settings.delays.maxWatchTime - settings.delays.minWatchTime)) + settings.delays.minWatchTime;
                console.log(`⏳ Watching reel for ${(watchTime / 1000).toFixed(1)} seconds...`);
                await randomDelay(watchTime, watchTime + 2000);

                // 60% chance to like the reel
                if (Math.random() > 0.4) {
                    await likeReel(page);
                }

                // Scroll to next reel
                await humanScroll(page);
                await randomDelay(2000, 4000);
            }

            // --- Phase 2: Target Page Reels & Commenting ---
            if (targetPages.length > 0) {
                console.log('\n🎯 [Phase 2] Switching to Target Pages...');

                for (const targetUrl of targetPages) {
                    console.log(`🔗 Navigating to target page: ${targetUrl}`);
                    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
                    await randomDelay(4000, 6000);

                    // Click the first reel in the grid to open the full-screen player
                    await openFirstReel(page);

                    for (let j = 0; j < settings.limits.maxTargetReelsPerSession; j++) {
                        console.log(`--- Target Reel [${j + 1} / ${settings.limits.maxTargetReelsPerSession}] ---`);

                        const watchTime = Math.floor(Math.random() * (settings.delays.maxWatchTime - settings.delays.minWatchTime)) + settings.delays.minWatchTime;
                        console.log(`⏳ Watching target reel for ${(watchTime / 1000).toFixed(1)} seconds...`);
                        await randomDelay(watchTime, watchTime + 2000);

                        // Like target reel
                        await likeReel(page);

                        // 50% chance to comment on target page reels
                        if (Math.random() > 0.5) {
                            await commentOnReel(page);
                        }

                        // Scroll to next reel
                        await humanScroll(page);
                        await randomDelay(3000, 5000);
                    }
                }
            } else {
                console.log('ℹ️ No valid target pages found in `data/targets.json`. Skipping Phase 2.');
            }

            // --- Phase 3: Human Break / Cooldown (5 to 10 Minutes) ---
            const breakTime = Math.floor(Math.random() * (600000 - 300000 + 1)) + 300000;
            console.log(`\n☕ Cycle #${cycleCount} completed! Taking a human break for ${(breakTime / 60000).toFixed(1)} minutes before next cycle...`);

            await randomDelay(breakTime, breakTime + 5000);
            cycleCount++;
        }

    } catch (error) {
        console.error('❌ An error occurred during bot execution:', error);
    } finally {
        console.log('🔒 Closing browser session.');
        await browserContext.close();
    }
}

runBot();