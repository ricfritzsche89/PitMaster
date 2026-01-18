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
        }
    });

    // 3. Calculate Odds
    // Odds = TotalPool / Stake (Decimal Odds)
    // If Stake is 0, we return 1.0 (Refund/Neutral) to avoid Infinity, 
    // but effectively this means "No Payout data available yet".

    // Winner Odds
    Object.keys(pools.winner).forEach(target => {
        const stake = pools.winner[target];
        if (stake === 0) {
            odds[`winner_${target}`] = 1.0;
        } else {
            odds[`winner_${target}`] = totalPool.winner / stake;
        }
    });

    // Loser Odds
    Object.keys(pools.loser).forEach(target => {
        const stake = pools.loser[target];
        if (stake === 0) {
            odds[`loser_${target}`] = 1.0;
        } else {
            odds[`loser_${target}`] = totalPool.loser / stake;
        }
    });

    return odds;
};

// Calculate Payouts after results are in
export const calculatePayouts = (bets, results, oddsAtClose) => {
    const payouts = [];

    // We need to recalculate the EXACT odds based on the results for Split Pots (Max Score).
    // For Winner/Loser, if there is only one winner/loser, the pre-calc odds (Pool/Stake) are correct.
    // BUT what if 'oddsAtClose' was passed based on a previous state?
    // It is safer to recalculate the Final Pool Payouts here strictly.

    // Calculate Pools strictly from bets provided
    const pools = {
        winner: 0,
        loser: 0
    };
    bets.forEach(b => {
        if (pools[b.type] !== undefined) pools[b.type] += b.amount;
    });

    // Helper to get total stake on a specific target/type
    const getStake = (type, target) => {
        return bets
            .filter(b => b.type === type && b.target === target)
            .reduce((sum, b) => sum + b.amount, 0);
    };

    bets.forEach(bet => {
        let win = false;
        let odd = 1.0;

        if (bet.type === 'winner' && bet.target === results.winner) {
            win = true;
            // Strict Parimutuel: Total Pool / Total Stake on Winner
            const winningStake = getStake('winner', results.winner);
            odd = winningStake > 0 ? pools.winner / winningStake : 1.0;
        } else if (bet.type === 'loser' && bet.target === results.loser) {
            win = true;
            // Strict Parimutuel
            const winningStake = getStake('loser', results.loser);
            odd = winningStake > 0 ? pools.loser / winningStake : 1.0;
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


