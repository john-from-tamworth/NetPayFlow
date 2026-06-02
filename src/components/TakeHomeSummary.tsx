import { CalculationResult } from '../types';
import { Calendar, ReceiptEuro, Wallet, Percent, ArrowDownCircle, Download } from 'lucide-react';
import { exportPayCalculatorCSV } from '../utils/csvDownloader';

interface TakeHomeSummaryProps {
  result: CalculationResult;
}

export default function TakeHomeSummary({ result }: TakeHomeSummaryProps) {
  const { netTakeHome, grossPay, totalDeductions, effectiveTaxRate, effectiveDeductionRate } = result;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  return (
    <div className="space-y-6">
      
      {/* Primary Take-Home Pay Main Card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-colors duration-200">

        <div className="relative space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              ESTIMATED TAKE-HOME YIELD
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/40 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              <Wallet className="h-3 w-3" />
              <span>Net Inflow</span>
            </span>
          </div>

          {/* Large Monthly Value */}
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500">Monthly Take-Home Pay</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-5xl font-black tracking-tight text-emerald-600 dark:text-emerald-400 font-sans">
                {formatCurrency(netTakeHome.monthly).split('.')[0]}
              </span>
              <span className="text-2xl font-black text-emerald-600/80 dark:text-emerald-400/80 font-sans">
                .{formatCurrency(netTakeHome.monthly).split('.')[1]}
              </span>
            </div>
          </div>

          {/* Grid for Year and Week breakouts */}
          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4 mt-6">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                Yearly Net
              </span>
              <p className="text-xl font-black text-slate-800 dark:text-slate-100 font-sans">
                {formatCurrency(netTakeHome.yearly).split('.')[0]}
                <span className="text-xs text-slate-400 dark:text-slate-500 font-bold font-sans">
                  .{formatCurrency(netTakeHome.yearly).split('.')[1]}
                </span>
              </p>
            </div>
            
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                Weekly Net
              </span>
              <p className="text-xl font-black text-slate-800 dark:text-slate-100 font-sans">
                {formatCurrency(netTakeHome.weekly).split('.')[0]}
                <span className="text-xs text-slate-400 dark:text-slate-500 font-bold font-sans">
                  .{formatCurrency(netTakeHome.weekly).split('.')[1]}
                </span>
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => exportPayCalculatorCSV(result)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white px-4 py-2.5 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Download Take-Home Calculations (CSV)</span>
            </button>
          </div>

          {/* Quick Stats: Effective tax rate progress */}
          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2 bg-slate-50 dark:bg-slate-950/30 -mx-6 -mb-6 px-6 py-4 rounded-b-3xl">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-100 dark:bg-indigo-950/35 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                <Percent className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Eff. Tax Rate</p>
                <p className="text-xs font-black text-slate-800 dark:text-slate-200">
                  {(effectiveTaxRate * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-150 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                <ArrowDownCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">All Deductions</p>
                <p className="text-xs font-black text-slate-800 dark:text-slate-205 dark:text-slate-200">
                  {(effectiveDeductionRate * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Ad Placeholder 1: Inline Ad Box placed right beneath summary card */}
      <div className="overflow-hidden rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 p-4 text-center">
        <div className="flex flex-col items-center justify-center py-2">
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
            Sponsored advertisement
          </span>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3 shadow-xs">
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-300 font-sans">Google AdSense Partner Unit</p>
            <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">In-Feed Placement Optimized For Bento Cards</p>
          </div>
        </div>
      </div>

    </div>
  );
}
