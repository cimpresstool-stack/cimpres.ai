import React, { useState, useEffect } from 'react';
import { X, Sliders, DollarSign, Check, ArrowUpRight, ArrowDownRight, Lock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ACCOUNTS, formatCurrency } from '../../data/constants';
import { AccountKey } from '../../types';

export const AdjustBalanceModal: React.FC = () => {
  const {
    state,
    adjustAccountKey,
    setAdjustAccountKey,
    setAccountBalance,
    adjustAccountBalance,
    requireAuth,
    isAuthenticated,
    openAuthModal,
  } = useApp();

  const [selectedKey, setSelectedKey] = useState<AccountKey>('C');
  const [mode, setMode] = useState<'set' | 'adjust'>('set');
  const [amountStr, setAmountStr] = useState<string>('');
  const [note, setNote] = useState<string>('Initial business balance');

  useEffect(() => {
    if (adjustAccountKey) {
      setSelectedKey(adjustAccountKey);
      const current = state.balances[adjustAccountKey] || 0;
      setAmountStr(current > 0 ? current.toString() : '');
      setNote(`Opening balance for ${ACCOUNTS.find((a) => a.key === adjustAccountKey)?.name || adjustAccountKey}`);
    }
  }, [adjustAccountKey, state.balances]);

  if (!adjustAccountKey) return null;

  const currentAccount = ACCOUNTS.find((a) => a.key === selectedKey) || ACCOUNTS[0];
  const currentBalance = state.balances[selectedKey] || 0;

  const handleSelectAccount = (key: AccountKey) => {
    setSelectedKey(key);
    const balance = state.balances[key] || 0;
    setAmountStr(balance > 0 ? balance.toString() : '');
    const acct = ACCOUNTS.find((a) => a.key === key);
    setNote(`Opening balance for ${acct?.name || key}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth('feed or adjust account balances')) {
      setAdjustAccountKey(null);
      return;
    }

    const val = parseFloat(amountStr);
    if (isNaN(val)) return;

    if (mode === 'set') {
      setAccountBalance(selectedKey, Math.max(0, val), note);
    } else {
      adjustAccountBalance(selectedKey, val, note);
    }

    setAdjustAccountKey(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => setAdjustAccountKey(null)}
      id="adjust-balance-modal-overlay"
    >
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        id="adjust-balance-modal"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${currentAccount.badgeBg} ${currentAccount.badgeText}`}>
              {currentAccount.key}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                Feed Account Figures
              </h3>
              <p className="text-xs text-slate-500">
                Set or adjust balance for {currentAccount.name}
              </p>
            </div>
          </div>
          <button
            onClick={() => setAdjustAccountKey(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            id="close-adjust-modal-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 7 Account Selector Tabs */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-100 bg-slate-50/70 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
          {ACCOUNTS.map((a) => {
            const isSelected = a.key === selectedKey;
            const bal = state.balances[a.key] || 0;
            return (
              <button
                key={a.key}
                type="button"
                onClick={() => handleSelectAccount(a.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-white shadow-xs border border-slate-200 text-slate-900 ring-1 ring-slate-900/10'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
                }`}
              >
                <span className={`w-4 h-4 rounded text-[10px] flex items-center justify-center font-black ${a.badgeBg} ${a.badgeText}`}>
                  {a.key}
                </span>
                <span>{a.short}</span>
                <span className="text-[11px] font-mono text-slate-400 font-normal">
                  {formatCurrency(bal, state.settings.currency)}
                </span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Account Details Card */}
          <div className={`p-4 rounded-xl border ${currentAccount.borderLight} ${currentAccount.bgLight} flex items-center justify-between`}>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Current {currentAccount.key} Balance
              </span>
              <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                {formatCurrency(currentBalance, state.settings.currency)}
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {currentAccount.description}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-semibold block">Split Allocation</span>
              <span className="text-sm font-extrabold text-blue-700">
                {state.percentages[selectedKey]}%
              </span>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('set')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                mode === 'set'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Set Exact Balance
            </button>
            <button
              type="button"
              onClick={() => setMode('adjust')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                mode === 'adjust'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Add / Subtract (+ / -)
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {mode === 'set' ? 'New Target Balance' : 'Adjustment Amount'} ({state.settings.currency})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                {state.settings.currency}
              </span>
              <input
                type="number"
                step="0.01"
                required
                autoFocus
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 font-mono text-base font-bold text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>

            {/* Quick Preset Buttons */}
            {mode === 'set' && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[11px] text-slate-400 font-semibold mr-1">Quick Set:</span>
                {[0, 500, 1000, 2500, 5000, 10000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmountStr(preset.toString())}
                    className="px-2 py-1 text-[11px] font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                  >
                    {state.settings.currency}{preset.toLocaleString()}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Note Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description / Ledger Memo
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Opening account balance, monthly top up..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
            />
          </div>

          {!isAuthenticated && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Log in or sign up required to feed figures</p>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                  To save opening balances or record live financial transactions, you must first log into or create your company account.
                </p>
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setAdjustAccountKey(null)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-bold shadow-sm shadow-blue-600/30 flex items-center gap-1.5 transition cursor-pointer"
              id="save-account-figure-btn"
            >
              <Check className="w-4 h-4" />
              <span>{isAuthenticated ? `Save ${currentAccount.key} Figure` : 'Log In / Sign Up to Save'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
