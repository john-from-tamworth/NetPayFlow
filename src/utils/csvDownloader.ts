import { CalculationResult } from '../types';

interface ExpenseItem {
  id: string;
  category: string;
  label: string;
  amount: number;
}

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
}

interface DebtItem {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  monthlyRepayment: number;
}

// Helper to trigger physical browser download
export function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export 1: Pay Calculator Results
export function exportPayCalculatorCSV(result: CalculationResult) {
  const rows = [
    ['NetPayFlow UK Salary & Breakdown Report (Fiscal Year 2026/27)'],
    [],
    ['Breakout Metric', 'Yearly Value (£)', 'Monthly Value (£)', 'Weekly Value (£)'],
    ['Gross Salary / Inflow', result.grossPay.yearly, result.grossPay.monthly, result.grossPay.weekly],
    ['Pension Salary Sacrifice Contribution', result.salarySacrificePension.yearly, result.salarySacrificePension.monthly, result.salarySacrificePension.weekly],
    ['Adjusted Net Income (Total Net)', result.adjustedNetIncome.yearly, result.adjustedNetIncome.monthly, result.adjustedNetIncome.weekly],
    ['Computed Personal Allowance', result.personalAllowance.yearly, result.personalAllowance.monthly, result.personalAllowance.weekly],
    ['Benefit in Kind (BiK Value)', result.bikBenefit.yearly, result.bikBenefit.monthly, result.bikBenefit.weekly],
    ['Taxable Income', result.taxableIncome.yearly, result.taxableIncome.monthly, result.taxableIncome.weekly],
    ['Income Tax Paid', result.incomeTax.yearly, result.incomeTax.monthly, result.incomeTax.weekly],
    ['National Insurance Contribution (NIC)', result.nationalInsurance.yearly, result.nationalInsurance.monthly, result.nationalInsurance.weekly],
    ['Student Loan Repayment', result.studentLoan.yearly, result.studentLoan.monthly, result.studentLoan.weekly],
    ['Postgraduate Loan Repayment', result.postgradLoan.yearly, result.postgradLoan.monthly, result.postgradLoan.weekly],
    ['Total Deductions (Tax+NI+Debt+Loan)', result.totalDeductions.yearly, result.totalDeductions.monthly, result.totalDeductions.weekly],
    ['Net Take-Home Pay (Available Cash)', result.netTakeHome.yearly, result.netTakeHome.monthly, result.netTakeHome.weekly],
    [],
    ['Summary Performance Metrics'],
    ['Effective Income Tax + NIC Rate (%)', (result.effectiveTaxRate * 100).toFixed(2)],
    ['All Deductions Combined Rate (%)', (result.effectiveDeductionRate * 100).toFixed(2)],
    ['Is In £100k - £125k Tax Trap?', result.isTaxTrap ? 'YES' : 'NO'],
  ];

  if (result.isTaxTrap) {
    rows.push(['Tax Trap Income Involved (£)', result.taxTrapAmountInvolved]);
    rows.push(['Pension Saving Advisory Opportunity (£)', result.taxTrapOpportunitySaving]);
  }

  // Format CSV
  const csvText = rows.map(e => e.map(val => {
    if (typeof val === 'string' && (val.includes(',') || val.includes('\n') || val.includes('"'))) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  }).join(',')).join('\n');

  downloadCSV('NetPayFlow_Salary_Report.csv', csvText);
}

// Export 2: Budget Planner Report
export function exportBudgetPlannerCSV(
  incomeSource: string,
  activeIncome: number,
  expenses: ExpenseItem[],
  totalExpenses: number,
  spareCash: number,
  allocatedSavings: number
) {
  const rows = [
    ['NetPayFlow Budget Planner Allocation Report'],
    [],
    ['Income Stream Source Used', incomeSource.toUpperCase()],
    ['Total Monthly Income Inflow (£)', activeIncome],
    ['Total Monthly Expenditure Outgoings (£)', totalExpenses],
    ['Remaining Surplus Spare Cash (£)', spareCash],
    ['Allocated Monthly Savings Target (£)', allocatedSavings],
    ['Unallocated Disposable Cash Leftover (£)', (spareCash - allocatedSavings)],
    [],
    ['Breakup Expenses Ledger List:'],
    ['Expense Item Label', 'Budgeting Category', 'Monthly Amount (£)'],
    ...expenses.map(e => [e.label, e.category, e.amount]),
  ];

  const csvText = rows.map(e => e.map(val => {
    if (typeof val === 'string' && (val.includes(',') || val.includes('\n') || val.includes('"'))) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  }).join(',')).join('\n');

  downloadCSV('NetPayFlow_Monthly_Budget.csv', csvText);
}

// Export 3: Compound Savings Projections
export function exportCompoundSavingsCSV(
  initialLumpSum: number,
  monthlyDeposit: number,
  annualRate: number,
  termYears: number,
  compoundFreq: string,
  projectionData: any[],
  goals: SavingsGoal[],
  goalCalculations: any[]
) {
  const rows = [
    ['NetPayFlow High-Yield Compound Projections & Goals Report'],
    [],
    ['Parameter Settings'],
    ['Starting Lump Sum (£)', initialLumpSum],
    ['Monthly Contribution Inflow (£)', monthlyDeposit],
    ['Annual Investment Yield (% APY)', annualRate],
    ['Timeline Term Selected', `${termYears} Years`],
    ['Compounding Interval', compoundFreq === 'monthly' ? 'Monthly' : 'Annually'],
    [],
    ['Calculated Milestones / Targets Status:'],
    ['Goal Name', 'Target Amount (£)', 'Status / Reach Time', 'Interest Contribution (£)'],
    ...goals.map((g, idx) => {
      const calc = goalCalculations[idx];
      if (!calc) return [g.name, g.targetAmount, 'No calculation', '£0'];
      if (calc.reached) {
        return [g.name, g.targetAmount, `Reached in ${calc.durationString || '0 months'}`, Math.round(calc.interestContribution || 0)];
      } else {
        return [g.name, g.targetAmount, calc.message || 'Out of reach', '£0'];
      }
    }),
    [],
    ['Compound Projection Timeline Curve Data:'],
    ['Timeline Point', 'Cumulative Self Deposits (£)', 'Compound Pot Value (£)', 'Interest Earned to Date (£)'],
    ...projectionData.map((pt) => [
      pt.label,
      pt.deposits,
      pt.balance,
      pt.interest
    ])
  ];

  const csvText = rows.map(e => e.map(val => {
    if (typeof val === 'string' && (val.includes(',') || val.includes('\n') || val.includes('"'))) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  }).join(',')).join('\n');

  downloadCSV('NetPayFlow_Compound_Savings.csv', csvText);
}

// Export 4: Debt Payoff Plan
export function exportDebtPayoffCSV(
  debts: DebtItem[],
  overpaymentPocket: number,
  strategy: string,
  stdMonths: number,
  stdInterest: number,
  optMonths: number,
  optInterest: number,
  savedInterest: number,
  savedMonths: number,
  comparativeTimeline: any[]
) {
  const rows = [
    ['NetPayFlow Debt Clearance Optimization Plan'],
    [],
    ['Active Registered Liabilities Summary:'],
    ['Debt Name / Institution', 'Current Outstanding Balance (£)', 'Interest APR Rate (%)', 'Minimum Monthly Repayment (£)'],
    ...debts.map(d => [d.name, d.balance, d.interestRate, d.monthlyRepayment]),
    [],
    ['Acceleration Options Selected:'],
    ['Monthly Overpayment Pocket Added (£)', overpaymentPocket],
    ['Algorithmic Clear Strategy', strategy === 'avalanche' ? 'Avalanche Model (Highest interest rate first)' : 'Snowball Model (Lowest balance first)'],
    [],
    ['Strategic Comparison Key Analysis Outcomes'],
    ['Payoff Timeline Outcome Type', 'Total Balance Clearance Duration', 'Accrued Lenders Cash Interest Cost (£)'],
    ['Standard Minimal Repayments Plan', stdMonths > 0 ? `${Math.floor(stdMonths / 12)} yrs ${stdMonths % 12} mos` : '0 mos', Math.round(stdInterest)],
    ['Accelerated Overpayments Plan', optMonths > 0 ? `${Math.floor(optMonths / 12)} yrs ${optMonths % 12} mos` : '0 mos', Math.round(optInterest)],
    [],
    ['Summary Clearance Yield'],
    ['Direct Financial Cash Interest Saved (£)', Math.round(savedInterest)],
    ['Months Cleared Faster', savedMonths],
    [],
    ['Simulated Clearance Combined Curves Timeline:'],
    ['Timeline interval', 'Standard Payoff Remaining Balance (£)', 'Accelerated Plan Remaining Balance (£)'],
    ...comparativeTimeline.map((pt) => [
      pt.label,
      pt.standardBalance,
      pt.optimizedBalance
    ])
  ];

  const csvText = rows.map(e => e.map(val => {
    if (typeof val === 'string' && (val.includes(',') || val.includes('\n') || val.includes('"'))) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  }).join(',')).join('\n');

  downloadCSV('NetPayFlow_Debt_Payoff_Plan.csv', csvText);
}
