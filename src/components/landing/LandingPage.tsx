import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  PieChart,
  DollarSign,
  Receipt,
  Users,
  Sparkles,
  BarChart3,
  Lock,
  ChevronDown,
  Building2,
  Calendar,
  Layers,
  ArrowDownRight,
  Star,
  Check,
  Zap,
  Clock,
  Briefcase,
  Play,
  CreditCard,
  Link2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ACCOUNTS, formatCurrency, formatCompactCurrency } from '../../data/constants';
import { AccountKey } from '../../types';

export const LandingPage: React.FC = () => {
  const {
    openAuthModal,
    quickDemoLogin,
    isAuthenticated,
    setIsLandingPageActive,
    currentUser,
  } = useApp();

  // Hero Simulator state
  const [simulatorAmount, setSimulatorAmount] = useState<number>(10000);
  const [customInput, setCustomInput] = useState<string>('10000');

  // ROI Calculator state
  const [monthlyRev, setMonthlyRev] = useState<number>(45000);
  const [targetProfitPct, setTargetProfitPct] = useState<number>(20);

  // FAQ open states
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Active feature tab
  const [activeFeatureTab, setActiveFeatureTab] = useState<'distribution' | 'invoicing' | 'paylinks' | 'reporting'>('distribution');

  const handleAmountSelect = (val: number) => {
    setSimulatorAmount(val);
    setCustomInput(val.toString());
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setCustomInput(raw);
    const num = Number(raw) || 0;
    setSimulatorAmount(num);
  };

  // 7 Account distribution calculations
  const simDistribution = {
    P: Math.round(simulatorAmount * 0.20), // Ring-fenced profit
    S: Math.round(simulatorAmount * 0.25), // Salaries & Payroll
    I: Math.round(simulatorAmount * 0.25), // Input Costs / COGS
    M: Math.round(simulatorAmount * 0.10), // Marketing
    E: Math.round(simulatorAmount * 0.10), // Daily Expenses
    R: Math.round(simulatorAmount * 0.05), // Rent & Facilities
    C: Math.round(simulatorAmount * 0.05), // Cash In Clearing
  };

  // ROI Calculations
  const annualRev = monthlyRev * 12;
  const annualProfitLocked = Math.round(annualRev * (targetProfitPct / 100));
  const payrollReserveAnnual = Math.round(annualRev * 0.25);
  const taxSafeBuffer = Math.round(annualRev * 0.10);

  const faqs = [
    {
      q: 'Why is Cimpres 100% free for everyone?',
      a: 'We believe every founder and business owner deserves financial clarity and discipline without paying $100s/month in recurring SaaS subscription fees. Cimpres is completely free forever. There are no trials, no credit card requirements, and no artificial paywalls.',
    },
    {
      q: 'How is Cimpres different from traditional accounting tools like QuickBooks or Xero?',
      a: 'Traditional accounting tools are backward-looking ledgers that record what already happened weeks ago. Cimpres is a forward-operating financial engine. The moment cash arrives or an invoice is settled, Cimpres automatically splits the money into 7 dedicated reserves (Profit, Payroll, Rent, Input Costs, Marketing, Overhead, Cash-In). This prevents cash-flow illusions and ensures you never accidentally spend payroll or tax money on daily expenses.',
    },
    {
      q: 'Can our business customize the 7 allocation accounts and percentage splits?',
      a: 'Yes! While the Cimpres default formula (20% Profit, 25% Payroll, 25% Input Costs, 10% Marketing, 10% Overhead, 5% Rent, 5% Clearing) is mathematically optimized for high-growth service agencies and B2B firms, you can adjust targets and percentage allocations in your Settings anytime.',
    },
    {
      q: 'How does automated invoicing and instant payment collection work?',
      a: 'You can generate professional itemized invoices in seconds and send one-click shareable payment links to your clients via Email, SMS, or WhatsApp. When an invoice is paid, Cimpres logs the transaction and automatically splits the funds into your 7 reserve accounts.',
    },
    {
      q: 'Do I need to enter credit card details to start or test drive?',
      a: 'No credit card is required. You can either create a free account with your email or click "Instant Demo Access" to immediately test drive the full system loaded with realistic ledger balances, invoices, and allocation records.',
    },
    {
      q: 'Is our financial data private and secure?',
      a: 'Yes. All data is protected with enterprise-grade AES-256 local and cloud encryption. We adhere to SOC2 security principles, and your records persist securely in your dedicated environment.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. TOP ANNOUNCEMENT BANNER */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-blue-800 text-white text-xs sm:text-sm py-2 px-4 text-center font-medium border-b border-emerald-600/40 flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
        <span>
          <strong className="font-bold">100% Free Forever:</strong> The Automated 7-Account Cash Flow OS & Invoicing Engine is now free for every business.
        </span>
        <button
          onClick={() => openAuthModal('signup')}
          className="underline font-bold hover:text-emerald-100 ml-1 cursor-pointer"
        >
          Get Free Access →
        </button>
      </div>

      {/* 2. STICKY NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-teal-500 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-blue-500/25">
              C
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-white tracking-tight">Cimpres</span>
                <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  100% FREE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">7-Account Cash Flow Operating System</p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-300">
            <a href="#simulator" className="hover:text-white transition">7-Account Engine</a>
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#calculator" className="hover:text-white transition">Profit ROI</a>
            <a href="#pricing" className="hover:text-white transition">Why 100% Free?</a>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
          </nav>

          {/* Nav Right CTA */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => setIsLandingPageActive(false)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-md shadow-blue-600/30 transition cursor-pointer"
                id="landing-btn-enter-workspace"
              >
                <span>Enter Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
                  id="landing-nav-login"
                >
                  Log In
                </button>
                <button
                  onClick={quickDemoLogin}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer"
                  id="landing-nav-demo"
                  title="One click instant demo"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Instant Demo</span>
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/25 transition cursor-pointer"
                  id="landing-nav-signup"
                >
                  <span>Get Free Access</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative pt-12 pb-20 sm:pt-16 sm:pb-28 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[300px] bg-teal-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-bold mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>THE 100% FREE FINANCIAL OPERATING SYSTEM • NO SUBSCRIPTIONS</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12] mb-6">
              Never Run Short on Payroll, Rent, or Taxes Again.
            </h1>

            {/* Subhead */}
            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed font-normal mb-8">
              Traditional accounting looks backwards at history. <strong className="text-white font-semibold">Cimpres</strong> is <span className="text-emerald-400 font-bold">100% free</span> and automatically splits every client payment across <span className="text-blue-400 font-semibold">7 dedicated reserves</span> in real time—locking in founder profit first, automating invoices, and ending cash flow surprises forever.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <button
                onClick={() => openAuthModal('signup')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-base shadow-xl shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
                id="hero-btn-start-trial"
              >
                <span>Get Instant Free Access</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={quickDemoLogin}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-white font-bold text-base border border-slate-700 shadow-lg hover:border-slate-600 transition cursor-pointer"
                id="hero-btn-instant-demo"
              >
                <Zap className="w-5 h-5 text-amber-400" />
                <span>Test Drive Live System (1-Click)</span>
              </button>
            </div>

            {/* Trust Microcopy */}
            <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>100% Free forever</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Instant 7-account setup</span>
              </div>
            </div>
          </div>

          {/* 4. INTERACTIVE LIVE HERO WIDGET: THE 7-ACCOUNT CASH IN SPLIT SIMULATOR */}
          <div id="simulator" className="max-w-5xl mx-auto">
            <div className="bg-slate-800/90 backdrop-blur-xl rounded-3xl border border-slate-700 shadow-2xl p-6 sm:p-8 lg:p-10 relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-700/80">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Live Interactive Simulation
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    See the Cimpres 7-Account Distribution in Action
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Choose or enter any client payment amount to watch the instant automatic segregation:
                  </p>
                </div>

                {/* Amount Quick Presets & Input */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  {[5000, 10000, 25000, 50000].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handleAmountSelect(preset)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        simulatorAmount === preset
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-700/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      ${(preset / 1000).toFixed(0)}k
                    </button>
                  ))}

                  <div className="relative flex-1 sm:w-36">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">$</span>
                    <input
                      type="text"
                      value={customInput}
                      onChange={handleCustomInputChange}
                      className="w-full pl-6 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-blue-500 text-right"
                      placeholder="Custom"
                    />
                  </div>
                </div>
              </div>

              {/* Total Inflow Header */}
              <div className="my-6 p-4 rounded-2xl bg-slate-900/80 border border-slate-700/60 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <ArrowDownRight className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                      Client Payment Inflow
                    </span>
                    <p className="text-2xl font-black text-white">
                      {formatCurrency(simulatorAmount, 'USD')}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    Distribution Protocol
                  </span>
                  <p className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 justify-end">
                    <ShieldCheck className="w-4 h-4" />
                    <span>100% Segregated & Ring-Fenced</span>
                  </p>
                </div>
              </div>

              {/* 7 Accounts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Ring-Fenced Profit */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300">
                      [P] Profit (20%)
                    </span>
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <p className="text-xl font-black text-white">
                    {formatCurrency(simDistribution.P, 'USD')}
                  </p>
                  <p className="text-[11px] text-amber-200/80 mt-1">
                    Locked for founder dividends & reserves first.
                  </p>
                </div>

                {/* 2. Salaries & Payroll */}
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300">
                      [S] Payroll (25%)
                    </span>
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <p className="text-xl font-black text-white">
                    {formatCurrency(simDistribution.S, 'USD')}
                  </p>
                  <p className="text-[11px] text-indigo-200/80 mt-1">
                    Directly protects team compensation.
                  </p>
                </div>

                {/* 3. Input Costs (COGS) */}
                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300">
                      [I] Input Costs (25%)
                    </span>
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <p className="text-xl font-black text-white">
                    {formatCurrency(simDistribution.I, 'USD')}
                  </p>
                  <p className="text-[11px] text-blue-200/80 mt-1">
                    Contractors, production & raw materials.
                  </p>
                </div>

                {/* 4. Marketing */}
                <div className="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-300">
                      [M] Marketing (10%)
                    </span>
                    <TrendingUp className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                  <p className="text-xl font-black text-white">
                    {formatCurrency(simDistribution.M, 'USD')}
                  </p>
                  <p className="text-[11px] text-violet-200/80 mt-1">
                    Continuous client acquisition budget.
                  </p>
                </div>

                {/* 5. Daily Expenses */}
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300">
                      [E] Expenses (10%)
                    </span>
                    <DollarSign className="w-3.5 h-3.5 text-rose-400" />
                  </div>
                  <p className="text-xl font-black text-white">
                    {formatCurrency(simDistribution.E, 'USD')}
                  </p>
                  <p className="text-[11px] text-rose-200/80 mt-1">
                    SaaS subscriptions, utilities, legal.
                  </p>
                </div>

                {/* 6. Rent Reserve */}
                <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300">
                      [R] Rent Reserve (5%)
                    </span>
                    <Building2 className="w-3.5 h-3.5 text-teal-400" />
                  </div>
                  <p className="text-xl font-black text-white">
                    {formatCurrency(simDistribution.R, 'USD')}
                  </p>
                  <p className="text-[11px] text-teal-200/80 mt-1">
                    Premises & facilities buffer.
                  </p>
                </div>

                {/* 7. Cash In Clearing */}
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 sm:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">
                      [C] Cash In Clearing (5%)
                    </span>
                    <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <p className="text-xl font-black text-white">
                    {formatCurrency(simDistribution.C, 'USD')}
                  </p>
                  <p className="text-[11px] text-emerald-200/80 mt-1">
                    Operating liquidity buffer & transaction reconciliation.
                  </p>
                </div>
              </div>

              {/* Bottom interactive action */}
              <div className="mt-6 pt-5 border-t border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300">
                <span className="text-center sm:text-left">
                  Ready to deploy this automated methodology across your client invoices and team?
                </span>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <span>Apply to My Business</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CREDIBILITY & SOCIAL PROOF METRICS BAR */}
      <section className="bg-slate-950 py-12 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">
            TRUSTED BY 1,420+ FOUNDER-LED AGENCIES, CONSULTANCIES & B2B ENTERPRISES
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">$48.2M+</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Inflows Distributed Safely</p>
            </div>
            <div className="p-4">
              <p className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">99.8%</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Payroll Reserves Met Ahead</p>
            </div>
            <div className="p-4">
              <p className="text-3xl sm:text-4xl font-black text-blue-400 tracking-tight">1,420+</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Active High-Growth Firms</p>
            </div>
            <div className="p-4">
              <p className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight">4.9 / 5</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Founder & CFO Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. THE CORE PROBLEM VS CIMPRES SOLUTION */}
      <section className="py-20 sm:py-28 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">
              THE FATAL FLAW OF MODERN BUSINESS
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Why 82% of Businesses Fail Despite "Strong Revenue"
            </h3>
            <p className="text-base text-slate-300 mt-4 leading-relaxed">
              When all incoming client revenue dumps into a single bank account, you experience false financial comfort. You spend on growth today, only to panic when month-end payroll and quarterly taxes arrive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* The Old Broken Way */}
            <div className="bg-rose-950/20 border border-rose-500/30 rounded-3xl p-6 sm:p-8 relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold mb-6">
                <span>✕ THE TRADITIONAL BANK ACCOUNT TRAP</span>
              </div>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✕</span>
                  <span><strong>One Giant Pool of Cash:</strong> Revenue, payroll, tax reserves, and contractor costs sit mixed together in one checking account.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✕</span>
                  <span><strong>Month-End Payroll Panic:</strong> Checking the account balance on the 25th and discovering unexpected shortfalls.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✕</span>
                  <span><strong>Disconnected Spreadsheets:</strong> CRM deals are recorded in one tool, invoices in another, and manual cash guesses in Excel.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✕</span>
                  <span><strong>Zero True Founder Profit:</strong> Founder only takes whatever little cash happens to be left over at year-end.</span>
                </li>
              </ul>
            </div>

            {/* The Cimpres Engine */}
            <div className="bg-blue-950/30 border border-blue-500/40 rounded-3xl p-6 sm:p-8 relative shadow-xl shadow-blue-500/10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold mb-6">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>✓ THE CIMPRES 7-ACCOUNT DISCIPLINE</span>
              </div>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</span>
                  <span><strong>Automated Inflow Segregation:</strong> Every client payment is partitioned into dedicated reserves the exact second it lands.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</span>
                  <span><strong>Profit Ring-Fenced First:</strong> Your 20% founder profit is segregated first, protecting the true bottom line.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</span>
                  <span><strong>Automated Invoicing & Instant Allocation:</strong> Create invoices, send payment links, and partition cash across all 7 accounts automatically the moment settlement occurs.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</span>
                  <span><strong>Predictive Cash Radar:</strong> Continuous 30/60/90-day cash projections blend current account balances with anticipated invoice settlements to prevent shortfalls.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOUR CORE ARCHITECTURAL PILLARS (DEEP DIVE TABS) */}
      <section id="features" className="py-20 sm:py-28 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">
              COMPLETE OPERATING SUITE
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Everything Needed to Scale Profitably in One Screen
            </h3>
            <p className="text-base text-slate-400 mt-3">
              Replace messy spreadsheets and disconnected invoicing tools with a unified 100% free cash flow cockpit.
            </p>

            {/* Feature Tabs Switcher */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
              {[
                { id: 'distribution', label: '7-Account Distribution', icon: PieChart },
                { id: 'invoicing', label: 'Automated Invoicing', icon: Receipt },
                { id: 'paylinks', label: 'Payment Links & Settlement', icon: CreditCard },
                { id: 'reporting', label: 'Real-Time Financial Reports', icon: BarChart3 },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeFeatureTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFeatureTab(tab.id as any)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feature Showcase Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 max-w-5xl mx-auto">
            {activeFeatureTab === 'distribution' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold mb-4">
                    <span>CIMPRES METHODOLOGY</span>
                  </div>
                  <h4 className="text-2xl font-black text-white mb-4">
                    The 7-Account Distribution Engine
                  </h4>
                  <p className="text-slate-300 text-sm leading-relaxed mb-6">
                    Every payment that touches your company is partitioned according to strict business math. You always know exactly how much you can spend on team bonuses, ads, and office space without risking financial stability.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Dedicated target progress trackers for monthly Rent & Payroll</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Instant audit ledger tracking every allocation, transfer, and payout</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Customizable account targets tailored to your operating model</span>
                    </div>
                  </div>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition cursor-pointer"
                  >
                    <span>Test the Engine Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between text-xs text-slate-400 pb-2 border-b border-slate-800 font-semibold">
                    <span>ACCOUNT ALLOCATION</span>
                    <span>SHARE & TARGET</span>
                  </div>
                  {ACCOUNTS.map((acc) => (
                    <div key={acc.key} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <span className={`text-xs font-black px-2 py-0.5 rounded ${acc.badgeBg} ${acc.badgeText}`}>
                          [{acc.key}]
                        </span>
                        <div>
                          <p className="text-xs font-bold text-white">{acc.name}</p>
                          <p className="text-[10px] text-slate-400">{acc.short}</p>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-blue-400">{acc.defaultPct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeFeatureTab === 'invoicing' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-4">
                    <span>ZERO MANUAL DATA ENTRY</span>
                  </div>
                  <h4 className="text-2xl font-black text-white mb-4">
                    Automated Pipeline-to-Invoice Generation
                  </h4>
                  <p className="text-slate-300 text-sm leading-relaxed mb-6">
                    Close a deal in the CRM and watch an invoice generate automatically with items, taxes, and a payment link. When the client pays, Cimpres immediately distributes the cash across the 7 accounts.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>One-click shareable payment links sent via SMS, Email, or WhatsApp</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Professional printable and exportable itemized invoices</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Built-in payment simulator to test invoice settlement workflows</span>
                    </div>
                  </div>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition cursor-pointer"
                  >
                    <span>Create Your First Invoice</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-400">INVOICE #INV-2026-089</span>
                      <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                        PAID & DISTRIBUTED
                      </span>
                    </div>
                    <p className="text-base font-bold text-white">Brand Strategy & UX Architecture</p>
                    <p className="text-xs text-slate-400">Client: Nexus Global Media • $12,500.00</p>
                    <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Split to 7 accounts complete</span>
                      </span>
                      <span className="text-slate-400">Paid via Stripe Link</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-400">INVOICE #INV-2026-090</span>
                      <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                        PENDING PAYMENT
                      </span>
                    </div>
                    <p className="text-base font-bold text-white">Full-Stack Cloud Implementation</p>
                    <p className="text-xs text-slate-400">Client: Horizon Health • $18,000.00</p>
                    <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                      <span className="text-slate-400">Payment link active</span>
                      <span className="text-blue-400 font-semibold">Due in 5 days</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'paylinks' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-bold mb-4">
                    <span>INSTANT BILLING & COLLECTION</span>
                  </div>
                  <h4 className="text-2xl font-black text-white mb-4">
                    Payment Links & Instant Cash Allocation
                  </h4>
                  <p className="text-slate-300 text-sm leading-relaxed mb-6">
                    Collect payments effortlessly with one-click shareable checkout links sent via Email, SMS, or WhatsApp. The exact moment an invoice is settled, Cimpres automatically partitions the funds across all 7 accounts in real time.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>One-click shareable links supporting Cards, Wire, and Bank Transfers</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Instant automated deposit recognition and 7-way account segregation</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Zero software platform fees — 100% free forever for all businesses</span>
                    </div>
                  </div>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm transition cursor-pointer"
                  >
                    <span>Test Payment Links Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
                  <div className="p-4 rounded-xl bg-slate-900 border border-teal-500/30">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
                        <Link2 className="w-3.5 h-3.5" />
                        <span>SHAREABLE PAYMENT LINK ACTIVE</span>
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                        1-Click Ready
                      </span>
                    </div>
                    <p className="text-base font-bold text-white">Full-Stack Cloud Infrastructure</p>
                    <p className="text-xs text-slate-400">Client: Horizon Health • $18,500.00</p>
                    <div className="mt-3 p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs space-y-1.5">
                      <div className="flex justify-between text-slate-300">
                        <span>Automated 20% Profit:</span>
                        <span className="text-amber-400 font-bold">$3,700.00</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Automated 25% Payroll:</span>
                        <span className="text-indigo-400 font-bold">$4,625.00</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>COGS, Tax & Reserves:</span>
                        <span className="text-blue-400 font-bold">$10,175.00</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Instant Payment Simulator</p>
                      <p className="text-[11px] text-slate-400">Test one-click settlement with live test data</p>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/30">
                      Live Simulation
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'reporting' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold mb-4">
                    <span>LIVE EXECUTIVE P&L</span>
                  </div>
                  <h4 className="text-2xl font-black text-white mb-4">
                    Real-Time Financial Reports & Predictive Radar
                  </h4>
                  <p className="text-slate-300 text-sm leading-relaxed mb-6">
                    Stop waiting for the accountant to close the books 3 weeks after the month ends. See your continuous income statement, 6-month cash curve, and 30/60/90-day predictive runway instantly.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Executive P&L Statement separating direct COGS from net ring-fenced profit</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Interactive "What-If" Scenario Simulator for pricing and hiring stress tests</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>One-click CSV ledger export and print-ready executive summaries</span>
                    </div>
                  </div>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm transition cursor-pointer"
                  >
                    <span>View Financial Reports</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-slate-400">P&L SUMMARY (CURRENT PERIOD)</span>
                    <span className="text-xs font-bold text-emerald-400">REAL-TIME</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Gross Cash Inflow:</span>
                      <span className="font-bold text-white">$142,500</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Input Costs (COGS 25%):</span>
                      <span className="text-blue-400 font-bold">-$35,625</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Payroll & Salaries (25%):</span>
                      <span className="text-indigo-400 font-bold">-$35,625</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Marketing & Acquisition (10%):</span>
                      <span className="text-violet-400 font-bold">-$14,250</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Rent & Overhead (15%):</span>
                      <span className="text-rose-400 font-bold">-$21,375</span>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex justify-between font-black text-sm">
                      <span className="text-amber-400">Net Ring-Fenced Profit (20%):</span>
                      <span className="text-amber-400">$28,500</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 8. INTERACTIVE REVENUE & PROFIT ROI CALCULATOR */}
      <section id="calculator" className="py-20 sm:py-28 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">
              YOUR PROJECTED FINANCIAL DISCIPLINE
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Interactive Cash Flow & Profit Reserve Calculator
            </h3>
            <p className="text-base text-slate-300 mt-4">
              Slide to your expected monthly gross revenue to see how much founder profit and payroll security Cimpres will ring-fence for your business over 12 months.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10">
            {/* Slider controls */}
            <div className="mb-10 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-bold text-white">
                    Estimated Monthly Gross Revenue:
                  </label>
                  <span className="text-2xl font-black text-blue-400">
                    {formatCurrency(monthlyRev, 'USD')} / mo
                  </span>
                </div>
                <input
                  type="range"
                  min={10000}
                  max={250000}
                  step={5000}
                  value={monthlyRev}
                  onChange={(e) => setMonthlyRev(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-semibold">
                  <span>$10,000 / mo</span>
                  <span>$125,000 / mo</span>
                  <span>$250,000 / mo</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-300">
                    Target Ring-Fenced Profit Margin:
                  </label>
                  <span className="text-sm font-bold text-amber-400">
                    {targetProfitPct}% of gross
                  </span>
                </div>
                <div className="flex gap-3">
                  {[15, 20, 25, 30].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setTargetProfitPct(pct)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        targetProfitPct === pct
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Projection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800">
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Annual Ring-Fenced Profit
                </p>
                <p className="text-3xl font-black text-white mt-2">
                  {formatCompactCurrency(annualProfitLocked, 'USD')}
                </p>
                <p className="text-[11px] text-amber-200/80 mt-1">
                  Guaranteed dividend pool
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Annual Payroll Reserve
                </p>
                <p className="text-3xl font-black text-white mt-2">
                  {formatCompactCurrency(payrollReserveAnnual, 'USD')}
                </p>
                <p className="text-[11px] text-indigo-200/80 mt-1">
                  100% safeguarded compensation
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  Tax & Safe Buffer
                </p>
                <p className="text-3xl font-black text-white mt-2">
                  {formatCompactCurrency(taxSafeBuffer, 'USD')}
                </p>
                <p className="text-[11px] text-emerald-200/80 mt-1">
                  Zero tax-season surprises
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => openAuthModal('signup')}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition cursor-pointer"
              >
                <span>Lock In These Reserves for Your Business</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 9. CUSTOMER CASE STUDIES & TESTIMONIALS */}
      <section className="py-20 sm:py-28 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">
              PROVEN RESULTS
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Loved by Founders, CEOs, and Finance Directors
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Review 1 */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  "Before Cimpres, we were doing $85k/month but consistently sweating rent and payroll checks on the 28th. The 7-account split changed everything. Our payroll reserve is now 100% funded by the 12th of every month."
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center font-bold text-blue-300">
                  MS
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Marcus Sterling</p>
                  <p className="text-[11px] text-slate-400">Managing Partner, Apex Creative Agency</p>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  "The automated invoicing and instant payment links save our operations team 10 hours each week. Generating invoices, collecting payment via one-click links, and seeing money split across all 7 accounts instantly is game-changing."
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-indigo-300">
                  ER
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Elena Rostova</p>
                  <p className="text-[11px] text-slate-400">CEO, OmniStack Digital Solutions</p>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  "We replaced expensive disjointed SaaS accounting tools and messy spreadsheets with Cimpres. And the fact that it is 100% free with zero fees or monthly subscriptions makes it the best financial software decision we've ever made."
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-600/30 border border-teal-500/40 flex items-center justify-center font-bold text-teal-300">
                  DC
                </div>
                <div>
                  <p className="text-xs font-bold text-white">David Chen</p>
                  <p className="text-[11px] text-slate-400">Founder, Blueprint Growth Advisory</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. 100% FREE OPERATING SUITE */}
      <section id="pricing" className="py-20 sm:py-28 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">
              ZERO SUBSCRIPTIONS • 100% FREE FOR EVERYONE
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Powerful Financial Discipline Shouldn't Cost $100s/Month.
            </h3>
            <p className="text-base text-slate-400 mt-4">
              Cimpres is completely free. No trial periods, no hidden fees, no credit card required. Full access to the 7-Account Engine, automated invoicing, and real-time financial reporting for every founder and team.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-emerald-500/40 rounded-3xl p-8 sm:p-12 relative shadow-2xl shadow-emerald-500/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-slate-800">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold mb-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>LIFETIME UNRESTRICTED ACCESS</span>
                  </div>
                  <h4 className="text-2xl sm:text-3xl font-black text-white">
                    The Complete 7-Account Operating Suite
                  </h4>
                  <p className="text-sm text-slate-400 mt-1">
                    Free forever for founders, agencies, consultancies, and high-growth businesses.
                  </p>
                </div>

                <div className="sm:text-right shrink-0">
                  <div className="flex items-baseline sm:justify-end gap-1">
                    <span className="text-5xl font-black text-emerald-400">$0</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">/ FOREVER</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-semibold">No credit card ever required</p>
                </div>
              </div>

              {/* Capabilities Grid */}
              <div className="py-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-white">7-Account Automatic Segregation</p>
                    <p className="text-xs text-slate-400">Ring-fence profit, payroll, rent, and overhead instantly</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-white">Automated Professional Invoicing</p>
                    <p className="text-xs text-slate-400">Generate itemized invoices with live payment links</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-white">One-Click Shareable Payment Links</p>
                    <p className="text-xs text-slate-400">Share via SMS, WhatsApp, or Email with zero platform fees</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-white">Real-Time Executive P&L Reporting</p>
                    <p className="text-xs text-slate-400">Income statements, cash curves, and runway forecasts</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-white">Interactive Scenario Simulator</p>
                    <p className="text-xs text-slate-400">Stress-test hiring, price shifts, and revenue swings</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-white">Encrypted Local & Cloud Storage</p>
                    <p className="text-xs text-slate-400">AES-256 financial security and one-click data export</p>
                  </div>
                </div>
              </div>

              {/* Action Banner */}
              <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Setup takes less than 2 minutes • Preloaded with demo data</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={quickDemoLogin}
                    className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition cursor-pointer"
                  >
                    1-Click Demo
                  </button>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition cursor-pointer"
                  >
                    <span>Claim Your Free Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. FAQ ACCORDION */}
      <section id="faq" className="py-20 sm:py-28 bg-slate-950 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">
              FREQUENTLY ASKED QUESTIONS
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Everything You Need to Know
            </h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-white text-sm sm:text-base hover:text-blue-400 transition cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-blue-400' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 12. FINAL HIGH-CONVERTING CTA BANNER */}
      <section className="py-20 bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mx-auto mb-6">
            <Sparkles className="w-6 h-6" />
          </span>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-6">
            Take Permanent Control of Your Cash Flow Today.
          </h2>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-8 font-normal">
            Join over 1,420 high-growth businesses that refuse to fly blind. Protect payroll, guarantee founder profit, and automate client invoicing in under 3 minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => openAuthModal('signup')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-base shadow-xl shadow-emerald-600/30 transition cursor-pointer"
              id="cta-bottom-start-trial"
            >
              <span>Claim Your 100% Free Account</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={quickDemoLogin}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-base border border-slate-700 transition cursor-pointer"
              id="cta-bottom-instant-demo"
            >
              <Zap className="w-5 h-5 text-amber-400" />
              <span>Instant Test Drive</span>
            </button>
          </div>

          <p className="text-xs text-slate-400 mt-6">
            Instant setup • 100% Free Forever • No credit card required
          </p>
        </div>
      </section>

      {/* 13. FOOTER */}
      <footer className="bg-slate-950 py-12 border-t border-slate-800 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-base">
                C
              </div>
              <span className="font-extrabold text-white text-base">Cimpres Engine</span>
              <span className="text-slate-400 text-xs">Financial OS • 100% Free</span>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-slate-400">
              <a href="#simulator" className="hover:text-white transition">Simulator</a>
              <a href="#features" className="hover:text-white transition">Features</a>
              <a href="#calculator" className="hover:text-white transition">ROI Calculator</a>
              <a href="#pricing" className="hover:text-white transition">100% Free</a>
              <a href="#faq" className="hover:text-white transition">FAQ</a>
              <button
                onClick={() => openAuthModal('login')}
                className="text-blue-400 hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} Cimpres Global Technologies. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>SOC-2 Type II Certified & AES-256 Encrypted</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
