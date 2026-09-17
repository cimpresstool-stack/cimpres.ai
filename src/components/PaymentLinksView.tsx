import React, { useState } from 'react';
import {
  Link2,
  Plus,
  Copy,
  ExternalLink,
  CheckCircle2,
  Clock,
  Trash2,
  CreditCard,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../data/constants';
import { PaymentLink } from '../types';

export const PaymentLinksView: React.FC = () => {
  const {
    state,
    createPaymentLink,
    payPaymentLink,
    setActivePaymentLink,
    showToast,
  } = useApp();

  const [title, setTitle] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [amount, setAmount] = useState('2500');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount) || 0;
    if (num <= 0 || !title.trim()) return;

    createPaymentLink({
      title,
      contactName: contactName || 'Valued Client',
      contactEmail: contactEmail || 'client@example.com',
      amount: num,
    });

    setTitle('');
    setContactName('');
    setContactEmail('');
    setIsCreating(false);
  };

  const copyUrl = (link: PaymentLink) => {
    navigator.clipboard.writeText(link.url);
    showToast(`Copied payment link: ${link.title}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Direct Payment Links
          </h2>
          <p className="text-sm text-slate-500">
            Send one-click payment links via email, SMS or WhatsApp. When paid, funds auto-split into your 7 accounts.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-sm transition active:scale-[0.98] cursor-pointer flex items-center gap-2"
          id="paylinks-new-btn"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Payment Link</span>
        </button>
      </div>

      {/* Creation Form */}
      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-in fade-in duration-200"
        >
          <h3 className="text-base font-bold text-slate-900">New Payment Link</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Link Description / Item
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Website Strategy Retainer Deposit"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Amount ({state.settings.currency})
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-bold outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Customer Name (Optional)
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Amara Okonkwo"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Customer Email (Optional)
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="amara@example.com"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition cursor-pointer"
            >
              Generate Link
            </button>
          </div>
        </form>
      )}

      {/* Payment Links List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {state.paymentLinks.map((link) => {
            const isPaid = link.status === 'paid';

            return (
              <div
                key={link.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    <Link2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">
                      {link.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Recipient: <span className="font-medium text-slate-700">{link.contactName}</span> •{' '}
                      <span className="font-mono text-[11px] text-blue-600">{link.url}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {link.status}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Created {new Date(link.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pl-13 sm:pl-0">
                  <div className="text-left sm:text-right">
                    <span className="text-base font-black text-slate-900 block font-mono">
                      {formatCurrency(link.amount, state.settings.currency)}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {isPaid ? 'Settled to 7 accounts' : 'Awaiting payment'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!isPaid ? (
                      <button
                        onClick={() => payPaymentLink(link.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1"
                        title="Simulate client settling payment via Apple Pay/Card"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Simulate Pay</span>
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Paid</span>
                      </span>
                    )}

                    <button
                      onClick={() => copyUrl(link)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition cursor-pointer"
                      title="Copy URL"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {state.paymentLinks.length === 0 && (
          <div className="p-12 text-center text-slate-400 text-xs">
            No payment links created yet. Click &quot;Generate Payment Link&quot; above.
          </div>
        )}
      </div>
    </div>
  );
};
