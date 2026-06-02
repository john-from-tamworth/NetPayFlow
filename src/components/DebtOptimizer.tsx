import { useState, useEffect, useMemo, FormEvent } from 'react';
import { PiggyBank, Briefcase, Plus, Trash2, ShieldAlert, Sparkles, HelpCircle, Info, Landmark, Play, TrendingDown, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { exportDebtPayoffCSV } from '../utils/csvDownloader';

interface DebtItem {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  monthlyRepayment: number;
}

export default function DebtOptimizer() {
  const [useSharedSpare, setUseSharedSpare] = useState(true);
  const [sharedSpareVal, setSharedSpareVal] = useState<number>(() => {
    return Number(localStorage.getItem('shared_monthly_savings_budget') || '200'); // defaults to leftover
  });

  const [debts, setDebts] = useState<DebtItem[]>(() => {
    const saved = localStorage.getItem('debt_items');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: '1', name: 'Car Finance (PCP)', balance: 8500, interestRate: 6.9, monthlyRepayment: 220 },
      { id: '2', name: 'Main Credit Card', balance: 3200, interestRate: 19.9, monthlyRepayment: 120 },
      { id: '3', name: 'Personal Loan', balance: 14000, interestRate: 5.2, monthlyRepayment: 310 },
    ];
  });

  const [overpaymentBudget, setOverpaymentBudget] = useState<number>(() => {
    return Number(localStorage.getItem('debt_overpayment_budget') || '150');
  });

  const [paymentStrategy, setPaymentStrategy] = useState<'avalanche' | 'snowball'>(() => {
    return (localStorage.getItem('debt_strategy') as 'avalanche' | 'snowball') || 'avalanche';
  });

  // Keep a budget fallback value in case they don't want to use shared leftovers
  const [customOverpayment, setCustomOverpayment] = useState<number>(() => {
    return Number(localStorage.getItem('debt_custom_overpayment') || '150');
  });

  // Form fields
  const [newName, setNewName] = useState('');
  const [newBalance, setNewBalance] = useState('');
  const [newRate, setNewRate] = useState('');
  const [newRepayment, setNewRepayment] = useState('');

  // Watch for Budget Planner shared spare changes
  useEffect(() => {
    const handleBudgetUpdate = () => {
      // We will look up the spare cash by looking at income minus expenses
      // Alternatively, we can let them use the shared monthly savings budget as details
      const liveSavingsBudget = Number(localStorage.getItem('shared_monthly_savings_budget') || '200');
      setSharedSpareVal(liveSavingsBudget);
    };

    window.addEventListener('update_savings_budget', handleBudgetUpdate);
    handleBudgetUpdate();
    return () => {
      window.removeEventListener('update_savings_budget', handleBudgetUpdate);
    };
  }, []);

  // Sync to local DB
  useEffect(() => {
    localStorage.setItem('debt_items', JSON.stringify(debts));
    localStorage.setItem('debt_overpayment_budget', overpaymentBudget.toString());
    localStorage.setItem('debt_strategy', paymentStrategy);
    localStorage.setItem('debt_custom_overpayment', customOverpayment.toString());
  }, [debts, overpaymentBudget, paymentStrategy, customOverpayment]);

  const activeOverpayment = useSharedSpare ? sharedSpareVal : customOverpayment;

  const handleAddDebt = (e: FormEvent) => {
    e.preventDefault();
    const bal = parseFloat(newBalance);
    const rt = parseFloat(newRate);
    const pay = parseFloat(newRepayment);

    if (!newName.trim() || isNaN(bal) || bal <= 0 || isNaN(rt) || isNaN(pay) || pay <= 0) return;

    // Check if repayment is less than monthly interest to prevent infinite debt trap warning
    const monthlyInt = bal * (rt / 100 / 12);
    if (pay <= monthlyInt) {
      alert(`Warning: The standard monthly repayment (£${pay}) must be higher than the monthly accured interest (£${Math.ceil(monthlyInt)}) or the debt will grow indefinitely!`);
      return;
    }

    const newDebt: DebtItem = {
      id: Date.now().toString(),
      name: newName.trim(),
      balance: bal,
      interestRate: rt,
      monthlyRepayment: pay,
    };

    setDebts([...debts, newDebt]);
    setNewName('');
    setNewBalance('');
    setNewRate('');
    setNewRepayment('');
  };

  const handleRemoveDebt = (id: string) => {
    setDebts(debts.filter(d => d.id !== id));
  };

  const totalDebtBalance = debts.reduce((sum, d) => sum + d.balance, 0);
  const totalMinRepayments = debts.reduce((sum, d) => sum + d.monthlyRepayment, 0);

  // SIMULATORS: Simulate payoff schedules month-by-month
  // 1. STANDARD PAYOFF SIMULATION
  const standardSimulation = useMemo(() => {
    if (debts.length === 0) return { months: 0, totalInterest: 0, timeline: [] };

    let simDebts = debts.map(d => ({ ...d }));
    let timelinePoints = [];
    let totalInterest = 0;
    let monthsElapsed = 0;
    const maxMonths = 360; // 30 years safety bounds

    timelinePoints.push({
      month: 0,
      label: 'Start',
      balance: Math.round(totalDebtBalance),
    });

    while (simDebts.some(d => d.balance > 0) && monthsElapsed < maxMonths) {
      monthsElapsed++;
      let monthlyCombinedBalance = 0;

      for (let d of simDebts) {
        if (d.balance <= 0) continue;

        // Accrue interest first
        const monthlyInterest = d.balance * (d.interestRate / 100 / 12);
        d.balance += monthlyInterest;
        totalInterest += monthlyInterest;

        // Apply regular repayment
        const actualPayment = Math.min(d.balance, d.monthlyRepayment);
        d.balance -= actualPayment;

        monthlyCombinedBalance += d.balance;
      }

      // Record quarterly points for readable chart timeline
      if (monthsElapsed % 3 === 0 || simDebts.every(d => d.balance === 0)) {
        timelinePoints.push({
          month: monthsElapsed,
          label: `Mo ${monthsElapsed}`,
          balance: Math.round(monthlyCombinedBalance),
        });
      }
    }

    return {
      months: monthsElapsed,
      totalInterest,
      timeline: timelinePoints,
    };
  }, [debts, totalDebtBalance]);

  // 2. OPTIMIZED ACCELERATED SIMULATION WITH OVERPAYMENT (Avalanche vs Snowball)
  const optimizedSimulation = useMemo(() => {
    if (debts.length === 0) return { months: 0, totalInterest: 0, timeline: [] };

    let simDebts = debts.map(d => ({ ...d }));
    let timelinePoints = [];
    let totalInterest = 0;
    let monthsElapsed = 0;
    const maxMonths = 360; // 30 years safety bounds

    timelinePoints.push({
      month: 0,
      label: 'Start',
      balance: Math.round(totalDebtBalance),
    });

    while (simDebts.some(d => d.balance > 0) && monthsElapsed < maxMonths) {
      monthsElapsed++;
      let monthlyCombinedBalance = 0;

      // Track standard repayments made first
      let paymentsMadeThisMonth = 0;

      // 1. Compile month interest accumulation & apply minimum payments
      for (let d of simDebts) {
        if (d.balance <= 0) continue;

        // Accrue interest
        const monthlyInterest = d.balance * (d.interestRate / 100 / 12);
        d.balance += monthlyInterest;
        totalInterest += monthlyInterest;

        // standard payment
        const standardAmt = Math.min(d.balance, d.monthlyRepayment);
        d.balance -= standardAmt;
        paymentsMadeThisMonth += standardAmt;
      }

      // 2. Distribute Extra Overpayment budget + freed minimums (Snowball/Avalanche rollover!)
      // Combined active pool = original overpayment budget + (freed standard repayment budgets from finished debts!)
      let activeOutstandingStandardCommitments = simDebts
        .filter(d => d.balance > 0)
        .reduce((sum, d) => sum + d.monthlyRepayment, 0);

      // The rollover pool amount is the difference in minimum commitments that can now be sent to accelerate the focus debt
      let freedRepaymentRollover = Math.max(0, totalMinRepayments - activeOutstandingStandardCommitments);
      let availableExtraRepaymentPool = activeOverpayment + freedRepaymentRollover;

      // Sort remaining active debts based on strategy
      let activeDebtsSorted = simDebts.filter(d => d.balance > 0);
      if (paymentStrategy === 'avalanche') {
        // Avalanche: Sort by interest rate descending (mathematically optimal to reduce interest!)
        activeDebtsSorted.sort((a, b) => b.interestRate - a.interestRate);
      } else {
        // Snowball: Sort by remaining balance ascending (visually rewarding!)
        activeDebtsSorted.sort((a, b) => a.balance - b.balance);
      }

      // Apply extra deposits recursively to targeted high-priority debts
      for (let target of activeDebtsSorted) {
        if (availableExtraRepaymentPool <= 0) break;
        const extraPaymentNeeded = Math.min(target.balance, availableExtraRepaymentPool);
        target.balance -= extraPaymentNeeded;
        availableExtraRepaymentPool -= extraPaymentNeeded;
      }

      // Re-sum remaining totals
      const combinedRemaining = simDebts.reduce((sum, d) => sum + Math.max(0, d.balance), 0);

      if (monthsElapsed % 3 === 0 || combinedRemaining === 0) {
        timelinePoints.push({
          month: monthsElapsed,
          label: `Mo ${monthsElapsed}`,
          balance: Math.round(combinedRemaining),
        });
      }

      if (combinedRemaining === 0) break;
    }

    return {
      months: monthsElapsed,
      totalInterest,
      timeline: timelinePoints,
    };
  }, [debts, totalDebtBalance, activeOverpayment, paymentStrategy, totalMinRepayments]);

  // Merge timelines into unified comparative sequence for Recharts
  const comparativeChartData = useMemo(() => {
    const maxLen = Math.max(standardSimulation.timeline.length, optimizedSimulation.timeline.length);
    const unified = [];

    // Combine matching intervals smoothly
    const maxMonths = Math.max(standardSimulation.months, optimizedSimulation.months);
    
    for (let m = 0; m <= maxMonths; m += 3) {
      const stdPt = standardSimulation.timeline.find(p => p.month === m) || 
                   (m > standardSimulation.months ? { balance: 0 } : null);
      const optPt = optimizedSimulation.timeline.find(p => p.month === m) || 
                   (m > optimizedSimulation.months ? { balance: 0 } : null);

      if (stdPt || optPt) {
        unified.push({
          month: m,
          label: `Month ${m}`,
          standardBalance: stdPt ? stdPt.balance : 0,
          optimizedBalance: optPt ? optPt.balance : 0,
        });
      }
    }

    // Always push absolute final 0 point
    unified.push({
      month: maxMonths,
      label: `Finished`,
      standardBalance: 0,
      optimizedBalance: 0,
    });

    return unified;
  }, [standardSimulation, optimizedSimulation]);

  const interestSaved = Math.max(0, standardSimulation.totalInterest - optimizedSimulation.totalInterest);
  const monthsFaster = Math.max(0, standardSimulation.months - optimizedSimulation.months);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header Introduction */}
      <div className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 dark:bg-indigo-950/50 p-2.5 rounded-2xl text-indigo-650 dark:text-indigo-400">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-indigo-600 dark:text-indigo-400">Section 4</span>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5 animate-in fade-in slide-in-from-left-2">Debt payoff &amp; Overpayment Desk</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
                Organise external debts, loans, PCP car leases or credit cards. Model mathematical payoff behaviors like Avalanche and Snowball to see exactly how extra overpayments collapse repayment times and interest!
              </p>
            </div>
          </div>
          <button
            onClick={() => exportDebtPayoffCSV(
              debts,
              activeOverpayment,
              paymentStrategy,
              standardSimulation.months,
              standardSimulation.totalInterest,
              optimizedSimulation.months,
              optimizedSimulation.totalInterest,
              interestSaved,
              monthsFaster,
              comparativeChartData
            )}
            className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white px-4 py-2.5 text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 focus-within:opacity-100 duration-350"
          >
            <Download className="h-4 w-4" />
            <span>Download Payoff Plan (CSV)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column: input debts and strategies */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Debt Ledger Desk
            </h2>

            {/* Quick add form */}
            <form onSubmit={handleAddDebt} className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850">
              <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-405 block">Register Active Liabilities</span>
              
              <div className="space-y-2">
                <input
                  type="text"
                  required
                  placeholder="Debt Name (e.g. Barclays Car Loan, PCP)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 p-2 text-xs font-semibold focus:outline-hidden focus:border-indigo-500 dark:text-white"
                />

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[8px] text-slate-400 font-bold uppercase block pl-1">Balance (£)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 5000"
                      value={newBalance}
                      onChange={(e) => setNewBalance(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 p-2 text-xs font-mono font-black focus:outline-hidden focus:border-indigo-500 dark:text-white-850 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] text-slate-400 font-bold uppercase block pl-1">Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      placeholder="e.g. 12"
                      value={newRate}
                      onChange={(e) => setNewRate(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 p-2 text-xs font-mono font-black focus:outline-hidden focus:border-indigo-500 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] text-slate-400 font-bold uppercase block pl-1">Min Repay (£)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 150"
                      value={newRepayment}
                      onChange={(e) => setNewRepayment(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 p-2 text-xs font-mono font-black focus:outline-hidden focus:border-indigo-500 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-100 dark:shadow-none"
              >
                <Plus className="h-4 w-4" /> Add Debt to Calculator
              </button>
            </form>

            {/* List of registered debts */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {debts.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-400 font-medium">No active debts registered. Debt-free is a safe landscape!</p>
              ) : (
                debts.map(d => (
                  <div key={d.id} className="p-3 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all font-sans">
                    <div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">{d.name}</h4>
                      <p className="text-[9px] text-slate-400 font-bold mt-0.5 uppercase tracking-wide">
                        Balance: <span className="font-mono text-slate-800 dark:text-white">{formatCurrency(d.balance)}</span> @ <span className="font-mono text-slate-800 dark:text-white font-black">{d.interestRate}%</span> APR
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 block">Pays</span>
                        <span className="font-mono text-xs font-black text-rose-550 text-slate-800 dark:text-slate-200 font-sans mt-0.5">{formatCurrency(d.monthlyRepayment)}/mo</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDebt(d.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-650 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Strategy Selection & Extra Overpayment Settings */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Acceleration Strategy Setup
            </h3>

            {/* Overpayment Allocation source */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Monthly Overpayment Pocket Source
              </label>

              <div className="grid grid-cols-2 p-1 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setUseSharedSpare(true)}
                  className={`py-2 px-1 text-[10px] font-bold rounded-xl transition-all text-center cursor-pointer ${
                    useSharedSpare
                      ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-355'
                  }`}
                >
                  Link Planner ({formatCurrency(sharedSpareVal)})
                </button>
                <button
                  type="button"
                  onClick={() => setUseSharedSpare(false)}
                  className={`py-2 px-1 text-[10px] font-bold rounded-xl transition-all text-center cursor-pointer ${
                    !useSharedSpare
                      ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-355'
                  }`}
                >
                  Custom Overpayment
                </button>
              </div>
            </div>

            {/* Custom overpayment textbox */}
            {!useSharedSpare && (
              <div className="space-y-1.5 animate-fade-in">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-405 block text-slate-400">
                  Custom Monthly Overpayment Allocation
                </label>
                <div className="relative rounded-2xl shadow-xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <span className="text-xs font-semibold text-slate-400">£</span>
                  </div>
                  <input
                    type="number"
                    value={customOverpayment || ''}
                    onChange={(e) => setCustomOverpayment(Math.max(0, parseInt(e.target.value) || 0))}
                    className="block w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 pl-8 text-xs font-mono font-black text-slate-950 dark:text-white focus:outline-hidden focus:border-indigo-500"
                    placeholder="150"
                  />
                </div>
              </div>
            )}

            {/* Strategy Selectors */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                Algorithmic Priority Strategy
              </label>
              <select
                value={paymentStrategy}
                onChange={(e) => setPaymentStrategy(e.target.value as 'avalanche' | 'snowball')}
                className="block w-full rounded-2xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs font-semibold focus:outline-hidden focus:border-indigo-500 dark:text-white"
              >
                <option value="avalanche">Avalanche Model: Highest Interest first (Saves maximum money)</option>
                <option value="snowball">Snowball Model: Lowest Balance first (Saves maximum stress)</option>
              </select>
            </div>
          </div>

        </div>

        {/* Right column: metrics tables and visualization graphs */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Key comparison cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Standard Repayments</span>
                <span className="text-xs text-slate-550 font-bold block text-slate-400 mt-0.5">Paying minimum commitments</span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-black text-slate-800 dark:text-white font-mono leading-none">
                  {Math.floor(standardSimulation.months / 12) > 0 
                    ? `${Math.floor(standardSimulation.months / 12)} yrs ${standardSimulation.months % 12} mos` 
                    : `${standardSimulation.months} mos`}
                </p>
                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase font-mono">
                  Interest Cost: {formatCurrency(standardSimulation.totalInterest)}
                </p>
              </div>
            </div>

            <div className="bg-emerald-50/15 dark:bg-emerald-950/5 border border-emerald-100/50 dark:border-emerald-900/30 rounded-3xl p-5 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 block tracking-wider">Accelerated Overpayments</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                </div>
                <span className="text-xs text-emerald-550 font-bold block text-emerald-650 dark:text-emerald-450 mt-0.5">With extra £{activeOverpayment}/mo overpayment</span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono leading-none">
                  {Math.floor(optimizedSimulation.months / 12) > 0 
                    ? `${Math.floor(optimizedSimulation.months / 12)} yrs ${optimizedSimulation.months % 12} mos` 
                    : `${optimizedSimulation.months} mos`}
                </p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400/80 font-bold mt-1 uppercase font-mono">
                  Interest Cost: {formatCurrency(optimizedSimulation.totalInterest)}
                </p>
              </div>
            </div>

          </div>

          {/* Acceleration feedback metrics */}
          {monthsFaster > 0 && (
            <div className="p-6 bg-emerald-500 text-white rounded-3xl shadow-md space-y-2 animate-fade-in">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 animate-bounce-subtle shrink-0" />
                <h4 className="text-sm font-black uppercase tracking-wider">Algorithmic Optimisations Complete!</h4>
              </div>
              <p className="text-xs text-emerald-50 leading-relaxed font-semibold">
                By investing your monthly surplus of <strong className="font-extrabold font-mono">£{activeOverpayment}</strong>, you clear your debts exactly <strong className="font-extrabold bg-white/20 px-2 py-0.5 rounded text-white text-xs font-mono">{monthsFaster} months faster</strong>! 
                This directly blocks lender interest, saving you <strong className="font-extrabold font-mono">{formatCurrency(interestSaved)} in unnecessary cash fees</strong>!
              </p>
            </div>
          )}

          {/* Recharts remaining debt balance curves */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Clearance Curves: Standard vs. Accelerated Balance
            </h3>

            <div className="h-[280px] w-full mt-4 font-mono text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={comparativeChartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <XAxis
                    dataKey="label"
                    stroke="#94a3b8"
                    tickSize={5}
                    fontSize={10}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tickFormatter={(value) => `£${value / 1000}k`}
                    fontSize={10}
                  />
                  
                  <Tooltip
                    formatter={(value: number, name: string) => {
                      const label = name === 'standardBalance' ? 'Standard Repayment' : 'Accelerated Repayment';
                      return [formatCurrency(value), label];
                    }}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '16px',
                      border: '1px solid #cbd5e1',
                      color: '#0f172a',
                      fontFamily: 'inherit',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="standardBalance"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="optimizedBalance"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-center items-center gap-6 text-[10px] text-slate-400 font-bold border-t border-slate-100 dark:border-slate-800 pt-3">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-4 bg-[#ef4444] rounded-full"></span>
                <span>Standard Minimum Payoffs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-4 bg-[#10b981] rounded-full animate-bounce-subtle"></span>
                <span>Accelerated payoff (Interest Saved!)</span>
              </div>
            </div>

          </div>

          {/* Advice block */}
          <div className="flex items-start gap-3 bg-indigo-50/20 dark:bg-indigo-950/10 rounded-2xl p-4 border border-indigo-100/30 dark:border-indigo-900/30 text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed font-semibold">
            <Info className="h-4.5 w-4.5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold block text-indigo-905 text-indigo-900 dark:text-indigo-300 mb-0.5">A Note on Loan Penalties &amp; Student Loans:</span>
              Before making gross overpayments on your residential mortgage or fixed-term bank loans, examine whether your lender imposes **Early Repayment Charges (ERCs)**. Most UK mortgage products allow up to 10% of the loan value in tax-free overpayments per calendar year completely fee-free! 
              Note: Do not overpay Plan 1, Plan 2 or Plan 5 UK Student Loans aggressively if you unlikely to clear them before they naturally expire (30 or 40 years write-off windows).
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
