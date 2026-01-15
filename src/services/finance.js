/**
 * Financial Calculation Utilities for PitMaster
 */

// Format currency
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
};

// Calculate total expenses from items array
export const calculateTotalExpenses = (expenses = []) => {
    return expenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
};

// Calculate metrics: Cost per Head, Total Revenue, Budget Status
export const calculateFinancials = (event) => {
    const { expenses = [], guests = [], hostMarkup = 0, budgetLimit = 0 } = event;

    const totalExpenses = calculateTotalExpenses(expenses);

    // Count confirmed guests
    const confirmedGuests = guests.filter(g => g.status === 'accepted');
    const confirmedCount = confirmedGuests.length;

    // Logic: Host Markup (Aufschlag)
    // Markup is added ON TOP of the total expenses.
    const markupAmount = totalExpenses * (hostMarkup / 100);
    const totalWithMarkup = totalExpenses + markupAmount;

    // Admin "Absorbed" is now actually negative (Profit) or 0 if we ignore it for this variable.
    // Let's keep adminAbsorbedCost as "Check" for "How much implies Admin pays", but here Admin EARNS.
    // Let's just track totalWithMarkup for splitting.

    const remainingCost = totalWithMarkup;

    // For compatibility with return object (and maybe UI usage)
    const adminAbsorbedCost = -markupAmount; // Negative "cost" = Profit

    // Cost per guest
    const costPerGuest = confirmedCount > 0 ? (remainingCost / confirmedCount) : 0;

    // Expected Revenue (tracked contributions)
    // Guests is array: { name, contribution, hasPaid }
    // We can track "Expected" vs "Collected".
    // Expected = confirmedCount * costPerGuest.

    const collectedRevenue = guests.reduce((sum, g) => sum + (g.hasPaid ? (g.contribution || costPerGuest) : 0), 0);

    // Warning triggers
    const isOverBudget = budgetLimit > 0 && totalExpenses > budgetLimit;
    const isHighCost = costPerGuest > 25; // Prompt: "Warnung >25€/Person"

    return {
        totalExpenses,
        confirmedCount,
        adminAbsorbedCost,
        remainingCost,
        costPerGuest,
        collectedRevenue,
        isOverBudget,
        isHighCost,
        budgetLimit
    };
};
