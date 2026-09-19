import React, { useState } from 'react';
import {
  ArrowDownRight,
  PieChart,
  Download,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  DollarSign,
  Building,
  Users2,
  Shield,
  Layers,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  ACCOUNTS,
  calculateDistribution,
  formatCurrency,
} from '../data/constants';
import { AccountKey, Transaction } from '../types';

export const CashFlowView: React.FC = () => {
  const {
    state,
    recordCashIn,
    adjustAccountBalance,
    setAdjustAccountKey,
    updatePercentages,
    updateSettings,
  } = useApp();

  const [inputAmount, setInputAmount] = useState<string>('5000');
  const [inputNote, setInputNote] = useState<string>('Client retainer settlement');
  const [editingPcts, setEditingPcts] = useState<Record<AccountKey, number>>({
    ...state.percentages,
  });
  const [isEditingPcts, setIsEditingPcts] = useState(false);
  const [selectedAccountFilter, setSelectedAccountFilter] = useState<string>('all');

  const parsedAmount = Math.max(0, parseFloat(inputAmount) || 0);
  const previewSplit = calculateDistribution(parsedAmount, state.percentages);

  const totalPct = Object.values(editingPcts).reduce((a, b) => a + b, 0);
  const isPctValid = Math.abs(totalPct - 100) < 0.01;

  const handleDistribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0) return;
    recordCashIn(parsedAmount, inputNote);
    setInputAmount('');
  };

  const handleSavePcts = () => {
    if (!isPctValid) return;
    updatePercentages(editingPcts);
    setIsEditingPcts(false);
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Amount', 'Note', 'Dist_C', 'Dist_I', 'Dist_M', 'Dist_P', 'Dist_R', 'Dist_E', 'Dist_S'];
    const rows = state.transactions.map((t) => [
      t.date,
      t.type,
      t.amount,
      `"${t.note.replace(/"/g, '""')}"`,
      t.dist?.C || 0,
      t.dist?.I || 0,
      t.dist?.M || 0,
      t.dist?.P || 0,
      t.dist?.R || 0,
      t.dist?.E || 0,
      t.dist?.S || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cimpres-cashflow-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTransactions = state.transactions.filter((t) => {
    if (selectedAccountFilter === 'all') return true;
    if (t.accountKey === selectedAccountFilter) return true;
    if (t.dist && (t.dist as any)[selectedAccountFilter] > 0) return true;
    return false;
  });

  return (
    <div className="space-y-8">
      {/* 7-Account Engine Architectural Explanation Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              The CIMPRES Money Router
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              One Entry Pool. Seven Dedicated Reserves.
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Traditional businesses mix all money into one general checking account and hope expenses don't outrun sales. Cimpres enforces financial solvency by partitioning every inflow upon arrival.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => setAdjustAccountKey('C')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition cursor-pointer flex items-center gap-1.5"
              id="feed-balances-btn"
            >
              <DollarSign className="w-4 h-4" />
              <span>Feed / Set Balances</span>
            </button>
            <button
              onClick={() => setIsEditingPcts(!isEditingPcts)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm border border-slate-200 transition cursor-pointer flex items-center gap-1.5"
              id="cashflow-edit-rules-btn"
            >
              <Sliders className="w-4 h-4 text-slate-600" />
              <span>{isEditingPcts ? 'Close Rules Editor' : 'Edit Split Rules'}</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm border border-slate-200 transition cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Rule Editor (Toggled) */}
        {isEditingPcts && (
          <div className="mt-6 p-5 bg-slate-50 rounded-2xl border border-slate-200 animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Custom Allocation Percentages</h4>
                <p className="text-xs text-slate-500">
                  Configure how each incoming revenue dollar is split across accounts. Must sum to 100%.
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isPctValid
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800 flex items-center gap-1'
                }`}
              >
                {!isPctValid && <AlertTriangle className="w-3.5 h-3.5" />}
                <span>Total: {totalPct.toFixed(1)}%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 mb-4">
              {ACCOUNTS.map((acct) => (
                <div key={acct.key} className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className={`${acct.badgeBg} ${acct.badgeText} px-1.5 py-0.5 rounded`}>
                      {acct.key}
                    </span>
                    <span className="text-slate-600">{acct.short}</span>
                  </div>
                  <div className="relative mt-2">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      value={editingPcts[acct.key] || 0}
                      onChange={(e) =>
                        setEditingPcts({
                          ...editingPcts,
                          [acct.key]: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full pl-2 pr-6 py-1.5 rounded-lg border border-slate-300 font-bold text-slate-900 text-sm focus:border-blue-500 outline-none"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                      %
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingPcts({ ...state.percentages })}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200 transition"
              >
                Reset
              </button>
              <button
                disabled={!isPctValid}
                onClick={handleSavePcts}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white font-bold text-xs transition cursor-pointer"
              >
                Save & Apply Rules
              </button>
            </div>
          </div>
        )}

        {/* 7 Accounts Display Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 mt-6">
          {ACCOUNTS.map((acct) => {
            const balance = state.balances[acct.key] || 0;
            const pct = state.percentages[acct.key] || 0;

            return (
              <div
                key={acct.key}
                className={`p-4 rounded-xl border ${acct.borderLight} ${acct.bgLight} flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${acct.badgeBg} ${acct.badgeText}`}
                    >
                      {acct.key}
                    </span>
                    <span className="text-xs font-bold text-slate-600">{pct}% split</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-tight">
                    {acct.name}
                  </h4>
                  <div className="text-lg font-black text-slate-900 mt-1">
                    {formatCurrency(balance, state.settings.currency)}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2 leading-relaxed line-clamp-2">
                    {acct.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <button
                    onClick={() => setAdjustAccountKey(acct.key)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold cursor-pointer hover:underline flex items-center gap-1"
                    id={`adjust-btn-${acct.key}`}
                  >
                    <span>Feed / Set</span>
                  </button>
                  <span className="text-[10px] font-semibold text-slate-400">Locked</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-Time Distribution Execution Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Execute Cash Inflow Distribution</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter any collected revenue to split into all 7 reserves instantly.
            </p>

            <form onSubmit={handleDistribute} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Inflow Amount ({state.settings.currency})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    {state.settings.currency}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={inputAmount}
                    onChange={(e) => setInputAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none font-bold text-slate-900 text-lg"
                    id="cashflow-inflow-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Description / Origin
                </label>
                <input
                  type="text"
                  value={inputNote}
                  onChange={(e) => setInputNote(e.target.value)}
                  placeholder="e.g. Retail POS deposit, Client invoice payment"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-900 text-sm"
                  id="cashflow-inflow-note"
                />
              </div>

              <button
                type="submit"
                disabled={parsedAmount <= 0}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 text-white font-bold text-sm shadow-sm hover:shadow transition cursor-pointer flex items-center justify-center gap-2"
                id="cashflow-distribute-btn"
              >
                <ArrowDownRight className="w-5 h-5" />
                <span>Distribute {formatCurrency(parsedAmount, state.settings.currency)} Now</span>
              </button>
            </form>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Automatic rent coverage:</span>
              <span className="font-bold text-slate-900">
                +{formatCurrency(previewSplit.R || 0, state.settings.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Automatic payroll reserve:</span>
              <span className="font-bold text-slate-900">
                +{formatCurrency(previewSplit.S || 0, state.settings.currency)}
              </span>
            </div>
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Ring-fenced profit:</span>
              <span className="font-bold">
                +{formatCurrency(previewSplit.P || 0, state.settings.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Transaction History & Audit Ledger */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Distribution Ledger</h3>
                <p className="text-xs text-slate-500">Full audit trail of every dollar routed or adjusted.</p>
              </div>

              {/* Account Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedAccountFilter}
                  onChange={(e) => setSelectedAccountFilter(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 outline-none"
                >
                  <option value="all">All Accounts</option>
                  {ACCOUNTS.map((a) => (
                    <option key={a.key} value={a.key}>
                      {a.key} - {a.short}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="pb-2.5">Date</th>
                    <th className="pb-2.5">Type</th>
                    <th className="pb-2.5">Description</th>
                    <th className="pb-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.slice(0, 8).map((tx) => {
                    const isPositive = tx.amount >= 0;
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 font-mono text-slate-500">
                          {new Date(tx.date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                              tx.type === 'invoice-payment'
                                ? 'bg-emerald-100 text-emerald-800'
                                : tx.type === 'cashin'
                                ? 'bg-blue-100 text-blue-800'
                                : tx.type === 'adjust-add'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3 font-medium text-slate-800 max-w-[220px] truncate">
                          {tx.note}
                        </td>
                        <td
                          className={`py-3 text-right font-extrabold font-mono ${
                            isPositive ? 'text-slate-900' : 'text-rose-600'
                          }`}
                        >
                          {isPositive ? '+' : ''}
                          {formatCurrency(tx.amount, state.settings.currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredTransactions.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No distribution transactions match this filter.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {Math.min(8, filteredTransactions.length)} of {filteredTransactions.length} events</span>
            <span className="text-[11px] text-emerald-600 font-semibold">Real-time ledger synchronized</span>
          </div>
        </div>
      </div>
    </div>
  );
};
