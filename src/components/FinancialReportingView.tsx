import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Download,
  Printer,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  Building,
  Users2,
  DollarSign,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { ACCOUNTS, formatCurrency, formatCompactCurrency } from '../data/constants';
import { AccountKey } from '../types';

export const FinancialReportingView: React.FC = () => {
  const { state } = useApp();

  // Scenario Simulator state
  const [scenarioRevenueGrowth, setScenarioRevenueGrowth] = useState<number>(20);
  const [scenarioExtraHires, setScenarioExtraHires] = useState<number>(0);
  const [scenarioCostReduction, setScenarioCostReduction] = useState<number>(0);

  // Financial aggregates
  const totalInflow = state.transactions
    .filter((t) => t.type === 'cashin' || t.type === 'invoice-payment')
    .reduce((sum, t) => sum + t.amount, 0);

  const profitReserve = state.balances.P || 0;
  const inputCosts = state.balances.I || 0;
  const marketingCosts = state.balances.M || 0;
  const rentCosts = state.balances.R || 0;
  const dailyExpenses = state.balances.E || 0;
  const salaries = state.balances.S || 0;
  const totalOperatingReserves = inputCosts + marketingCosts + rentCosts + dailyExpenses + salaries;

  // Pipeline weighted addition
  const openDeals = state.deals.filter((d) => d.stage !== 'won' && d.stage !== 'lost');
  const weightedPipeline = openDeals.reduce((sum, d) => sum + d.value * d.probability, 0);

  // 7 Account distribution data for Pie Chart
  const pieData = ACCOUNTS.map((a) => ({
    name: a.name,
    short: a.short,
    value: Math.max(10, state.balances[a.key] || 0),
    color: a.color,
    percentage: state.percentages[a.key],
  }));

  // Trend data
  const monthlyData = [
    { month: 'Apr', revenue: 19500, expenses: 14200, profit: 5300 },
    { month: 'May', revenue: 23200, expenses: 16400, profit: 6800 },
    { month: 'Jun', revenue: 28400, expenses: 19100, profit: 9300 },
    { month: 'Jul', revenue: 32000, expenses: 21500, profit: 10500 },
    { month: 'Aug', revenue: 37500, expenses: 24200, profit: 13300 },
    { month: 'Current (Sep)', revenue: totalInflow, expenses: totalOperatingReserves, profit: profitReserve },
  ];

  // 30 / 60 / 90 Forecast
  const avgMonthlyInflow = totalInflow > 0 ? totalInflow : 28000;
  const forecast30 = Math.round(profitReserve + (avgMonthlyInflow * (state.percentages.P / 100)) + (weightedPipeline * 0.4 * (state.percentages.P / 100)));
  const forecast60 = Math.round(profitReserve + (avgMonthlyInflow * 2 * (state.percentages.P / 100)) + (weightedPipeline * 0.7 * (state.percentages.P / 100)));
  const forecast90 = Math.round(profitReserve + (avgMonthlyInflow * 3 * (state.percentages.P / 100)) + (weightedPipeline * (state.percentages.P / 100)));

  // Simulated results
  const simulatedInflow = Math.round(totalInflow * (1 + scenarioRevenueGrowth / 100));
  const simulatedExpenses = Math.round(
    totalOperatingReserves * (1 - scenarioCostReduction / 100) + scenarioExtraHires * 4500
  );
  const simulatedProfit = Math.round(simulatedInflow * (state.percentages.P / 100));

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const lines = [
      `CIMPRES REAL-TIME FINANCIAL P&L STATEMENT`,
      `Business: ${state.settings.businessName}`,
      `Generated: ${new Date().toISOString()}`,
      ``,
      `METRIC,AMOUNT`,
      `Total Cash Inflow,${totalInflow}`,
      `Input Cost Reserve (COGS),${inputCosts}`,
      `Salaries & Payroll Reserve,${salaries}`,
      `Rent & Facility Lease Reserve,${rentCosts}`,
      `Marketing & Acquisition Fund,${marketingCosts}`,
      `Daily Operating Overhead,${dailyExpenses}`,
      `NET PROFIT RING-FENCED,${profitReserve}`,
      ``,
      `PIPELINE WEIGHTED FORECAST,${weightedPipeline}`,
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Real-Time Financial Intelligence
          </h2>
          <p className="text-sm text-slate-500">
            Real-time profit & loss statement, account allocation breakdown, 90-day cash flow projection, and scenario modeling.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm border border-slate-200 transition cursor-pointer flex items-center gap-1.5"
            id="reports-export-csv-btn"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-sm transition cursor-pointer flex items-center gap-1.5"
            id="reports-print-btn"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Top Real-Time P&L Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-500 block mb-1">
            Total Inflow Revenue
          </span>
          <div className="text-2xl font-black text-slate-900">
            {formatCurrency(totalInflow, state.settings.currency)}
          </div>
          <span className="text-xs text-emerald-700 font-semibold mt-1 block">
            Across {state.transactions.length} events
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-500 block mb-1">
            Total Secured Reserves
          </span>
          <div className="text-2xl font-black text-indigo-900">
            {formatCurrency(totalOperatingReserves, state.settings.currency)}
          </div>
          <span className="text-xs text-indigo-700 font-medium mt-1 block">
            Payroll, Rent, Stock & Ops
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-500 block mb-1">
            Net Ring-Fenced Profit
          </span>
          <div className="text-2xl font-black text-emerald-700">
            {formatCurrency(profitReserve, state.settings.currency)}
          </div>
          <span className="text-xs text-emerald-700 font-semibold mt-1 block">
            {state.percentages.P}% ring-fence margin
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-500 block mb-1">
            Weighted Pipeline Inflow
          </span>
          <div className="text-2xl font-black text-blue-700">
            {formatCurrency(weightedPipeline, state.settings.currency)}
          </div>
          <span className="text-xs text-blue-600 font-medium mt-1 block">
            Projected from active deals
          </span>
        </div>
      </div>

      {/* Charts Row: Historical Cash Flow & 7-Account Distribution Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue & Profit Growth Area Chart */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Revenue Inflow vs Operating Outflows</h3>
              <p className="text-xs text-slate-500">Track financial stability and surplus buffer over time</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              6-Month Trend
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="chartInflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="chartExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64748b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Legend iconType="circle" />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Inflow Revenue"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fill="url(#chartInflow)"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Operating Reserves"
                  stroke="#64748b"
                  strokeWidth={2}
                  fill="url(#chartExpenses)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 7 Accounts Distribution Donut/Pie Chart */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-slate-900">7-Account Allocation Split</h3>
              <PieIcon className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Current proportion of total liquidity across all 7 accounts
            </p>

            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Balance']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
            {ACCOUNTS.map((acct) => (
              <div key={acct.key} className="flex items-center justify-between py-1">
                <span className="flex items-center gap-1.5 text-slate-600 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: acct.color }}
                  />
                  <span className="truncate">{acct.short}</span>
                </span>
                <span className="font-bold text-slate-900">
                  {formatCompactCurrency(state.balances[acct.key] || 0, state.settings.currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-Time P&L Statement & 90-Day Forecaster */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Real-Time Profit & Loss Statement */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Real-Time P&L Statement</h3>
              <p className="text-xs text-slate-500">Live operational ledger formatted for executive review</p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400">USD GAAP</span>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="font-bold text-slate-900">Gross Collected Inflow</span>
              <span className="font-mono font-black text-slate-900">
                {formatCurrency(totalInflow, state.settings.currency)}
              </span>
            </div>

            <div className="flex justify-between py-1 text-slate-600 pl-3">
              <span>Less: Direct Input Costs (COGS {state.percentages.I}%)</span>
              <span className="font-mono text-rose-600">
                -{formatCurrency(inputCosts, state.settings.currency)}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-y border-slate-200 font-bold bg-slate-50 px-2 rounded-lg">
              <span>Gross Operating Margin</span>
              <span className="font-mono text-slate-900">
                {formatCurrency(totalInflow - inputCosts, state.settings.currency)}
              </span>
            </div>

            <div className="pl-3 space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Salaries & Payroll ({state.percentages.S}%)</span>
                <span className="font-mono text-rose-600">
                  -{formatCurrency(salaries, state.settings.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Rent & Physical Leases ({state.percentages.R}%)</span>
                <span className="font-mono text-rose-600">
                  -{formatCurrency(rentCosts, state.settings.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Marketing & Customer Acquisition ({state.percentages.M}%)</span>
                <span className="font-mono text-rose-600">
                  -{formatCurrency(marketingCosts, state.settings.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Daily Operating Expenses ({state.percentages.E}%)</span>
                <span className="font-mono text-rose-600">
                  -{formatCurrency(dailyExpenses, state.settings.currency)}
                </span>
              </div>
            </div>

            <div className="flex justify-between py-3 border-t-2 border-slate-900 font-black text-base bg-emerald-50/80 px-3 rounded-xl">
              <span className="text-emerald-900">NET RING-FENCED PROFIT</span>
              <span className="font-mono text-emerald-800">
                {formatCurrency(profitReserve, state.settings.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* 30 / 60 / 90 Day Forecaster */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Cash Flow Projections</h3>
                <p className="text-xs text-slate-500">
                  Algorithmic estimate combining existing reserves and weighted deal closing rate
                </p>
              </div>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                    30-Day Projected Profit Reserve
                  </span>
                  <span className="text-xs font-bold text-blue-700 font-mono">+1 Month</span>
                </div>
                <div className="text-2xl font-black text-blue-950">
                  {formatCurrency(forecast30, state.settings.currency)}
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  Assumes {state.percentages.P}% profit ring-fence on expected deals.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                    60-Day Projected Profit Reserve
                  </span>
                  <span className="text-xs font-bold text-indigo-700 font-mono">+2 Months</span>
                </div>
                <div className="text-2xl font-black text-indigo-950">
                  {formatCurrency(forecast60, state.settings.currency)}
                </div>
                <p className="text-xs text-indigo-700 mt-1">
                  Includes projected settlement of 70% of current proposal deals.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                    90-Day Projected Profit Reserve
                  </span>
                  <span className="text-xs font-bold text-emerald-700 font-mono">+Quarter</span>
                </div>
                <div className="text-2xl font-black text-emerald-950">
                  {formatCurrency(forecast90, state.settings.currency)}
                </div>
                <p className="text-xs text-emerald-700 mt-1">
                  Target wealth cushion assuming steady velocity across pipeline.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Scenario Simulator ("What-If" Analysis) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Calculator className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-slate-900">
            Interactive Scenario Planning & Impact Modeling
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-6">
          Test operational decisions before committing cash. Adjust the sliders below to see immediate impact on bottom-line profit and payroll capacity.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Slider 1: Revenue Growth */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
              <span>Sales Revenue Change</span>
              <span className="text-blue-600">{scenarioRevenueGrowth > 0 ? `+${scenarioRevenueGrowth}%` : `${scenarioRevenueGrowth}%`}</span>
            </div>
            <input
              type="range"
              min="-50"
              max="100"
              step="5"
              value={scenarioRevenueGrowth}
              onChange={(e) => setScenarioRevenueGrowth(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>-50%</span>
              <span>Baseline</span>
              <span>+100%</span>
            </div>
          </div>

          {/* Slider 2: Additional Hires */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
              <span>Team Expansion (New Hires)</span>
              <span className="text-indigo-600">+{scenarioExtraHires} Team Members</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="1"
              value={scenarioExtraHires}
              onChange={(e) => setScenarioExtraHires(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>0</span>
              <span>+2</span>
              <span>+5</span>
            </div>
          </div>

          {/* Slider 3: Cost Reductions */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
              <span>Vendor / Overhead Reduction</span>
              <span className="text-emerald-700">-{scenarioCostReduction}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="5"
              value={scenarioCostReduction}
              onChange={(e) => setScenarioCostReduction(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>0%</span>
              <span>-20%</span>
              <span>-40%</span>
            </div>
          </div>
        </div>

        {/* Simulated Outcome Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs uppercase font-bold tracking-wider text-cyan-400">
              Simulated Annualized Run-Rate
            </span>
            <div className="text-xl sm:text-2xl font-black">
              Inflow: {formatCurrency(simulatedInflow, state.settings.currency)} • Profit Reserve:{' '}
              <span className="text-emerald-400">
                {formatCurrency(simulatedProfit, state.settings.currency)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right text-xs">
              <span className="text-slate-400 block">Monthly Payroll Impact:</span>
              <span className="font-bold text-white font-mono">
                +{formatCurrency(scenarioExtraHires * 4500, state.settings.currency)}/mo
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
