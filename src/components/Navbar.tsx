import React from 'react';
import {
  ArrowDownRight,
  Plus,
  Receipt,
  Sparkles,
  Search,
  Bell,
  CheckCircle2,
  TrendingUp,
  Menu,
  Globe,
  LogOut,
  User,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCompactCurrency } from '../data/constants';

export const Navbar: React.FC<{ onToggleMobileSidebar?: () => void }> = ({
  onToggleMobileSidebar,
}) => {
  const {
    state,
    currentUser,
    setIsLandingPageActive,
    logout,
    setIsCashInModalOpen,
    setIsNewInvoiceModalOpen,
    setIsNewDealModalOpen,
    setIsNewClientModalOpen,
    toastMessage,
    activeTab,
  } = useApp();

  const totalCashIn = state.transactions
    .filter((t) => t.type === 'cashin' || t.type === 'invoice-payment')
    .reduce((sum, t) => sum + t.amount, 0);

  const openDeals = state.deals.filter((d) => d.stage !== 'won' && d.stage !== 'lost');
  const openDealsValue = openDeals.reduce((sum, d) => sum + d.value, 0);
  const pendingInvoices = state.invoices.filter((i) => i.status === 'sent');
  const pendingAmount = pendingInvoices.reduce((sum, i) => sum + i.total, 0);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Tab Title & Quick Search */}
        <div className="flex items-center gap-3">
          {onToggleMobileSidebar && (
            <button
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight capitalize">
                {activeTab === 'cashin'
                  ? 'Record Cash In'
                  : activeTab === 'accounts'
                  ? '7-Account Cash Engine'
                  : activeTab === 'invoices'
                  ? 'Automated Invoicing'
                  : activeTab === 'pipeline'
                  ? 'Deals & Sales Pipeline'
                  : activeTab === 'clients'
                  ? 'Clients & CRM Tracking'
                  : activeTab === 'reports'
                  ? 'Real-Time Financial Reports'
                  : activeTab === 'paylinks'
                  ? 'Payment Links & Gateways'
                  : activeTab === 'tasks'
                  ? 'Activities & Follow-Ups'
                  : activeTab === 'communications'
                  ? 'Communications & Automations'
                  : activeTab === 'settings'
                  ? 'Rules & Engine Settings'
                  : 'Financial & CRM Cockpit'}
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Engine Live
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              {state.settings.businessName} • Connected to 7-Account Distribution
            </p>
          </div>
        </div>

        {/* Center: Live Pulse Stats (Desktop) */}
        <div className="hidden xl:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-500">Total Inflow:</span>
            <span className="font-bold text-slate-900">
              {formatCompactCurrency(totalCashIn, state.settings.currency)}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-blue-700 font-medium">Pipeline:</span>
            <span className="font-bold text-blue-900">
              {formatCompactCurrency(openDealsValue, state.settings.currency)}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs">
            <Receipt className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-amber-700 font-medium">Receivables:</span>
            <span className="font-bold text-amber-900">
              {formatCompactCurrency(pendingAmount, state.settings.currency)}
            </span>
          </div>
        </div>

        {/* Right: Quick Action Triggers */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* Record Cash In Button */}
          <button
            onClick={() => setIsCashInModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow-md hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] transition cursor-pointer"
            id="nav-btn-record-cashin"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>Record Cash In</span>
          </button>

          {/* New Invoice Button */}
          <button
            onClick={() => setIsNewInvoiceModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs sm:text-sm shadow-sm hover:bg-blue-500 active:scale-[0.98] transition cursor-pointer"
            id="nav-btn-new-invoice"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Invoice</span>
            <span className="sm:hidden">Invoice</span>
          </button>

          {/* New Deal */}
          <button
            onClick={() => setIsNewDealModalOpen(true)}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs sm:text-sm border border-slate-200 transition cursor-pointer"
            id="nav-btn-new-deal"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Deal</span>
          </button>

          {/* New Client */}
          <button
            onClick={() => setIsNewClientModalOpen(true)}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs sm:text-sm border border-slate-200 transition cursor-pointer"
            id="nav-btn-new-client"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Client</span>
          </button>

          {/* Public Landing Page View Link */}
          <button
            onClick={() => setIsLandingPageActive(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 text-xs font-semibold border border-slate-200 transition cursor-pointer"
            title="Preview public landing page"
            id="nav-btn-view-landing"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden xl:inline">Landing Page</span>
          </button>

          {/* User Account / Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden 2xl:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">
                {currentUser?.name || 'Finance Lead'}
              </p>
              <p className="text-[10px] text-slate-500 truncate max-w-[120px]">
                {currentUser?.email || 'cimpresstool@gmail.com'}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
              title="Log Out & Return to Landing Page"
              id="nav-btn-logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-800 text-xs sm:text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </header>
  );
};
