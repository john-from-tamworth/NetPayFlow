import { CalculatorInputs, CalculationResult, BreakoutValue, TaxBandDetail } from '../types';
import { CURRENT_TAX_CONFIG } from '../config/taxBrackets';

/**
 * Parses a UK tax code to determine the personal allowance.
 * Standard tax code is "1257L" -> £12,570.
 * Scottish codes might start with "S" (e.g., S1257L) -> £12,570.
 * Welsh codes might start with "C" -> parsed same way.
 * "BR" -> £0 allowance, flat basic rate (20%).
 * "0T" / "0" -> £0 allowance.
 * "K" codes represent negative allowance (addition to taxable income), e.g. "K400" -> -£4,000.
 */
export function parseTaxCode(taxCode: string): { allowance: number; error: string | null; isKCode: boolean; kValue: number } {
  const code = taxCode.trim().toUpperCase();
  
  if (!code) {
    return { allowance: CURRENT_TAX_CONFIG.personalAllowanceStandard, error: null, isKCode: false, kValue: 0 };
  }

  // Flat codes
  if (code === 'BR') {
    return { allowance: 0, error: null, isKCode: false, kValue: 0 };
  }
  if (code === 'D0') { // Higher rate flat (40%)
    return { allowance: 0, error: null, isKCode: false, kValue: 0 };
  }
  if (code === 'D1') { // Additional rate flat (45%)
    return { allowance: 0, error: null, isKCode: false, kValue: 0 };
  }
  if (code === 'NT') { // No tax
    return { allowance: 999999, error: null, isKCode: false, kValue: 0 }; // virtual infinite allowance
  }

  // Check for K codes
  if (code.startsWith('K')) {
    const numericPart = code.substring(1).replace(/[^0-9]/g, '');
    if (numericPart) {
      const value = parseInt(numericPart, 10) * 10;
      return { allowance: 0, error: null, isKCode: true, kValue: value };
    }
    return { allowance: 0, error: 'Invalid K tax code numeric value', isKCode: true, kValue: 0 };
  }

  // Standard codes with prefix S, C or suffix L, T, M, N, Y, etc.
  // Standard digits are from index 0/1 to the end of digits
  const cleaned = code.replace(/^[SC]/g, ''); // strip Scottish or Welsh prefixes
  const digitsOnly = cleaned.replace(/[^0-9]/g, '');
  
  if (digitsOnly) {
    const allowanceVal = parseInt(digitsOnly, 10) * 10;
    return { allowance: allowanceVal, error: null, isKCode: false, kValue: 0 };
  }

  return { 
    allowance: CURRENT_TAX_CONFIG.personalAllowanceStandard, 
    error: 'Unrecognised format, defaulting to 1257L', 
    isKCode: false, 
    kValue: 0 
  };
}

/**
 * Distributes a yearly value into Yearly, Monthly, and Weekly views.
 */
function createBreakout(yearly: number): BreakoutValue {
  return {
    yearly: parseFloat(yearly.toFixed(2)),
    monthly: parseFloat((yearly / 12).toFixed(2)),
    weekly: parseFloat((yearly / 52).toFixed(2)),
  };
}

/**
 * Core mathematical engine to calculate UK payroll details linearily.
 */
export function calculateTakeHomePay(inputs: CalculatorInputs): CalculationResult {
  const config = CURRENT_TAX_CONFIG;
  const { grossSalary, pensionPercent, location, studentLoanPlan, hasPostgradLoan, bikValue, taxCode, useCustomTaxCode } = inputs;

  // 1. Gross Pay
  const grossYearly = grossSalary;
  
  // 2. Pension contribution (Salary Sacrifice)
  // Work pension is taken of gross salary before tax and NI
  const pensionYearly = grossYearly * (pensionPercent / 100);
  
  // 3. Adjusted Net Income (ANI)
  // Used for personal allowance tapering
  const adjustedNetIncomeYearly = Math.max(0, grossYearly - pensionYearly);

  // 4. Personal Allowance Calculation & Tapering
  let baseAllowance = config.personalAllowanceStandard;
  let isKCode = false;
  let kValue = 0;
  let parseError = null;

  if (useCustomTaxCode) {
    const parsed = parseTaxCode(taxCode);
    baseAllowance = parsed.allowance;
    isKCode = parsed.isKCode;
    kValue = parsed.kValue;
    parseError = parsed.error;
  }

  // Tapering of Personal Allowance
  // Standard tapering: For every £2 of income above £100,000, allowance is reduced by £1
  let finalAllowance = baseAllowance;
  if (!isKCode && adjustedNetIncomeYearly > config.taperThreshold) {
    const excess = adjustedNetIncomeYearly - config.taperThreshold;
    const reduction = excess / config.taperRate;
    finalAllowance = Math.max(0, baseAllowance - reduction);
  }

  // 5. Income Tax Calculation
  // BIK adds to TAXABLE income, but does not increase Gross or ANI for Pension/NI/Student Loan calculations.
  // Taxable income is ANI + BIK - allowance.
  let taxableIncomeForTax = 0;
  if (isKCode) {
    // K Code adds the kValue to taxable income instead of subtracting an allowance
    taxableIncomeForTax = adjustedNetIncomeYearly + bikValue + kValue;
  } else {
    taxableIncomeForTax = Math.max(0, adjustedNetIncomeYearly + bikValue - finalAllowance);
  }

  let taxPaidYearly = 0;
  const taxBandsUsed: TaxBandDetail[] = [];
  
  const bands = location === 'Scotland' ? config.scotlandBands : config.rUKBands;
  
  let remainingTaxable = taxableIncomeForTax;
  let prevLimit = 0;

  for (let i = 0; i < bands.length; i++) {
    const band = bands[i];
    const bandSpan = band.limit - prevLimit;
    
    if (remainingTaxable > 0) {
      const taxableInThisBand = Math.min(remainingTaxable, bandSpan);
      const taxInThisBand = taxableInThisBand * band.rate;
      
      taxPaidYearly += taxInThisBand;
      remainingTaxable -= taxableInThisBand;
      
      taxBandsUsed.push({
        bandName: band.name,
        rate: band.rate * 100,
        taxableAmount: parseFloat(taxableInThisBand.toFixed(2)),
        taxPaid: parseFloat(taxInThisBand.toFixed(2))
      });
    } else {
      taxBandsUsed.push({
        bandName: band.name,
        rate: band.rate * 100,
        taxableAmount: 0,
        taxPaid: 0
      });
    }
    
    prevLimit = band.limit;
  }

  // 6. National Insurance
  // Calculated on ANI (Gross - Pension)
  let niPaidYearly = 0;
  const niIncome = adjustedNetIncomeYearly;
  
  if (niIncome > config.niThreshold) {
    const primaryBandIncome = Math.min(niIncome, config.niUpperLimit) - config.niThreshold;
    niPaidYearly += primaryBandIncome * config.niPrimaryRate;
    
    if (niIncome > config.niUpperLimit) {
      const upperBandIncome = niIncome - config.niUpperLimit;
      niPaidYearly += upperBandIncome * config.niUpperRate;
    }
  }

  // 7. Student Loans (calculated on NI-eligible income: ANI)
  let studentLoanYearly = 0;
  if (studentLoanPlan !== 'none') {
    const loanThresholdInfo = config.studentLoans[studentLoanPlan];
    if (loanThresholdInfo && niIncome > loanThresholdInfo.threshold) {
      studentLoanYearly = (niIncome - loanThresholdInfo.threshold) * loanThresholdInfo.rate;
    }
  }

  // 8. Postgraduate Loan (concurrently calculated on NI-eligible income: ANI)
  let postgradLoanYearly = 0;
  if (hasPostgradLoan) {
    if (niIncome > config.postgradLoan.threshold) {
      postgradLoanYearly = (niIncome - config.postgradLoan.threshold) * config.postgradLoan.rate;
    }
  }

  // 9. Total Deductions (Pension, Income Tax, NI, Student Loans)
  // BIK itself is NOT subtracted from take-home cash because it's a non-cash benefit.
  // But the tax paid on BIK is included in the income tax, which is deducted.
  const totalDeductionsYearly = pensionYearly + taxPaidYearly + niPaidYearly + studentLoanYearly + postgradLoanYearly;
  
  // 10. Net Take-Home Pay
  const netTakeHomeYearly = Math.max(0, grossYearly - totalDeductionsYearly);

  // 11. Rates and Extra Metrics
  const effectiveTaxRate = grossYearly > 0 ? (taxPaidYearly + niPaidYearly) / grossYearly : 0;
  const effectiveDeductionRate = grossYearly > 0 ? totalDeductionsYearly / grossYearly : 0;

  // Tax Trap calculation: Adjusted Net Income between £100,000 and £125,140
  const isTaxTrap = adjustedNetIncomeYearly > 100000 && adjustedNetIncomeYearly <= config.personalAllowanceLimit;
  let taxTrapAmountInvolved = 0;
  let taxTrapOpportunitySaving = 0;

  if (adjustedNetIncomeYearly > 100000) {
    taxTrapAmountInvolved = Math.min(adjustedNetIncomeYearly, config.personalAllowanceLimit) - 100000;
    
    // Effective marginal rate in this trap zone: 
    // In rUK: 40% higher rate + 20% lost allowance tax + 2% NI = 62%
    // In Scotland: 45% advanced rate + 22.5% lost allowance tax + 2% NI = 69.5%
    const marginalRate = location === 'Scotland' ? 0.695 : 0.62;
    taxTrapOpportunitySaving = taxTrapAmountInvolved * marginalRate;
  }

  return {
    grossPay: createBreakout(grossYearly),
    salarySacrificePension: createBreakout(pensionYearly),
    adjustedNetIncome: createBreakout(adjustedNetIncomeYearly),
    personalAllowance: createBreakout(finalAllowance),
    bikBenefit: createBreakout(bikValue),
    taxableIncome: createBreakout(taxableIncomeForTax),
    incomeTax: createBreakout(taxPaidYearly),
    nationalInsurance: createBreakout(niPaidYearly),
    studentLoan: createBreakout(studentLoanYearly),
    postgradLoan: createBreakout(postgradLoanYearly),
    totalDeductions: createBreakout(totalDeductionsYearly),
    netTakeHome: createBreakout(netTakeHomeYearly),
    
    effectiveTaxRate,
    effectiveDeductionRate,
    isTaxTrap,
    taxTrapAmountInvolved,
    taxTrapOpportunitySaving,
    taxBandsUsed
  };
}
