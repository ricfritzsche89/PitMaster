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
    // We display the odd assuming "Only THIS person hits it" (Best case)
    // or we display "Current Pool / My Stake" ? 
    // Let's stick to: Total Pool / Total Stake on THIS Target. 
    // This is valid if only this target wins. If multiple win, odd drops (User risk).
    const totalMaxScorePool = totalPool.maxScore;
    Object.keys(pools.maxScore).forEach(target => {
        const stake = pools.maxScore[target];
        if (stake === 0) {
            odds[`max_score_${target}`] = 10.0;
        } else {
            odds[`max_score_${target}`] = totalMaxScorePool / stake;
        }
    });

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

            // DYNAMIC ODDS LOGIC (Split Pot)
            // 1. Calculate total pool for 'max_score' (already in oddsAtClose calculation conceptually ?)
            // Actually, we need to recalculate the specific odd for THIS target based to be precise, 
            // OR rely on 'oddsAtClose' having the correct value.
            // Problem: 'oddsAtClose' is calculated BEFORE results are known? 
            // Standard Parimutuel: Odds are final at "Close". But for "Max Score", if multiple people win, 
            // do they split the SAME pot? 
            // In Horse Racing (Place/Show), it's complex.
            // Simplified Friends Logic: 
            // - Market: "Will Ric hit 30?" -> Pool for "Ric Yes" vs "Ric No"? No, we only have "Backing".
            // - Market: "Who hits 30?" -> Pool of ALL 30-bets. 
            // - If Ric and Tom hit, the pool is split between Ric-Backers and Tom-Backers.

            // Let's implement the Split Pot here strictly.
            // We need to know the Total Stakes on ALL Winning Targets.
            const totalMaxScorePool = bets.filter(b => b.type === 'max_score').reduce((sum, b) => sum + b.amount, 0);

            const winningTargets = results.maxScoreHitters || [];
            if (winningTargets.length === 0) {
                odd = 0; // House wins (nobody hit it)
            } else {
                // Calculate total stake on ALL winners
                const winningStakes = bets
                    .filter(b => b.type === 'max_score' && winningTargets.includes(b.target))
                    .reduce((sum, b) => sum + b.amount, 0);

                if (winningStakes > 0) {
                    odd = totalMaxScorePool / winningStakes;
                } else {
                    odd = 1.0; // Refund? Or lost? Let's say 1.0 (Audit)
                }
            }
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
