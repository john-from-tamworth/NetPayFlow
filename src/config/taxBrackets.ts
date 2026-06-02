export interface TaxConfig {
  personalAllowanceLimit: number;
  personalAllowanceStandard: number;
  taperThreshold: number;
  taperRate: number; // £1 reduced for every £X excess

  // Income Tax - Rest of UK (rUK)
  rUKBands: {
    limit: number; // upper limit, Infinity for top band
    rate: number; // e.g., 0.20
    name: string;
  }[];

  // Income Tax - Scotland
  scotlandBands: {
    limit: number;
    rate: number;
    name: string;
  }[];

  // National Insurance
  niThreshold: number; // Annual equivalent of Primary Threshold
  niUpperLimit: number; // Annual equivalent of Upper Earnings Limit
  niPrimaryRate: number; // e.g., 0.08 (8%)
  niUpperRate: number; // e.g., 0.02 (2%)

  // Student Loans thresholds
  studentLoans: {
    'Plan 1': { threshold: number; rate: number };
    'Plan 2': { threshold: number; rate: number };
    'Plan 4': { threshold: number; rate: number };
    'Plan 5': { threshold: number; rate: number };
  };

  // Postgraduate Loan
  postgradLoan: {
    threshold: number;
    rate: number;
  };
}

export const CURRENT_TAX_CONFIG: TaxConfig = {
  personalAllowanceLimit: 125140,
  personalAllowanceStandard: 12570,
  taperThreshold: 100000,
  taperRate: 2, // £1 for every £2 of income over £100,000

  // Standard progressive bands (excluding allowance, which is handled before band application)
  // For Income Tax, the bands are applied on "Taxable Income" = Adjusted net income - personal allowance.
  rUKBands: [
    { limit: 37700, rate: 0.20, name: 'Basic Rate' }, // £12,570 + £37,700 = £50,270
    { limit: 125140 - 12570, rate: 0.40, name: 'Higher Rate' }, // up to £125,140 total adjusted net income
    { limit: Infinity, rate: 0.45, name: 'Additional Rate' }
  ],

  scotlandBands: [
    { limit: 2306, rate: 0.19, name: 'Starter Rate' }, // £12570 + 2306 = £14,876
    { limit: 13991, rate: 0.20, name: 'Basic Rate' }, // £14,876 + 11685 = £26,561
    { limit: 31092, rate: 0.21, name: 'Intermediate Rate' }, // £26,561 + 17101 = £43,662
    { limit: 62430, rate: 0.42, name: 'Higher Rate' }, // £43,662 + 31338 = £75,000
    { limit: 112570, rate: 0.45, name: 'Advanced Rate' }, // £75,000 + 50140 = £125,140
    { limit: Infinity, rate: 0.48, name: 'Top Rate' }
  ],

  // NI Thresholds 2025/2026/2027 (annual values based on 2024+ changes)
  niThreshold: 12570, // Primary Threshold
  niUpperLimit: 50270, // Upper Earnings Limit
  niPrimaryRate: 0.08, // 8% primary
  niUpperRate: 0.02, // 2% above limit

  studentLoans: {
    'Plan 1': { threshold: 24990, rate: 0.09 },
    'Plan 2': { threshold: 27295, rate: 0.09 },
    'Plan 4': { threshold: 31395, rate: 0.09 },
    'Plan 5': { threshold: 25000, rate: 0.09 }
  },

  postgradLoan: {
    threshold: 21000,
    rate: 0.06
  }
};
