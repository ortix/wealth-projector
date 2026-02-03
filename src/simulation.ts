import type { UserInputs, YearlyProjection, SimulationResults, SavingsBucket } from './types';

function gaussianRandom(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function calculateYearlyContribution(
  bucket: SavingsBucket,
  annualSalary: number,
  isRetired: boolean
): number {
  if (isRetired) return 0;
  
  let employeeContribution = 0;
  if (bucket.contributionType === 'fixed') {
    employeeContribution = bucket.monthlyContribution * 12;
  } else {
    employeeContribution = (bucket.contributionPercentage / 100) * annualSalary;
  }
  
  // Apply max annual contribution cap (e.g., 401k limits)
  if (bucket.maxAnnualContribution && employeeContribution > bucket.maxAnnualContribution) {
    employeeContribution = bucket.maxAnnualContribution;
  }
  
  let totalContribution = employeeContribution;
  
  if (bucket.type === '401k' && bucket.employerMatch && bucket.employerMatchLimit) {
    const employeeContributionPercent = (employeeContribution / annualSalary) * 100;
    const matchablePercent = Math.min(employeeContributionPercent, bucket.employerMatchLimit);
    const employerContribution = (matchablePercent / 100) * annualSalary * (bucket.employerMatch / 100);
    totalContribution += employerContribution;
  }
  
  return totalContribution;
}

function simulateYear(
  buckets: SavingsBucket[],
  currentBalances: Record<string, number>,
  annualSalary: number,
  isRetired: boolean,
  useRandomReturns: boolean,
  annualWithdrawal: number = 0
): { newBalances: Record<string, number>; totalContributions: number; totalReturns: number; totalWithdrawals: number } {
  const newBalances: Record<string, number> = {};
  let totalContributions = 0;
  let totalReturns = 0;
  let totalWithdrawals = 0;
  
  // Calculate total current balance for proportional withdrawals
  const totalBalance = Object.values(currentBalances).reduce((a, b) => a + b, 0);
  
  for (const bucket of buckets) {
    const currentBalance = currentBalances[bucket.id] || bucket.currentBalance;
    const contribution = calculateYearlyContribution(bucket, annualSalary, isRetired);
    
    // Withdraw proportionally from each bucket based on its share of total
    let withdrawal = 0;
    if (isRetired && totalBalance > 0) {
      const bucketShare = currentBalance / totalBalance;
      withdrawal = Math.min(annualWithdrawal * bucketShare, currentBalance);
    }
    
    let returnRate = bucket.annualReturn / 100;
    if (useRandomReturns) {
      const randomReturn = gaussianRandom() * (bucket.returnVolatility / 100);
      returnRate = (bucket.annualReturn / 100) + randomReturn;
    }
    
    const balanceAfterWithdrawal = currentBalance - withdrawal;
    const returns = balanceAfterWithdrawal * returnRate;
    const contributionReturns = contribution * returnRate * 0.5;
    
    newBalances[bucket.id] = Math.max(0, balanceAfterWithdrawal + contribution + returns + contributionReturns);
    totalContributions += contribution;
    totalReturns += returns + contributionReturns;
    totalWithdrawals += withdrawal;
  }
  
  return { newBalances, totalContributions, totalReturns, totalWithdrawals };
}

export function runDeterministicSimulation(inputs: UserInputs): YearlyProjection[] {
  const projections: YearlyProjection[] = [];
  let currentBalances: Record<string, number> = {};
  
  for (const bucket of inputs.buckets) {
    currentBalances[bucket.id] = bucket.currentBalance;
  }
  
  let currentSalary = inputs.currentSalary;
  let currentRetirementSpending = inputs.monthlyRetirementSpending * 12;
  
  for (let year = 0; year <= inputs.projectionYears; year++) {
    const age = inputs.currentAge + year;
    const isRetired = age >= inputs.retirementAge;
    const yearsRetired = isRetired ? age - inputs.retirementAge : 0;
    const annualWithdrawal = isRetired 
      ? currentRetirementSpending * Math.pow(1 + inputs.retirementSpendingIncrease / 100, yearsRetired)
      : 0;
    
    if (year === 0) {
      const totalSavings = Object.values(currentBalances).reduce((a, b) => a + b, 0);
      projections.push({
        year,
        age,
        salary: isRetired ? 0 : currentSalary,
        totalSavings,
        bucketBalances: { ...currentBalances },
        yearlyContributions: 0,
        yearlyReturns: 0,
        yearlyWithdrawals: 0,
      });
    } else {
      const { newBalances, totalContributions, totalReturns, totalWithdrawals } = simulateYear(
        inputs.buckets,
        currentBalances,
        currentSalary,
        isRetired,
        false,
        annualWithdrawal
      );
      
      currentBalances = newBalances;
      const totalSavings = Object.values(currentBalances).reduce((a, b) => a + b, 0);
      
      projections.push({
        year,
        age,
        salary: isRetired ? 0 : currentSalary,
        totalSavings,
        bucketBalances: { ...currentBalances },
        yearlyContributions: totalContributions,
        yearlyReturns: totalReturns,
        yearlyWithdrawals: totalWithdrawals,
      });
      
      if (!isRetired) {
        currentSalary *= (1 + inputs.annualSalaryIncrease / 100);
      }
    }
  }
  
  return projections;
}

export function runMonteCarloSimulation(
  inputs: UserInputs,
  numSimulations: number = 1000
): SimulationResults {
  const deterministic = runDeterministicSimulation(inputs);
  const simulations: YearlyProjection[][] = [];
  
  for (let sim = 0; sim < numSimulations; sim++) {
    const projections: YearlyProjection[] = [];
    let currentBalances: Record<string, number> = {};
    
    for (const bucket of inputs.buckets) {
      currentBalances[bucket.id] = bucket.currentBalance;
    }
    
    let currentSalary = inputs.currentSalary;
    const currentRetirementSpending = inputs.monthlyRetirementSpending * 12;
    
    for (let year = 0; year <= inputs.projectionYears; year++) {
      const age = inputs.currentAge + year;
      const isRetired = age >= inputs.retirementAge;
      const yearsRetired = isRetired ? age - inputs.retirementAge : 0;
      const annualWithdrawal = isRetired 
        ? currentRetirementSpending * Math.pow(1 + inputs.retirementSpendingIncrease / 100, yearsRetired)
        : 0;
      
      if (year === 0) {
        const totalSavings = Object.values(currentBalances).reduce((a, b) => a + b, 0);
        projections.push({
          year,
          age,
          salary: isRetired ? 0 : currentSalary,
          totalSavings,
          bucketBalances: { ...currentBalances },
          yearlyContributions: 0,
          yearlyReturns: 0,
          yearlyWithdrawals: 0,
        });
      } else {
        const { newBalances, totalContributions, totalReturns, totalWithdrawals } = simulateYear(
          inputs.buckets,
          currentBalances,
          currentSalary,
          isRetired,
          true,
          annualWithdrawal
        );
        
        currentBalances = newBalances;
        const totalSavings = Object.values(currentBalances).reduce((a, b) => a + b, 0);
        
        projections.push({
          year,
          age,
          salary: isRetired ? 0 : currentSalary,
          totalSavings,
          bucketBalances: { ...currentBalances },
          yearlyContributions: totalContributions,
          yearlyReturns: totalReturns,
          yearlyWithdrawals: totalWithdrawals,
        });
        
        if (!isRetired) {
          currentSalary *= (1 + inputs.annualSalaryIncrease / 100);
        }
      }
    }
    
    simulations.push(projections);
  }
  
  const percentiles = {
    p10: [] as number[],
    p25: [] as number[],
    p50: [] as number[],
    p75: [] as number[],
    p90: [] as number[],
  };
  
  for (let year = 0; year <= inputs.projectionYears; year++) {
    const yearTotals = simulations.map(sim => sim[year].totalSavings).sort((a, b) => a - b);
    const n = yearTotals.length;
    
    percentiles.p10.push(yearTotals[Math.floor(n * 0.1)]);
    percentiles.p25.push(yearTotals[Math.floor(n * 0.25)]);
    percentiles.p50.push(yearTotals[Math.floor(n * 0.5)]);
    percentiles.p75.push(yearTotals[Math.floor(n * 0.75)]);
    percentiles.p90.push(yearTotals[Math.floor(n * 0.9)]);
  }
  
  return {
    deterministic,
    monteCarlo: {
      simulations,
      percentiles,
    },
  };
}

export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
