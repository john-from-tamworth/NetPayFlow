import { ShieldCheck, Clock, Sun, Moon, Menu } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenMobileMenu?: () => void;
}

export default function Header({ darkMode, onToggleDarkMode, onOpenMobileMenu }: HeaderProps) {
  return (
    <header className="h-16 px-4 sm:px-8 flex items-center justify-between border-b border-slate-200 bg-white sticky top-0 z-40 shrink-0 dark:bg-slate-900 dark:border-slate-800 transition-colors duration-200">
      {/* Logo / Title */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 text-slate-500 hover:text-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
          £
        </div>
        <div>
          <h1 className="text-sm font-black tracking-tight text-slate-800 uppercase sm:text-base dark:text-slate-100">
            NetPay<span className="text-indigo-600 dark:text-indigo-400">Flow</span>
          </h1>
          <p className="text-[9px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-medium">
            Fiscal 2026 / 2027 Calculator Suite
          </p>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Verification Badges (Desktop/Tablet) */}
        <div className="hidden items-center gap-4 sm:flex">
          <div className="flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-500" />
            <span>HMRC Compliant Ruleset</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full dark:bg-slate-800 dark:text-slate-400">
            <Clock className="h-3.5 w-3.5 text-slate-400 animate-pulse dark:text-slate-500" />
            <span>LATEST TAX YEAR: 2026/27</span>
          </div>
        </div>

        {/* Small Device Metadata (Mobile phone) */}
        <div className="flex flex-col items-end sm:hidden">
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400">
            HMRC OK
          </span>
          <span className="text-[9px] text-slate-400 mt-0.5 font-bold dark:text-slate-550 dark:text-slate-500">TY 2026/27</span>
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-slate-200 dark:bg-slate-800"></div>

        {/* Theme Toggle Button */}
        <button
          id="theme-toggle"
          type="button"
          onClick={onToggleDarkMode}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700 cursor-pointer"
          aria-label={darkMode ? "Switch to light theme" : "Switch to dark theme"}
        >
          {darkMode ? (
            <Sun className="h-4.5 w-4.5 text-amber-500 animate-in spin-in duration-300" />
          ) : (
            <Moon className="h-4.5 w-4.5 text-slate-600" />
          )}
        </button>
      </div>
    </header>
  );
}

