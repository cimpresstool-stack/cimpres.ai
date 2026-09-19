import React, { useState } from 'react';
import {
  ArrowDownRight,
  TrendingUp,
  ShieldAlert,
  Building,
  Users2,
  Receipt,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Calendar,
  Layers,
  ChevronRight,
  Send,
  AlertCircle,
  DollarSign,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { useApp } from '../context/AppContext';
import {
  ACCOUNTS,
  calculateDistribution,
  formatCurrency,
  formatCompactCurrency,
} from '../data/constants';
import { AccountKey } from '../types';

export const DashboardView: React.FC = () => {
  const {
    state,
    recordCashIn,
    setActiveTab,
    setIsCashInModalOpen,
    setIsNewInvoiceModalOpen,
    setPreviewInvoice,
    adjustAccountBalance,
    setAdjustAccountKey,
  } = useApp();

  const [quickAmount, setQuickAmount] = useState<string>('4850');
  const [quickNote, setQuickNote] = useState<string>('Daily client receipts & online settlement');

  const parsedAmount = Math.max(0, parseFloat(quickAmount) || 0);
  const livePreview = calculateDistribution(parsedAmount, state.percentages);

  const totalCashIn = state.transactions
    .filter((t) => t.type === 'cashin' || t.type === 'invoice-payment')
    .reduce((sum, t) => sum + t.amount, 0);

  const profitReserve = state.balances.P || 0;
  const rentBalance = state.balances.R || 0;
  const rentTarget = state.settings.monthlyRentTarget > 0 ? state.settings.monthlyRentTarget : 6000;
  const rentPct = rentTarget > 0 ? Math.min(100, Math.round((rentBalance / rentTarget) * 100)) : 0;

  const salBalance = state.balances.S || 0;
  const salTarget = state.settings.monthlyPayrollTarget > 0 ? state.settings.monthlyPayrollTarget : 14000;
  const salPct = salTarget > 0 ? Math.min(100, Math.round((salBalance / salTarget) * 100)) : 0;

  const totalBalance = Object.values(state.balances).reduce((sum, b) => sum + (b || 0), 0);
  const isWorkspaceEmpty = totalBalance === 0 && state.transactions.length === 0;

  const pendingInvoices = state.invoices.filter((i) => i.status === 'sent');
  const pendingAmount = pendingInvoices.reduce((sum, i) => sum + i.total, 0);

  const handleQuickDistribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0) return;
    recordCashIn(parsedAmount, quickNote);
    setQuickAmount('');
  };

  // Mock trend data for chart
  const trendData = [
    { month: 'Apr', inflow: 18500, expenses: 14200, profit: 4300 },
    { month: 'May', inflow: 22400, expenses: 16800, profit: 5600 },
    { month: 'Jun', inflow: 28900, expenses: 19400, profit: 9500 },
    { month: 'Jul', inflow: 31200, expenses: 21000, profit: 10200 },
    { month: 'Aug', inflow: 36800, expenses: 23500, profit: 13300 },
    { month: 'Sep (Now)', inflow: totalCashIn, expenses: 24500, profit: profitReserve },
  ];

  return (
    <div className="space-y-6">
      {/* Onboarding Zero-State Banner for Newly Registered Businesses */}
      {isWorkspaceEmpty && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white border border-blue-700/50 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex flex-wrap items-center gap-2">
                <span>Clean Business Slate Active</span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Account Balances: $0.00
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                Your account is set up with all 7 figures at zero. You can now start feeding in your current business bank balances or record your first cash-inflow distribution.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setAdjustAccountKey('C')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition cursor-pointer flex items-center gap-1.5"
              id="zero-state-feed-balances-btn"
            >
              <DollarSign className="w-4 h-4" />
              <span>Feed Opening Balances</span>
            </button>
            <button
              onClick={() => setIsCashInModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-sm transition cursor-pointer flex items-center gap-1.5"
              id="zero-state-cashin-btn"
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>Record Cash In</span>
            </button>
          </div>
        </div>
      )}

      {/* Welcome Banner & Overview Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-3 border border-emerald-400/30">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            100% Free 7-Account Cash Flow Engine • Active
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Every dollar collected feeds your 7 accounts automatically.
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-5">
            Rent reserved daily. Payroll secured before month-end. Profit ring-fenced first. When cash arrives, the Cimpres algorithm routes each dollar where it belongs in under a second.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsCashInModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition shadow-sm cursor-pointer flex items-center gap-2"
              id="dash-quick-cashin-btn"
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>Record Cash Inflow</span>
            </button>
            <button
              onClick={() => setAdjustAccountKey('C')}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition shadow-sm cursor-pointer flex items-center gap-2"
              id="dash-feed-balances-btn"
            >
              <DollarSign className="w-4 h-4" />
              <span>Feed Account Figures</span>
            </button>
            <button
              onClick={() => setIsNewInvoiceModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition border border-white/20 cursor-pointer flex items-center gap-2"
              id="dash-create-invoice-btn"
            >
              <Receipt className="w-4 h-4 text-blue-400" />
              <span>New Invoice</span>
            </button>
            <button
              onClick={() => setActiveTab('accounts')}
              className="px-4 py-2.5 rounded-xl bg-transparent hover:bg-white/5 text-slate-300 hover:text-white font-medium text-sm transition flex items-center gap-1 cursor-pointer"
            >
              <span>7 Accounts Breakdown</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Decorative Grid and Background Glow */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-cyan-500/10 via-blue-500/10 to-transparent pointer-events-none" />
      </div>

      {/* Top 4 Core Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inflow */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>TOTAL CASH INFLOW</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <ArrowDownRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {formatCurrency(totalCashIn, state.settings.currency)}
          </div>
          <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <span className="font-bold">▲ 100%</span> automatically distributed
          </p>
        </div>

        {/* Profit Reserve */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>PROFIT RING-FENCED</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tracking-tight">
            {formatCurrency(profitReserve, state.settings.currency)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Allocated at {state.percentages.P}% of all inflows
          </p>
        </div>

        {/* Rent Coverage */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>RENT LEASE SECURED</span>
            <span className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600">
              <Building className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-800 tracking-tight">
              {rentPct}%
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {formatCurrency(rentBalance, state.settings.currency)} / {formatCurrency(rentTarget, state.settings.currency)}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${rentPct}%` }}
            />
          </div>
        </div>

        {/* Salaries & Payroll */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>PAYROLL FUNDED</span>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Users2 className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-900 tracking-tight">
              {salPct}%
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {formatCurrency(salBalance, state.settings.currency)} / {formatCurrency(salTarget, state.settings.currency)}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${salPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Financial Health & Invoicing Quick Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('invoices')}
          className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
        >
          <span className="text-xs text-slate-500 font-medium block">Unpaid Invoices</span>
          <div className="text-lg sm:text-xl font-bold text-amber-800 mt-0.5">
            {formatCurrency(pendingAmount, state.settings.currency)}
          </div>
          <span className="text-xs text-amber-700 font-semibold">
            {pendingInvoices.length} awaiting settlement →
          </span>
        </div>

        <div
          onClick={() => setActiveTab('accounts')}
          className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
        >
          <span className="text-xs text-slate-500 font-medium block">Liquid Reserves</span>
          <div className="text-lg sm:text-xl font-bold text-emerald-700 mt-0.5">
            {formatCurrency(
              (state.balances.P || 0) + (state.balances.E || 0) + (state.balances.C || 0),
              state.settings.currency
            )}
          </div>
          <span className="text-xs text-emerald-700 font-semibold">
            Profit + Daily + Buffer →
          </span>
        </div>

        <div
          onClick={() => setActiveTab('reports')}
          className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
        >
          <span className="text-xs text-slate-500 font-medium block">Ledger Volume</span>
          <div className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
            {state.transactions.length} Entries
          </div>
          <span className="text-xs text-blue-600 font-semibold">
            Automated journal history →
          </span>
        </div>

        <div
          onClick={() => setActiveTab('settings')}
          className="p-4 rounded-xl bg-emerald-50/60 hover:bg-emerald-100/60 border border-emerald-200/80 transition cursor-pointer"
        >
          <span className="text-xs text-emerald-800 font-bold block">License Status</span>
          <div className="text-lg sm:text-xl font-black text-emerald-900 mt-0.5">
            100% Free
          </div>
          <span className="text-xs text-emerald-700 font-semibold">
            Full lifetime access unlocked ✓
          </span>
        </div>
      </div>

      {/* Instant Cash In Distributor Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Instant Cash Flow Distribution Simulator</h3>
            <p className="text-xs text-slate-500">
              Type any incoming payment to preview the exact math before committing to accounts.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            Rules Total: {Object.values(state.percentages).reduce((a, b) => a + b, 0)}%
          </span>
        </div>

        <form onSubmit={handleQuickDistribute} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Amount to Distribute ({state.settings.currency})
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  {state.settings.currency}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={quickAmount}
                  onChange={(e) => setQuickAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none font-bold text-slate-900 text-base"
                  id="dash-quick-amount-input"
                />
              </div>
            </div>

            <div className="md:col-span-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Source / Reference
              </label>
              <input
                type="text"
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                placeholder="e.g. POS Settlement, Client Deposit, Online Payment"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-900 text-sm"
                id="dash-quick-note-input"
              />
            </div>

            <div className="md:col-span-3 flex items-end">
              <button
                type="submit"
                disabled={parsedAmount <= 0}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm shadow-sm hover:shadow transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                id="dash-distribute-submit-btn"
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>Distribute Now</span>
              </button>
            </div>
          </div>

          {/* Real-time 7-Account Distribution Preview Chips */}
          <div className="pt-3 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-500 mb-2">
              Live Split across all 7 Accounts ({formatCurrency(parsedAmount, state.settings.currency)}):
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {ACCOUNTS.map((acct) => {
                const share = livePreview[acct.key] || 0;
                return (
                  <div
                    key={acct.key}
                    className={`p-2.5 rounded-xl border ${acct.borderLight} ${acct.bgLight} flex flex-col justify-between`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className={`px-1.5 py-0.5 rounded ${acct.badgeBg} ${acct.badgeText}`}>
                        {acct.key}
                      </span>
                      <span className="text-slate-500">{state.percentages[acct.key]}%</span>
                    </div>
                    <div className="mt-1.5">
                      <span className="block text-[11px] text-slate-600 font-medium truncate">
                        {acct.short}
                      </span>
                      <span className="text-sm font-extrabold text-slate-900">
                        {formatCurrency(share, state.settings.currency)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </form>
      </div>

      {/* 7 Accounts Live Balance Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Current Balances in the 7 Accounts</h3>
            <p className="text-xs text-slate-500">
              Live funds secured for operations, rent, payroll, and profit reserves.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('accounts')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <span>Manage Allocation Rules</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {ACCOUNTS.map((acct) => {
            const bal = state.balances[acct.key] || 0;
            const pct = state.percentages[acct.key] || 0;

            return (
              <div
                key={acct.key}
                className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${acct.badgeBg} ${acct.badgeText}`}
                    >
                      {acct.key}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{pct}%</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-tight">
                    {acct.name}
                  </h4>
                  <div className="text-lg font-extrabold text-slate-900 mt-1">
                    {formatCurrency(bal, state.settings.currency)}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      const amountStr = window.prompt(`Adjust balance for ${acct.name} (+ or -):`);
                      if (amountStr) {
                        const amt = parseFloat(amountStr);
                        if (!isNaN(amt)) {
                          adjustAccountBalance(acct.key, amt);
                        }
                      }
                    }}
                    className="text-[11px] text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    Adjust
                  </button>
                  <span className="text-[10px] text-slate-400">Ring-fenced</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Financial Charts & Pipeline Pulse */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Inflow vs Expenses Chart */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Revenue & Profit Growth Trend</h3>
              <p className="text-xs text-slate-500">
                Monthly cash inflow vs ring-fenced profit reserve accumulation
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Inflow
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Profit
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                <Area
                  type="monotone"
                  dataKey="inflow"
                  name="Inflow"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#inflowGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  name="Profit"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#profitGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Invoices & Automated Operations */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Recent Invoices</h3>
              <button
                onClick={() => setActiveTab('invoices')}
                className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                View all ({state.invoices.length})
              </button>
            </div>

            <div className="space-y-3">
              {state.invoices.slice(0, 4).map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => setPreviewInvoice(inv)}
                  className="p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">{inv.invoiceNum}</span>
                      {inv.autoGenerated && (
                        <span className="text-[10px] font-bold px-1 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          AUTO
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 block truncate max-w-[130px]">
                      {inv.contactName}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900 block">
                      {formatCurrency(inv.total, state.settings.currency)}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        inv.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inv.status === 'sent'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {inv.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Unsettled Receivables:</span>
              <span className="font-extrabold text-amber-800">
                {formatCurrency(pendingAmount, state.settings.currency)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
