module.exports = {
    // Delays in milliseconds (min, max) to mimic human wait times
    delays: {
        minWatchTime: 6000,   // 6 seconds minimum on a reel
        maxWatchTime: 14000,  // 14 seconds maximum on a reel
        minActionWait: 2000,  // Wait before clicking like/comment
        maxActionWait: 5000,
        cooldownTime: 180000  // 3-minute break between major shifts
    },

    // Limits
    limits: {
        maxGeneralReelsPerSession: 10,
        maxTargetReelsPerSession: 5
    },

    // URLs
    urls: {
        generalReels: 'https://www.facebook.com/reels',
    }
};