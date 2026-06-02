export type LocationType = 'rUK' | 'Scotland';

export type StudentLoanPlanType = 'none' | 'Plan 1' | 'Plan 2' | 'Plan 4' | 'Plan 5';

export interface CalculatorInputs {
  grossSalary: number;
  pensionPercent: number;
  location: LocationType;
  studentLoanPlan: StudentLoanPlanType;
  hasPostgradLoan: boolean;
  bikValue: number;
  taxCode: string;
  useCustomTaxCode: boolean;
}

export interface BreakoutValue {
  yearly: number;
  monthly: number;
  weekly: number;
}

export interface TaxBandDetail {
  bandName: string;
  rate: number;
  taxableAmount: number;
  taxPaid: number;
}

export interface CalculationResult {
  grossPay: BreakoutValue;
  salarySacrificePension: BreakoutValue;
  adjustedNetIncome: BreakoutValue;
  personalAllowance: BreakoutValue;
  bikBenefit: BreakoutValue;
  taxableIncome: BreakoutValue;
  incomeTax: BreakoutValue;
  nationalInsurance: BreakoutValue;
  studentLoan: BreakoutValue;
  postgradLoan: BreakoutValue;
  totalDeductions: BreakoutValue;
  netTakeHome: BreakoutValue;
  
  // Extra detailed metrics
  effectiveTaxRate: number; // total tax + NI / gross salary
  effectiveDeductionRate: number; // all deductions / gross salary
  isTaxTrap: boolean;
  taxTrapAmountInvolved: number; // amount of income in £100k-£125k band
  taxTrapOpportunitySaving: number; // potential tax savings if put in pension
  taxBandsUsed: TaxBandDetail[];
}
