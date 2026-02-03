export interface SavingsBucket {
  id: string;
  name: string;
  type: 'hysa' | '401k' | 'etf' | 'other';
  currentBalance: number;
  annualReturn: number;
  returnVolatility: number;
  monthlyContribution: number;
  contributionType: 'fixed' | 'percentage';
  contributionPercentage: number;
  employerMatch?: number;
  employerMatchLimit?: number;
  maxAnnualContribution?: number;
}

export interface UserInputs {
  currentAge: number;
  retirementAge: number;
  currentSalary: number;
  annualSalaryIncrease: number;
  projectionYears: number;
  monthlyRetirementSpending: number;
  retirementSpendingIncrease: number;
  buckets: SavingsBucket[];
}

export interface YearlyProjection {
  year: number;
  age: number;
  salary: number;
  totalSavings: number;
  bucketBalances: Record<string, number>;
  yearlyContributions: number;
  yearlyReturns: number;
  yearlyWithdrawals: number;
}

export interface MonteCarloResult {
  percentile: number;
  projections: YearlyProjection[];
}

export interface SimulationResults {
  deterministic: YearlyProjection[];
  monteCarlo: {
    simulations: YearlyProjection[][];
    percentiles: {
      p10: number[];
      p25: number[];
      p50: number[];
      p75: number[];
      p90: number[];
    };
  };
}

export const DEFAULT_BUCKET: Omit<SavingsBucket, 'id'> = {
  name: 'New Bucket',
  type: 'other',
  currentBalance: 0,
  annualReturn: 7,
  returnVolatility: 15,
  monthlyContribution: 0,
  contributionType: 'fixed',
  contributionPercentage: 0,
};

export const BUCKET_PRESETS: Record<string, Partial<SavingsBucket>> = {
  hysa: {
    name: 'High-Yield Savings',
    type: 'hysa',
    annualReturn: 4.5,
    returnVolatility: 0.5,
  },
  '401k': {
    name: '401(k)',
    type: '401k',
    annualReturn: 7,
    returnVolatility: 15,
    employerMatch: 50,
    employerMatchLimit: 6,
    contributionType: 'fixed',
    maxAnnualContribution: 23500,
  },
  etf: {
    name: 'ETF Portfolio',
    type: 'etf',
    annualReturn: 8,
    returnVolatility: 18,
  },
};
