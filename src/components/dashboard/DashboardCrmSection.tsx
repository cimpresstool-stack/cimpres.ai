import React, { useState } from 'react';
import {
  Users,
  KanbanSquare,
  CheckSquare,
  FileText,
  Plus,
  Search,
  Mail,
  Phone,
  Building2,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Sparkles,
  Trophy,
  Trash2,
  ExternalLink,
  ChevronRight,
  Filter,
  Check,
  Calendar,
  AlertCircle,
  Receipt,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatCompactCurrency } from '../../data/constants';
import { ClientContact, Deal, DealStage, Task, ContactType, TaskPriority } from '../../types';

export const DashboardCrmSection: React.FC = () => {
  const {
    state,
    addContact,
    deleteContact,
    addDeal,
    updateDealStage,
    deleteDeal,
    addTask,
    toggleTask,
    deleteTask,
    acceptQuote,
    setIsNewInvoiceModalOpen,
    setActiveTab,
    showToast,
  } = useApp();

  const [crmTab, setCrmTab] = useState<'contacts' | 'pipeline' | 'tasks' | 'quotes'>('contacts');

  // Contacts state
  const [contactSearch, setContactSearch] = useState('');
  const [contactTypeFilter, setContactTypeFilter] = useState<string>('all');
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactCompany, setNewContactCompany] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactType, setNewContactType] = useState<ContactType>('lead');
  const [newContactNotes, setNewContactNotes] = useState('');

  // Deal state
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [newDealTitle, setNewDealTitle] = useState('');
  const [newDealContactId, setNewDealContactId] = useState(state.contacts[0]?.id || '');
  const [newDealValue, setNewDealValue] = useState('8500');
  const [newDealStage, setNewDealStage] = useState<DealStage>('lead');

  // Task state
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskContactId, setNewTaskContactId] = useState(state.contacts[0]?.id || '');
  const [newTaskDueDate, setNewTaskDueDate] = useState(
    new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
  );
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');

  // Filter contacts
  const filteredContacts = state.contacts.filter((c) => {
    if (contactTypeFilter !== 'all' && c.type !== contactTypeFilter) return false;
    if (contactSearch.trim()) {
      const q = contactSearch.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Calculate Pipeline statistics
  const activeDeals = state.deals.filter((d) => d.stage !== 'lost');
  const openDeals = activeDeals.filter((d) => d.stage !== 'won');
  const pipelineTotalValue = openDeals.reduce((sum, d) => sum + d.value, 0);
  const wonDealsTotal = state.deals.filter((d) => d.stage === 'won').reduce((sum, d) => sum + d.value, 0);
  const pendingTasksCount = state.tasks.filter((t) => !t.done).length;

  // Handle contact submit
  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactCompany.trim()) {
      showToast('Please enter contact name and company');
      return;
    }
    addContact({
      name: newContactName.trim(),
      company: newContactCompany.trim(),
      email: newContactEmail.trim() || `${newContactName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      phone: newContactPhone.trim(),
      type: newContactType,
      tags: [newContactType.toUpperCase(), 'Client'],
      notes: newContactNotes.trim() || 'Added via Dashboard CRM',
    });
    setNewContactName('');
    setNewContactCompany('');
    setNewContactEmail('');
    setNewContactPhone('');
    setNewContactNotes('');
    setShowAddContact(false);
  };

  // Handle deal submit
  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDealTitle.trim()) {
      showToast('Please enter a deal title');
      return;
    }
    const contact = state.contacts.find((c) => c.id === newDealContactId) || state.contacts[0];
    const val = parseFloat(newDealValue) || 0;
    addDeal({
      name: newDealTitle.trim(),
      contactId: contact?.id || '',
      contactName: contact?.name || 'Client',
      value: val,
      stage: newDealStage,
      probability: newDealStage === 'won' ? 1.0 : newDealStage === 'negotiation' ? 0.8 : 0.4,
      expectedCloseDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      notes: `Lead for ${contact?.company || 'Enterprise'}`,
    });
    setNewDealTitle('');
    setNewDealValue('8500');
    setShowAddDeal(false);
  };

  // Handle task submit
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      showToast('Please enter task description');
      return;
    }
    const contact = state.contacts.find((c) => c.id === newTaskContactId);
    addTask({
      title: newTaskTitle.trim(),
      contactId: contact?.id,
      contactName: contact?.name,
      dueDate: newTaskDueDate,
      priority: newTaskPriority,
    });
    setNewTaskTitle('');
    setShowAddTask(false);
  };

  // Pipeline stage configs
  const STAGES: { id: DealStage; label: string; color: string; bg: string }[] = [
    { id: 'lead', label: 'Lead Inbound', color: 'text-slate-700', bg: 'bg-slate-100' },
    { id: 'qualified', label: 'Discovery', color: 'text-blue-700', bg: 'bg-blue-50' },
    { id: 'proposal', label: 'Proposal Sent', color: 'text-amber-700', bg: 'bg-amber-50' },
    { id: 'negotiation', label: 'Terms', color: 'text-purple-700', bg: 'bg-purple-50' },
    { id: 'won', label: 'Won & Invoiced', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  ];

  const moveDealStage = (deal: Deal, direction: 'next' | 'prev') => {
    const stageOrder: DealStage[] = ['lead', 'qualified', 'proposal', 'negotiation', 'won'];
    const currentIndex = stageOrder.indexOf(deal.stage);
    if (currentIndex === -1) return;
    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= 0 && nextIndex < stageOrder.length) {
      updateDealStage(deal.id, stageOrder[nextIndex]);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
      {/* CRM Section Top Banner */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider border border-blue-500/30 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                Integrated CRM & Lead Hub
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                Auto-Invoicing Connected
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Client Relationships, Leads & Pipeline
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Nurture client relationships, advance sales deals, assign follow-up tasks, and automatically generate invoices when deals close.
            </p>
          </div>

          {/* Quick Header CTA buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setCrmTab('contacts');
                setShowAddContact(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Contact</span>
            </button>
            <button
              onClick={() => {
                setCrmTab('pipeline');
                setShowAddDeal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-sm transition active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Deal</span>
            </button>
            <button
              onClick={() => {
                setCrmTab('tasks');
                setShowAddTask(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* CRM Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-800/50 backdrop-blur-xs p-3 rounded-xl border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
              <span>Active Contacts</span>
              <Users className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-xl font-black text-white">{state.contacts.length}</div>
            <p className="text-[10px] text-slate-400 truncate mt-0.5">
              {state.contacts.filter((c) => c.type === 'vip').length} VIP Clients • {state.contacts.filter((c) => c.type === 'lead').length} Leads
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xs p-3 rounded-xl border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
              <span>Open Pipeline</span>
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-black text-amber-300">{formatCompactCurrency(pipelineTotalValue)}</div>
            <p className="text-[10px] text-slate-400 truncate mt-0.5">
              {openDeals.length} active deals in progress
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xs p-3 rounded-xl border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
              <span>Won Deals</span>
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-black text-emerald-400">{formatCompactCurrency(wonDealsTotal)}</div>
            <p className="text-[10px] text-slate-400 truncate mt-0.5">
              {state.deals.filter((d) => d.stage === 'won').length} converted to invoices
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xs p-3 rounded-xl border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
              <span>Follow-up Tasks</span>
              <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-xl font-black text-white">{pendingTasksCount}</div>
            <p className="text-[10px] text-slate-400 truncate mt-0.5">
              {state.tasks.length - pendingTasksCount} completed
            </p>
          </div>
        </div>
      </div>

      {/* CRM Sub-Navigation Tabs */}
      <div className="px-6 py-3 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCrmTab('contacts')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              crmTab === 'contacts'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Contacts & Leads ({state.contacts.length})</span>
          </button>

          <button
            onClick={() => setCrmTab('pipeline')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              crmTab === 'pipeline'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <KanbanSquare className="w-3.5 h-3.5" />
            <span>Deal Pipeline ({state.deals.length})</span>
          </button>

          <button
            onClick={() => setCrmTab('tasks')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              crmTab === 'tasks'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Client Tasks ({pendingTasksCount})</span>
          </button>

          <button
            onClick={() => setCrmTab('quotes')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              crmTab === 'quotes'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Quotes & Proposals ({state.quotes.length})</span>
          </button>
        </div>

        <button
          onClick={() => {
            if (crmTab === 'contacts') setShowAddContact(!showAddContact);
            if (crmTab === 'pipeline') setShowAddDeal(!showAddDeal);
            if (crmTab === 'tasks') setShowAddTask(!showAddTask);
          }}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>
            {crmTab === 'contacts' && (showAddContact ? 'Close Form' : 'Quick Add Contact')}
            {crmTab === 'pipeline' && (showAddDeal ? 'Close Form' : 'Quick Add Deal')}
            {crmTab === 'tasks' && (showAddTask ? 'Close Form' : 'Quick Add Task')}
            {crmTab === 'quotes' && 'View All Quotes'}
          </span>
        </button>
      </div>

      {/* TAB CONTENT 1: CONTACTS & LEADS */}
      {crmTab === 'contacts' && (
        <div className="p-6 space-y-4">
          {/* Quick Add Contact Inline Form Drawer */}
          {showAddContact && (
            <form
              onSubmit={handleCreateContact}
              className="p-5 bg-blue-50/70 border border-blue-200 rounded-2xl animate-in slide-in-from-top-2 duration-150 space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-blue-200/60">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-600" />
                  Add New Client or Lead Record
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddContact(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    placeholder="e.g. Jordan Hayes"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company *</label>
                  <input
                    type="text"
                    required
                    value={newContactCompany}
                    onChange={(e) => setNewContactCompany(e.target.value)}
                    placeholder="e.g. Stellar Dynamics Ltd"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newContactEmail}
                    onChange={(e) => setNewContactEmail(e.target.value)}
                    placeholder="jordan@stellardynamics.com"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Relationship Type</label>
                  <select
                    value={newContactType}
                    onChange={(e) => setNewContactType(e.target.value as ContactType)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="lead">New Inbound Lead</option>
                    <option value="prospect">Qualified Prospect</option>
                    <option value="customer">Active Customer</option>
                    <option value="vip">VIP Key Account</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <input
                  type="text"
                  value={newContactNotes}
                  onChange={(e) => setNewContactNotes(e.target.value)}
                  placeholder="Optional notes or deal context..."
                  className="flex-1 max-w-lg px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 mr-3"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition shadow-sm cursor-pointer shrink-0"
                >
                  Save Contact to CRM
                </button>
              </div>
            </form>
          )}

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                placeholder="Search contacts, companies, or tags..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {(['all', 'lead', 'prospect', 'customer', 'vip'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setContactTypeFilter(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition cursor-pointer shrink-0 ${
                    contactTypeFilter === type
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {type === 'all' ? 'All Contacts' : `${type}s`}
                </button>
              ))}
            </div>
          </div>

          {/* Contacts Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto max-h-[420px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="py-3 px-4">Contact & Company</th>
                    <th className="py-3 px-4">Direct Contact</th>
                    <th className="py-3 px-4">Relationship</th>
                    <th className="py-3 px-4">Lifetime Revenue</th>
                    <th className="py-3 px-4">Reliability</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredContacts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        No contacts found. Click "New Contact" above to add your first client.
                      </td>
                    </tr>
                  ) : (
                    filteredContacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {contact.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">{contact.name}</p>
                              <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                                <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                                {contact.company}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <p className="text-slate-800 font-medium truncate max-w-[180px]">{contact.email}</p>
                          {contact.phone && (
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                              <Phone className="w-2.5 h-2.5 text-slate-400" />
                              {contact.phone}
                            </p>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              contact.type === 'vip'
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : contact.type === 'customer'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : contact.type === 'prospect'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {contact.type}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-extrabold text-slate-900 block font-mono">
                            {formatCurrency(contact.ltv || 0, state.settings.currency)}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {contact.dealsWon || 0} won deal{(contact.dealsWon || 0) === 1 ? '' : 's'}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-emerald-500 h-1.5 rounded-full"
                                style={{ width: `${contact.onTimePaymentPct || 100}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-semibold text-slate-600 font-mono">
                              {contact.onTimePaymentPct || 100}%
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setIsNewInvoiceModalOpen(true);
                              }}
                              className="px-2 py-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 text-[11px] font-bold transition cursor-pointer"
                              title="Invoice this client"
                            >
                              Invoice
                            </button>
                            <button
                              onClick={() => deleteContact(contact.id)}
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Delete contact"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: DEAL PIPELINE */}
      {crmTab === 'pipeline' && (
        <div className="p-6 space-y-4">
          {/* Quick Add Deal Form Drawer */}
          {showAddDeal && (
            <form
              onSubmit={handleCreateDeal}
              className="p-5 bg-purple-50/70 border border-purple-200 rounded-2xl animate-in slide-in-from-top-2 duration-150 space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-purple-200/60">
                <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                  <KanbanSquare className="w-4 h-4 text-purple-600" />
                  Add New Sales Deal / Opportunity
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddDeal(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Deal Title *</label>
                  <input
                    type="text"
                    required
                    value={newDealTitle}
                    onChange={(e) => setNewDealTitle(e.target.value)}
                    placeholder="e.g. Q4 Growth Retainer"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Associated Client</label>
                  <select
                    value={newDealContactId}
                    onChange={(e) => setNewDealContactId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {state.contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.company})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Deal Value ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={newDealValue}
                    onChange={(e) => setNewDealValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Starting Stage</label>
                  <select
                    value={newDealStage}
                    onChange={(e) => setNewDealStage(e.target.value as DealStage)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="lead">Lead Inbound</option>
                    <option value="qualified">Qualified Discovery</option>
                    <option value="proposal">Proposal Review</option>
                    <option value="negotiation">Contract & Terms</option>
                    <option value="won">Won (Auto-Invoiced!)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition shadow-sm cursor-pointer"
                >
                  Create Deal Card
                </button>
              </div>
            </form>
          )}

          {/* Kanban Board Layout */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {STAGES.map((stage) => {
              const stageDeals = state.deals.filter((d) => d.stage === stage.id);
              const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);

              return (
                <div key={stage.id} className="bg-slate-50/70 border border-slate-200 rounded-2xl p-3 flex flex-col min-h-[320px]">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                    <div>
                      <span className={`text-xs font-black uppercase tracking-wider ${stage.color}`}>
                        {stage.label}
                      </span>
                      <p className="text-[10px] text-slate-400 font-mono font-bold mt-0.5">
                        {formatCompactCurrency(stageValue)}
                      </p>
                    </div>
                    <span className="text-xs font-bold px-1.5 py-0.5 bg-white rounded-md text-slate-600 border border-slate-200">
                      {stageDeals.length}
                    </span>
                  </div>

                  <div className="space-y-2 flex-1 overflow-y-auto">
                    {stageDeals.length === 0 ? (
                      <div className="h-28 flex items-center justify-center text-slate-400 text-[11px] border border-dashed border-slate-200 rounded-xl">
                        No deals
                      </div>
                    ) : (
                      stageDeals.map((deal) => (
                        <div
                          key={deal.id}
                          className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs hover:shadow-xs transition"
                        >
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <p className="font-bold text-xs text-slate-900 leading-snug">{deal.name}</p>
                            <button
                              onClick={() => deleteDeal(deal.id)}
                              className="text-slate-300 hover:text-rose-500 cursor-pointer p-0.5"
                              title="Delete deal"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate mb-2">{deal.contactName}</p>

                          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                            <span className="font-black text-emerald-600 font-mono">
                              {formatCurrency(deal.value, state.settings.currency)}
                            </span>

                            {/* Stage Navigation Arrows */}
                            <div className="flex items-center gap-1">
                              {stage.id !== 'lead' && (
                                <button
                                  onClick={() => moveDealStage(deal, 'prev')}
                                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                                  title="Previous stage"
                                >
                                  <ArrowLeft className="w-2.5 h-2.5" />
                                </button>
                              )}
                              {stage.id !== 'won' ? (
                                <button
                                  onClick={() => moveDealStage(deal, 'next')}
                                  className="p-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 cursor-pointer"
                                  title="Advance to next stage"
                                >
                                  <ArrowRight className="w-2.5 h-2.5" />
                                </button>
                              ) : (
                                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                                  <Check className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: CLIENT TASKS */}
      {crmTab === 'tasks' && (
        <div className="p-6 space-y-4">
          {/* Quick Add Task Form */}
          {showAddTask && (
            <form
              onSubmit={handleCreateTask}
              className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl animate-in slide-in-from-top-2 duration-150 space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-indigo-200/60">
                <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-indigo-600" />
                  Add Follow-Up Task or Action Item
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Task Action *</label>
                  <input
                    type="text"
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="e.g. Call CFO to confirm Q4 Retainer payment link"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Client</label>
                  <select
                    value={newTaskContactId}
                    onChange={(e) => setNewTaskContactId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">No client linked</option>
                    {state.contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.company})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition shadow-sm cursor-pointer"
                >
                  Save Task
                </button>
              </div>
            </form>
          )}

          {/* Task List */}
          <div className="space-y-2">
            {state.tasks.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
                No active follow-ups. Click "+ Quick Add Task" to schedule reminders.
              </div>
            ) : (
              state.tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-xl border transition flex items-center justify-between gap-3 ${
                    task.done ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200 shadow-2xs hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggleTask(task.id)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <div className="min-w-0">
                      <p className={`text-xs font-bold text-slate-900 truncate ${task.done ? 'line-through text-slate-400' : ''}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        {task.contactName && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-slate-400" />
                            {task.contactName}
                          </span>
                        )}
                        <span>• Due {task.dueDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        task.priority === 'high'
                          ? 'bg-rose-100 text-rose-800'
                          : task.priority === 'medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {task.priority}
                    </span>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-slate-300 hover:text-rose-500 p-1 cursor-pointer"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: QUOTES & PROPOSALS */}
      {crmTab === 'quotes' && (
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Client Quotes & Estimates
              </h3>
              <p className="text-[11px] text-slate-500">
                Send professional estimates that convert directly into payable invoices upon client acceptance.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('invoices')}
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>Manage Invoices</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {state.quotes.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
                No quotes generated yet.
              </div>
            ) : (
              state.quotes.map((quote) => (
                <div
                  key={quote.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-emerald-200 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{quote.quoteNum}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          quote.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : quote.status === 'sent'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {quote.status}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 mt-1">{quote.title}</p>
                    <p className="text-xs text-slate-500">
                      Client: {quote.clientName} ({quote.clientEmail})
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <span className="text-base font-black text-slate-900 font-mono">
                      {formatCurrency(quote.total, state.settings.currency)}
                    </span>
                    {quote.status !== 'accepted' && (
                      <button
                        onClick={() => acceptQuote(quote.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                      >
                        Accept & Convert to Invoice
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
