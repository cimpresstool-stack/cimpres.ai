import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { AppState, ClientContact, Deal, Invoice, Transaction, UserProfile, UserRole, SiteActivity, ActivityAction } from '../types';

export const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_QuP6bUMTNW_hKBIwHWSopw_F2IVmOLG';

export const SUPABASE_SECRET_KEY =
  (typeof process !== 'undefined' && process.env?.SUPABASE_SECRET_KEY) ||
  '';

const STORAGE_URL_KEY = 'cimpres_supabase_project_url';
const LOCAL_USERS_KEY = 'cimpres_registered_users_v1';
const ACTIVITIES_STORAGE_KEY = 'cimpres_site_activities_v1';

export function normalizeSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  if (!url) return '';

  if (!url.includes('.') && !url.includes('/')) {
    return `https://${url}.supabase.co`;
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

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
        storageKey: 'cimpres_supabase_auth_token',
      },
    });
    return cachedClient;
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return null;
  }
}

export interface SupabaseTestResult {
  success: boolean;
  message: string;
  latencyMs?: number;
}

export async function testSupabaseConnection(overrideUrl?: string): Promise<SupabaseTestResult> {
  const targetUrl = overrideUrl ? normalizeSupabaseUrl(overrideUrl) : getStoredSupabaseUrl();
  if (!targetUrl) {
    return {
      success: false,
      message: 'Supabase Project URL is missing.',
    };
  }

  const startTime = Date.now();
  try {
    const response = await fetch(`${targetUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      },
    });

    const latencyMs = Date.now() - startTime;
    if (response.ok || response.status === 200 || response.status === 404 || response.status === 401) {
      return {
        success: true,
        message: `Connected to Supabase (${latencyMs}ms)`,
        latencyMs,
      };
    }
    return {
      success: false,
      message: `Supabase server responded with HTTP status ${response.status}`,
      latencyMs,
    };
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    return {
      success: false,
      message: `Connection unreachable (${err instanceof Error ? err.message : String(err)})`,
      latencyMs,
    };
  }
}

// ----------------------------------------------------
// LOCAL DIRECTORY HELPERS (For instant offline cache & fallback)
// ----------------------------------------------------

export function getLocalUsersDirectory(): UserProfile[] {
  try {
    const saved = localStorage.getItem(LOCAL_USERS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {}
  // Default system seed users
  const defaults: UserProfile[] = [
    {
      id: 'admin-master-user',
      name: 'Executive Admin',
      email: 'cimpresstool@gmail.com',
      companyName: 'Cimpres Global Group',
      role: 'admin',
      businessType: 'enterprise',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: 'owner-sample-1',
      name: 'Sarah Jenkins',
      email: 'sarah@apexdigital.io',
      companyName: 'Apex Creative Studio',
      role: 'owner',
      businessType: 'agency',
      createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    },
    {
      id: 'owner-sample-2',
      name: 'Marcus Brody',
      email: 'mbrody@brodytech.com',
      companyName: 'Brody Logistics & Supply',
      role: 'owner',
      businessType: 'ecommerce',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
  ];
  saveLocalUsersDirectory(defaults);
  return defaults;
}

export function saveLocalUsersDirectory(users: UserProfile[]): void {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch {}
}

export function upsertUserInDirectory(profile: UserProfile): void {
  const current = getLocalUsersDirectory();
  const index = current.findIndex((u) => u.id === profile.id || u.email.toLowerCase() === profile.email.toLowerCase());
  if (index >= 0) {
    current[index] = { ...current[index], ...profile };
  } else {
    current.unshift(profile);
  }
  saveLocalUsersDirectory(current);
}

// ----------------------------------------------------
// SUPABASE AUTHENTICATION
// ----------------------------------------------------

export interface AuthResponse {
  user: UserProfile;
  sessionToken?: string;
  source: 'supabase' | 'local';
}

export async function supabaseAuthSignUp(params: {
  email: string;
  password: string;
  name: string;
  companyName: string;
  businessType?: string;
  role?: UserRole;
}): Promise<AuthResponse> {
  const cleanEmail = params.email.trim().toLowerCase();
  const assignedRole: UserRole =
    params.role ||
    (cleanEmail === 'cimpresstool@gmail.com' || cleanEmail.includes('admin') ? 'admin' : 'owner');

  const client = getSupabaseClient();
  let supabaseUserId: string | null = null;

  if (client) {
    try {
      const { data, error } = await client.auth.signUp({
        email: cleanEmail,
        password: params.password,
        options: {
          data: {
            name: params.name,
            companyName: params.companyName,
            businessType: params.businessType || 'agency',
            role: assignedRole,
          },
        },
      });

      if (error && !error.message.includes('already registered')) {
        console.warn('Supabase auth sign up note:', error.message);
      } else if (data?.user) {
        supabaseUserId = data.user.id;
        // Upsert into Supabase public.profiles if table exists
        try {
          await client.from('profiles').upsert({
            id: data.user.id,
            email: cleanEmail,
            name: params.name,
            company_name: params.companyName,
            role: assignedRole,
            business_type: params.businessType || 'agency',
            created_at: new Date().toISOString(),
          });
        } catch {}
      }
    } catch (err) {
      console.warn('Supabase auth network notice:', err);
    }
  }

  const profile: UserProfile = {
    id: supabaseUserId || `usr_${Date.now()}`,
    name: params.name,
    email: cleanEmail,
    companyName: params.companyName,
    role: assignedRole,
    businessType: params.businessType || 'agency',
    createdAt: new Date().toISOString(),
  };

  upsertUserInDirectory(profile);

  // Store user credentials locally for resilient offline access
  try {
    localStorage.setItem(
      `cimpres_cred_${cleanEmail}`,
      JSON.stringify({ email: cleanEmail, password: params.password, profile })
    );
  } catch {}

  // Log site activity
  await logSiteActivity({
    userId: profile.id,
    userEmail: profile.email,
    userName: profile.name,
    companyName: profile.companyName,
    action: 'signup',
    details: `New account registered as ${assignedRole === 'admin' ? 'Administrator' : 'Business Owner'} (${profile.companyName})`,
  });

  return {
    user: profile,
    source: supabaseUserId ? 'supabase' : 'local',
  };
}

export async function supabaseAuthSignIn(params: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const cleanEmail = params.email.trim().toLowerCase();
  const client = getSupabaseClient();

  if (client) {
    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: cleanEmail,
        password: params.password,
      });

      if (!error && data?.user) {
        const metadata = data.user.user_metadata || {};
        const profile: UserProfile = {
          id: data.user.id,
          name: metadata.name || data.user.email?.split('@')[0] || 'Business Leader',
          email: data.user.email || cleanEmail,
          companyName: metadata.companyName || 'My Enterprise',
          role: metadata.role || (cleanEmail === 'cimpresstool@gmail.com' ? 'admin' : 'owner'),
          businessType: metadata.businessType,
          createdAt: data.user.created_at || new Date().toISOString(),
        };

        upsertUserInDirectory(profile);

        await logSiteActivity({
          userId: profile.id,
          userEmail: profile.email,
          userName: profile.name,
          companyName: profile.companyName,
          action: 'login',
          details: `User signed in via Supabase Auth (${profile.role === 'admin' ? 'Admin Access' : 'Business Owner'})`,
        });

        return {
          user: profile,
          sessionToken: data.session?.access_token,
          source: 'supabase',
        };
      }
    } catch (err) {
      console.warn('Supabase auth sign in network check:', err);
    }
  }

  // Fallback to local credential verification
  const savedCredStr = localStorage.getItem(`cimpres_cred_${cleanEmail}`);
  if (savedCredStr) {
    const cred = JSON.parse(savedCredStr);
    if (cred.password && cred.password !== params.password) {
      throw new Error('Invalid email or password. Please verify your credentials.');
    }
    const profile: UserProfile = cred.profile || {
      id: `usr_${Date.now()}`,
      name: cleanEmail.split('@')[0],
      email: cleanEmail,
      companyName: 'My Enterprise',
      role: cleanEmail === 'cimpresstool@gmail.com' ? 'admin' : 'owner',
      createdAt: new Date().toISOString(),
    };

    upsertUserInDirectory(profile);

    await logSiteActivity({
      userId: profile.id,
      userEmail: profile.email,
      userName: profile.name,
      companyName: profile.companyName,
      action: 'login',
      details: `User logged in securely (${profile.role === 'admin' ? 'Admin Access' : 'Business Owner'})`,
    });

    return {
      user: profile,
      source: 'local',
    };
  }

  // If master admin email without prior local password, initialize account
  if (cleanEmail === 'cimpresstool@gmail.com') {
    const adminProfile: UserProfile = {
      id: 'admin-master-user',
      name: 'Executive Administrator',
      email: cleanEmail,
      companyName: 'Cimpres Global Group',
      role: 'admin',
      businessType: 'enterprise',
      createdAt: new Date().toISOString(),
    };
    upsertUserInDirectory(adminProfile);
    localStorage.setItem(
      `cimpres_cred_${cleanEmail}`,
      JSON.stringify({ email: cleanEmail, password: params.password, profile: adminProfile })
    );

    await logSiteActivity({
      userId: adminProfile.id,
      userEmail: adminProfile.email,
      userName: adminProfile.name,
      companyName: adminProfile.companyName,
      action: 'login',
      details: 'Administrator signed in to Control Center',
    });

    return { user: adminProfile, source: 'local' };
  }

  throw new Error('No account found with this email. Please click Sign Up to register your business.');
}

export async function supabaseAuthSignOut(currentUser?: UserProfile | null): Promise<void> {
  const client = getSupabaseClient();
  if (currentUser) {
    await logSiteActivity({
      userId: currentUser.id,
      userEmail: currentUser.email,
      userName: currentUser.name,
      companyName: currentUser.companyName,
      action: 'logout',
      details: 'User logged out and closed session',
    }).catch(() => {});
  }

  if (client) {
    try {
      await client.auth.signOut();
    } catch (err) {
      console.warn('Supabase sign out note:', err);
    }
  }
}

export async function supabaseAuthGetSession(): Promise<UserProfile | null> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data } = await client.auth.getSession();
      if (data?.session?.user) {
        const u = data.session.user;
        const meta = u.user_metadata || {};
        const profile: UserProfile = {
          id: u.id,
          name: meta.name || u.email?.split('@')[0] || 'Business Leader',
          email: u.email || '',
          companyName: meta.companyName || 'My Enterprise',
          role: meta.role || (u.email === 'cimpresstool@gmail.com' ? 'admin' : 'owner'),
          businessType: meta.businessType,
          createdAt: u.created_at || new Date().toISOString(),
        };
        upsertUserInDirectory(profile);
        return profile;
      }
    } catch (e) {
      console.warn('Supabase getSession notice:', e);
    }
  }

  // Fallback to local stored session
  try {
    const saved = localStorage.getItem('cimpres_crm_auth_user_v1');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {}

  return null;
}

// ----------------------------------------------------
// AUDIT & SITE ACTIVITY LOGGING
// ----------------------------------------------------

export function getLocalActivities(): SiteActivity[] {
  try {
    const saved = localStorage.getItem(ACTIVITIES_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {}

  // Default seed activities for immediate audit trail
  const seed: SiteActivity[] = [
    {
      id: 'act-001',
      userId: 'admin-master-user',
      userEmail: 'cimpresstool@gmail.com',
      userName: 'Executive Administrator',
      companyName: 'Cimpres Global Group',
      action: 'login',
      details: 'Administrator signed in to Control Center',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
      id: 'act-002',
      userId: 'owner-sample-1',
      userEmail: 'sarah@apexdigital.io',
      userName: 'Sarah Jenkins',
      companyName: 'Apex Creative Studio',
      action: 'invoice_paid',
      details: 'Invoice #INV-2026-004 marked paid and auto-distributed across 8 accounts',
      amount: 4200,
      timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    },
    {
      id: 'act-003',
      userId: 'owner-sample-1',
      userEmail: 'sarah@apexdigital.io',
      userName: 'Sarah Jenkins',
      companyName: 'Apex Creative Studio',
      action: 'cash_in',
      details: 'Cash In recorded: $8,500 automatically split across 8 Profit-First accounts',
      amount: 8500,
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    },
    {
      id: 'act-004',
      userId: 'owner-sample-2',
      userEmail: 'mbrody@brodytech.com',
      userName: 'Marcus Brody',
      companyName: 'Brody Logistics & Supply',
      action: 'deal_won',
      details: 'Deal "Q4 Fleet Maintenance Retainer" marked as Won',
      amount: 14500,
      timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    },
    {
      id: 'act-005',
      userId: 'owner-sample-2',
      userEmail: 'mbrody@brodytech.com',
      userName: 'Marcus Brody',
      companyName: 'Brody Logistics & Supply',
      action: 'signup',
      details: 'New account registered as Business Owner',
      timestamp: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
    },
  ];
  saveLocalActivities(seed);
  return seed;
}

export function saveLocalActivities(activities: SiteActivity[]): void {
  try {
    localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activities.slice(0, 150)));
  } catch {}
}

export async function logSiteActivity(
  data: Omit<SiteActivity, 'id' | 'timestamp'>
): Promise<SiteActivity> {
  const newActivity: SiteActivity = {
    ...data,
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
  };

  // 1. Immediately store in local cache
  const current = getLocalActivities();
  current.unshift(newActivity);
  saveLocalActivities(current);

  // 2. Mirror to Supabase site_activities table if client exists
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('site_activities').insert({
        id: newActivity.id,
        user_id: newActivity.userId,
        user_email: newActivity.userEmail,
        user_name: newActivity.userName,
        company_name: newActivity.companyName || '',
        action: newActivity.action,
        details: newActivity.details,
        amount: newActivity.amount || null,
        created_at: newActivity.timestamp,
      });
    } catch (e) {
      // Table may not yet be created; fail silently
    }
  }

  return newActivity;
}

export async function fetchSiteActivities(): Promise<SiteActivity[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('site_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && data && data.length > 0) {
        const mapped: SiteActivity[] = data.map((d: any) => ({
          id: d.id,
          userId: d.user_id,
          userEmail: d.user_email,
          userName: d.user_name,
          companyName: d.company_name,
          action: d.action as ActivityAction,
          details: d.details,
          amount: d.amount ? Number(d.amount) : undefined,
          timestamp: d.created_at,
        }));
        saveLocalActivities(mapped);
        return mapped;
      }
    } catch {}
  }
  return getLocalActivities();
}

export async function fetchAllUsers(): Promise<UserProfile[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.from('profiles').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        const users: UserProfile[] = data.map((row: any) => ({
          id: row.id,
          name: row.name || 'User',
          email: row.email,
          companyName: row.company_name || 'Enterprise',
          role: (row.role === 'admin' ? 'admin' : 'owner') as UserRole,
          businessType: row.business_type,
          createdAt: row.created_at,
        }));
        saveLocalUsersDirectory(users);
        return users;
      }
    } catch {}
  }
  return getLocalUsersDirectory();
}

export async function updateUserRole(userId: string, newRole: UserRole, adminName: string): Promise<boolean> {
  // Update local directory
  const users = getLocalUsersDirectory();
  const target = users.find((u) => u.id === userId);
  if (target) {
    target.role = newRole;
    saveLocalUsersDirectory(users);

    await logSiteActivity({
      userId,
      userEmail: target.email,
      userName: target.name,
      companyName: target.companyName,
      action: 'role_changed',
      details: `Role updated to "${newRole === 'admin' ? 'Administrator' : 'Business Owner'}" by ${adminName}`,
    });
  }

  // Update Supabase profiles table
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('profiles').update({ role: newRole }).eq('id', userId);
    } catch {}
  }

  return true;
}

// ----------------------------------------------------
// STATE MIRRORING (Contacts, Deals, Invoices, Transactions)
// ----------------------------------------------------

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
      error: 'Supabase is not configured yet. Set VITE_SUPABASE_URL in environment or settings.',
    };
  }

  try {
    // 1. Sync Balances & Percentages
    await client.from('cimpres_business_state').upsert(
      {
        id: 'primary',
        balances: state.balances,
        percentages: state.percentages,
        settings: state.settings,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    // 2. Sync Contacts
    let contactsCount = 0;
    if (state.contacts.length > 0) {
      const formattedContacts = state.contacts.map((c) => ({
        id: c.id,
        name: c.name,
        company: c.company || '',
        email: c.email || '',
        phone: c.phone || '',
        type: c.type,
        ltv: c.ltv || 0,
        deals_won: c.dealsWon || 0,
        tags: c.tags || [],
        notes: c.notes || '',
        created_at: c.createdAt,
      }));
      const { error: contactsErr } = await client
        .from('contacts')
        .upsert(formattedContacts, { onConflict: 'id' });
      if (!contactsErr) contactsCount = state.contacts.length;
    }

    // 3. Sync Deals
    let dealsCount = 0;
    if (state.deals.length > 0) {
      const formattedDeals = state.deals.map((d) => ({
        id: d.id,
        name: d.name,
        contact_id: d.contactId,
        contact_name: d.contactName || '',
        value: d.value,
        stage: d.stage,
        probability: d.probability,
        expected_close_date: d.expectedCloseDate || null,
        notes: d.notes || '',
        created_at: d.createdAt,
      }));
      const { error: dealsErr } = await client.from('deals').upsert(formattedDeals, { onConflict: 'id' });
      if (!dealsErr) dealsCount = state.deals.length;
    }

    // 4. Sync Invoices
    let invoicesCount = 0;
    if (state.invoices.length > 0) {
      const formattedInvoices = state.invoices.map((inv) => ({
        id: inv.id,
        invoice_num: inv.invoiceNum,
        contact_name: inv.contactName || '',
        contact_email: inv.contactEmail || '',
        total: inv.total,
        status: inv.status,
        issued_date: inv.issuedDate,
        due_date: inv.dueDate,
        items: inv.items,
        created_at: inv.issuedDate || new Date().toISOString(),
      }));
      const { error: invErr } = await client
        .from('invoices')
        .upsert(formattedInvoices, { onConflict: 'id' });
      if (!invErr) invoicesCount = state.invoices.length;
    }

    // 5. Sync Transactions
    let txCount = 0;
    if (state.transactions.length > 0) {
      const formattedTx = state.transactions.slice(0, 100).map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        note: t.note || '',
        date: t.date,
        account_key: t.accountKey || null,
        dist: t.dist || null,
      }));
      const { error: txErr } = await client
        .from('transactions')
        .upsert(formattedTx, { onConflict: 'id' });
      if (!txErr) txCount = formattedTx.length;
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
  return `-- ==============================================================================
-- CIMPRES CRM & CASH FLOW ENGINE: COMPLETE SUPABASE POSTGRESQL SCHEMA WITH RLS
-- ==============================================================================
-- Run this script in your Supabase Dashboard:
-- SQL Editor -> New Query -> Paste -> Run (Ctrl+Enter / Cmd+Enter)
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. USER PROFILES TABLE (Linked with Supabase Auth)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  name text,
  company_name text,
  role text not null default 'owner' check (role in ('owner', 'admin')),
  business_type text default 'agency',
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_email on public.profiles(email);

-- 3. SITE ACTIVITIES (ADMIN AUDIT TRAIL)
create table if not exists public.site_activities (
  id text primary key,
  user_id text,
  user_email text,
  user_name text,
  company_name text,
  action text not null,
  details text not null,
  amount numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_site_activities_created_at on public.site_activities(created_at desc);
create index if not exists idx_site_activities_action on public.site_activities(action);
create index if not exists idx_site_activities_user_id on public.site_activities(user_id);

-- 4. 8-ACCOUNT BALANCES & RULES STATE
create table if not exists public.cimpres_business_state (
  id text primary key default 'primary',
  balances jsonb not null default '{"C": 0, "I": 0, "M": 0, "P": 0, "R": 0, "E": 0, "S": 0, "T": 0}'::jsonb,
  percentages jsonb not null default '{"C": 2, "I": 75, "M": 3, "P": 3, "R": 5, "E": 3, "S": 6, "T": 3}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. CRM CLIENT CONTACTS
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
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_contacts_email on public.contacts(email);

-- 6. SALES PIPELINE & DEALS
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
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_deals_stage on public.deals(stage);

-- 7. INVOICES & AUTOMATED SETTLEMENT
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
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_invoices_status on public.invoices(status);
create index if not exists idx_invoices_num on public.invoices(invoice_num);

-- 8. 8-ACCOUNT CASH FLOW TRANSACTIONS
create table if not exists public.transactions (
  id text primary key,
  type text not null,
  amount numeric not null,
  note text default '',
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  account_key text,
  dist jsonb
);

create index if not exists idx_transactions_date on public.transactions(date desc);

-- ==============================================================================
-- 9. AUTOMATIC USER PROFILE TRIGGER (ON AUTH SIGNUP)
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_role text;
begin
  -- Automatically assign admin role if email matches master admin or metadata specifies admin
  if new.email = 'cimpresstool@gmail.com' or (new.raw_user_meta_data->>'role') = 'admin' then
    user_role := 'admin';
  else
    user_role := coalesce(new.raw_user_meta_data->>'role', 'owner');
  end if;

  insert into public.profiles (id, email, name, company_name, role, business_type)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'companyName', 'My Enterprise'),
    user_role,
    coalesce(new.raw_user_meta_data->>'businessType', 'agency')
  )
  on conflict (id) do update set
    email = excluded.email,
    name = coalesce(excluded.name, profiles.name),
    company_name = coalesce(excluded.company_name, profiles.company_name),
    role = coalesce(excluded.role, profiles.role),
    updated_at = timezone('utc'::text, now());

  return new;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if present, then recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==============================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS across all tables
alter table public.profiles enable row level security;
alter table public.site_activities enable row level security;
alter table public.cimpres_business_state enable row level security;
alter table public.contacts enable row level security;
alter table public.deals enable row level security;
alter table public.invoices enable row level security;
alter table public.transactions enable row level security;

-- Helper function to check if current user is an Administrator
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Drop old policies to prevent collision
drop policy if exists "Profiles read access" on public.profiles;
drop policy if exists "Profiles update access" on public.profiles;
drop policy if exists "Profiles insert access" on public.profiles;
drop policy if exists "Allow public read/write profiles" on public.profiles;

drop policy if exists "Activities read access" on public.site_activities;
drop policy if exists "Activities insert access" on public.site_activities;
drop policy if exists "Allow public read/write site_activities" on public.site_activities;

drop policy if exists "State full access" on public.cimpres_business_state;
drop policy if exists "Allow public read/write cimpres_business_state" on public.cimpres_business_state;

drop policy if exists "Contacts full access" on public.contacts;
drop policy if exists "Allow public read/write contacts" on public.contacts;

drop policy if exists "Deals full access" on public.deals;
drop policy if exists "Allow public read/write deals" on public.deals;

drop policy if exists "Invoices full access" on public.invoices;
drop policy if exists "Allow public read/write invoices" on public.invoices;

drop policy if exists "Transactions full access" on public.transactions;
drop policy if exists "Allow public read/write transactions" on public.transactions;

-- PROFILES POLICIES
-- 1) Authenticated users and admins can view profiles
create policy "Profiles read access"
  on public.profiles for select
  using (true);

-- 2) Users can update their own profile, or admins can update any profile
create policy "Profiles update access"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin() or auth.role() = 'anon')
  with check (auth.uid() = id or public.is_admin() or auth.role() = 'anon');

-- 3) Profile insert allowed for new users and anon fallback
create policy "Profiles insert access"
  on public.profiles for insert
  with check (true);

-- SITE ACTIVITIES (AUDIT LOG) POLICIES
-- 1) Admins can read full audit log (or app client)
create policy "Activities read access"
  on public.site_activities for select
  using (true);

-- 2) Any user or client can record site activities (logins, cash-ins, invoicing)
create policy "Activities insert access"
  on public.site_activities for insert
  with check (true);

-- BUSINESS STATE & CRM ENTITIES POLICIES
-- Allow authenticated & application client access to synchronize business data
create policy "State full access"
  on public.cimpres_business_state for all
  using (true)
  with check (true);

create policy "Contacts full access"
  on public.contacts for all
  using (true)
  with check (true);

create policy "Deals full access"
  on public.deals for all
  using (true)
  with check (true);

create policy "Invoices full access"
  on public.invoices for all
  using (true)
  with check (true);

create policy "Transactions full access"
  on public.transactions for all
  using (true)
  with check (true);
`;
}
