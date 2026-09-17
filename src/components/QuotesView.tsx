import React, { useState } from 'react';
import {
  FileText,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Trash2,
  Printer,
  Sparkles,
  Receipt,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../data/constants';
import { Quote, InvoiceItem } from '../types';

export const QuotesView: React.FC = () => {
  const { state, addQuote, acceptQuote, deleteQuote, setPreviewInvoice, setActiveTab } = useApp();

  const [isCreating, setIsCreating] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [title, setTitle] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [items, setItems] = useState<{ description: string; quantity: number; unitPrice: number }[]>([
    { description: 'Phase 1 Scoping & Architectural Blueprint', quantity: 1, unitPrice: 3500 },
    { description: 'Implementation & Automated Integration', quantity: 1, unitPrice: 6500 },
  ]);

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 1000 }]);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const next = [...items];
    (next[index] as any)[field] = value;
    setItems(next);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const quoteTotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const handleCreateQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !title.trim() || quoteTotal <= 0) return;

    const formattedItems: InvoiceItem[] = items.map((item, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      description: item.description || 'Professional Services',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      amount: item.quantity * item.unitPrice,
    }));

    addQuote({
      clientName,
      clientEmail: clientEmail || 'client@example.com',
      title,
      items: formattedItems,
      total: quoteTotal,
      status: 'sent',
      validUntil: validUntil || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    });

    setIsCreating(false);
    setTitle('');
    setClientName('');
    setClientEmail('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Quotes & Proposals
          </h2>
          <p className="text-sm text-slate-500">
            Generate itemized proposals. When accepted, convert in one click to an automated invoice with payment link.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-sm transition active:scale-[0.98] cursor-pointer flex items-center gap-2"
          id="quotes-add-btn"
        >
          <Plus className="w-4 h-4" />
          <span>New Proposal</span>
        </button>
      </div>

      {/* Quote Creation Form */}
      {isCreating && (
        <form
          onSubmit={handleCreateQuote}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-in fade-in duration-200"
        >
          <h3 className="text-base font-bold text-slate-900">Draft New Client Proposal</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Proposal Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Omnichannel Operations Redesign"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Client / Company
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Zenith Organic Foods"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Client Email
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="fatima@zenithfoods.com"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Valid Until
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Scope Items
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
              >
                + Add Line
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                    placeholder="Deliverable description..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs outline-none focus:border-blue-500"
                  />
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(idx, 'quantity', parseInt(e.target.value) || 1)
                    }
                    className="w-16 px-2 py-1.5 rounded-lg border border-slate-300 text-xs text-center outline-none focus:border-blue-500"
                  />
                  <input
                    type="number"
                    step="50"
                    value={item.unitPrice}
                    onChange={(e) =>
                      handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)
                    }
                    className="w-24 px-2 py-1.5 rounded-lg border border-slate-300 text-xs text-right font-mono outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 text-sm font-black text-slate-900">
              <span>Total Proposal Value: {formatCurrency(quoteTotal, state.settings.currency)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500 transition cursor-pointer"
            >
              Save Proposal
            </button>
          </div>
        </form>
      )}

      {/* Quote Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.quotes.map((quote) => {
          const isAccepted = quote.status === 'accepted';

          return (
            <div
              key={quote.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-slate-400">
                    {quote.quoteNum}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                      isAccepted
                        ? 'bg-emerald-100 text-emerald-800'
                        : quote.status === 'sent'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {quote.status}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug">{quote.title}</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4 font-medium">{quote.clientName}</p>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs mb-4">
                  {quote.items.map((it) => (
                    <div key={it.id} className="flex justify-between text-slate-600">
                      <span className="truncate pr-2">{it.description}</span>
                      <span className="font-mono shrink-0">
                        {formatCurrency(it.amount, state.settings.currency)}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                    <span>Total</span>
                    <span className="font-mono">
                      {formatCurrency(quote.total, state.settings.currency)}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400">Valid until: {quote.validUntil}</div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                {!isAccepted ? (
                  <button
                    onClick={() => {
                      const createdInvoice = acceptQuote(quote.id);
                      if (createdInvoice) {
                        setPreviewInvoice(createdInvoice);
                        setActiveTab('invoices');
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Accept & Invoice</span>
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Invoiced & Active</span>
                  </span>
                )}

                <button
                  onClick={() => {
                    if (window.confirm(`Delete proposal ${quote.quoteNum}?`)) {
                      deleteQuote(quote.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                  title="Delete proposal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {state.quotes.length === 0 && (
          <div className="col-span-full p-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
            No proposals created yet. Click &quot;New Proposal&quot; to build your first client quote.
          </div>
        )}
      </div>
    </div>
  );
};
