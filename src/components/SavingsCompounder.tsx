import { useState, useEffect, useMemo, FormEvent } from 'react';
import { Landmark, TrendingUp, Calendar, BadgePercent, Sparkles, AlertCircle, Info, Target, HelpCircle, RefreshCcw, Download, Plus, Trash2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { exportCompoundSavingsCSV } from '../utils/csvDownloader';

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
}

export default function SavingsCompounder() {
  // Sync defaulted contribution from shared Budget section
  const [useSharedBudget, setUseSharedBudget] = useState(true);
  const [sharedBudgetVal, setSharedBudgetVal] = useState<number>(() => {
    return Number(localStorage.getItem('shared_monthly_savings_budget') || '200');
  });

  // Basic compound interest selectors
  const [initialSumpSum, setInitialLumpSum] = useState<number>(() => {
    return Number(localStorage.getItem('compound_initial_lump_sum') || '1000');
  });

  const [customMonthlyCont, setCustomMonthlyCont] = useState<number>(() => {
    return Number(localStorage.getItem('compound_custom_monthly_cont') || '250');
  });

  const [annualRate, setAnnualRate] = useState<number>(() => {
    return Number(localStorage.getItem('compound_annual_rate') || '4.5');
  });

  const [termYears, setTermYears] = useState<number>(() => {
    return Number(localStorage.getItem('compound_term_years') || '5');
  });

  const [compoundFrequency, setCompoundFrequency] = useState<'monthly' | 'annually'>(() => {
    return (localStorage.getItem('compound_freq') as 'monthly' | 'annually') || 'monthly';
  });

  // Multiple Goals state
  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem('compound_savings_goals');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: '1', name: 'Summer Holiday', targetAmount: 2000 },
      { id: '2', name: 'Emergency Fund', targetAmount: 5000 },
      { id: '3', name: 'House Deposit', targetAmount: 25000 },
    ];
  });

  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalAmount, setNewGoalAmount] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState<string>(() => {
    const saved = localStorage.getItem('compound_selected_goal_id');
    return saved || '1';
  });

  // Watch for Budget Planner shared value updates dynamically
  useEffect(() => {
    const handleBudgetUpdate = () => {
      const liveVal = Number(localStorage.getItem('shared_monthly_savings_budget') || '0');
      setSharedBudgetVal(liveVal);
    };

    window.addEventListener('update_savings_budget', handleBudgetUpdate);
    // Initial check
    handleBudgetUpdate();

    return () => {
      window.removeEventListener('update_savings_budget', handleBudgetUpdate);
    };
  }, []);

  // Save selectors states
  useEffect(() => {
    localStorage.setItem('compound_initial_lump_sum', initialSumpSum.toString());
    localStorage.setItem('compound_custom_monthly_cont', customMonthlyCont.toString());
    localStorage.setItem('compound_annual_rate', annualRate.toString());
    localStorage.setItem('compound_term_years', termYears.toString());
    localStorage.setItem('compound_freq', compoundFrequency);
    localStorage.setItem('compound_savings_goals', JSON.stringify(goals));
    localStorage.setItem('compound_selected_goal_id', selectedGoalId);
  }, [initialSumpSum, customMonthlyCont, annualRate, termYears, compoundFrequency, goals, selectedGoalId]);

  const handleRemoveGoal = (id: string) => {
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    if (selectedGoalId === id && updated.length > 0) {
      setSelectedGoalId(updated[0].id);
    }
  };

  const activeMonthlyDeposit = useSharedBudget ? sharedBudgetVal : customMonthlyCont;

  // Perform precise monthly simulation to correctly capture compounding frequency
  const projectionData = useMemo(() => {
    const dataPoints = [];
    let currentBalance = initialSumpSum;
    let totalDeposited = initialSumpSum;
    let totalInterest = 0;

    const ratePerMonth = annualRate / 100 / 12;
    const ratePerYear = annualRate / 100;

    // We do a month-by-month simulation for termYears
    const totalMonths = termYears * 12;

    // Start block (Month 0)
    dataPoints.push({
      month: 0,
      year: 0,
      label: 'Start',
      balance: Math.round(currentBalance),
      deposits: Math.round(totalDeposited),
      interest: Math.round(totalInterest),
    });

    for (let m = 1; m <= totalMonths; m++) {
      // 1. Add monthly contribution at the start of the month
      currentBalance += activeMonthlyDeposit;
      totalDeposited += activeMonthlyDeposit;

      // 2. Compound calculation (interest added depends on frequency)
      if (compoundFrequency === 'monthly') {
        const monthlyInt = currentBalance * ratePerMonth;
        currentBalance += monthlyInt;
        totalInterest += monthlyInt;
      } else {
        // Annually compounding checks
        if (m % 12 === 0) {
          const annualInt = currentBalance * ratePerYear;
          currentBalance += annualInt;
          totalInterest += annualInt;
        }
      }

      // Record year landmarks or final indices for chart readability
      if (m % 12 === 0 || m === totalMonths) {
        dataPoints.push({
          month: m,
          year: m / 12,
          label: `Yr ${m / 12}`,
          balance: Math.round(currentBalance),
          deposits: Math.round(totalDeposited),
          interest: Math.round(totalInterest),
        });
      }
    }

    return dataPoints;
  }, [initialSumpSum, activeMonthlyDeposit, annualRate, termYears, compoundFrequency]);

  // Solve Goal parameters: Month by month simulation for EACH goal in the list
  const goalResults = useMemo(() => {
    return goals.map(g => {
      if (g.targetAmount <= 0) {
        return { reached: false, message: 'Goal target must be positive' };
      }

      let currentBalance = initialSumpSum;
      let monthsElapsed = 0;
      const maxSafetyMonths = 600; // 50 years max guard block

      const ratePerMonth = annualRate / 100 / 12;
      const ratePerYear = annualRate / 100;

      if (currentBalance >= g.targetAmount) {
        return { reached: true, months: 0, years: 0, message: 'Starting lump sum already exceeds this goal!', durationString: '0 months', interestContribution: 0 };
      }

      if (activeMonthlyDeposit === 0 && annualRate === 0) {
        return { reached: false, message: 'Contributions & APY are both 0. Goal is out of reach!' };
      }

      while (currentBalance < g.targetAmount && monthsElapsed < maxSafetyMonths) {
        monthsElapsed++;
        currentBalance += activeMonthlyDeposit;

        if (compoundFrequency === 'monthly') {
          currentBalance += (currentBalance * ratePerMonth);
        } else {
          if (monthsElapsed % 12 === 0) {
            currentBalance += (currentBalance * ratePerYear);
          }
        }
      }

      if (currentBalance >= g.targetAmount) {
        const yrs = Math.floor(monthsElapsed / 12);
        const remainingMs = monthsElapsed % 12;
        let durationStr = '';
        if (yrs > 0) durationStr += `${yrs} yr${yrs > 1 ? 's' : ''} `;
        if (remainingMs > 0 || yrs === 0) durationStr += `${remainingMs} mo${remainingMs > 1 ? 's' : ''}`;

        return {
          reached: true,
          months: monthsElapsed,
          durationString: durationStr.trim(),
          interestContribution: Math.max(0, currentBalance - (initialSumpSum + (activeMonthlyDeposit * monthsElapsed))),
        };
      }

      return { reached: false, message: 'Goal requires over 50 years with current selections' };
    });
  }, [goals, initialSumpSum, activeMonthlyDeposit, annualRate, compoundFrequency]);

  const summaryMetrics = useMemo(() => {
    const finalVal = projectionData[projectionData.length - 1];
    return {
      endBalance: finalVal?.balance || 0,
      totalDeposited: finalVal?.deposits || 0,
      interestEarned: finalVal?.interest || 0,
    };
  }, [projectionData]);

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
      <div className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-205 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 dark:bg-indigo-950/50 p-2.5 rounded-2xl text-indigo-650 dark:text-indigo-400">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-indigo-600 dark:text-indigo-400">Section 3</span>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5 animate-in fade-in slide-in-from-left-2">Compound Interest & Goal Tracker</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
                Visualize how your monthly savings budget compounds over time! Specify starting balances, high yield interest rates (HYSA), and map your timeline to specific targets like house deposits or holidays.
              </p>
            </div>
          </div>
          <button
            onClick={() => exportCompoundSavingsCSV(initialSumpSum, activeMonthlyDeposit, annualRate, termYears, compoundFrequency, projectionData, goals, goalResults)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white px-4 py-2.5 text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 focus-within:opacity-100 duration-350"
          >
            <Download className="h-4 w-4" />
            <span>Download Projections (CSV)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Parameters Form */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Savings Input Settings
            </h2>

            {/* Savings source selection */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Monthly Deposit Source
                </label>
              </div>

              <div className="grid grid-cols-2 p-1 bg-slate-50 dark:bg-slate-950/75 border border-slate-200/50 dark:border-slate-850 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setUseSharedBudget(true)}
                  className={`py-2 px-1 text-[10px] font-bold rounded-xl transition-all text-center cursor-pointer ${
                    useSharedBudget
                      ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-350'
                  }`}
                >
                  Link Planner ({formatCurrency(sharedBudgetVal)})
                </button>
                <button
                  type="button"
                  onClick={() => setUseSharedBudget(false)}
                  className={`py-2 px-3 text-[10px] font-bold rounded-xl transition-all text-center cursor-pointer ${
                    !useSharedBudget
                      ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-350'
                  }`}
                >
                  Custom Deposit
                </button>
              </div>
            </div>

            {/* Starting Balance */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400">
                Starting Lump Sum (Initial Pot)
              </label>
              <div className="relative rounded-2xl shadow-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <span className="text-xs font-semibold text-slate-400">£</span>
                </div>
                <input
                  type="number"
                  value={initialSumpSum || ''}
                  onChange={(e) => setInitialLumpSum(Math.max(0, parseInt(e.target.value) || 0))}
                  className="block w-full rounded-2xl border border-slate-250 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-2.5 pl-8 text-xs font-mono font-black text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Monthly deposit selector (If custom selected) */}
            {!useSharedBudget && (
              <div className="space-y-1.5 animate-fade-in">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Custom Monthly Contribution
                </label>
                <div className="relative rounded-2xl shadow-xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <span className="text-xs font-semibold text-slate-400">£</span>
                  </div>
                  <input
                    type="number"
                    value={customMonthlyCont || ''}
                    onChange={(e) => setCustomMonthlyCont(Math.max(0, parseInt(e.target.value) || 0))}
                    className="block w-full rounded-2xl border border-slate-250 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-2.5 pl-8 text-xs font-mono font-black text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                    placeholder="250"
                  />
                </div>
              </div>
            )}

            {/* Annual interest rate */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-wider text-slate-400">
                <label>Annual Interest Rate</label>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-extrabold">{annualRate}% APY</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                step="0.1"
                value={annualRate}
                onChange={(e) => setAnnualRate(parseFloat(e.target.value))}
                className="w-full accent-indigo-650 accent-indigo-600 h-1 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase">
                <span>0%</span>
                <span>Average HYSA (4.5%-5.5%)</span>
                <span>15%</span>
              </div>
            </div>

            {/* Calculation Term */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-wider text-slate-400">
                <label>Target Timeline Term</label>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-extrabold">{termYears} Years</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={termYears}
                onChange={(e) => setTermYears(parseInt(e.target.value))}
                className="w-full accent-indigo-600 h-1 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase">
                <span>1 Year</span>
                <span>Retirement target</span>
                <span>30 Years</span>
              </div>
            </div>

            {/* Interest compound frequency */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400">
                Compounding Interval
              </label>
              <select
                value={compoundFrequency}
                onChange={(e) => setCompoundFrequency(e.target.value as 'monthly' | 'annually')}
                className="block w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs font-semibold focus:outline-hidden focus:border-indigo-500 dark:text-white"
              >
                <option value="monthly">Monthly compounding (Most HYSAs)</option>
                <option value="annually">Annually compounding (Fixed Bonds)</option>
              </select>
            </div>
          </div>

          {/* Savings specific goals list setup */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-indigo-600" />
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Savings Goals Ledger
              </h3>
            </div>

            {/* List of goals */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-none">
              {goals.length === 0 ? (
                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed py-2 text-center">
                  No active goals added. Create one below!
                </p>
              ) : (
                goals.map((g) => {
                  const isSelected = selectedGoalId === g.id;
                  return (
                    <div
                      key={g.id}
                      onClick={() => setSelectedGoalId(g.id)}
                      className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/25 dark:bg-indigo-950/20 ring-1 ring-indigo-500'
                          : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/40'
                      }`}
                    >
                      <div className="flex items-center gap-2 max-w-[150px]">
                        <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${isSelected ? 'bg-pink-500' : 'bg-slate-350'}`} />
                        <div className="truncate">
                          <p className="text-xs font-black text-slate-800 dark:text-slate-150 truncate leading-tight">{g.name}</p>
                          <p className="text-[9px] font-mono font-black text-slate-400">{formatCurrency(g.targetAmount)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                        {isSelected && (
                          <span className="text-[8px] bg-pink-100 dark:bg-pink-950/40 text-pink-700 dark:text-pink-400 px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                            Chart Active
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveGoal(g.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add goal inline form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const amt = parseFloat(newGoalAmount);
                if (!newGoalName.trim() || isNaN(amt) || amt <= 0) return;
                const newGoal: SavingsGoal = {
                  id: Date.now().toString(),
                  name: newGoalName.trim(),
                  targetAmount: amt,
                };
                const updated = [...goals, newGoal];
                setGoals(updated);
                setSelectedGoalId(newGoal.id);
                setNewGoalName('');
                setNewGoalAmount('');
              }}
              className="space-y-2 pt-2 border-t border-slate-150 dark:border-slate-800"
            >
              <div className="space-y-1">
                <label className="text-[9px] font-black tracking-wider text-slate-400 dark:text-slate-500 uppercase">Goal Name</label>
                <input
                  type="text"
                  required
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  className="block w-full rounded-xl border border-slate-205 dark:border-slate-850 bg-slate-50 dark:bg-slate-950/50 p-2 text-xs font-bold dark:text-white"
                  placeholder="e.g. House deposit, Holiday"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black tracking-wider text-slate-400 dark:text-slate-500 uppercase">Target Amount (£)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    required
                    value={newGoalAmount}
                    onChange={(e) => setNewGoalAmount(e.target.value)}
                    className="block w-full rounded-xl border border-slate-205 dark:border-slate-850 bg-slate-50 dark:bg-slate-950/50 p-2 text-xs font-mono font-black dark:text-white"
                    placeholder="5000"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-3 flex items-center justify-center cursor-pointer transition-all active:scale-95"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </form>
          </div>

        </div>

        {/* Right Side: Projections charts and analysis metrics */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Summary Hero Results Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
              <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Projected Final Pot</span>
              <p className="text-2xl font-black font-sans text-slate-900 dark:text-white mt-1">
                {formatCurrency(summaryMetrics.endBalance)}
              </p>
              <span className="text-[9px] font-semibold text-slate-400 mt-1 block">Value after {termYears} years</span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
              <span className="text-[9px] font-black uppercase text-indigo-400 dark:text-indigo-500 tracking-wider">Total Self Deposited</span>
              <p className="text-2xl font-black font-sans text-indigo-600 dark:text-indigo-400 mt-1">
                {formatCurrency(summaryMetrics.totalDeposited)}
              </p>
              <span className="text-[9px] font-semibold text-slate-400 mt-1 block">Lump sum + monthly deposits</span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
              <span className="text-[9px] font-black uppercase text-emerald-400 dark:text-emerald-500 tracking-wider">Compound Interest Earned</span>
              <p className="text-2xl font-black font-sans text-emerald-600 dark:text-emerald-400 mt-1">
                {formatCurrency(summaryMetrics.interestEarned)}
              </p>
              <span className="text-[9px] font-semibold text-emerald-500 mt-1 block">Free compound earnings yield</span>
            </div>

          </div>

          {/* Goals Milestone Summary Panel */}
          {goals.length > 0 && (
            <div className="bg-indigo-50/20 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-900/40 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-indigo-100/40 dark:border-indigo-900/40 pb-2">
                <Target className="h-4.5 w-4.5 text-indigo-650" />
                <h3 className="text-xs font-black uppercase tracking-widest text-indigo-950 dark:text-indigo-200">
                  Timeline Map for All Savings Goals
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goals.map((g, idx) => {
                  const calc = goalResults[idx];
                  if (!calc) return null;
                  const isSelected = selectedGoalId === g.id;
                  return (
                    <div
                      key={g.id}
                      onClick={() => setSelectedGoalId(g.id)}
                      className={`rounded-2xl border p-4 transition-all flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-white dark:bg-slate-905 bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-400 dark:border-indigo-900 ring-1 ring-indigo-500'
                          : 'bg-white/50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/80 hover:border-slate-350'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-slate-800 dark:text-indigo-200">
                            {g.name}
                          </h4>
                          <span className="font-mono text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                            {formatCurrency(g.targetAmount)}
                          </span>
                        </div>
                        {calc.reached ? (
                          <p className="text-[10px] text-indigo-950 dark:text-indigo-300 font-medium leading-relaxed">
                            🌟 Reachable in <strong className="font-black font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/80 px-1.5 py-0.5 rounded">{calc.durationString}</strong> of saving!
                            Compounding yields <strong className="font-extrabold text-emerald-605 dark:text-emerald-400">{formatCurrency(calc.interestContribution)}</strong> of this completely free!
                          </p>
                        ) : (
                          <p className="text-[10px] text-rose-650 dark:text-rose-400 font-semibold leading-relaxed">
                            ⚠️ {calc.message}. Improve APY rate or increase contribution in Budget Planner.
                          </p>
                        )}
                      </div>
                      
                      {/* Small selection action */}
                      <button
                        type="button"
                        className={`mt-3 w-full py-1 text-center font-bold text-[8px] uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                            : 'border-slate-250 dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {isSelected ? 'Currently Plotted on Chart' : 'Plot on Chart'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Interactive Recharts area compounding visualization */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-405" />
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Compounding Over Time (Cumulative Pot)
                </h3>
              </div>
              <span className="text-[9px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200/50 dark:border-slate-800 uppercase">
                Annual compounding line
              </span>
            </div>

            <div className="h-[280px] w-full mt-4 font-mono text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={projectionData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  
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
                      const label = name === 'balance' ? 'Total Savings Value' : 'Self Deposits Portion';
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

                  {/* Savings goal target horizontal indicator line */}
                  {selectedGoalId && goals.find(g => g.id === selectedGoalId) && (
                    <ReferenceLine
                      y={goals.find(g => g.id === selectedGoalId)?.targetAmount}
                      stroke="#ec4899"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{
                        value: `${goals.find(g => g.id === selectedGoalId)?.name}: ${formatCurrency(goals.find(g => g.id === selectedGoalId)!.targetAmount)}`,
                        fill: '#ec4899',
                        fontSize: 9,
                        position: 'top',
                        fontWeight: '800'
                      }}
                    />
                  )}

                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorBalance)"
                  />
                  <Area
                    type="monotone"
                    dataKey="deposits"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorDeposits)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-center items-center gap-6 text-[10px] text-slate-400 font-bold border-t border-slate-100 dark:border-slate-800 pt-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#6366f1]"></span>
                <span>Cumulative Self Deposits</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#10b981]"></span>
                <span>Pot compounding value (Self deposits + Interest)</span>
              </div>
            </div>

          </div>

          {/* Informational tip on smart index allocations */}
          <div className="flex items-start gap-3 bg-indigo-50/20 dark:bg-indigo-950/10 rounded-2xl p-4 border border-indigo-100/30 dark:border-indigo-900/30 text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed font-semibold">
            <Info className="h-4.5 w-4.5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold block text-indigo-900 dark:text-indigo-300 mb-0.5">UK Savings and Investment Tip (ISAs):</span>
              In the UK, earnings from savings interest exceeding £1,000 (Basic Rate tax allowance) or £500 (Higher Rate allowance) are subject to Income Tax. Utilizing an **ISA (Individual Savings Account)**, such as a Cash ISA or Stocks &amp; Shares ISA, completely shields up to £20,000 of annual deposits and all subsequent cumulative compound interest from tax liability entirely!
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
