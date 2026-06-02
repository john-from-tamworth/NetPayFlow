import { CalculationResult, CalculatorInputs } from '../types';
import { ArrowUpRight, TrendingUp, Calendar, Wallet, Landmark, Percent, Copy, Check, Info } from 'lucide-react';
import { useState } from 'react';

interface ComparisonSummaryProps {
  result: CalculationResult;
  compareResult: CalculationResult;
  inputs: CalculatorInputs;
  compareInputs: CalculatorInputs;
  onCopyScenarioAToB: () => void;
  onResetScenarioB: () => void;
}

export default function ComparisonSummary({
  result,
  compareResult,
  inputs,
  compareInputs,
  onCopyScenarioAToB,
  onResetScenarioB,
}: ComparisonSummaryProps) {
  const [copied, setCopied] = useState(false);

  const formatCurrency = (val: number, decimals = 0) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
    }).format(val);
  };

  const hasGain = compareResult.netTakeHome.yearly > result.netTakeHome.yearly;
  const netDiffMonthly = compareResult.netTakeHome.monthly - result.netTakeHome.monthly;
  const netDiffYearly = compareResult.netTakeHome.yearly - result.netTakeHome.yearly;
  const pensionDiffMonthly = compareResult.salarySacrificePension.monthly - result.salarySacrificePension.monthly;
  const pensionDiffYearly = compareResult.salarySacrificePension.yearly - result.salarySacrificePension.yearly;

  // Total wealth gain = cash increase + pension savings
  const totalWealthDiffMonthly = netDiffMonthly + pensionDiffMonthly;
  const totalWealthDiffYearly = netDiffYearly + pensionDiffYearly;

  const grossDiffYearly = compareInputs.grossSalary - inputs.grossSalary;

  const handleSync = () => {
    onCopyScenarioAToB();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6 transition-all animate-in fade-in duration-300">
      {/* Header element */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-100 dark:bg-indigo-950/50 p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Scenario Compare Desk
            </h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
              Before &amp; After analysis for salary bumps &amp; pension sacrifice
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSync}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-all cursor-pointer"
            title="Copy all settings from Scenario A to Scenario B"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-500 animate-scale-in" />
                <span className="text-emerald-500">Synchronised!</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 text-slate-400" />
                <span>Clone Scenario A to B</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hero Yield Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Metric 1: Net Cash Yield Change */}
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/25 p-4 flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block">
              Net Take-home Pay
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold block mt-0.5">
              Available Cash
            </span>
          </div>
          <div className="mt-3">
            <p className={`text-2xl font-black font-sans ${netDiffMonthly >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
              {netDiffMonthly >= 0 ? '+' : ''}{formatCurrency(netDiffMonthly)}
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 font-sans"> / mo</span>
            </p>
            <p className="text-[10px] text-slate-450 text-slate-400 dark:text-slate-500 font-bold font-sans mt-0.5">
              {netDiffYearly >= 0 ? '+' : ''}{formatCurrency(netDiffYearly)} / year
            </p>
          </div>
        </div>

        {/* Metric 2: Pension Savings Increase */}
        <div className="rounded-2xl border border-indigo-100 dark:border-indigo-950/55 bg-indigo-50/15 dark:bg-indigo-950/5 p-4 flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 dark:text-indigo-500 block">
              Workplace Pension
            </span>
            <span className="text-xs text-indigo-505 text-indigo-400 dark:text-indigo-450 font-semibold block mt-0.5">
              Retirement Pot Savings
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-sans">
              {pensionDiffMonthly >= 0 ? '+' : ''}{formatCurrency(pensionDiffMonthly)}
              <span className="text-xs font-bold text-indigo-450 text-indigo-400 dark:text-indigo-500 font-sans"> / mo</span>
            </p>
            <p className="text-[10px] text-indigo-400 dark:text-indigo-500 font-bold font-sans mt-0.5">
              {pensionDiffYearly >= 0 ? '+' : ''}{formatCurrency(pensionDiffYearly)} / year (tax-shielded)
            </p>
          </div>
        </div>

        {/* Metric 3: Total Combined Value (Gain / Loss) */}
        <div className="rounded-2xl border border-emerald-100 dark:border-emerald-950/55 bg-emerald-50/10 dark:bg-emerald-950/5 p-4 flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 dark:text-emerald-400 block">
              Combined Inbound Wealth
            </span>
            <span className="text-xs text-emerald-450 text-emerald-400 dark:text-emerald-550 font-semibold block mt-0.5">
              Cash Pay + Pension Savings
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-emerald-500 dark:text-emerald-400 font-sans">
              {totalWealthDiffMonthly >= 0 ? '+' : ''}{formatCurrency(totalWealthDiffMonthly)}
              <span className="text-xs font-bold text-emerald-450 text-emerald-400 dark:text-emerald-500 font-sans"> / mo</span>
            </p>
            <p className="text-[10px] text-emerald-450 text-emerald-400 dark:text-emerald-500 font-bold font-sans mt-0.5">
              {totalWealthDiffYearly >= 0 ? '+' : ''}{formatCurrency(totalWealthDiffYearly)} / year
            </p>
          </div>
        </div>

      </div>

      {/* Side by side comparison Table block */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">A: Base</th>
              <th className="py-2.5 px-3">B: Comparison</th>
              <th className="py-2.5 px-3 text-right">Differential</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
            <tr>
              <td className="py-2.5 px-3 font-semibold text-slate-500">Gross Salary</td>
              <td className="py-2.5 px-3 font-mono text-slate-800 dark:text-slate-200">{formatCurrency(inputs.grossSalary)}</td>
              <td className="py-2.5 px-3 font-mono text-slate-800 dark:text-slate-200">{formatCurrency(compareInputs.grossSalary)}</td>
              <td className={`py-2.5 px-3 font-mono font-bold text-right ${grossDiffYearly > 0 ? 'text-emerald-600 dark:text-emerald-400' : grossDiffYearly < 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                {grossDiffYearly > 0 ? '+' : ''}{formatCurrency(grossDiffYearly)}/yr
              </td>
            </tr>
            <tr>
              <td className="py-2.5 px-3 font-semibold text-slate-500">Workplace Pension</td>
              <td className="py-2.5 px-3 font-mono text-slate-800 dark:text-slate-200">
                {inputs.pensionPercent}% ({formatCurrency(result.salarySacrificePension.monthly)}/mo)
              </td>
              <td className="py-2.5 px-3 font-mono text-slate-800 dark:text-slate-200">
                {compareInputs.pensionPercent}% ({formatCurrency(compareResult.salarySacrificePension.monthly)}/mo)
              </td>
              <td className={`py-2.5 px-3 font-mono font-bold text-right ${pensionDiffMonthly > 0 ? 'text-indigo-600 dark:text-indigo-400' : pensionDiffMonthly < 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                {pensionDiffMonthly > 0 ? '+' : ''}{formatCurrency(pensionDiffMonthly)}/mo
              </td>
            </tr>
            <tr>
              <td className="py-2.5 px-3 font-semibold text-slate-500">Income Tax</td>
              <td className="py-2.5 px-3 font-mono text-slate-800 dark:text-slate-200">{formatCurrency(result.incomeTax.monthly)}/mo</td>
              <td className="py-2.5 px-3 font-mono text-slate-800 dark:text-slate-200">{formatCurrency(compareResult.incomeTax.monthly)}/mo</td>
              <td className={`py-2.5 px-3 font-mono font-bold text-right ${(compareResult.incomeTax.monthly - result.incomeTax.monthly) > 0 ? 'text-rose-550 text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {compareResult.incomeTax.monthly - result.incomeTax.monthly >= 0 ? '+' : ''}{formatCurrency(compareResult.incomeTax.monthly - result.incomeTax.monthly)}/mo
              </td>
            </tr>
            <tr>
              <td className="py-2.5 px-3 font-semibold text-slate-500">National Insurance</td>
              <td className="py-2.5 px-3 font-mono text-slate-800 dark:text-slate-200">{formatCurrency(result.nationalInsurance.monthly)}/mo</td>
              <td className="py-2.5 px-3 font-mono text-slate-800 dark:text-slate-200">{formatCurrency(compareResult.nationalInsurance.monthly)}/mo</td>
              <td className={`py-2.5 px-3 font-mono font-bold text-right ${(compareResult.nationalInsurance.monthly - result.nationalInsurance.monthly) > 0 ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {compareResult.nationalInsurance.monthly - result.nationalInsurance.monthly >= 0 ? '+' : ''}{formatCurrency(compareResult.nationalInsurance.monthly - result.nationalInsurance.monthly)}/mo
              </td>
            </tr>
            {(result.studentLoan.yearly > 0 || compareResult.studentLoan.yearly > 0) && (
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-500">Student Loan</td>
                <td className="py-2.5 px-3 font-mono text-slate-800 dark:text-slate-200">{formatCurrency(result.studentLoan.monthly)}/mo</td>
                <td className="py-2.5 px-3 font-mono text-slate-800 dark:text-slate-200">{formatCurrency(compareResult.studentLoan.monthly)}/mo</td>
                <td className={`py-2.5 px-3 font-mono font-bold text-right ${(compareResult.studentLoan.monthly - result.studentLoan.monthly) > 0 ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {compareResult.studentLoan.monthly - result.studentLoan.monthly >= 0 ? '+' : ''}{formatCurrency(compareResult.studentLoan.monthly - result.studentLoan.monthly)}/mo
                </td>
              </tr>
            )}
            <tr className="bg-emerald-50/20 dark:bg-emerald-950/10 font-bold">
              <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200 font-extrabold">Net Take-Home Cash</td>
              <td className="py-2.5 px-3 font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">{formatCurrency(result.netTakeHome.monthly)}/mo</td>
              <td className="py-2.5 px-3 font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">{formatCurrency(compareResult.netTakeHome.monthly)}/mo</td>
              <td className={`py-2.5 px-3 font-mono font-black text-right ${netDiffMonthly >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                {netDiffMonthly >= 0 ? '+' : ''}{formatCurrency(netDiffMonthly)}/mo
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Explanatory insights badge */}
      <div className="flex items-start gap-2.5 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-2xl p-4 border border-indigo-100/40 dark:border-indigo-900/30 text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed font-semibold">
        <Info className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-indigo-900 dark:text-indigo-300 mb-0.5">Understand your comparison:</span>
          {grossDiffYearly > 0 && pensionDiffMonthly > 0 ? (
            <p>
              By combining a gross wage increase of <strong className="font-extrabold">{formatCurrency(grossDiffYearly)}</strong> with a higher pension contribution, you are shielding extra income from HMRC. Even with more cash in your pension fund (<span className="text-indigo-600 dark:text-indigo-400 font-bold">+{formatCurrency(pensionDiffMonthly)}/mo</span>), you keep <span className="text-emerald-604 text-emerald-600 dark:text-emerald-400 font-bold">+{formatCurrency(netDiffMonthly)}/mo</span> in daily spending money!
            </p>
          ) : grossDiffYearly > 0 ? (
            <p>
              Your salary bump of <strong className="font-bold">{formatCurrency(grossDiffYearly)}/yr</strong> translates to <span className="text-emerald-600 dark:text-emerald-400 font-bold">+{formatCurrency(netDiffMonthly)}/mo</span> in take-home pay. Consider raising your workplace pension contribution slightly to avoid higher tax thresholds &amp; build long term secure savings!
            </p>
          ) : pensionDiffMonthly !== 0 ? (
            <p>
              Toggling your pension sacrifice contribution directly impacts your monthly takeaway. Increasing pension sacrifices shields your funds from full tax &amp; NIC brackets, meaning your workplace retirement account growth costs significantly less in lost take-home cash!
            </p>
          ) : (
            <p>
              Alter either scenario's gross compensation, workplace contributions, locations or custom tax codes to instantly see the real-time compared cash yield.
            </p>
          )}
        </div>
      </div>

    </div>
  );
}
