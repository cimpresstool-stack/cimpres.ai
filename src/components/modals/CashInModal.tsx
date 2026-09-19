import React, { useState } from 'react';
import { X, ArrowDownRight, Sparkles, Lock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ACCOUNTS, calculateDistribution, formatCurrency } from '../../data/constants';

export const CashInModal: React.FC = () => {
  const {
    state,
    isCashInModalOpen,
    setIsCashInModalOpen,
    recordCashIn,
    requireAuth,
    isAuthenticated,
  } = useApp();
  const [amount, setAmount] = useState('3500');
  const [note, setNote] = useState('POS & Online Sales Batch');

  if (!isCashInModalOpen) return null;

  const parsedAmount = Math.max(0, parseFloat(amount) || 0);
  const liveSplit = calculateDistribution(parsedAmount, state.percentages);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth('record cash inflows and distribute funds')) {
      setIsCashInModalOpen(false);
      return;
    }
    if (parsedAmount <= 0) return;
    recordCashIn(parsedAmount, note);
    setIsCashInModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Record Cash Inflow</h3>
              <p className="text-xs text-slate-500">Auto-routes into all 7 CIMPRES accounts</p>
            </div>
          </div>
          <button
            onClick={() => setIsCashInModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Amount ({state.settings.currency})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                {state.settings.currency}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-300 text-slate-900 font-black text-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Source / Note
            </label>
            <input
              type="text"
              required
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Retail POS deposit, Client invoice payment"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* Real-time 7-Account Distribution Preview */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
              <span>Automatic 7-Account Split Preview:</span>
              <span className="text-emerald-700 font-mono">100% Allocated</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {ACCOUNTS.map((acct) => (
                <div key={acct.key} className="flex justify-between items-center py-1">
                  <span className="flex items-center gap-1.5 text-slate-600 truncate">
                    <span className={`px-1 rounded font-bold text-[10px] ${acct.badgeBg} ${acct.badgeText}`}>
                      {acct.key}
                    </span>
                    <span className="truncate">{acct.short} ({state.percentages[acct.key]}%)</span>
                  </span>
                  <span className="font-mono font-bold text-slate-900 shrink-0">
                    {formatCurrency(liveSplit[acct.key] || 0, state.settings.currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {!isAuthenticated && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Account required to feed live cash inflows</p>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                  Please log in or create an account to record transactions and distribute funds into your private business accounts.
                </p>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCashInModalOpen(false)}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={parsedAmount <= 0}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 text-white font-bold text-sm rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2"
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>
                {isAuthenticated
                  ? `Distribute ${formatCurrency(parsedAmount, state.settings.currency)}`
                  : 'Log In / Sign Up to Distribute'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
