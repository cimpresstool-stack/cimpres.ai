import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Activity,
  DollarSign,
  Receipt,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowDownRight,
  UserCheck,
  UserX,
  RefreshCw,
  Download,
  AlertCircle,
  Database,
  Building2,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SiteActivity, UserProfile, UserRole, ActivityAction } from '../types';
import {
  fetchSiteActivities,
  fetchAllUsers,
  updateUserRole,
  logSiteActivity,
  getStoredSupabaseUrl,
  testSupabaseConnection,
} from '../lib/supabase';
import { formatCompactCurrency } from '../data/constants';

export const AdminControlView: React.FC = () => {
  const { currentUser, state, showToast, setActiveTab } = useApp();

  const [activities, setActivities] = useState<SiteActivity[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [cloudStatus, setCloudStatus] = useState<{ connected: boolean; message: string }>({
    connected: false,
    message: 'Checking...',
  });

  const isAdmin = currentUser?.role === 'admin';

  // Load activities & users
  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [acts, usrs] = await Promise.all([fetchSiteActivities(), fetchAllUsers()]);
      setActivities(acts);
      setUsers(usrs);

      const url = getStoredSupabaseUrl();
      if (url) {
        const testRes = await testSupabaseConnection(url);
        setCloudStatus({
          connected: testRes.success,
          message: testRes.success ? 'Cloud Sync Active' : 'Local Sync Active',
        });
      } else {
        setCloudStatus({
          connected: false,
          message: 'Local Sync Active',
        });
      }
    } catch (e) {
      console.warn('Load note:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleToggle = async (targetUser: UserProfile) => {
    const newRole: UserRole = targetUser.role === 'admin' ? 'owner' : 'admin';
    const confirmed = window.confirm(
      `Update access permissions for ${targetUser.name} (${targetUser.email})?`
    );
    if (!confirmed) return;

    await updateUserRole(targetUser.id, newRole, currentUser?.name || 'Operations');
    showToast(`Access updated for ${targetUser.name}`);
    await loadData();
  };

  const handleExportAuditLog = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activities, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cimpres-audit-log-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Audit log exported successfully.');
  };

  // Filter activities
  const filteredActivities = activities.filter((act) => {
    const matchesSearch =
      act.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (act.companyName && act.companyName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (actionFilter === 'all') return true;
    if (actionFilter === 'auth') return act.action === 'login' || act.action === 'signup' || act.action === 'logout';
    if (actionFilter === 'cash') return act.action === 'cash_in' || act.action === 'account_adjusted';
    if (actionFilter === 'invoices') return act.action === 'invoice_created' || act.action === 'invoice_paid';
    if (actionFilter === 'roles') return act.action === 'role_changed';
    return true;
  });

  // Calculate platform totals
  const totalInvoicesValue = state.invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const totalCashTracked =
    Object.values(state.balances).reduce((a, b) => a + b, 0) +
    state.transactions.filter((t) => t.type === 'cashin' || t.type === 'invoice-payment').reduce((sum, t) => sum + t.amount, 0);

  // If user does not have management access, show access restriction notice
  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Access Restricted</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            This section is restricted to authorized operations accounts.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              Return to Cockpit
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider border border-purple-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Operations Console
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                cloudStatus.connected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-300'
              }`}
            >
              {cloudStatus.message}
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Operations & Activity Overview</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time audit log, account directory, and cross-workspace financial activity monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={loadData}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExportAuditLog}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Log</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Accounts</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{users.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {users.length} Total Verified Workspaces
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Audit Log Events</span>
            <Activity className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{activities.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Live tracking logins, cash ins & changes</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Volume Tracked</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{formatCompactCurrency(totalCashTracked)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Across 8-account formula splits</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Platform Invoices</span>
            <Receipt className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{formatCompactCurrency(totalInvoicesValue)}</div>
          <div className="text-[11px] text-slate-500 mt-1">{state.invoices.length} total generated invoices</div>
        </div>
      </div>

      {/* Account Directory */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Account Directory
            </h2>
            <p className="text-xs text-slate-500">
              Directory of registered enterprise workspaces.
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 self-start sm:self-auto">
            {users.length} Active Accounts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-5">User & Company</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Account Level</th>
                <th className="py-3 px-4">Registered Date</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const isCurrent = u.id === currentUser?.id || u.email === currentUser?.email;
                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-700 border border-purple-200'
                              : 'bg-blue-100 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {u.name.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            <span>{u.companyName}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-700">{u.email}</td>

                    <td className="py-3.5 px-4">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 font-bold text-[11px] border border-purple-200">
                          <ShieldCheck className="w-3 h-3 text-purple-600" />
                          Management
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-200">
                          <Building2 className="w-3 h-3 text-blue-500" />
                          Standard
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => handleRoleToggle(u)}
                        disabled={isCurrent}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          isCurrent
                            ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
                            : u.role === 'admin'
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200'
                        }`}
                        title={isCurrent ? 'Current active account' : 'Modify access tier'}
                      >
                        {u.role === 'admin' ? 'Set Standard' : 'Set Management'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Site Activity Feed */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-600" />
              Live Site Activity Stream
            </h2>
            <p className="text-xs text-slate-500">
              Audit log of authentication, cash allocations, invoicing, and account governance.
            </p>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search audit trail..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 w-48 sm:w-60"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {(['all', 'auth', 'cash', 'invoices', 'roles'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActionFilter(filter)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider transition cursor-pointer ${
                    actionFilter === filter
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Items */}
        <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
          {filteredActivities.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No activity matching the current filter.
            </div>
          ) : (
            filteredActivities.map((act) => {
              const isAuth = act.action === 'login' || act.action === 'signup' || act.action === 'logout';
              const isCash = act.action === 'cash_in' || act.action === 'account_adjusted';
              const isRole = act.action === 'role_changed';
              const isInv = act.action === 'invoice_created' || act.action === 'invoice_paid' || act.action === 'deal_won';

              return (
                <div key={act.id} className="p-4 hover:bg-slate-50/70 transition flex items-start gap-3.5 text-xs">
                  {/* Icon badge */}
                  <div
                    className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center ${
                      isCash
                        ? 'bg-emerald-100 text-emerald-700'
                        : isRole
                        ? 'bg-purple-100 text-purple-700'
                        : isInv
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {isCash ? (
                      <ArrowDownRight className="w-4 h-4" />
                    ) : isRole ? (
                      <ShieldCheck className="w-4 h-4" />
                    ) : isInv ? (
                      <Receipt className="w-4 h-4" />
                    ) : (
                      <UserCheck className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold text-slate-900 truncate">
                        {act.userName}{' '}
                        <span className="font-normal text-slate-500">({act.userEmail})</span>
                      </div>
                      <span className="text-[11px] text-slate-400 shrink-0 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                        {new Date(act.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <p className="text-slate-600 mt-0.5">{act.details}</p>

                    {act.companyName && (
                      <span className="inline-block mt-1 text-[10px] text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded">
                        {act.companyName}
                      </span>
                    )}
                  </div>

                  {act.amount !== undefined && act.amount > 0 && (
                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-emerald-600 text-xs">
                        +${act.amount.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
