import React, { useState } from 'react';
import { RotateCcw, AlertTriangle, X, CheckCircle2, Sparkles, DollarSign } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ResetConfirmModal: React.FC = () => {
  const {
    isResetConfirmModalOpen,
    setIsResetConfirmModalOpen,
    resetToDemoData,
    resetToZeroState,
    currentUser,
  } = useApp();

  const [selectedAction, setSelectedAction] = useState<'zero' | 'demo'>('zero');

  if (!isResetConfirmModalOpen) return null;

  const handleExecute = () => {
    if (selectedAction === 'zero') {
      resetToZeroState();
    } else {
      resetToDemoData();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => setIsResetConfirmModalOpen(false)}
      id="reset-confirm-modal-overlay"
    >
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        id="reset-confirm-modal"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                Workspace Reset Options
              </h3>
              <p className="text-xs text-slate-500">
                Choose how you want to reset your CIMPRES workspace
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsResetConfirmModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            id="reset-modal-close-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-sm text-slate-600">
          <p className="text-xs text-slate-600">
            Select the desired state for your business dashboard:
          </p>

          {/* Action 1: Zero Figures (Recommended for real businesses) */}
          <div
            onClick={() => setSelectedAction('zero')}
            className={`p-4 rounded-xl border-2 transition cursor-pointer flex items-start gap-3.5 ${
              selectedAction === 'zero'
                ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">
                  Reset to Zero Figures (Clean Slate)
                </h4>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Recommended for your business
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Sets all 7 account balances to <span className="font-bold text-slate-900">$0.00</span>, clears all sample transactions, clients, deals, and invoices so you can start inputting your live company numbers.
              </p>
            </div>
          </div>

          {/* Action 2: Demo Sandbox */}
          <div
            onClick={() => setSelectedAction('demo')}
            className={`p-4 rounded-xl border-2 transition cursor-pointer flex items-start gap-3.5 ${
              selectedAction === 'demo'
                ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">
                  Load Sample Demo Sandbox
                </h4>
                <span className="text-[11px] font-medium text-slate-500">
                  Sandbox Test
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Loads pre-populated Apex Creative Studio sample data with $60,935 balances across 7 accounts, sample CRM contacts, and sample invoices to test formulas.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {currentUser ? `Account: ${currentUser.email}` : 'Sandbox workspace'}
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsResetConfirmModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              id="reset-modal-cancel-btn"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExecute}
              className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer ${
                selectedAction === 'zero'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'
              }`}
              id="confirm-reset-action-btn"
            >
              <RotateCcw className="w-4 h-4" />
              <span>
                {selectedAction === 'zero' ? 'Reset to Zero Figures' : 'Load Demo Sandbox'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
