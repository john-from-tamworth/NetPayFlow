import { useState, useEffect, FormEvent } from 'react';
import { Calculator, Plus, Trash2, PiggyBank, Landmark, Sparkles, HelpCircle, Info, BadgePercent, ArrowRight, Download } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { exportBudgetPlannerCSV } from '../utils/csvDownloader';

interface BudgetPlannerProps {
  monthlySalaryA: number;
  monthlySalaryB: number;
}

interface ExpenseItem {
  id: string;
  category: string;
  label: string;
  amount: number;
}

const DEFAULT_CATEGORIES = [
  { id: 'housing', label: 'Rent / Mortgage', color: '#6366f1' }, // Indigo
  { id: 'utilities', label: 'Utilities (Gas, Elec, Water)', color: '#3b82f6' }, // Blue
  { id: 'bills', label: 'bills & Council Tax', color: '#06b6d4' }, // Cyan
  { id: 'food', label: 'Groceries & Dining', color: '#10b981' }, // Emerald
  { id: 'transport', label: 'Transport (Petrol, Rail, Leases)', color: '#f59e0b' }, // Amber
  { id: 'debts', label: 'Debts & Loan Minimums', color: '#ef4444' }, // Red
  { id: 'leisure', label: 'Leisure & Subscriptions', color: '#ec4899' }, // Pink
  { id: 'other', label: 'Other Miscellaneous Expenses', color: '#6b7280' }, // Grey
];

export default function BudgetPlanner({ monthlySalaryA, monthlySalaryB }: BudgetPlannerProps) {
  // Select income source: Scenario A, Scenario B, or Custom
  const [incomeSource, setIncomeSource] = useState<'A' | 'B' | 'custom'>(() => {
    return (localStorage.getItem('budget_income_source') as 'A' | 'B' | 'custom') || 'A';
  });
  
  const [customIncome, setCustomIncome] = useState<number>(() => {
    return Number(localStorage.getItem('budget_custom_income') || '2500');
  });

  // Track expense items
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    const saved = localStorage.getItem('budget_expenses');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return [
      { id: '1', category: 'housing', label: 'Mortgage / Rent payment', amount: 850 },
      { id: '2', category: 'utilities', label: 'Energy & Water bill', amount: 150 },
      { id: '3', category: 'bills', label: 'Council Tax & Broadband', amount: 180 },
      { id: '4', category: 'food', label: 'Weekly groceries & lunch', amount: 300 },
      { id: '5', category: 'transport', label: 'Car insurance & Petrol', amount: 200 },
      { id: '6', category: 'debts', label: 'Credit Card Minimum', amount: 100 },
      { id: '7', category: 'leisure', label: 'Netflix & Gym subscription', amount: 75 },
    ];
  });

  // Specific savings target allocation from remaining spare cash
  const [savingsTarget, setSavingsTarget] = useState<number>(() => {
    return Number(localStorage.getItem('budget_savings_target') || '200');
  });

  // Form state to add custom items
  const [newLabel, setNewLabel] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState('housing');

  // Sync to database-like localStorage
  useEffect(() => {
    localStorage.setItem('budget_income_source', incomeSource);
    localStorage.setItem('budget_custom_income', customIncome.toString());
    localStorage.setItem('budget_expenses', JSON.stringify(expenses));
    localStorage.setItem('budget_savings_target', savingsTarget.toString());
  }, [incomeSource, customIncome, expenses, savingsTarget]);

  // Determine current active income to budget with
  const activeIncome = incomeSource === 'A' 
    ? monthlySalaryA 
    : incomeSource === 'B' 
    ? monthlySalaryB 
    : customIncome;

  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const spareCash = Math.max(0, activeIncome - totalExpenses);

  // Guarantee savings target doesn't exceed total available spare cash
  const safeSavingsTarget = Math.min(spareCash, savingsTarget);

  // Send a custom event out so other sections are aware of the savings budget immediately
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('update_savings_budget', { detail: { value: safeSavingsTarget } }));
    localStorage.setItem('shared_monthly_savings_budget', safeSavingsTarget.toString());
  }, [safeSavingsTarget]);

  const handleAddExpense = (e: FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newAmount);
    if (!newLabel.trim() || isNaN(amt) || amt <= 0) return;

    const newItem: ExpenseItem = {
      id: Date.now().toString(),
      category: newCategory,
      label: newLabel.trim(),
      amount: amt,
    };

    setExpenses([...expenses, newItem]);
    setNewLabel('');
    setNewAmount('');
  };

  const handleRemoveExpense = (id: string) => {
    setExpenses(expenses.filter(item => item.id !== id));
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Group expenses for visual chart breakdown
  const chartData = DEFAULT_CATEGORIES.map(cat => {
    const sum = expenses
      .filter(item => item.category === cat.id)
      .reduce((s, item) => s + item.amount, 0);
    return {
      name: cat.label,
      value: sum,
      color: cat.color,
    };
  }).filter(item => item.value > 0);

  // Add savings and leftovers to complete the income pie
  const pieData = [
    ...chartData,
    ...(safeSavingsTarget > 0 ? [{ name: 'Allocated Savings Goal', value: safeSavingsTarget, color: '#ec4899' }] : []),
    ...(spareCash - safeSavingsTarget > 0 ? [{ name: 'Leftover Spare Cash', value: spareCash - safeSavingsTarget, color: '#10b981' }] : []),
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Header Introduction */}
      <div className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 dark:bg-indigo-950/50 p-2.5 rounded-2xl text-indigo-650 dark:text-indigo-400">
              <PiggyBank className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-indigo-600 dark:text-indigo-400">Section 2</span>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5 animate-in fade-in slide-in-from-left-2">Take-Home Pay Budget Planner</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
                Connect your computed net UK take-home salary to allocate day-to-day expenditure, capture exact mortgage offsets, and build a monthly compounding fund plan!
              </p>
            </div>
          </div>
          <button
            onClick={() => exportBudgetPlannerCSV(incomeSource, activeIncome, expenses, totalExpenses, spareCash, safeSavingsTarget)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white px-4 py-2.5 text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 focus-within:opacity-100 duration-350"
          >
            <Download className="h-4 w-4" />
            <span>Download Budget (CSV)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Hand: Budgeting controls & Expenses details */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Income Source Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                1. Select Income Stream
              </h2>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-200/50 dark:border-slate-800">
                Active Pool: {formatCurrency(activeIncome)}/mo
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setIncomeSource('A')}
                className={`flex flex-col items-center justify-center py-3 px-2 rounded-2xl border text-center transition-all cursor-pointer ${
                  incomeSource === 'A'
                    ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 ring-1 ring-indigo-500'
                    : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
                }`}
              >
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-600 dark:text-indigo-400">Scenario A</span>
                <span className="text-xs font-black mt-1">{formatCurrency(monthlySalaryA)}</span>
                <span className="text-[9px] font-semibold text-slate-400 mt-0.5">Current Base</span>
              </button>

              <button
                type="button"
                onClick={() => setIncomeSource('B')}
                className={`flex flex-col items-center justify-center py-3 px-2 rounded-2xl border text-center transition-all cursor-pointer ${
                  incomeSource === 'B'
                    ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 ring-1 ring-indigo-500'
                    : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
                }`}
              >
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-600 dark:text-indigo-400">Scenario B</span>
                <span className="text-xs font-black mt-1">{formatCurrency(monthlySalaryB)}</span>
                <span className="text-[9px] font-semibold text-slate-400 mt-0.5">Compare Pay</span>
              </button>

              <button
                type="button"
                onClick={() => setIncomeSource('custom')}
                className={`flex flex-col items-center justify-center py-3 px-2 rounded-2xl border text-center transition-all cursor-pointer ${
                  incomeSource === 'custom'
                    ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 ring-1 ring-indigo-500'
                    : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
                }`}
              >
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500">Custom Limit</span>
                <span className="text-xs font-black mt-1">{formatCurrency(customIncome)}</span>
                <span className="text-[9px] font-semibold text-slate-400 mt-0.5">Input manually</span>
              </button>
            </div>

            {incomeSource === 'custom' && (
              <div className="pt-2 animate-fade-in-down">
                <label className="block text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  Specify Custom Monthly Inflow
                </label>
                <div className="relative mt-2 rounded-2xl shadow-xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <span className="text-xs font-bold text-slate-400">£</span>
                  </div>
                  <input
                    type="number"
                    value={customIncome || ''}
                    onChange={(e) => setCustomIncome(Math.max(0, parseInt(e.target.value) || 0))}
                    className="block w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-3 pl-8 text-xs font-mono font-black text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-hidden"
                    placeholder="e.g. 2500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Core Expenses Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                2. Detail Expense Ledger
              </h2>
              <span className="text-[9px] font-extrabold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 rounded-full border border-rose-100 dark:border-rose-900/30 font-mono">
                Total Out: {formatCurrency(totalExpenses)}/mo
              </span>
            </div>

            {/* Quick add form */}
            <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
              <div className="sm:col-span-5">
                <label className="block text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Item Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electric & Gas, gym"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="mt-1.5 block w-full rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 p-2 text-xs font-semibold focus:outline-hidden focus:border-indigo-500 dark:text-white"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Monthly Amount (£)</label>
                <input
                  type="number"
                  required
                  placeholder="0"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="mt-1.5 block w-full rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 p-2 text-xs font-mono font-black focus:outline-hidden focus:border-indigo-500 dark:text-white"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="mt-1.5 block w-full rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 p-2 text-xs font-semibold focus:outline-hidden focus:border-indigo-500 dark:text-white"
                >
                  {DEFAULT_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-1 flex items-end">
                <button
                  type="submit"
                  className="w-full h-[34px] rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </form>

            {/* List of items */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-none">
              {expenses.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-400 font-medium">No expenses logged. Add one above to kick off planning!</p>
              ) : (
                expenses.map((item) => {
                  const catMeta = DEFAULT_CATEGORIES.find(c => c.id === item.category);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all font-sans"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: catMeta?.color || '#cbd5e1' }}
                          title={catMeta?.label}
                        ></span>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.label}</p>
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">{catMeta?.label}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-black text-slate-900 dark:text-white">
                          {formatCurrency(item.amount)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveExpense(item.id)}
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
          </div>
        </div>

        {/* Right Hand side: Allocation summary, interactive savings target, and visuals */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
          
          {/* Spare cash allocation & savings selector */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              3. Spare Cash &amp; Savings Target
            </h2>

            <div className="p-4 rounded-2xl bg-emerald-50/15 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/30 flex justify-between items-center">
              <div>
                <p className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Month Remainder Leftover</p>
                <p className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">{formatCurrency(spareCash)}</p>
              </div>
              <div className="text-right">
                <span className="inline-block rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-[9px] font-black text-emerald-800 dark:text-emerald-400 px-2.5 py-0.5 uppercase tracking-widest">
                  Spare Safe
                </span>
              </div>
            </div>

            {/* Savings target slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Monthly Savings Budget
                </label>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(safeSavingsTarget)} /mo
                  </span>
                  {spareCash > 0 && (
                    <span className="text-[10px] font-bold text-slate-400">
                      ({((safeSavingsTarget / spareCash) * 100).toFixed(0)}% of remainder)
                    </span>
                  )}
                </div>
              </div>

              {spareCash > 0 ? (
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max={spareCash}
                    step="10"
                    value={safeSavingsTarget}
                    onChange={(e) => setSavingsTarget(parseInt(e.target.value))}
                    className="w-full accent-indigo-600 h-1 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wild select-none">
                    <span>£0</span>
                    <span>Allocate to investments</span>
                    <span>{formatCurrency(spareCash)} Limit</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-orange-50 dark:bg-orange-950/25 p-3 border border-orange-100 dark:border-orange-900/30 text-[10px] leading-relaxed font-semibold text-orange-850 dark:text-orange-400">
                  Your expenses completely consume your take-home pay. Create extra cushion by lowering discretionary outgoings (leisure, other) or secure high salary sacrifice bounds.
                </div>
              )}
            </div>

            {safeSavingsTarget > 0 && (
              <div className="rounded-2xl border border-indigo-100 dark:border-indigo-900 bg-indigo-50/20 dark:bg-indigo-950/20 p-4 space-y-2 animate-fade-in">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-500 shrink-0" />
                  <p className="text-[11px] font-black uppercase text-indigo-900 dark:text-indigo-300 tracking-wider">Compounding Potential Attached:</p>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                  By directing your allocated <span className="font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(safeSavingsTarget)}</span>/month into index portfolios or High-Yield Savings (HYSAs), you instantly fuel compounding options (see the next page in Sidebar!).
                </p>
              </div>
            )}
          </div>

          {/* Allocation visual Chart card */}
          {pieData.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Monthly Inflow Breakdown
              </h3>
              
              <div className="h-[220px] w-full flex items-center justify-center font-sans">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), '']}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        fontFamily: 'inherit',
                        fontSize: '11px',
                        fontWeight: '600',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend details */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] text-slate-500 dark:text-slate-400 font-bold border-t border-slate-100 dark:border-slate-800 pt-3">
                {pieData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                    <span className="truncate max-w-[120px]" title={item.name}>{item.name}</span>
                    <span className="font-mono text-slate-900 dark:text-white font-extrabold shrink-0 ml-auto">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
