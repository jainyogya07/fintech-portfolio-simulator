/**
 * FIRE Calculator Service
 * Financial Independence, Retire Early calculations
 */

/**
 * Calculate FIRE number (25x annual expenses - 4% rule)
 */
export function calculateFIRENumber(annualExpenses) {
    return annualExpenses * 25;
}

/**
 * Calculate years to FIRE
 */
export function calculateYearsToFIRE({
    currentSavings,
    annualSavings,
    annualExpenses,
    expectedReturn = 0.07,
    inflationRate = 0.03
}) {
    const realReturn = expectedReturn - inflationRate;
    const fireNumber = calculateFIRENumber(annualExpenses);

    if (currentSavings >= fireNumber) {
        return { years: 0, alreadyFI: true };
    }

    if (annualSavings <= 0) {
        return { years: Infinity, impossible: true };
    }

    let savings = currentSavings;
    let years = 0;
    const maxYears = 100;

    while (savings < fireNumber && years < maxYears) {
        savings = savings * (1 + realReturn) + annualSavings;
        years++;
    }

    return {
        years,
        fireNumber,
        projectedSavings: Math.round(savings),
        alreadyFI: false,
        impossible: years >= maxYears
    };
}

/**
 * Calculate savings rate
 */
export function calculateSavingsRate(annualIncome, annualExpenses) {
    const annualSavings = annualIncome - annualExpenses;
    return (annualSavings / annualIncome) * 100;
}

/**
 * Calculate different FIRE scenarios
 */
export function calculateFIREScenarios({
    currentAge,
    currentSavings,
    annualIncome,
    annualExpenses,
    expectedReturn = 0.07
}) {
    const annualSavings = annualIncome - annualExpenses;
    const savingsRate = calculateSavingsRate(annualIncome, annualExpenses);

    // Lean FIRE: 60% of normal expenses
    const leanExpenses = annualExpenses * 0.6;
    const leanFIRE = calculateYearsToFIRE({
        currentSavings,
        annualSavings,
        annualExpenses: leanExpenses,
        expectedReturn
    });

    // Regular FIRE: current expenses
    const regularFIRE = calculateYearsToFIRE({
        currentSavings,
        annualSavings,
        annualExpenses,
        expectedReturn
    });

    // Fat FIRE: 150% of expenses (comfortable lifestyle)
    const fatExpenses = annualExpenses * 1.5;
    const fatFIRE = calculateYearsToFIRE({
        currentSavings,
        annualSavings,
        annualExpenses: fatExpenses,
        expectedReturn
    });

    // Coast FIRE: enough invested to retire at 65 with no more savings
    const coastFIREAge = calculateCoastFIREAge(currentAge, currentSavings, annualExpenses, expectedReturn);

    return {
        savingsRate: Math.round(savingsRate),
        annualSavings,
        scenarios: {
            lean: {
                type: 'Lean FIRE',
                description: 'Minimal lifestyle, 60% expenses',
                annualExpenses: leanExpenses,
                fireNumber: calculateFIRENumber(leanExpenses),
                years: leanFIRE.years,
                retireAge: currentAge + leanFIRE.years,
                icon: '🌱'
            },
            regular: {
                type: 'Regular FIRE',
                description: 'Current lifestyle maintained',
                annualExpenses,
                fireNumber: calculateFIRENumber(annualExpenses),
                years: regularFIRE.years,
                retireAge: currentAge + regularFIRE.years,
                icon: '🔥'
            },
            fat: {
                type: 'Fat FIRE',
                description: 'Comfortable lifestyle, 150% expenses',
                annualExpenses: fatExpenses,
                fireNumber: calculateFIRENumber(fatExpenses),
                years: fatFIRE.years,
                retireAge: currentAge + fatFIRE.years,
                icon: '🏖️'
            },
            coast: {
                type: 'Coast FIRE',
                description: 'Stop saving, retire at 65',
                coastAge: coastFIREAge,
                yearsToCoast: coastFIREAge - currentAge,
                alreadyCoast: coastFIREAge <= currentAge,
                icon: '⛵'
            }
        }
    };
}

/**
 * Calculate Coast FIRE age
 */
function calculateCoastFIREAge(currentAge, currentSavings, annualExpenses, expectedReturn = 0.07) {
    const targetRetireAge = 65;
    const fireNumber = calculateFIRENumber(annualExpenses);
    const yearsToRetire = targetRetireAge - currentAge;

    // Calculate how much current savings will grow by 65
    const projectedAt65 = currentSavings * Math.pow(1 + expectedReturn, yearsToRetire);

    if (projectedAt65 >= fireNumber) {
        return currentAge; // Already at Coast FIRE
    }

    // Calculate when investments alone would reach FIRE number by 65
    // We need to find x where: currentSavings * (1+r)^(65-currentAge-x) * (1+r)^x >= FIRE
    // Simplifies to finding when we no longer need to save
    let coastAge = currentAge;
    for (let age = currentAge; age < 65; age++) {
        const yearsOfGrowth = 65 - age;
        const futureValue = currentSavings * Math.pow(1 + expectedReturn, yearsOfGrowth);
        if (futureValue >= fireNumber) {
            coastAge = age;
            break;
        }
        currentSavings *= (1 + expectedReturn);
    }

    return coastAge;
}

/**
 * Get FIRE status message
 */
export function getFIREStatus(years, currentAge) {
    const retireAge = currentAge + years;

    if (years === 0) {
        return { status: 'achieved', message: 'Congratulations! You\'ve reached FIRE!', color: 'var(--color-success)' };
    }
    if (retireAge <= 40) {
        return { status: 'extreme', message: 'Extreme Early Retirement!', color: 'var(--color-primary)' };
    }
    if (retireAge <= 50) {
        return { status: 'early', message: 'Early Retirement', color: 'var(--color-success)' };
    }
    if (retireAge <= 60) {
        return { status: 'good', message: 'Ahead of Schedule', color: 'var(--color-success)' };
    }
    if (retireAge <= 65) {
        return { status: 'normal', message: 'Traditional Retirement', color: 'var(--color-warning)' };
    }
    return { status: 'delayed', message: 'Delayed Retirement', color: 'var(--color-danger)' };
}
