/**
 * Betting Service - "Wettbüro"
 * Handles odds calculation and payout logic (Parimutuel Betting)
 */

// Calculate dynamic odds based on the current pool
// Returns an object: { [targetId]: odds }
// Logic: Odds = Total Pool / Amount Bet on Target
// If no bets on target, return fallback odds.
export const calculateOdds = (bets, participants) => {
    const odds = {};
    const totalPool = {
        winner: 0,
        loser: 0,
        maxScore: 0
    };

    const pools = {
        winner: {},
        loser: {},
        maxScore: { yes: 0, no: 0 }
    };

    // 1. Initialize Pools
    participants.forEach(p => {
        pools.winner[p.name] = 0;
        pools.loser[p.name] = 0;
    });

    // 2. Aggregate Bets
    bets.forEach(bet => {
        if (!totalPool[bet.type]) totalPool[bet.type] = 0;
        totalPool[bet.type] += bet.amount;

        if (bet.type === 'winner' || bet.type === 'loser') {
            if (!pools[bet.type][bet.target]) pools[bet.type][bet.target] = 0;
            pools[bet.type][bet.target] += bet.amount;
        } else if (bet.type === 'max_score') {
            // Target is "yes" (someone hit it) or "no" (nobody hit it) ?? 
            // Simplified: User bets on a SPECIFIC PERSON to hit max score?
            // "ob ein Schütze mit einem Schuss die maximale Punktzahl erreicht" -> "Does [Shooter] hit Max Score?"
            // Usually this is a Prop Bet. let's assume user selects a Shooter and says "Yes".
            // For simplicity, let's treat 'target' as the shooter name.
            // But odds for "Max Score" are usually fixed/high risk. 
            // Let's stick to Parimutuel: Pool of "Max Score Bets" vs "Winners". 
            // Actually, for "Max Score", it's simpler to have fixed odds (e.g. 10.0) or a separate pool.
            // Let's do a simple pool: All money in "Max Score Pot". Winners split the pot.
            if (!pools.maxScore[bet.target]) pools.maxScore[bet.target] = 0;
            pools.maxScore[bet.target] += bet.amount;
        }
    });

    // 3. Calculate Odds
    // Min odds 1.05 to prevent total loss or 1.0
    const HOUSE_TAKE = 0.0; // No house take for friends app

    // Winner Odds
    Object.keys(pools.winner).forEach(target => {
        const stake = pools.winner[target];
        if (stake === 0) {
            odds[`winner_${target}`] = 10.0; // Fallback / Start odds
        } else {
            odds[`winner_${target}`] = (totalPool.winner * (1 - HOUSE_TAKE)) / stake;
        }
    });

    // Loser Odds
    Object.keys(pools.loser).forEach(target => {
        const stake = pools.loser[target];
        if (stake === 0) {
            odds[`loser_${target}`] = 10.0;
        } else {
            odds[`loser_${target}`] = (totalPool.loser * (1 - HOUSE_TAKE)) / stake;
        }
    });

    // Max Score Odds (Per Shooter)
    // If I bet on Ric to hit max score, I compete against everyone else in the Max Score pool? 
    // Or is it a global pool? "Will ONE OF THEM hit it?" or "Will RIC hit it?"
    // Let's assume specific shooter.
    // NOTE: Max Score is rare. Parimutuel is risky if nobody wins.
    // Let's keep it simple: Fixed Odds 5.0 for Max Score for now, to avoid complexity if pool is empty.
    // Or better: Accumulate all Max Score bets. If Ric hits, everyone who bet on Ric splits the pot.

    return odds;
};

// Calculate Payouts after results are in
export const calculatePayouts = (bets, results, oddsAtClose) => {
    // results: { winner: "Ric", loser: "Tom", maxScoreHitters: ["Ric"] }
    const payouts = [];

    bets.forEach(bet => {
        let win = false;
        let odd = 1.0;

        if (bet.type === 'winner' && bet.target === results.winner) {
            win = true;
            odd = oddsAtClose[`winner_${bet.target}`] || 1.0;
        } else if (bet.type === 'loser' && bet.target === results.loser) {
            win = true;
            odd = oddsAtClose[`loser_${bet.target}`] || 1.0;
        } else if (bet.type === 'max_score' && results.maxScoreHitters?.includes(bet.target)) {
            win = true;
            odd = 5.0; // Fixed odds for Max Score for simplicity
        }

        if (win) {
            payouts.push({
                user: bet.user,
                amount: bet.amount * odd,
                profit: (bet.amount * odd) - bet.amount,
                type: bet.type,
                target: bet.target
            });
        }
    });

    return payouts;
};
