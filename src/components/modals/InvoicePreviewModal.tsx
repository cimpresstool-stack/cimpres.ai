import React from 'react';
import {
  X,
  Printer,
  Copy,
  CreditCard,
  CheckCircle2,
  Building2,
  ExternalLink,
  Sparkles,
  Receipt,
  Download,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../data/constants';

export const InvoicePreviewModal: React.FC = () => {
  const { state, previewInvoice, setPreviewInvoice, updateInvoiceStatus, showToast } = useApp();

  if (!previewInvoice) return null;

  const isPaid = previewInvoice.status === 'paid';
  const paymentUrl = `${window.location.origin}/pay/${previewInvoice.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(paymentUrl);
    showToast(`Copied payment link for ${previewInvoice.invoiceNum}`);
  };

  const handleSimulatePayment = () => {
    updateInvoiceStatus(previewInvoice.id, 'paid');
    setPreviewInvoice({
      ...previewInvoice,
      status: 'paid',
      paidDate: new Date().toISOString().split('T')[0],
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Toolbar */}
        <div className="px-6 py-3 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold font-mono tracking-wide">
              {previewInvoice.invoiceNum}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Print / Save PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewInvoice(null)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Paper Area */}
        <div className="p-8 overflow-y-auto space-y-6 bg-white text-slate-800" id="printable-invoice">
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
                  C
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {state.settings.businessName}
                </h2>
              </div>
              <p className="text-xs text-slate-500">{state.settings.businessAddress}</p>
              <p className="text-xs text-slate-500">{state.settings.businessEmail} • {state.settings.businessPhone}</p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-2xl font-black text-slate-900 tracking-tight uppercase block">
                INVOICE
              </span>
              <span className="font-mono text-xs font-bold text-slate-500 block">
                #{previewInvoice.invoiceNum}
              </span>
              <div className="mt-2">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    isPaid
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {previewInvoice.status}
                </span>
              </div>
            </div>
          </div>

          {/* Dates and Client Meta */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Billed To:
              </span>
              <p className="font-bold text-slate-900 text-sm">{previewInvoice.contactName}</p>
              <p className="text-slate-500">{previewInvoice.contactEmail}</p>
            </div>

            <div className="text-right space-y-1">
              <div>
                <span className="text-slate-400">Date Issued: </span>
                <span className="font-medium text-slate-800">{previewInvoice.issuedDate}</span>
              </div>
              <div>
                <span className="text-slate-400">Payment Due: </span>
                <span className="font-bold text-slate-900">{previewInvoice.dueDate}</span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Price</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {previewInvoice.items.map((it) => (
                  <tr key={it.id}>
                    <td className="py-3 px-4 font-semibold text-slate-800">{it.description}</td>
                    <td className="py-3 px-3 text-center text-slate-600">{it.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      {formatCurrency(it.unitPrice, state.settings.currency)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(it.amount, state.settings.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="flex justify-end text-xs">
            <div className="w-64 space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(previewInvoice.subtotal, state.settings.currency)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax ({previewInvoice.taxPct}%)</span>
                <span className="font-mono">{formatCurrency(previewInvoice.taxAmount, state.settings.currency)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Due</span>
                <span className="font-mono">{formatCurrency(previewInvoice.total, state.settings.currency)}</span>
              </div>
            </div>
          </div>

          {/* Payment Link Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-slate-800 block">Direct Online Payment Link</span>
              <span className="text-[11px] font-mono text-blue-600 truncate block max-w-sm">
                {paymentUrl}
              </span>
            </div>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Link</span>
            </button>
          </div>

          {previewInvoice.notes && (
            <p className="text-[11px] text-slate-400 italic">Note: {previewInvoice.notes}</p>
          )}
        </div>

        {/* Modal Footer / Action Bar */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {isPaid ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Invoice settled & split into 7 reserve accounts</span>
              </span>
            ) : (
              <span>Ready to receive online payment via card or wire</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isPaid && (
              <button
                onClick={handleSimulatePayment}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-2"
                id="invoice-modal-simulate-pay-btn"
              >
                <CreditCard className="w-4 h-4" />
                <span>Simulate Client Payment ({formatCurrency(previewInvoice.total, state.settings.currency)})</span>
              </button>
            )}
            <button
              onClick={() => setPreviewInvoice(null)}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
