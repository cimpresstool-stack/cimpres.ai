import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  Server,
  Key,
  ShieldCheck,
  Eye,
  EyeOff,
  Code,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_SECRET_KEY,
  getStoredSupabaseUrl,
  saveStoredSupabaseUrl,
  testSupabaseConnection,
  syncStateToSupabase,
  getSupabaseSqlSchema,
  SupabaseTestResult,
} from '../lib/supabase';

export const SupabaseSyncCard: React.FC = () => {
  const { state, showToast } = useApp();

  const [projectUrl, setProjectUrl] = useState(getStoredSupabaseUrl());
  const [isSecretVisible, setIsSecretVisible] = useState(false);
  const [testResult, setTestResult] = useState<SupabaseTestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSummary, setSyncSummary] = useState<{
    success: boolean;
    timestamp?: string;
    details?: string;
  } | null>(null);
  const [showSqlSchema, setShowSqlSchema] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    // If URL is already configured, test connectivity silently on mount
    const stored = getStoredSupabaseUrl();
    if (stored) {
      testSupabaseConnection(stored).then((res) => {
        setTestResult(res);
      });
    }
  }, []);

  const handleSaveUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectUrl.trim()) {
      saveStoredSupabaseUrl('');
      setTestResult(null);
      showToast('Supabase Project URL cleared');
      return;
    }

    saveStoredSupabaseUrl(projectUrl);
    showToast('Supabase Project URL saved!');
    handleTestConnection();
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await testSupabaseConnection(projectUrl);
      setTestResult(result);
      if (result.success) {
        showToast('Supabase connection verified successfully!');
      } else {
        showToast(`Supabase check: ${result.message}`);
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleSyncData = async () => {
    if (!projectUrl.trim()) {
      showToast('Please enter and save your Supabase Project URL first.');
      return;
    }

    setIsSyncing(true);
    try {
      const res = await syncStateToSupabase(state);
      if (res.success) {
        const text = `Synced ${res.syncedCount.contacts} contacts, ${res.syncedCount.deals} deals, ${res.syncedCount.invoices} invoices, ${res.syncedCount.transactions} transactions to Supabase!`;
        setSyncSummary({
          success: true,
          timestamp: new Date().toLocaleTimeString(),
          details: text,
        });
        showToast(text);
      } else {
        setSyncSummary({
          success: false,
          timestamp: new Date().toLocaleTimeString(),
          details: res.error || 'Failed to sync to Supabase tables. Ensure the SQL schema is created.',
        });
        showToast(`Sync notice: ${res.error || 'Check table schema'}`);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const copyToClipboard = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(identifier);
    showToast(`Copied ${identifier} to clipboard`);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2500);
  };

  const isConfigured = Boolean(projectUrl.trim() && testResult?.success);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-linear-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Supabase Cloud Database & Storage
                </h3>
                {isConfigured ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Connected
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                    Keys Configured • Awaiting Project URL
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                PostgreSQL database integration with publishable and secret API keys.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSqlSchema(!showSqlSchema)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Code className="w-3.5 h-3.5 text-slate-500" />
              <span>{showSqlSchema ? 'Hide SQL Schema' : 'View SQL Schema'}</span>
            </button>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Supabase Console</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Credentials Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Publishable Key */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-blue-600" />
                Publishable Key (Client)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 mt-2">
              <code className="text-xs font-mono font-semibold text-slate-800 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 truncate flex-1 select-all">
                {SUPABASE_PUBLISHABLE_KEY.slice(0, 18)}...{SUPABASE_PUBLISHABLE_KEY.slice(-8)}
              </code>
              <button
                type="button"
                onClick={() => copyToClipboard(SUPABASE_PUBLISHABLE_KEY, 'Publishable Key')}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition cursor-pointer"
                title="Copy Publishable Key"
              >
                {copiedKey === 'Publishable Key' ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Standard client-safe public token for browser operations and real-time listeners.
            </p>
          </div>

          {/* Secret Key */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Secret Key (Admin)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Secured
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 mt-2">
              <code className="text-xs font-mono font-semibold text-slate-800 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 truncate flex-1 select-all">
                {SUPABASE_SECRET_KEY
                  ? (isSecretVisible
                    ? SUPABASE_SECRET_KEY
                    : `${SUPABASE_SECRET_KEY.slice(0, 12)}••••••••••••••••${SUPABASE_SECRET_KEY.slice(-6)}`)
                  : 'Configured via server environment'}
              </code>
              {SUPABASE_SECRET_KEY && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsSecretVisible(!isSecretVisible)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition cursor-pointer"
                    title={isSecretVisible ? 'Hide' : 'Reveal'}
                  >
                    {isSecretVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(SUPABASE_SECRET_KEY, 'Secret Key')}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition cursor-pointer"
                    title="Copy Secret Key"
                  >
                    {copiedKey === 'Secret Key' ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Privileged server token. Safely isolated for backend and administrative tasks.
            </p>
          </div>
        </div>

        {/* Project URL Configuration Form */}
        <form onSubmit={handleSaveUrl} className="space-y-3">
          <div className="flex items-baseline justify-between">
            <label className="block text-xs font-bold uppercase text-slate-700">
              Supabase Project URL
            </label>
            <span className="text-xs text-slate-400">
              e.g. <span className="font-mono text-slate-600">https://xyzcompany.supabase.co</span> or project ref
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Server className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                placeholder="https://your-project-id.supabase.co"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm font-mono text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition cursor-pointer shrink-0"
            >
              Save URL
            </button>
            <button
              type="button"
              disabled={isTesting || !projectUrl.trim()}
              onClick={handleTestConnection}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 disabled:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer shrink-0 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
            </button>
          </div>

          {/* Test Status Banner */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-semibold">{testResult.message}</p>
                {testResult.latencyMs && (
                  <p className="text-[11px] opacity-80 mt-0.5">
                    Response time: {testResult.latencyMs}ms
                  </p>
                )}
              </div>
            </div>
          )}

          <p className="text-xs text-slate-500">
            You can copy your Project URL from your{' '}
            <strong className="text-slate-700">Supabase Dashboard &gt; Project Settings &gt; API &gt; Project URL</strong>.
          </p>
        </form>

        {/* Sync Controls */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight">
              Two-Way Data Sync Engine
            </h4>
            <p className="text-xs text-slate-500">
              Synchronize {state.contacts.length} contacts, {state.deals.length} deals,{' '}
              {state.invoices.length} invoices, and 8-account allocation records to Supabase.
            </p>
          </div>

          <button
            type="button"
            disabled={isSyncing || !projectUrl.trim()}
            onClick={handleSyncData}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold text-xs shadow-xs transition flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing Tables...' : 'Sync All Data to Supabase'}</span>
          </button>
        </div>

        {/* Sync Result Notice */}
        {syncSummary && (
          <div
            className={`p-3.5 rounded-xl border text-xs ${
              syncSummary.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center justify-between font-bold mb-1">
              <span>{syncSummary.success ? '✓ Sync Succeeded' : '⚠️ Sync Notice'}</span>
              <span className="text-[11px] opacity-75 font-normal">{syncSummary.timestamp}</span>
            </div>
            <p>{syncSummary.details}</p>
          </div>
        )}

        {/* SQL Schema Preview Drawer */}
        {showSqlSchema && (
          <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-950 text-slate-200 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
              <span className="font-bold text-slate-400">
                POSTGRESQL SCHEMA FOR SUPABASE (SQL EDITOR)
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(getSupabaseSqlSchema(), 'SQL Schema')}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'SQL Schema' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'SQL Schema' ? 'Copied!' : 'Copy SQL'}</span>
              </button>
            </div>
            <pre className="overflow-x-auto max-h-60 font-mono text-[11px] leading-relaxed text-emerald-400/90 whitespace-pre">
              {getSupabaseSqlSchema()}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
