import { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import TakeHomeSummary from './components/TakeHomeSummary';
import TaxTrapAlert from './components/TaxTrapAlert';
import SalaryChart from './components/SalaryChart';
import TaxTable from './components/TaxTable';
import ComparisonSummary from './components/ComparisonSummary';

// Import New Pages Added
import BudgetPlanner from './components/BudgetPlanner';
import SavingsCompounder from './components/SavingsCompounder';
import DebtOptimizer from './components/DebtOptimizer';
import BlogPage from './components/BlogPage';

import { CalculatorInputs } from './types';
import { calculateTakeHomePay } from './utils/taxCalculator';
import { 
  Calculator, 
  PiggyBank, 
  TrendingUp, 
  Briefcase, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  HelpCircle,
  Coins,
  BookOpen
} from 'lucide-react';

type NavigatorTab = 'pay-calc' | 'budget' | 'savings-compound' | 'debt-advisor' | 'blog';

export default function App() {
  // Navigation tabs state
  const [activeTab, setActiveTab] = useState<NavigatorTab>(() => {
    return (localStorage.getItem('suite_active_tab') as NavigatorTab) || 'pay-calc';
  });

  // Sidebar expanded / collapsed state
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(() => {
    const saved = localStorage.getItem('suite_sidebar_expanded');
    return saved !== 'false'; // Default to expanded
  });

  // Mobile menu open / closed drawer toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Balanced standard UK default values (e.g. £52k standard salary with 5% pension)
  const [inputs, setInputs] = useState<CalculatorInputs>({
    grossSalary: 52000,
    pensionPercent: 5,
    location: 'rUK',
    studentLoanPlan: 'none',
    hasPostgradLoan: false,
    bikValue: 0,
    taxCode: '1257L',
    useCustomTaxCode: false,
  });

  // State for Scenario B compared settings
  const [compareInputs, setCompareInputs] = useState<CalculatorInputs>({
    grossSalary: 60000,
    pensionPercent: 8,
    location: 'rUK',
    studentLoanPlan: 'none',
    hasPostgradLoan: false,
    bikValue: 0,
    taxCode: '1257L',
    useCustomTaxCode: false,
  });

  // Dual scenario compare toggles and active states
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [activeScenario, setActiveScenario] = useState<'A' | 'B'>('A');

  // Dark mode state with persistence in localStorage and fallback to system prefers-color-scheme setting
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Sync tab and sidebar choices
  useEffect(() => {
    localStorage.setItem('suite_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('suite_sidebar_expanded', sidebarExpanded.toString());
  }, [sidebarExpanded]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Calculate Scenario A (Base) and Scenario B (Comparison) results instantly
  const calculationResult = useMemo(() => {
    return calculateTakeHomePay(inputs);
  }, [inputs]);

  const compareResult = useMemo(() => {
    return calculateTakeHomePay(compareInputs);
  }, [compareInputs]);

  // Focus on the right set of calculations for individual visual charts
  const activeResult = isCompareMode && activeScenario === 'B' ? compareResult : calculationResult;
  const activeInputs = isCompareMode && activeScenario === 'B' ? compareInputs : inputs;

  const handleSetInputs = (nextInputs: CalculatorInputs) => {
    if (isCompareMode && activeScenario === 'B') {
      setCompareInputs(nextInputs);
    } else {
      setInputs(nextInputs);
    }
  };

  const handleToggleCompareMode = () => {
    if (!isCompareMode) {
      // Clone Scenario A to Scenario B by default but apply an intuitive bump
      // (so they instantly see a meaningful difference like dynamic pay rise)
      setCompareInputs({
        ...inputs,
        grossSalary: inputs.grossSalary + 8000,
        pensionPercent: Math.min(30, inputs.pensionPercent + 3),
      });
      setActiveScenario('B');
    } else {
      setActiveScenario('A');
    }
    setIsCompareMode(!isCompareMode);
  };

  const handleCopyScenarioAToB = () => {
    setCompareInputs({ ...inputs });
  };

  const handleResetScenarioB = () => {
    setCompareInputs({
      ...inputs,
      grossSalary: inputs.grossSalary + 8000,
      pensionPercent: Math.min(30, inputs.pensionPercent + 3),
    });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0
    }).format(val);
  };

  const navMenuItems = [
    {
      id: 'pay-calc',
      label: 'Pay Calculator',
      description: 'HMRC income tax & NIC calculations',
      icon: Calculator,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50/50 dark:bg-indigo-950/20',
    },
    {
      id: 'budget',
      label: 'Budget Planner',
      description: 'Detail expenditure & reserve savings',
      icon: PiggyBank,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50/50 dark:bg-emerald-950/25',
    },
    {
      id: 'savings-compound',
      label: 'Compound Savings',
      description: 'Goal mapping & HYSA projections',
      icon: TrendingUp,
      color: 'text-amber-500 dark:text-amber-400',
      bgColor: 'bg-amber-50/50 dark:bg-amber-950/20',
    },
    {
      id: 'debt-advisor',
      label: 'Debt Payoff Optimizer',
      description: 'Clear loans & cards quickly',
      icon: Briefcase,
      color: 'text-rose-500 dark:text-rose-450',
      bgColor: 'bg-rose-50/50 dark:bg-rose-950/20',
    },
    {
      id: 'blog',
      label: 'Planning & Insights',
      description: 'Tax guides & rise planning',
      icon: BookOpen,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50/50 dark:bg-indigo-950/20',
    },
  ];

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'budget':
        return (
          <BudgetPlanner 
            monthlySalaryA={calculationResult.netTakeHome.monthly}
            monthlySalaryB={compareResult.netTakeHome.monthly}
          />
        );
      case 'savings-compound':
        return <SavingsCompounder />;
      case 'debt-advisor':
        return <DebtOptimizer />;
      case 'blog':
        return (
          <BlogPage 
            onNavigateToTab={(tabId) => setActiveTab(tabId)}
            setInputs={setInputs}
            setCompareInputs={setCompareInputs}
            setIsCompareMode={setIsCompareMode}
            setActiveScenario={setActiveScenario}
          />
        );
      case 'pay-calc':
      default:
        return (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start transition-all">
            
            {/* LEFT COLUMN: Controls & Inputs */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
              <ControlPanel
                inputs={activeInputs}
                setInputs={handleSetInputs}
                isCompareMode={isCompareMode}
                onToggleCompareMode={handleToggleCompareMode}
                activeScenario={activeScenario}
                onChangeActiveScenario={setActiveScenario}
                scenarioASalary={inputs.grossSalary}
                scenarioBSalary={compareInputs.grossSalary}
              />
              
              {/* Ad Placeholder 2: Sidebar Ad Spot */}
              <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 p-4 text-center">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Sponsored Ad Unit
                </span>
                <div className="mt-2 rounded-2xl border border-slate-200 dark:border-slate-850 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                  <p className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Financial Advisory Partner</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-505 dark:text-slate-500 mt-1 leading-relaxed font-semibold">
                    Compare mortgage rates, consolidate workplace pensions, or consult independent specialists regarding custom tax overrides.
                  </p>
                  <div className="mt-3 inline-block rounded-full bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 px-3 py-0.5 text-[9px] font-bold text-indigo-750 dark:text-indigo-400 text-indigo-700 uppercase tracking-widest font-sans">
                    AdSense Partner Spot #2
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Outputs & Visualizations */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Compare Desk Summary Box (shows up only in comparison scenario) */}
              {isCompareMode && (
                <ComparisonSummary
                  result={calculationResult}
                  compareResult={compareResult}
                  inputs={inputs}
                  compareInputs={compareInputs}
                  onCopyScenarioAToB={handleCopyScenarioAToB}
                  onResetScenarioB={handleResetScenarioB}
                />
              )}

              {/* Selected Scenario Mode Header Banner */}
              {isCompareMode && (
                <div className="rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 px-5 py-3.5 flex items-center justify-between text-xs font-semibold text-indigo-950 dark:text-indigo-200 transition-all">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse"></span>
                    <p>
                      Showing detailed outputs for <strong className="text-indigo-900 dark:text-indigo-300 font-extrabold">Scenario {activeScenario === 'A' ? 'A (Base)' : 'B (Comparison)'}</strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveScenario(activeScenario === 'A' ? 'B' : 'A')}
                    className="text-[10px] uppercase font-black tracking-widest text-indigo-705 dark:text-indigo-400 hover:text-indigo-900 transition-all bg-indigo-100/40 dark:bg-indigo-950 px-2.5 py-1 rounded cursor-pointer"
                  >
                    Swap details to Scenario {activeScenario === 'A' ? 'B' : 'A'}
                  </button>
                </div>
              )}

              {/* Monthly Summary Hero Card */}
              <TakeHomeSummary result={activeResult} />

              {/* Contextual Tax Trap Alert (displays optimizations in £100k-£125k trap) */}
              <TaxTrapAlert
                result={activeResult}
                inputs={activeInputs}
                setInputs={handleSetInputs}
              />

              {/* Recharts allocation visualizations */}
              <SalaryChart result={activeResult} />

              {/* Highly interactive scannable datatable */}
              <TaxTable result={activeResult} />

            </div>

          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] dark:bg-[#0b0f19] flex font-sans antialiased text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* ========================================================= */}
      {/* DESKTOP COLLAPSIBLE SIDEBAR                               */}
      {/* ========================================================= */}
      <aside 
        id="desktop-sidebar"
        className={`hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 sticky top-0 h-screen transition-all duration-300 ease-in-out z-35 ${
          sidebarExpanded ? 'w-[280px]' : 'w-[76px]'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm font-sans font-black">
              £
            </div>
            {sidebarExpanded && (
              <div className="animate-in fade-in duration-300 slide-in-from-left-2">
                <span className="text-sm font-black uppercase tracking-tight text-slate-800 dark:text-white">NetPay<span className="text-indigo-600 dark:text-indigo-400">Flow</span> Suite</span>
                <p className="text-[8px] font-bold font-mono text-slate-400">UK wealth &amp; tax platform</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items list */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-none">
          {navMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id as NavigatorTab)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer text-left ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-950/50'
                }`}
                title={!sidebarExpanded ? item.label : undefined}
              >
                <div 
                  className={`p-2 rounded-xl shrink-0 transition-colors ${
                    isActive ? 'bg-white/10 text-white' : `${item.bgColor} ${item.color}`
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>
                {sidebarExpanded && (
                  <div className="animate-in fade-in duration-300 truncate">
                    <span className="block text-xs font-black">{item.label}</span>
                    <span className={`block text-[9px] truncate font-medium mt-0.5 ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>
                      {item.description}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Collapse Toggle Button */}
        <div className="p-4 border-t border-slate-205 border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="w-full h-10 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-850 dark:hover:text-white cursor-pointer hover:bg-slate-100 transition-all"
            aria-label={sidebarExpanded ? "Collapse sidebar menu" : "Expand sidebar menu"}
          >
            {sidebarExpanded ? (
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider">
                <ChevronLeft className="h-4 w-4 text-slate-400" />
                <span>Minimize Sidebar</span>
              </div>
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-400" />
            )}
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MOBILE SLIDE-OUT DRAWER OVERLAY                           */}
      {/* ========================================================= */}
      {mobileMenuOpen && (
        <div className="relative z-50 md:hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" 
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer body */}
          <div className="fixed inset-y-0 left-0 w-[280px] bg-white dark:bg-slate-900 p-5 flex flex-col border-r border-slate-200 dark:border-slate-800 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-sans font-black shadow-sm">
                  £
                </div>
                <div>
                  <span className="text-sm font-black uppercase tracking-tight text-slate-800 dark:text-white">NetPay<span className="text-indigo-600 dark:text-indigo-400">Flow</span> Suite</span>
                  <p className="text-[8px] font-bold font-mono text-slate-400">UK Platform</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-850 hover:bg-slate-50 text-slate-500 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex-1 py-6 space-y-3">
              {navMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id as NavigatorTab);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3.5 p-3 rounded-2xl transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${isActive ? 'bg-white/15 text-white' : `${item.bgColor} ${item.color}`}`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <span className="block text-xs font-black">{item.label}</span>
                      <span className={`block text-[9px] mt-0.5 font-medium ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>
                        {item.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </nav>

            <div className="pb-4 pt-4 border-t border-slate-140 border-slate-100 dark:border-slate-800 text-center">
              <p className="text-[10px] font-bold font-mono text-slate-400">Version 1.2 • TY 2026/27 Compliant</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MAIN VIEW AREA                                            */}
      {/* ========================================================= */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Universal Header */}
        <Header 
          darkMode={darkMode} 
          onToggleDarkMode={() => setDarkMode(!darkMode)} 
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        {/* Live page view renderer */}
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          
          {/* Quick Real-Time Summary Inflow Indicator Bar (Displays across all page layouts dynamically!) */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 shadow-xs transition-all">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#64748b] dark:text-slate-400">
                {activeTab === 'pay-calc' ? (
                  isCompareMode ? 'Compare Mode Live Feed Active' : 'Live Calculator Updated Instantly'
                ) : (
                  `Connected Stream Active: Standard Take-home is ${formatCurrency(calculationResult.netTakeHome.monthly)}/mo`
                )}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-bold text-slate-500 dark:text-slate-400">
              {activeTab === 'pay-calc' && !isCompareMode ? (
                <>
                  <span>Gross: <strong className="text-slate-900 dark:text-white font-extrabold">{formatCurrency(inputs.grossSalary)}</strong></span>
                  <span className="text-slate-200 dark:text-slate-800">|</span>
                  <span>Taxable: <strong className="text-slate-900 dark:text-white font-extrabold">{formatCurrency(calculationResult.taxableIncome.yearly)}</strong></span>
                  <span className="text-slate-200 dark:text-slate-800">|</span>
                  <span>Take-Home: <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">{formatCurrency(calculationResult.netTakeHome.monthly)}/mo</strong></span>
                </>
              ) : activeTab === 'pay-calc' && isCompareMode ? (
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                  <span className={`px-2.5 py-1 rounded-lg ${activeScenario === 'A' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-100 dark:ring-indigo-900/30' : ''}`}>
                    A (Base) Gross: <strong className="font-extrabold">{formatCurrency(inputs.grossSalary)}</strong> → <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">{formatCurrency(calculationResult.netTakeHome.monthly)}/mo</strong>
                  </span>
                  <span className="text-slate-200 dark:text-slate-800">|</span>
                  <span className={`px-2.5 py-1 rounded-lg ${activeScenario === 'B' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-100 dark:ring-indigo-900/30' : ''}`}>
                    B (Compare) Gross: <strong className="font-extrabold">{formatCurrency(compareInputs.grossSalary)}</strong> → <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">{formatCurrency(compareResult.netTakeHome.monthly)}/mo</strong>
                  </span>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-4 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <span>Gross Salary: <span className="font-mono text-slate-900 dark:text-white font-extrabold">{formatCurrency(inputs.grossSalary)}/yr</span></span>
                  <span>•</span>
                  <span>Take-Home Pay: <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black">{formatCurrency(calculationResult.netTakeHome.monthly)}/mo</span></span>
                </div>
              )}
            </div>
          </div>

          {/* Render Active View Container */}
          <div className="transition-all animate-in fade-in duration-300">
            {renderActiveScreen()}
          </div>

        </main>
      </div>

    </div>
  );
}
