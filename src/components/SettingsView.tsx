import React, { useState } from 'react';
import {
  Settings,
  Building,
  DollarSign,
  PieChart,
  ShieldCheck,
  RotateCcw,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ACCOUNTS } from '../data/constants';
import { AccountKey } from '../types';

export const SettingsView: React.FC = () => {
  const { state, updateSettings, updatePercentages, resetToDemoData, showToast } = useApp();

  const [bizName, setBizName] = useState(state.settings.businessName);
  const [bizEmail, setBizEmail] = useState(state.settings.businessEmail);
  const [bizPhone, setBizPhone] = useState(state.settings.businessPhone);
  const [bizAddress, setBizAddress] = useState(state.settings.businessAddress);
  const [currency, setCurrency] = useState(state.settings.currency);
  const [rentTarget, setRentTarget] = useState(state.settings.monthlyRentTarget.toString());
  const [payrollTarget, setPayrollTarget] = useState(state.settings.monthlyPayrollTarget.toString());

  const [pcts, setPcts] = useState<Record<AccountKey, number>>({ ...state.percentages });

  const totalPct = Object.values(pcts).reduce((a, b) => a + b, 0);
  const isPctValid = Math.abs(totalPct - 100) < 0.01;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      businessName: bizName,
      businessEmail: bizEmail,
      businessPhone: bizPhone,
      businessAddress: bizAddress,
      currency,
      monthlyRentTarget: parseFloat(rentTarget) || 6000,
      monthlyPayrollTarget: parseFloat(payrollTarget) || 14000,
    });
  };

  const handleSavePercentages = () => {
    if (!isPctValid) {
      showToast('Error: Percentages must add up to exactly 100%');
      return;
    }
    updatePercentages(pcts);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Rules & System Settings
        </h2>
        <p className="text-sm text-slate-500">
          Configure business metadata, currency preferences, targets, and the CIMPRES distribution algorithm.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Business Profile & Targets */}
        <div className="lg:col-span-6 space-y-6">
          <form
            onSubmit={handleSaveProfile}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4"
          >
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Building className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">Business & Invoicing Identity</h3>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Company / Operating Name
              </label>
              <input
                type="text"
                required
                value={bizName}
                onChange={(e) => setBizName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Billing Email
                </label>
                <input
                  type="email"
                  required
                  value={bizEmail}
                  onChange={(e) => setBizEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={bizPhone}
                  onChange={(e) => setBizPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Physical Office Address
              </label>
              <input
                type="text"
                value={bizAddress}
                onChange={(e) => setBizAddress(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Currency Symbol
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-bold outline-none focus:border-blue-500 bg-white"
                >
                  <option value="$">$ (USD / CAD / AUD)</option>
                  <option value="€">€ (Euro)</option>
                  <option value="£">£ (British Pound)</option>
                  <option value="₦">₦ (Nigerian Naira)</option>
                  <option value="₵">₵ (Ghanaian Cedi)</option>
                  <option value="KSh ">KSh (Kenyan Shilling)</option>
                  <option value="R ">R (South African Rand)</option>
                  <option value="₹">₹ (Indian Rupee)</option>
                  <option value="¥">¥ (Japanese Yen / Yuan)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Monthly Rent Goal
                </label>
                <input
                  type="number"
                  step="100"
                  value={rentTarget}
                  onChange={(e) => setRentTarget(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono font-bold outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Monthly Payroll Goal
                </label>
                <input
                  type="number"
                  step="100"
                  value={payrollTarget}
                  onChange={(e) => setPayrollTarget(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono font-bold outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Business Identity</span>
              </button>
            </div>
          </form>

          {/* Danger Zone */}
          <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-6">
            <h4 className="text-sm font-bold text-rose-900 mb-1">Reset Sandbox Data</h4>
            <p className="text-xs text-rose-700 mb-4">
              Restores all sample contacts, deals, invoices, and 7-account balances to standard initial demo state.
            </p>
            <button
              onClick={() => {
                if (window.confirm('Reset all cash flow and CRM records to default demo data?')) {
                  resetToDemoData();
                }
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset to Demo Data</span>
            </button>
          </div>
        </div>

        {/* 7 Account Allocation Percentages */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  7-Account Allocation Split Algorithm
                </h3>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-black ${
                  isPctValid
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                Total: {totalPct.toFixed(1)}%
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Every dollar entering the cash flow engine will be multiplied by these exact percentage shares.
            </p>

            <div className="space-y-3">
              {ACCOUNTS.map((acct) => (
                <div
                  key={acct.key}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${acct.badgeBg} ${acct.badgeText}`}
                    >
                      {acct.key}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{acct.name}</span>
                      <span className="text-[11px] text-slate-500 line-clamp-1">
                        {acct.description}
                      </span>
                    </div>
                  </div>

                  <div className="relative shrink-0 w-24">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      value={pcts[acct.key]}
                      onChange={(e) =>
                        setPcts({
                          ...pcts,
                          [acct.key]: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full pl-2 pr-6 py-1.5 rounded-lg border border-slate-300 font-bold text-slate-900 text-sm focus:border-blue-500 outline-none text-right font-mono"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                      %
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-6 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {isPctValid ? '✓ Percentages sum to 100%' : '⚠️ Must equal 100%'}
            </span>
            <button
              disabled={!isPctValid}
              onClick={handleSavePercentages}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              Apply Split Rules
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
