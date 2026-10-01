import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppState, ClientContact, Deal, Invoice, Transaction } from '../types';

export const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_QuP6bUMTNW_hKBIwHWSopw_F2IVmOLG';

export const SUPABASE_SECRET_KEY =
  (typeof process !== 'undefined' && process.env?.SUPABASE_SECRET_KEY) ||
  '';

const STORAGE_URL_KEY = 'cimpres_supabase_project_url';

export function normalizeSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  if (!url) return '';

  // If user passed just the project reference (e.g., 'ovfzwv5fr2ne4mgt')
  if (!url.includes('.') && !url.includes('/')) {
    return `https://${url}.supabase.co`;
  }

  // If missing protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  // Remove trailing slashes
  return url.replace(/\/+$/, '');
}

export function getStoredSupabaseUrl(): string {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  if (envUrl && envUrl.trim() !== '') {
    return normalizeSupabaseUrl(envUrl);
  }
  try {
    const saved = localStorage.getItem(STORAGE_URL_KEY);
    if (saved) return normalizeSupabaseUrl(saved);
  } catch {}
  return '';
}

export function saveStoredSupabaseUrl(url: string): void {
  try {
    const normalized = normalizeSupabaseUrl(url);
    if (normalized) {
      localStorage.setItem(STORAGE_URL_KEY, normalized);
    } else {
      localStorage.removeItem(STORAGE_URL_KEY);
    }
    // Invalidate cached client
    cachedClient = null;
  } catch (err) {
    console.warn('Failed to save Supabase URL in storage:', err);
  }
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const url = getStoredSupabaseUrl();
  if (!url) return null;

  if (cachedClient) return cachedClient;

  try {
    cachedClient = createClient(url, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return cachedClient;
  } catch (err) {
    console.error('Failed to create Supabase client:', err);
    return null;
  }
}

export interface SupabaseTestResult {
  success: boolean;
  message: string;
  latencyMs?: number;
  statusCode?: number;
}

export async function testSupabaseConnection(overrideUrl?: string): Promise<SupabaseTestResult> {
  const targetUrl = overrideUrl ? normalizeSupabaseUrl(overrideUrl) : getStoredSupabaseUrl();
  if (!targetUrl) {
    return {
      success: false,
      message: 'Supabase Project URL is missing. Please enter your https://<project-ref>.supabase.co URL.',
    };
  }

  const startTime = Date.now();
  try {
    // Test endpoint using fetch against the Supabase REST health endpoint
    const response = await fetch(`${targetUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      },
    });

    const latencyMs = Date.now() - startTime;

    if (response.ok || response.status === 200 || response.status === 404 || response.status === 401) {
      // 200/404/401 from rest/v1 indicates host reached successfully and Supabase server answered
      if (response.status === 401) {
        return {
          success: true,
          message: `Connected to Supabase at ${targetUrl}! (Latency: ${latencyMs}ms)`,
          latencyMs,
          statusCode: response.status,
        };
      }
      return {
        success: true,
        message: `Successfully connected to Supabase (${latencyMs}ms). API responsive.`,
        latencyMs,
        statusCode: response.status,
      };
    }

    return {
      success: false,
      message: `Supabase server responded with HTTP status ${response.status}: ${response.statusText}`,
      latencyMs,
      statusCode: response.status,
    };
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Connection failed: ${errorMsg}. Please ensure the Project URL is correct and active.`,
      latencyMs,
    };
  }
}

export async function syncStateToSupabase(state: AppState): Promise<{
  success: boolean;
  syncedCount: { contacts: number; deals: number; invoices: number; transactions: number };
  error?: string;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      syncedCount: { contacts: 0, deals: 0, invoices: 0, transactions: 0 },
      error: 'Supabase is not configured yet. Please configure the Project URL first.',
    };
  }

  try {
    // 1. Sync System & Balances Document
    await client.from('cimpres_business_state').upsert({
      id: 'primary',
      balances: state.balances,
      percentages: state.percentages,
      settings: state.settings,
      updated_at: new Date().toISOString(),
    });

    // 2. Sync Contacts
    let contactsCount = 0;
    if (state.contacts && state.contacts.length > 0) {
      const { error } = await client.from('contacts').upsert(
        state.contacts.map((c) => ({
          id: c.id,
          name: c.name,
          company: c.company,
          email: c.email,
          phone: c.phone,
          type: c.type,
          ltv: c.ltv,
          deals_won: c.dealsWon,
          tags: c.tags,
          notes: c.notes,
          created_at: c.createdAt,
        }))
      );
      if (!error) contactsCount = state.contacts.length;
    }

    // 3. Sync Deals
    let dealsCount = 0;
    if (state.deals && state.deals.length > 0) {
      const { error } = await client.from('deals').upsert(
        state.deals.map((d) => ({
          id: d.id,
          name: d.name,
          contact_id: d.contactId,
          contact_name: d.contactName,
          value: d.value,
          stage: d.stage,
          probability: d.probability,
          expected_close_date: d.expectedCloseDate,
          notes: d.notes,
          created_at: d.createdAt,
        }))
      );
      if (!error) dealsCount = state.deals.length;
    }

    // 4. Sync Invoices
    let invoicesCount = 0;
    if (state.invoices && state.invoices.length > 0) {
      const { error } = await client.from('invoices').upsert(
        state.invoices.map((inv) => ({
          id: inv.id,
          invoice_num: inv.invoiceNum,
          contact_name: inv.contactName,
          contact_email: inv.contactEmail,
          total: inv.total,
          status: inv.status,
          issued_date: inv.issuedDate,
          due_date: inv.dueDate,
          items: inv.items,
        }))
      );
      if (!error) invoicesCount = state.invoices.length;
    }

    // 5. Sync Transactions
    let txCount = 0;
    if (state.transactions && state.transactions.length > 0) {
      const { error } = await client.from('transactions').upsert(
        state.transactions.slice(0, 100).map((t) => ({
          id: t.id,
          type: t.type,
          amount: t.amount,
          note: t.note,
          date: t.date,
          account_key: t.accountKey || null,
          dist: t.dist || null,
        }))
      );
      if (!error) txCount = state.transactions.length;
    }

    return {
      success: true,
      syncedCount: {
        contacts: contactsCount,
        deals: dealsCount,
        invoices: invoicesCount,
        transactions: txCount,
      },
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      syncedCount: { contacts: 0, deals: 0, invoices: 0, transactions: 0 },
      error: errorMsg,
    };
  }
}

export function getSupabaseSqlSchema(): string {
  return `-- CIMPRES CRM & CASH FLOW ENGINE: SUPABASE POSTGRESQL SCHEMA
-- Copy & Run this SQL in your Supabase Dashboard: SQL Editor -> New Query -> Run

-- 1. CIMPRES BUSINESS STATE (Balances & 8-Account Formula)
create table if not exists public.cimpres_business_state (
  id text primary key default 'primary',
  balances jsonb not null default '{}'::jsonb,
  percentages jsonb not null default '{"C": 2, "I": 75, "M": 3, "P": 3, "R": 5, "E": 3, "S": 6, "T": 3}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default now()
);

-- 2. CRM CONTACTS
create table if not exists public.contacts (
  id text primary key,
  name text not null,
  company text default '',
  email text default '',
  phone text default '',
  type text default 'customer',
  ltv numeric default 0,
  deals_won integer default 0,
  tags text[] default '{}',
  notes text default '',
  created_at timestamp with time zone default now()
);

-- 3. SALES PIPELINE & DEALS
create table if not exists public.deals (
  id text primary key,
  name text not null,
  contact_id text references public.contacts(id) on delete set null,
  contact_name text default '',
  value numeric default 0,
  stage text default 'lead',
  probability numeric default 0.2,
  expected_close_date date,
  notes text default '',
  created_at timestamp with time zone default now()
);

-- 4. INVOICES & AUTOMATED SETTLEMENT
create table if not exists public.invoices (
  id text primary key,
  invoice_num text not null,
  contact_name text default '',
  contact_email text default '',
  total numeric default 0,
  status text default 'sent',
  issued_date date default current_date,
  due_date date,
  items jsonb default '[]'::jsonb,
  created_at timestamp with time zone default now()
);

-- 5. 8-ACCOUNT CASH FLOW TRANSACTIONS
create table if not exists public.transactions (
  id text primary key,
  type text not null,
  amount numeric not null,
  note text default '',
  date timestamp with time zone default now(),
  account_key text,
  dist jsonb
);

-- Row Level Security (RLS) policies: Allow anon / publishable key access
alter table public.cimpres_business_state enable row level security;
alter table public.contacts enable row level security;
alter table public.deals enable row level security;
alter table public.invoices enable row level security;
alter table public.transactions enable row level security;

create policy "Allow public read/write for Cimpres applet" on public.cimpres_business_state for all using (true) with check (true);
create policy "Allow public read/write for contacts" on public.contacts for all using (true) with check (true);
create policy "Allow public read/write for deals" on public.deals for all using (true) with check (true);
create policy "Allow public read/write for invoices" on public.invoices for all using (true) with check (true);
create policy "Allow public read/write for transactions" on public.transactions for all using (true) with check (true);
`;
}
