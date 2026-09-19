import React from 'react';
import {
  LayoutDashboard,
  ArrowDownRight,
  PieChart,
  BarChart3,
  Receipt,
  Link2,
  Settings,
  RotateCcw,
  ShieldCheck,
  Building2,
  ChevronRight,
  Globe,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCompactCurrency } from '../data/constants';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const {
    state,
    activeTab,
    setActiveTab,
    resetToDemoData,
    setIsResetConfirmModalOpen,
    currentUser,
    setIsLandingPageActive,
    logout,
  } = useApp();

  const pendingInvoicesCount = state.invoices.filter((i) => i.status === 'sent').length;

  const sections: NavSection[] = [
    {
      title: 'Cash Flow Engine',
      items: [
        { id: 'dashboard', label: 'Cockpit Overview', icon: LayoutDashboard },
        { id: 'cashin', label: 'Record Cash In', icon: ArrowDownRight },
        { id: 'accounts', label: '7 Accounts Breakdown', icon: PieChart },
        { id: 'reports', label: 'Financial Reports & P&L', icon: BarChart3 },
      ],
    },
    {
      title: 'Invoicing & Payments',
      items: [
        {
          id: 'invoices',
          label: 'Invoices & Billing',
          icon: Receipt,
          badge: pendingInvoicesCount > 0 ? `${pendingInvoicesCount} due` : undefined,
          badgeColor: 'bg-emerald-100 text-emerald-800',
        },
        { id: 'paylinks', label: 'Payment Links', icon: Link2 },
      ],
    },
    {
      title: 'Configuration',
      items: [
        { id: 'settings', label: 'Rules & Percentage Settings', icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-500 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-blue-500/20">
              C
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white tracking-tight text-lg">Cimpres</span>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  100% FREE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">7-Account Cash Flow OS</p>
            </div>
          </div>
        </div>

        {/* Business Summary Card */}
        <div className="p-4 mx-3 mt-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Building2 className="w-3 h-3 text-slate-400" />
              {state.settings.businessName}
            </span>
            <span className="text-[10px] font-bold uppercase text-emerald-400">Active</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-slate-400">Profit Reserve:</span>
            <span className="text-sm font-bold text-emerald-400">
              {formatCompactCurrency(state.balances.P || 0, state.settings.currency)}
            </span>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">
                {section.title}
              </h3>
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                      id={`sidebar-link-${item.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 ${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>

                      {item.badge !== undefined && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                            isActive ? 'bg-white/20 text-white' : item.badgeColor
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 space-y-2.5">
          {/* User Profile Mini Card */}
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {currentUser?.name || 'Finance Lead'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {currentUser?.companyName || 'Cimpres Global'}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
              title="Log Out & Return to Landing Page"
              id="sidebar-btn-logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Switch to Public Landing Page */}
          <button
            onClick={() => {
              setIsLandingPageActive(true);
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition cursor-pointer border border-blue-500/20"
            id="sidebar-btn-view-landing"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Public Landing Page</span>
          </button>

          <button
            onClick={() => {
              setIsResetConfirmModalOpen(true);
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition cursor-pointer"
            id="sidebar-reset-btn"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline" />
            <span>100% Free Forever • Local Persistence</span>
          </div>
        </div>
      </aside>
    </>
  );
};
