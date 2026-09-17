import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Building2,
  TrendingUp,
  Receipt,
  CheckCircle2,
  Tag,
  ExternalLink,
  Edit2,
  Trash2,
  X,
  Send,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatCompactCurrency } from '../data/constants';
import { ClientContact } from '../types';

export const ClientsView: React.FC = () => {
  const {
    state,
    deleteContact,
    setIsNewClientModalOpen,
    setIsNewDealModalOpen,
    setIsNewInvoiceModalOpen,
    selectedContact,
    setSelectedContact,
    sendEmailMessage,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [quickEmailBody, setQuickEmailBody] = useState<string>('');
  const [quickEmailSubject, setQuickEmailSubject] = useState<string>('');

  const filteredContacts = state.contacts.filter((c) => {
    if (selectedTypeFilter !== 'all' && c.type !== selectedTypeFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalClientRevenue = state.contacts.reduce((sum, c) => sum + (c.ltv || 0), 0);
  const vipCount = state.contacts.filter((c) => c.type === 'vip').length;

  const handleSendQuickEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact || !quickEmailBody.trim()) return;
    sendEmailMessage({
      toEmail: selectedContact.email,
      toName: selectedContact.name,
      subject: quickEmailSubject || `Update from ${state.settings.businessName}`,
      body: quickEmailBody,
    });
    setQuickEmailBody('');
    setQuickEmailSubject('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Client Tracking & CRM
          </h2>
          <p className="text-sm text-slate-500">
            Track customer relationship profiles, lifetime revenue contributions, deal history, and payment reliability.
          </p>
        </div>

        <button
          onClick={() => setIsNewClientModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-sm transition active:scale-[0.98] cursor-pointer flex items-center gap-2"
          id="clients-add-btn"
        >
          <Plus className="w-4 h-4" />
          <span>Add Client</span>
        </button>
      </div>

      {/* CRM Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-500 block mb-1">
            Total CRM Contacts
          </span>
          <div className="text-2xl font-black text-slate-900">{state.contacts.length}</div>
          <span className="text-xs text-slate-500 mt-1 block">Active relationships tracked</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-500 block mb-1">
            Combined Lifetime Value
          </span>
          <div className="text-2xl font-black text-emerald-700">
            {formatCurrency(totalClientRevenue, state.settings.currency)}
          </div>
          <span className="text-xs text-emerald-700 font-medium mt-1 block">
            Across all won accounts
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-500 block mb-1">
            VIP Partners
          </span>
          <div className="text-2xl font-black text-blue-700">{vipCount} Clients</div>
          <span className="text-xs text-blue-600 font-medium mt-1 block">
            Highest revenue retention
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'vip', 'customer', 'prospect', 'lead'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedTypeFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition cursor-pointer ${
                selectedTypeFilter === type
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type === 'all' ? 'All Clients' : type}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, company, tag..."
            className="w-full px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs focus:border-blue-500 outline-none text-slate-800"
          />
        </div>
      </div>

      {/* Client Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map((contact) => {
          const clientDeals = state.deals.filter((d) => d.contactId === contact.id);
          const clientInvoices = state.invoices.filter((i) => i.contactId === contact.id);

          return (
            <div
              key={contact.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-blue-300 shadow-xs transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center font-extrabold text-white text-base shadow-sm">
                      {contact.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                        {contact.name}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 font-medium mt-0.5">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        {contact.company}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      contact.type === 'vip'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : contact.type === 'customer'
                        ? 'bg-emerald-100 text-emerald-800'
                        : contact.type === 'prospect'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {contact.type}
                  </span>
                </div>

                {/* Contact Coordinates */}
                <div className="space-y-1 my-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{contact.phone || 'No phone'}</span>
                  </div>
                </div>

                {/* Tags */}
                {contact.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 my-3">
                    {contact.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10px] font-semibold text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Financial Health / Stats */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 my-3 text-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">LTV</span>
                    <span className="text-xs font-black text-slate-900">
                      {formatCompactCurrency(contact.ltv || 0, state.settings.currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Deals</span>
                    <span className="text-xs font-black text-slate-900">
                      {contact.dealsWon || clientDeals.filter((d) => d.stage === 'won').length}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">On-Time</span>
                    <span className="text-xs font-black text-emerald-700">
                      {contact.onTimePaymentPct || 100}%
                    </span>
                  </div>
                </div>

                {/* Client Notes snippet */}
                {contact.notes && (
                  <p className="text-xs text-slate-500 italic line-clamp-2 mt-2">
                    &quot;{contact.notes}&quot;
                  </p>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setSelectedContact(contact)}
                  className="font-bold text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1"
                >
                  <span>Open Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    if (window.confirm(`Delete client record for ${contact.name}?`)) {
                      deleteContact(contact.id);
                    }
                  }}
                  className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition"
                  title="Delete Client"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Client Detail Slide-Over Drawer */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setSelectedContact(null)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl p-6 overflow-y-auto flex flex-col justify-between">
              <div>
                {/* Drawer Header */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-extrabold text-white text-lg">
                      {selectedContact.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{selectedContact.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">{selectedContact.company}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedContact(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Profile Stats */}
                <div className="grid grid-cols-3 gap-2 my-5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">LTV</span>
                    <span className="text-sm font-black text-slate-900">
                      {formatCurrency(selectedContact.ltv || 0, state.settings.currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Deals Won</span>
                    <span className="text-sm font-black text-slate-900">
                      {selectedContact.dealsWon || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Reliability</span>
                    <span className="text-sm font-black text-emerald-700">
                      {selectedContact.onTimePaymentPct || 100}%
                    </span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 text-xs text-slate-700 py-3 border-y border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="font-semibold">{selectedContact.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phone:</span>
                    <span className="font-semibold">{selectedContact.phone || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Location:</span>
                    <span className="font-semibold">{selectedContact.address || '—'}</span>
                  </div>
                </div>

                {/* Related Invoices */}
                <div className="mt-5">
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                    Invoices for this Client
                  </h4>
                  <div className="space-y-2">
                    {state.invoices
                      .filter((i) => i.contactId === selectedContact.id)
                      .map((inv) => (
                        <div
                          key={inv.id}
                          className="p-2.5 rounded-lg border border-slate-200 text-xs flex justify-between items-center"
                        >
                          <div>
                            <span className="font-bold text-slate-900 block">{inv.invoiceNum}</span>
                            <span className="text-[11px] text-slate-400">{inv.issuedDate}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold block">
                              {formatCurrency(inv.total, state.settings.currency)}
                            </span>
                            <span
                              className={`text-[10px] font-bold ${
                                inv.status === 'paid' ? 'text-emerald-700' : 'text-amber-700'
                              }`}
                            >
                              {inv.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      ))}
                    {state.invoices.filter((i) => i.contactId === selectedContact.id).length === 0 && (
                      <p className="text-xs text-slate-400">No invoices issued yet.</p>
                    )}
                  </div>
                </div>

                {/* Quick Direct Message */}
                <div className="mt-6">
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                    Send Direct Message / Email
                  </h4>
                  <form onSubmit={handleSendQuickEmail} className="space-y-2">
                    <input
                      type="text"
                      value={quickEmailSubject}
                      onChange={(e) => setQuickEmailSubject(e.target.value)}
                      placeholder="Subject line..."
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs outline-none focus:border-blue-500"
                    />
                    <textarea
                      value={quickEmailBody}
                      onChange={(e) => setQuickEmailBody(e.target.value)}
                      rows={3}
                      placeholder={`Message to ${selectedContact.name}...`}
                      className="w-full p-2.5 rounded-lg border border-slate-300 text-xs outline-none focus:border-blue-500 resize-none"
                    />
                    <button
                      type="submit"
                      disabled={!quickEmailBody.trim()}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 text-white font-bold text-xs rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send to {selectedContact.name}</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="pt-4 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => {
                    setSelectedContact(null);
                    setIsNewInvoiceModalOpen(true);
                  }}
                  className="flex-1 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs text-center cursor-pointer hover:bg-slate-800 transition"
                >
                  + Issue Invoice
                </button>
                <button
                  onClick={() => {
                    setSelectedContact(null);
                    setIsNewDealModalOpen(true);
                  }}
                  className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs text-center cursor-pointer hover:bg-slate-200 transition"
                >
                  + Add Deal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
