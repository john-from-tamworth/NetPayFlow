import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CalculationResult } from '../types';
import { PieChart as PieChartIcon } from 'lucide-react';

interface SalaryChartProps {
  result: CalculationResult;
}

export default function SalaryChart({ result }: SalaryChartProps) {
  const { netTakeHome, incomeTax, nationalInsurance, salarySacrificePension, studentLoan, postgradLoan, grossPay } = result;

  const totalLoans = studentLoan.yearly + postgradLoan.yearly;

  // Pie chart data structure
  const rawData = [
    { name: 'Net Take-Home Pay', value: netTakeHome.yearly, color: '#10b981' }, // Emerald
    { name: 'Income Tax', value: incomeTax.yearly, color: '#f43f5e' }, // Rose
    { name: 'National Insurance', value: nationalInsurance.yearly, color: '#8b5cf6' }, // Violet
    { name: 'Workplace Pension', value: salarySacrificePension.yearly, color: '#4f46e5' }, // Indigo
    { name: 'Student Loans', value: totalLoans, color: '#f59e0b' }, // Amber
  ];

  // Filter out zero entries to avoid chart glitches or overlaps
  const chartData = rawData.filter(item => item.value > 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0
    }).format(val);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = grossPay.yearly > 0 ? ((data.value / grossPay.yearly) * 100).toFixed(1) : '0';
      return (
        <div className="rounded-xl border border-gray-105 border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 shadow-md font-sans text-xs">
          <p className="font-bold text-gray-950 dark:text-white">{data.name}</p>
          <p className="font-mono text-gray-600 dark:text-gray-400 mt-1 font-semibold">
            {formatCurrency(data.value)} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors duration-200">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <PieChartIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-450 dark:text-indigo-400" />
          <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Salary Allocation Breakdown
          </h2>
        </div>
        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded">
          Annual distribution
        </span>
      </div>

      {/* Chart Canvas */}
      <div className="flex flex-col items-center justify-center lg:flex-row gap-6">
        <div className="h-[250px] w-full max-w-[280px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-slate-400 dark:text-slate-500 font-medium font-sans">
              Awaiting entry inputs...
            </div>
          )}
        </div>

        {/* Legend Panel */}
        <div className="flex-1 w-full space-y-3">
          {chartData.map((item, index) => {
            const percentage = grossPay.yearly > 0 ? ((item.value / grossPay.yearly) * 100).toFixed(1) : '0';
            return (
              <div
                key={index}
                className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">
                    {item.name}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs font-black text-slate-900 dark:text-white">
                    {formatCurrency(item.value)}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                    {percentage}% of Gross
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
