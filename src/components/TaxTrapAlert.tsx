import { CalculationResult, CalculatorInputs } from '../types';
import { AlertTriangle, TrendingUp, Sparkles, CheckCircle2, PiggyBank, ShieldAlert, Gift, Info } from 'lucide-react';

interface TaxTrapAlertProps {
  result: CalculationResult;
  inputs: CalculatorInputs;
  setInputs: (inputs: CalculatorInputs) => void;
}

export default function TaxTrapAlert({ result, inputs, setInputs }: TaxTrapAlertProps) {
  const { isTaxTrap, taxTrapOpportunitySaving, adjustedNetIncome, grossPay } = result;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0
    }).format(val);
  };

  const yearlySalary = grossPay.yearly;
  const netIncome = adjustedNetIncome.yearly;
  const isScotland = inputs.location === 'Scotland';

  // --- TRAP 1: The Personal Allowance Taper Trap (£100,000 to £125,140) ---
  const excessOver100k = yearlySalary - 100000;
  let requiredPensionPercentFor100k = 0;
  if (yearlySalary > 100000) {
    requiredPensionPercentFor100k = parseFloat(((excessOver100k / yearlySalary) * 100).toFixed(1));
  }

  const handleApply100kOptimizer = () => {
    if (requiredPensionPercentFor100k > 0) {
      setInputs({
        ...inputs,
        pensionPercent: Math.min(requiredPensionPercentFor100k, 100)
      });
    }
  };

  const escaped100kTrap = yearlySalary > 100000 && netIncome <= 100000;

  // --- TRAP 2: Child Benefit Taper Trap (£60,000 to £80,000) ---
  const isEligibleForChildBenefitTrap = netIncome > 60000 && netIncome <= 80000;
  const excessOver60k = yearlySalary - 60000;
  let requiredPensionPercentFor60k = 0;
  if (yearlySalary > 60000) {
    requiredPensionPercentFor60k = parseFloat(((excessOver60k / yearlySalary) * 100).toFixed(1));
  }

  const handleApplyChildBenefitOptimizer = () => {
    if (requiredPensionPercentFor60k > 0) {
      setInputs({
        ...inputs,
        pensionPercent: Math.min(requiredPensionPercentFor60k, 100)
      });
    }
  };

  const escapedChildBenefitTrap = yearlySalary > 60000 && netIncome <= 60000;

  // --- TRAP 3: Higher Rate Zone (£50,270 to £100,000) ---
  const inHigherRateZone = netIncome > 50270 && netIncome <= 100000;
  const excessOver50270 = yearlySalary - 50270;
  let requiredPensionPercentFor50270 = 0;
  if (yearlySalary > 50270) {
    requiredPensionPercentFor50270 = parseFloat(((excessOver50270 / yearlySalary) * 100).toFixed(1));
  }

  const handleApply50270Optimizer = () => {
    if (requiredPensionPercentFor50270 > 0) {
      setInputs({
        ...inputs,
        pensionPercent: Math.min(requiredPensionPercentFor50270, 100)
      });
    }
  };

  const escapedHigherRate = yearlySalary > 50270 && netIncome <= 50270;

  // Calculate approximate higher rate tax savings if pension is used to dodge the 40% band
  const potentialHigherRateSavings = Math.max(0, (yearlySalary - 50270) * (isScotland ? 0.21 : 0.20));

  return (
    <div className="space-y-4">
      {/* Dynamic Summary Panel Header */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2">
          <Info className="h-4 w-4" />
          HMRC Threshold &amp; Planning Engine
        </h3>
        <span className="text-[9px] font-mono font-bold text-slate-500">
          UK Rules (FY 2026/27)
        </span>
      </div>

      {/* --- 1. TAX-FREE ALLOWANCE BUFFER ALERT (Net Income <= £12,570) --- */}
      {netIncome <= 12570 && (
        <div className="rounded-3xl border border-emerald-200 dark:border-emerald-900/60 border-l-8 border-l-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/5 p-5 shadow-sm transform transition duration-300 hover:scale-[1.01]">
          <div className="flex items-start gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-xs">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black text-emerald-850 dark:text-emerald-400 uppercase tracking-wider">
                100% Tax-Free Earnings Buffer Active
              </h4>
              <p className="text-[11px] text-emerald-900 dark:text-emerald-300 font-medium leading-relaxed">
                Your Adjusted Net Income of <strong className="font-extrabold">{formatCurrency(netIncome)}</strong> falls within the official UK **Personal Allowance** limit of **£12,570**. You will pay **£0.00 Income Tax**! Celebrate keeping everything you earn!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- 2. BASIC RATE ZONE (Net Income > £12,570 and <= £50,270) --- */}
      {netIncome > 12570 && netIncome <= 50270 && yearlySalary <= 50270 && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/15 p-5 shadow-sm space-y-3">
          <div className="flex items-start gap-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-650 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
              <PiggyBank className="h-4.5 w-4.5" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="text-xs font-black text-slate-805 dark:text-slate-100 uppercase tracking-wider">
                  Basic Rate Tax Zone ({isScotland ? '19% - 21%' : '20% PAYE'})
                </h4>
                <span className="bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider border border-indigo-100 dark:border-indigo-900">
                  Stable Zone
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                Your salary has crossed the HMRC tax-free threshold of **£12,570**. For income above this, you pay basic tax rates and National Insurance (reduced to 8% in current UK budgets!). You have protected your standard personal allowance fully.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- 3. APPROACHING HIGHER RATE WARNING (Net Income approaches £50,270) --- */}
      {netIncome > 45000 && netIncome <= 50270 && yearlySalary <= 50270 && (
        <div className="rounded-3xl border border-amber-200 dark:border-amber-900/60 border-l-8 border-l-amber-500 bg-amber-50/10 dark:bg-amber-950/5 p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
              <AlertTriangle className="h-4.5 w-4.5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                Approaching Higher Rate Threshold
              </h4>
              <p className="text-[11px] text-amber-950 dark:text-amber-300 font-medium leading-relaxed">
                Your taxable income of <strong className="font-extrabold">{formatCurrency(netIncome)}</strong> is very close to the **£50,270** boundary. Above £50,270, the marginal Income Tax rate spikes from {isScotland ? '21%' : '20%'} up to **{isScotland ? '42%' : '40%'}**. Increasing your workplace pension contribution slightly can prevent you from crossing into the higher band!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- 3.5 HIGHER RATE TAX BRACKET ACTIVE --- */}
      {inHigherRateZone && (
        <div className="rounded-3xl border border-rose-200 dark:border-rose-900/60 border-l-8 border-l-amber-500 bg-amber-50/10 dark:bg-amber-950/5 p-5 shadow-md space-y-3">
          <div className="flex items-start gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
            <div className="space-y-1.5 w-full">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h4 className="text-xs font-black text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                  Higher Rate Tax Zone Active
                </h4>
                <span className="bg-amber-100 dark:bg-amber-950 text-amber-850 dark:text-amber-400 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider border border-amber-200 dark:border-amber-900">
                  {isScotland ? '42% Scottish rate' : '40% PAYE rate'}
                </span>
              </div>
              <p className="text-[11px] text-amber-950 dark:text-amber-300 leading-relaxed font-semibold">
                Your Adjusted Net Income of <strong className="font-extrabold">{formatCurrency(netIncome)}</strong> exceeds the Higher Rate threshold of **£50,270**. Earnings above this limit are subject to a **{isScotland ? '42%' : '40%'} bracket** plus **2% National Insurance**.
              </p>

              {/* Higher Rate Optimizer Card */}
              <div className="mt-3 rounded-2xl border border-amber-100/60 dark:border-amber-950/80 bg-white dark:bg-slate-900 p-4 shadow-xs">
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-black text-slate-800 dark:text-slate-250">
                        Workplace Pension Optimisation Opportunity:
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed mt-0.5">
                        Set your pension salary sacrifice rate to <strong className="text-indigo-650 dark:text-indigo-400 font-extrabold">{requiredPensionPercentFor50270}%</strong> (approx {formatCurrency(yearlySalary * (requiredPensionPercentFor50270 / 100))} per year) to lower your taxable net income down to £50,270.
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-50 dark:border-slate-800 flex-wrap gap-2">
                    <div className="text-[10px] font-semibold text-slate-450">
                      Unlocks <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">{formatCurrency(potentialHigherRateSavings)}</strong> of immediate tax savings!
                    </div>
                    <button
                      type="button"
                      onClick={handleApply50270Optimizer}
                      className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-[9px] font-black transition-all cursor-pointer shadow-xs active:scale-97"
                    >
                      Apply {requiredPensionPercentFor50270}% Pension
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- 3.6 HIGHER RATE BRACKET SUCCESSFULLY SHIELDED --- */}
      {escapedHigherRate && (
        <div className="rounded-3xl border border-emerald-200 dark:border-emerald-900/60 border-l-8 border-l-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10 p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-xs">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black text-emerald-850 dark:text-emerald-400 uppercase tracking-wider">
                Higher Rate Bracket Shielded!
              </h4>
              <p className="text-[11px] text-emerald-900 dark:text-emerald-300 font-medium leading-relaxed animate-pulse-subtle">
                Brilliant choice! Although your gross contract salary is {formatCurrency(yearlySalary)}, your pension salary sacrifice of <strong className="font-extrabold">{inputs.pensionPercent}%</strong> manages to pull your Adjusted Net Income back to **{formatCurrency(netIncome)}**, safely keeping you out of the 40%/42% higher rate band.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- 4. HIGH INCOME CHILD BENEFIT TAPER TRAP (£60,000 to £80,005) --- */}
      {isEligibleForChildBenefitTrap && (
        <div className="rounded-3xl border border-rose-200 dark:border-rose-900/60 border-l-8 border-l-pink-500 bg-rose-50/20 dark:bg-rose-950/10 p-5 shadow-md space-y-3">
          <div className="flex items-start gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pink-500 text-white">
              <Gift className="h-4.5 w-4.5" />
            </div>
            <div className="space-y-1.5 w-full">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h4 className="text-xs font-black text-rose-800 dark:text-rose-400 uppercase tracking-wider">
                  Child Benefit Clawback Zone Active (HICBC)
                </h4>
                <span className="bg-pink-100 dark:bg-rose-950 text-pink-700 dark:text-pink-400 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider border border-pink-200 dark:border-rose-900">
                  £60k - £80k Trap
                </span>
              </div>
              <p className="text-[11px] text-rose-950 dark:text-rose-200 font-semibold leading-relaxed">
                Your Adjusted Net Income is <strong className="font-extrabold">{formatCurrency(netIncome)}</strong>. 
                HMRC claws back Child Benefit at a rate of 1% for every £200 earned over £60,000, compounding your actual marginal tax rate. At £80,000, you lose your child benefit completely!
              </p>

              {/* Child Benefit Action Card */}
              <div className="mt-3 rounded-2xl border border-pink-100 dark:border-rose-950 bg-white dark:bg-slate-900 p-4 shadow-xs">
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-pink-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-black text-slate-800 dark:text-slate-200">
                        Insulate Child Benefits &amp; Save Income Tax:
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed mt-0.5">
                        Change your workplace pension contributions to <strong className="text-pink-600 font-extrabold">{requiredPensionPercentFor60k}%</strong> to lower your adjusted income back below £60,000.
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-50 dark:border-slate-800">
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider">
                      Reclaims 100% Child Benefit
                    </span>
                    <button
                      type="button"
                      onClick={handleApplyChildBenefitOptimizer}
                      className="rounded-lg bg-pink-600 hover:bg-pink-700 text-white px-3 py-1.5 text-[9px] font-black transition-all cursor-pointer active:scale-95 shadow-xs"
                    >
                      Apply {requiredPensionPercentFor60k}% Pension
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- 5. COMPLETED SECURE ESCAPE FOR CHILD BENEFIT TRAP --- */}
      {escapedChildBenefitTrap && (
        <div className="rounded-3xl border border-emerald-200 dark:border-emerald-900/60 border-l-8 border-l-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10 p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                Child Benefit Protected!
              </h4>
              <p className="text-[11px] text-emerald-955 text-emerald-800 dark:text-emerald-300 font-medium leading-relaxed">
                By maintaining a pension salary sacrifice of <strong className="font-extrabold">{inputs.pensionPercent}%</strong>, your Adjusted Net Income is kept at **{formatCurrency(netIncome)}** (safely below the £60,000 threshold). You avoid HICBC liability entirely and retain **100% of your family's Child Benefits**.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- 6. TAX-TAPER TRAP ACTIVE (£100,000 to £125,140) --- */}
      {isTaxTrap && (
        <div className="rounded-3xl border border-rose-200 dark:border-rose-900/60 border-l-8 border-l-rose-500 bg-rose-50/20 dark:bg-rose-950/10 p-5 shadow-md">
          <div className="flex items-start gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500 text-white shadow-xs">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="space-y-2 w-full">
              <div className="flex items-center justify-between gap-2 flex-wrap w-full">
                <h4 className="text-xs font-black text-rose-800 dark:text-rose-400 uppercase tracking-wider">
                  Tax-Taper Trap Active! (£100k - £125k)
                </h4>
                <span className="inline-block rounded-full bg-rose-100 dark:bg-rose-950 px-2 py-0.5 text-[8px] font-black text-rose-700 dark:text-rose-400 uppercase tracking-widest border border-rose-200 dark:border-rose-900">
                  {isScotland ? '70% effective rate' : '62% effective rate'}
                </span>
              </div>
              
              <p className="text-[11px] text-rose-950 dark:text-rose-200 font-semibold leading-relaxed">
                Your Adjusted Net Income is <strong className="font-extrabold">{formatCurrency(netIncome)}</strong>. 
                Because it exceeds £100,000, your Personal Allowance is reduced by **£1 for every £2** of excess. 
                This causes an effective marginal tax rate of **{isScotland ? '70%' : '62%'}** within this band! 
                You also lose **30 Tax-Free Childcare Hours** and the tax-free childcare account buffer entirely.
              </p>

              {/* Action Optimizer Card */}
              <div className="mt-3 rounded-2xl border border-rose-100 dark:border-rose-950 bg-white dark:bg-slate-900 p-4 shadow-xs">
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-black text-slate-805 dark:text-slate-100">
                        Escape the £100k Trap:
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed mt-0.5">
                        Bring your taxable Adjusted Net Income back down to £100,000 by increasing your pension contribution to <strong className="text-indigo-600 dark:text-indigo-400 font-extrabold">{requiredPensionPercentFor100k}%</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 flex-wrap border-t border-slate-50 dark:border-slate-800 pt-2 text-xs">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                        Real Cash Savings
                      </span>
                      <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(taxTrapOpportunitySaving)} immediate relief
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleApply100kOptimizer}
                      className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-[9px] font-black cursor-pointer transition-all active:scale-95 shadow-xs"
                    >
                      Apply {requiredPensionPercentFor100k}% Pension
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- 7. TAX-TAPER TRAP ESCAPED CONGRATS --- */}
      {escaped100kTrap && (
        <div className="rounded-3xl border border-emerald-250 border-emerald-200 dark:border-emerald-900/60 border-l-8 border-l-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-xs">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                62% Tax-Taper Trap Shielded!
              </h4>
              <p className="text-[11px] text-emerald-900 dark:text-emerald-300 font-medium leading-relaxed">
                Excellent! Your gross salary is {formatCurrency(yearlySalary)}, but your salary sacrifice pension rate of **{inputs.pensionPercent}%** lowers your Adjusted Net Income back to **{formatCurrency(netIncome)}** (safely below the £100,000 threshold). 
                You have fully preserved your **£12,570 Tax-Free Personal Allowance** and kept childcare eligibility safe!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- 8. ADDITIONAL RATE TAX ALERT (£125,140+) --- */}
      {netIncome > 125140 && (
        <div className="rounded-3xl border border-rose-200 dark:border-rose-900/40 border-l-8 border-l-indigo-600 bg-indigo-50/10 dark:bg-indigo-950/5 p-5 space-y-2">
          <div className="flex items-start gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <ShieldAlert className="h-4.5 w-4.5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Additional / Top Rate Tax Zone Active
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                Your Adjusted Net Income is **{formatCurrency(netIncome)}**. 
                You have reached the maximum UK tax band limit (£125,140+). Within this zone:
                1. Your **Personal Allowance has been completely tapered to £0**.
                2. Every £1 of extra earnings is taxed at the highest bracket of **{isScotland ? 'Top Rate (48%)' : 'Additional Rate (45%)' }**.
                3. High earners can make additional premium pension or charitable selections to capture relief, but remain aware of the annual allowance limit rules.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- 9. EDUCATION PLANNER ROW (Always show helpful educational tip at the bottom) --- */}
      {netIncome < 100000 && !isEligibleForChildBenefitTrap && !inHigherRateZone && (
        <div className="bg-slate-50/40 dark:bg-slate-950/5 border border-slate-202 dark:border-slate-850 border-slate-200 rounded-3xl p-5 shadow-xs flex items-start gap-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-slate-100 dark:border-slate-800">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Smart Tax Strategy Warning
            </p>
            <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
              UK Tax Planning uses Adjusted Net Income (earnings after salary sacrifice pension contributions). Increasing pension sacrifice reduces tax liability, keeps child benefit active, recaptures Personal Allowance, and prevents student loan deduction triggers. Take action early using the options above!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
