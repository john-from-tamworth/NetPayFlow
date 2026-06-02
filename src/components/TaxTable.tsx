import { CalculationResult } from '../types';
import { Calendar, ReceiptText, ArrowRightLeft, FileCheck2, Info } from 'lucide-react';

interface TaxTableProps {
  result: CalculationResult;
}

export default function TaxTable({ result }: TaxTableProps) {
  const {
    grossPay,
    salarySacrificePension,
    adjustedNetIncome,
    personalAllowance,
    bikBenefit,
    taxableIncome,
    incomeTax,
    nationalInsurance,
    studentLoan,
    postgradLoan,
    totalDeductions,
    netTakeHome
  } = result;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  interface RowData {
    label: string;
    description: string;
    yearly: number;
    monthly: number;
    weekly: number;
    type: 'add' | 'deduct' | 'info' | 'total' | 'subtotal';
  }

  const tableRows: RowData[] = [
    {
      label: 'Gross Salary',
      description: 'Your headline annual pre-tax payroll salary',
      yearly: grossPay.yearly,
      monthly: grossPay.monthly,
      weekly: grossPay.weekly,
      type: 'add'
    },
    {
      label: 'Workplace Pension (Sacrifice)',
      description: 'Salary sacrifice pension contribution (exempt from tax/NI)',
      yearly: salarySacrificePension.yearly,
      monthly: salarySacrificePension.monthly,
      weekly: salarySacrificePension.weekly,
      type: 'deduct'
    },
    {
      label: 'Adjusted Net Salary (Take-home basis)',
      description: 'Pension-adjusted assessment base (your post-sacrifice gross)',
      yearly: adjustedNetIncome.yearly,
      monthly: adjustedNetIncome.monthly,
      weekly: adjustedNetIncome.weekly,
      type: 'subtotal'
    },
    {
      label: 'Standard/Tapered Personal Allowance',
      description: 'The standard tax-free threshold or tapered allowance',
      yearly: personalAllowance.yearly,
      monthly: personalAllowance.monthly,
      weekly: personalAllowance.weekly,
      type: 'info'
    },
    {
      label: 'Benefit-in-Kind (BIK)',
      description: 'Non-cash taxable employer perks (adds to tax, not cash deductions)',
      yearly: bikBenefit.yearly,
      monthly: bikBenefit.monthly,
      weekly: bikBenefit.weekly,
      type: 'info'
    },
    {
      label: 'Income Tax (PAYE)',
      description: 'Income Tax paid under Pay-As-You-Earn scheme',
      yearly: incomeTax.yearly,
      monthly: incomeTax.monthly,
      weekly: incomeTax.weekly,
      type: 'deduct'
    },
    {
      label: 'National Insurance (NI)',
      description: 'Employee Class 1 Primary standard NI contributions',
      yearly: nationalInsurance.yearly,
      monthly: nationalInsurance.monthly,
      weekly: nationalInsurance.weekly,
      type: 'deduct'
    },
    {
      label: 'Undergrad Student Loan',
      description: 'Student loans repayments based on specific plan threshold',
      yearly: studentLoan.yearly,
      monthly: studentLoan.monthly,
      weekly: studentLoan.weekly,
      type: 'deduct'
    },
    {
      label: 'Postgrad Student Loan',
      description: 'Postgraduate loan repayment calculated concurrently',
      yearly: postgradLoan.yearly,
      monthly: postgradLoan.monthly,
      weekly: postgradLoan.weekly,
      type: 'deduct'
    },
    {
      label: 'Total Deductions',
      description: 'Collective sum of pension, taxes, NI, and loan repayments',
      yearly: totalDeductions.yearly,
      monthly: totalDeductions.monthly,
      weekly: totalDeductions.weekly,
      type: 'total'
    },
    {
      label: 'Take-Home Cash Yield',
      description: 'Net cash credited into your bank account',
      yearly: netTakeHome.yearly,
      monthly: netTakeHome.monthly,
      weekly: netTakeHome.weekly,
      type: 'total'
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden transition-colors duration-200">
      {/* Table Header Controls */}
      <div className="mb-4 flex flex-col justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <ReceiptText className="h-4 w-4 text-indigo-600 dark:text-indigo-405 dark:text-indigo-400" />
          <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Comprehensive Deduction Table
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 rounded-full px-3 py-1">
          <FileCheck2 className="h-3 w-3 shrink-0" />
          <span>All figures in GBP (£)</span>
        </div>
      </div>

      {/* Overflow wrapper */}
      <div className="overflow-x-auto -mx-6 px-6 scrollbar-none">
        <table className="w-full min-w-[550px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              <th className="py-3 px-3">Payroll Line Item Name</th>
              <th className="py-3 px-3 text-right">Yearly Sum</th>
              <th className="py-3 px-3 text-right">Monthly Sum</th>
              <th className="py-3 px-3 text-right">Weekly Sum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {tableRows.map((row, index) => {
              // Row Styling variations based on row type
              let rowStyle = '';
              let labelStyle = 'font-bold text-slate-800 dark:text-slate-200';
              let valueStyle = 'font-mono font-black text-slate-800 dark:text-slate-100';

              if (row.type === 'deduct') {
                labelStyle = 'font-bold text-slate-655 text-slate-600 dark:text-slate-400';
                valueStyle = 'font-mono font-black text-rose-600 dark:text-rose-455 dark:text-rose-400';
              } else if (row.type === 'info') {
                rowStyle = 'bg-slate-50/40 dark:bg-slate-950/15 text-slate-500 dark:text-slate-405 dark:text-slate-400';
                labelStyle = 'font-bold text-slate-400 dark:text-slate-550 dark:text-slate-500';
                valueStyle = 'font-mono font-bold text-slate-400 dark:text-slate-550 dark:text-slate-500';
              } else if (row.type === 'subtotal') {
                rowStyle = 'bg-indigo-50/20 dark:bg-indigo-950/20 border-y border-indigo-100/60 dark:border-indigo-900/50 font-black';
                labelStyle = 'font-bold text-indigo-950 dark:text-indigo-300';
                valueStyle = 'font-mono font-black text-indigo-900 dark:text-indigo-400';
              } else if (row.label === 'Take-Home Cash Yield') {
                rowStyle = 'bg-emerald-50 dark:bg-emerald-950/30 border-t border-emerald-200 dark:border-emerald-900 font-extrabold text-sm';
                labelStyle = 'font-black text-emerald-950 dark:text-emerald-300';
                valueStyle = 'font-mono font-black text-emerald-800 dark:text-emerald-400';
              } else if (row.type === 'total') {
                rowStyle = 'bg-slate-50 dark:bg-slate-950/30 border-t border-slate-200 dark:border-slate-800';
                labelStyle = 'font-bold text-slate-800 dark:text-slate-200';
                valueStyle = 'font-mono font-black text-slate-850 text-slate-800 dark:text-slate-150';
              } else if (row.type === 'add') {
                labelStyle = 'font-bold text-slate-800 dark:text-slate-200';
                valueStyle = 'font-mono font-black text-slate-905 text-slate-900 dark:text-white';
              }

              // Guard against displaying BIK as cash addition, or Allowance as cash addition
              let displayYearly = row.yearly;
              let displayMonthly = row.monthly;
              let displayWeekly = row.weekly;

              return (
                <tr key={index} className={`transition-colors hover:bg-slate-50/40 dark:hover:bg-slate-800/10 ${rowStyle}`}>
                  {/* Item Description col */}
                  <td className="py-3 px-3 max-w-[240px]">
                    <div className="space-y-0.5">
                      <p className={labelStyle}>{row.label}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold leading-relaxed">{row.description}</p>
                    </div>
                  </td>
                  
                  {/* Frequency columns */}
                  <td className={`py-3 px-3 text-right font-semibold ${valueStyle}`}>
                    {row.type === 'deduct' && displayYearly > 0 ? '-' : ''}
                    {row.type === 'info' ? '( ' : ''}
                    {formatCurrency(displayYearly)}
                    {row.type === 'info' ? ' )' : ''}
                  </td>
                  
                  <td className={`py-3 px-3 text-right font-semibold ${valueStyle}`}>
                    {row.type === 'deduct' && displayMonthly > 0 ? '-' : ''}
                    {row.type === 'info' ? '( ' : ''}
                    {formatCurrency(displayMonthly)}
                    {row.type === 'info' ? ' )' : ''}
                  </td>
                  
                  <td className={`py-3 px-3 text-right font-semibold ${valueStyle}`}>
                    {row.type === 'deduct' && displayWeekly > 0 ? '-' : ''}
                    {row.type === 'info' ? '( ' : ''}
                    {formatCurrency(displayWeekly)}
                    {row.type === 'info' ? ' )' : ''}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Small informative footnote */}
      <div className="mt-4 flex items-start gap-2 rounded-2xl bg-slate-50 dark:bg-slate-950/20 p-4 border border-slate-200 dark:border-slate-800">
        <Info className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-slate-700 dark:text-slate-300 font-bold text-[10.5px]">Calculation Notes on HMRC Rulesets:</p>
          <ul className="list-disc pl-4 space-y-1 text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
            <li>Personal allowance (standard £12,570) is tapered at 50% on adjusted net income exceeding £100,000. Benefit-in-Kind (BIK) triggers tax liability but does not lower net cash directly.</li>
            <li>Workplace pension contributions are calculated based on Salary Sacrifice, which completely shields NI contributions, income tax, and undergraduate/postgraduate student loan repayment levies.</li>
          </ul>
        </div>
      </div>

    </div>
  );
}
