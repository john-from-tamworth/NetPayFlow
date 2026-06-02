import { useState, useEffect } from 'react';
import { Sliders, MapPin, GraduationCap, ChevronDown, ChevronUp, Landmark, Percent, Receipt, BadgePercent, HelpCircle, BookOpen, Sparkles } from 'lucide-react';
import { CalculatorInputs, LocationType, StudentLoanPlanType } from '../types';

interface ControlPanelProps {
  inputs: CalculatorInputs;
  setInputs: (inputs: CalculatorInputs) => void;
  isCompareMode: boolean;
  onToggleCompareMode: () => void;
  activeScenario: 'A' | 'B';
  onChangeActiveScenario: (scenario: 'A' | 'B') => void;
  scenarioASalary: number;
  scenarioBSalary: number;
}

export default function ControlPanel({
  inputs,
  setInputs,
  isCompareMode,
  onToggleCompareMode,
  activeScenario,
  onChangeActiveScenario,
  scenarioASalary,
  scenarioBSalary,
}: ControlPanelProps) {
  const [isOpenAdvanced, setIsOpenAdvanced] = useState(false);
  const [tempSalaryText, setTempSalaryText] = useState(inputs.grossSalary.toString());
  const [tempPensionText, setTempPensionText] = useState(inputs.pensionPercent.toString());
  const [tempBikText, setTempBikText] = useState(inputs.bikValue.toString());

  // Synchronise temporary text inputs when the active scenario switches
  useEffect(() => {
    setTempSalaryText(inputs.grossSalary.toString());
    setTempPensionText(inputs.pensionPercent.toString());
    setTempBikText(inputs.bikValue.toString());
  }, [inputs.grossSalary, inputs.pensionPercent, inputs.bikValue]);

  // Handle salary inputs smoothly
  const handleSalaryChange = (value: number) => {
    const safeVal = Math.max(0, isNaN(value) ? 0 : value);
    setInputs({ ...inputs, grossSalary: safeVal });
    setTempSalaryText(safeVal.toString());
  };

  const handleSalaryTextChange = (text: string) => {
    // Strip everything except numbers
    const cleanNum = text.replace(/[^0-9]/g, '');
    setTempSalaryText(cleanNum);
    if (cleanNum !== '') {
      const parsed = parseInt(cleanNum, 10);
      setInputs({ ...inputs, grossSalary: parsed });
    } else {
      setInputs({ ...inputs, grossSalary: 0 });
    }
  };

  // Handle pension inputs smoothly
  const handlePensionChange = (value: number) => {
    const cappedVal = Math.min(100, Math.max(0, isNaN(value) ? 0 : value));
    setInputs({ ...inputs, pensionPercent: cappedVal });
    setTempPensionText(cappedVal.toString());
  };

  const handlePensionTextChange = (text: string) => {
    const cleanNum = text.replace(/[^0-9.]/g, '');
    setTempPensionText(cleanNum);
    if (cleanNum !== '' && !cleanNum.endsWith('.')) {
      const parsed = parseFloat(cleanNum);
      if (!isNaN(parsed)) {
        const capped = Math.min(100, Math.max(0, parsed));
        // Update model with capped value
        setInputs({ ...inputs, pensionPercent: capped });
      }
    } else if (cleanNum === '') {
      setInputs({ ...inputs, pensionPercent: 0 });
    }
  };

  // Handle Benefit-in-Kind inputs
  const handleBikChange = (text: string) => {
    const cleanNum = text.replace(/[^0-9]/g, '');
    setTempBikText(cleanNum);
    if (cleanNum !== '') {
      const parsed = parseInt(cleanNum, 10);
      setInputs({ ...inputs, bikValue: parsed });
    } else {
      setInputs({ ...inputs, bikValue: 0 });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col gap-6 transition-colors duration-200">
      {/* Title & Compare Toggle */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Financial Control Desk
            </h2>
          </div>
          
          <button
            type="button"
            onClick={onToggleCompareMode}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              isCompareMode
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                : 'bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-250 hover:bg-slate-100'
            }`}
          >
            <span>⚖️ {isCompareMode ? 'Comparing' : 'Compare Pay Wise'}</span>
          </button>
        </div>

        {isCompareMode && (
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-950/70 border border-slate-200/40 dark:border-slate-800 rounded-2xl animate-fade-in-down">
            <button
              type="button"
              onClick={() => onChangeActiveScenario('A')}
              className={`py-2 px-3 text-xs font-bold rounded-xl transition-all text-center cursor-pointer ${
                activeScenario === 'A'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-black ring-1 ring-slate-100/50 dark:ring-slate-800'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 animate-pulse-subtle'
              }`}
            >
              <span className={`block text-[9px] uppercase tracking-wider font-bold ${activeScenario === 'A' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>Scenario A</span>
              <span className="block truncate mt-0.5 font-extrabold">Base (£{new Intl.NumberFormat('en-GB').format(scenarioASalary)})</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeActiveScenario('B')}
              className={`py-2 px-3 text-xs font-bold rounded-xl transition-all text-center cursor-pointer ${
                activeScenario === 'B'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-black ring-1 ring-slate-100/50 dark:ring-slate-800'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <span className={`block text-[9px] uppercase tracking-wider font-bold ${activeScenario === 'B' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>Scenario B</span>
              <span className="block truncate mt-0.5 font-extrabold">Compare (£{new Intl.NumberFormat('en-GB').format(scenarioBSalary)})</span>
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Salary Input Block */}
        <div>
          <div className="flex justify-between items-end mb-3">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block" htmlFor="gross-salary-input">
              Gross Annual Salary
            </label>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-transparent dark:border-indigo-900/40 px-2.5 py-1 rounded">
              Pre-tax Income
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-black text-slate-700 dark:text-slate-300">£</span>
            <input
              id="gross-salary-input"
              type="text"
              className="text-4xl font-black w-full outline-none text-slate-900 dark:text-white bg-transparent border-0 p-0 focus:ring-0"
              value={tempSalaryText === '0' ? '' : Number(tempSalaryText).toLocaleString('en-GB')}
              onChange={(e) => handleSalaryTextChange(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="relative pt-1">
            <input
              type="range"
              min="10000"
              max="250000"
              step="500"
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-100 dark:bg-slate-800 accent-indigo-600 dark:accent-indigo-500"
              value={inputs.grossSalary > 250000 ? 250000 : inputs.grossSalary}
              onChange={(e) => handleSalaryChange(parseInt(e.target.value, 10))}
            />
            <div className="mt-1 flex justify-between text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500">
              <span>£10,000</span>
              <span>£130,000</span>
              <span>£250,050+</span>
            </div>
          </div>
        </div>

        {/* Pension Salary Sacrifice Block */}
        <div className="rounded-2xl border border-indigo-100 dark:border-indigo-950 bg-indigo-50/20 dark:bg-indigo-950/10 p-4 space-y-3">
          <div className="flex justify-between items-end">
            <div>
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block" htmlFor="pension-percent-input">
                Pension contribution (Sacrifice)
              </label>
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">
                Exempt from Tax &amp; National Insurance
              </p>
            </div>
            <div className="flex items-center gap-1 text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-transparent dark:border-indigo-900/30 px-2 py-0.5  rounded">
              <input
                id="pension-percent-input"
                type="text"
                className="w-8 border-0 bg-transparent text-right font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none p-0 focus:ring-0"
                value={tempPensionText}
                onChange={(e) => handlePensionTextChange(e.target.value)}
                placeholder="0"
              />
              <span className="font-mono text-xs">%</span>
            </div>
          </div>

          <div className="pt-1">
            <input
              type="range"
              min="0"
              max="30"
              step="0.5"
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-indigo-100/60 dark:bg-indigo-950/40 accent-indigo-600 dark:accent-indigo-500"
              value={inputs.pensionPercent}
              onChange={(e) => handlePensionChange(parseFloat(e.target.value))}
            />
            <div className="mt-1 flex justify-between text-[10px] font-mono font-bold text-indigo-400 dark:text-indigo-550 dark:text-indigo-500">
              <span>0%</span>
              <span>15%</span>
              <span>30%</span>
            </div>
          </div>
        </div>

        {/* Location Selector */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">
            Location
          </label>
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              type="button"
              className={`flex-1 py-1.5 text-xs font-bold rounded transition-all cursor-pointer ${
                inputs.location === 'rUK'
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              onClick={() => setInputs({ ...inputs, location: 'rUK' })}
            >
              Rest of UK
            </button>
            <button
              type="button"
              className={`flex-1 py-1.5 text-xs font-bold rounded transition-all cursor-pointer ${
                inputs.location === 'Scotland'
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              onClick={() => setInputs({ ...inputs, location: 'Scotland' })}
            >
              Scotland
            </button>
          </div>
        </div>

        {/* Student Loans dropdown/checkboxes */}
        <div className="space-y-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block" htmlFor="student-loan-undergrad">
              Student Loan Plan
            </label>
            <select
              id="student-loan-undergrad"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={inputs.studentLoanPlan}
              onChange={(e) =>
                setInputs({ ...inputs, studentLoanPlan: e.target.value as StudentLoanPlanType })
              }
            >
              <option value="none" className="dark:bg-slate-900">No Undergraduate Loan</option>
              <option value="Plan 1" className="dark:bg-slate-900">Plan 1 (Threshold: £24,990 / 9%)</option>
              <option value="Plan 2" className="dark:bg-slate-900">Plan 2 (Threshold: £27,295 / 9%)</option>
              <option value="Plan 4" className="dark:bg-slate-900">Plan 4 [Scotland] (Threshold: £31,395 / 9%)</option>
              <option value="Plan 5" className="dark:bg-slate-900">Plan 5 (Threshold: £25,000 / 9%)</option>
            </select>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200/65 dark:border-slate-800 pt-3">
            <div className="space-y-0.5">
              <label className="text-[10.5px] font-bold text-slate-700 dark:text-slate-300 block" htmlFor="postgrad-loan-cb">
                Postgraduate Loan Plan
              </label>
              <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                Threshold: £21,000 / Repayment: 6%
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                id="postgrad-loan-cb"
                type="checkbox"
                className="peer sr-only"
                checked={inputs.hasPostgradLoan}
                onChange={(e) => setInputs({ ...inputs, hasPostgradLoan: e.target.checked })}
              />
              <div className="peer h-5 w-9 rounded-full bg-slate-200 dark:bg-slate-800 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-slate-300 dark:after:border-slate-700 after:bg-white dark:after:bg-slate-900 after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none focus:outline-none"></div>
            </label>
          </div>
        </div>

        {/* Advanced Options Accordion */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
          <button
            type="button"
            className="flex w-full items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
            onClick={() => setIsOpenAdvanced(!isOpenAdvanced)}
          >
            <span>Advanced Adjustments (BIK &amp; Tax Code)</span>
            {isOpenAdvanced ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </button>

          {isOpenAdvanced && (
            <div className="mt-4 space-y-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10 p-4 transition-all animate-in fade-in slide-in-from-top-2 duration-200">
              
              {/* Benefit-in-Kind (BIK) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300" htmlFor="bik-value-input">
                    Benefit-in-Kind (BIK)
                  </label>
                  <div className="relative flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-2">
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">£</span>
                    <input
                      id="bik-value-input"
                      type="text"
                      className="w-20 border-0 bg-transparent px-2 py-1 text-right font-mono text-xs font-bold text-slate-800 dark:text-slate-250 dark:text-slate-200 focus:outline-none focus:ring-0"
                      value={tempBikText === '0' ? '' : Number(tempBikText).toLocaleString('en-GB')}
                      onChange={(e) => handleBikChange(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed font-semibold">
                  Taxed company car/health perks. Increases tax payable without raising gross payroll cash.
                </p>
              </div>

              {/* Custom Tax Code */}
              <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block" htmlFor="custom-tax-code-cb">
                      Custom Tax Code Override
                    </label>
                    <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                      Specify direct HMRC tax code (e.g. K400, BR, 0T)
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      id="custom-tax-code-cb"
                      type="checkbox"
                      className="peer sr-only"
                      checked={inputs.useCustomTaxCode}
                      onChange={(e) => setInputs({ ...inputs, useCustomTaxCode: e.target.checked })}
                    />
                    <div className="peer h-5 w-9 rounded-full bg-slate-200 dark:bg-slate-800 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-slate-300 dark:after:border-slate-700 after:bg-white dark:after:bg-slate-900 after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none focus:outline-none"></div>
                  </label>
                </div>

                {inputs.useCustomTaxCode && (
                  <div className="animate-in fade-in slide-in-from-top-1 duration-155">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={inputs.taxCode}
                        onChange={(e) => setInputs({ ...inputs, taxCode: e.target.value })}
                        placeholder="e.g. 1257L"
                      />
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
