import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  AppState,
  AccountKey,
  ClientContact,
  Deal,
  DealStage,
  Invoice,
  InvoiceStatus,
  PaymentLink,
  Task,
  Quote,
  AppSettings,
  Transaction,
  UserProfile,
} from '../types';
import {
  INITIAL_STATE,
  calculateDistribution,
  ACCOUNTS,
} from '../data/constants';

const STORAGE_KEY = 'cimpres_crm_cashflow_state_v1';
const AUTH_STORAGE_KEY = 'cimpres_crm_auth_user_v1';

interface AppContextType {
  state: AppState;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  // Auth & Visitor Landing
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isLandingPageActive: boolean;
  setIsLandingPageActive: (active: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'signup';
  setAuthModalMode: (mode: 'login' | 'signup') => void;
  openAuthModal: (mode?: 'login' | 'signup') => void;
  login: (email: string, name?: string, companyName?: string) => void;
  signup: (email: string, name: string, companyName: string, password?: string) => void;
  quickDemoLogin: () => void;
  logout: () => void;

  // Modals & Drawers
  isCashInModalOpen: boolean;
  setIsCashInModalOpen: (open: boolean) => void;
  isNewInvoiceModalOpen: boolean;
  setIsNewInvoiceModalOpen: (open: boolean) => void;
  isNewDealModalOpen: boolean;
  setIsNewDealModalOpen: (open: boolean) => void;
  isNewClientModalOpen: boolean;
  setIsNewClientModalOpen: (open: boolean) => void;
  previewInvoice: Invoice | null;
  setPreviewInvoice: (invoice: Invoice | null) => void;
  activePaymentLink: PaymentLink | null;
  setActivePaymentLink: (link: PaymentLink | null) => void;
  selectedContact: ClientContact | null;
  setSelectedContact: (contact: ClientContact | null) => void;
  
  // Actions
  recordCashIn: (amount: number, note: string) => Transaction;
  adjustAccountBalance: (key: AccountKey, amount: number, note?: string) => void;
  updatePercentages: (percentages: Record<AccountKey, number>) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  
  // CRM Contacts
  addContact: (contact: Omit<ClientContact, 'id' | 'createdAt' | 'ltv' | 'dealsWon' | 'onTimePaymentPct'>) => string;
  updateContact: (id: string, updates: Partial<ClientContact>) => void;
  deleteContact: (id: string) => void;
  
  // Deals & Pipeline
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateDealStage: (id: string, stage: DealStage) => void;
  updateDeal: (id: string, updates: Partial<Deal>) => void;
  deleteDeal: (id: string) => void;
  
  // Automated Invoicing
  createInvoice: (invoiceData: Omit<Invoice, 'id' | 'invoiceNum' | 'status'>, autoPay?: boolean) => Invoice;
  updateInvoiceStatus: (id: string, status: InvoiceStatus, paymentMethod?: string) => void;
  deleteInvoice: (id: string) => void;
  
  // Payment Links
  createPaymentLink: (data: { title: string; contactName: string; contactEmail: string; amount: number; invoiceId?: string }) => PaymentLink;
  payPaymentLink: (id: string) => void;
  
  // Tasks
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'done'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  
  // Quotes
  addQuote: (quote: Omit<Quote, 'id' | 'quoteNum' | 'createdAt'>) => void;
  acceptQuote: (quoteId: string) => Invoice;
  deleteQuote: (id: string) => void;
  
  // Communications & Campaigns
  sendEmailMessage: (msg: { toEmail: string; toName: string; subject: string; body: string }) => void;
  sendCampaign: (camp: { channel: 'sms' | 'whatsapp' | 'email'; title: string; message: string }) => void;
  toggleAutomation: (id: string) => void;
  
  // Reset & Helpers
  resetToDemoData: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback to initial
    }
    return INITIAL_STATE;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Authentication & Landing Page State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch {}
    return null;
  });

  const [isLandingPageActive, setIsLandingPageActive] = useState<boolean>(() => {
    try {
      const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      // If there's no saved user, default to landing page for web visitors
      return !savedUser;
    } catch {
      return true;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  const [isCashInModalOpen, setIsCashInModalOpen] = useState<boolean>(false);
  const [isNewInvoiceModalOpen, setIsNewInvoiceModalOpen] = useState<boolean>(false);
  const [isNewDealModalOpen, setIsNewDealModalOpen] = useState<boolean>(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState<boolean>(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [activePaymentLink, setActivePaymentLink] = useState<PaymentLink | null>(null);
  const [selectedContact, setSelectedContact] = useState<ClientContact | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [state]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4000);
  };

  const recordCashIn = (amount: number, note: string): Transaction => {
    const num = Math.max(0, Number(amount) || 0);
    const dist = calculateDistribution(num, state.percentages);

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'cashin',
      amount: num,
      note: note || 'Cash In distribution',
      date: new Date().toISOString(),
      dist,
    };

    setState((prev) => {
      const newBalances = { ...prev.balances };
      (Object.keys(dist) as AccountKey[]).forEach((key) => {
        newBalances[key] = Math.round(((newBalances[key] || 0) + dist[key]) * 100) / 100;
      });

      return {
        ...prev,
        balances: newBalances,
        transactions: [newTx, ...prev.transactions],
      };
    });

    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#2563eb', '#f59e0b', '#06b6d4'],
      });
    } catch {}

    showToast(`Distributed ${state.settings.currency}${num.toLocaleString()} across 7 accounts`);
    return newTx;
  };

  const adjustAccountBalance = (key: AccountKey, amount: number, note?: string) => {
    const num = Number(amount) || 0;
    const acct = ACCOUNTS.find((a) => a.key === key);

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: num >= 0 ? 'adjust-add' : 'adjust-sub',
      amount: num,
      note: note || `Manual adjustment: ${acct?.name || key}`,
      date: new Date().toISOString(),
      accountKey: key,
    };

    setState((prev) => ({
      ...prev,
      balances: {
        ...prev.balances,
        [key]: Math.round(((prev.balances[key] || 0) + num) * 100) / 100,
      },
      transactions: [newTx, ...prev.transactions],
    }));

    showToast(`Updated ${acct?.name || key} by ${num >= 0 ? '+' : ''}${state.settings.currency}${Math.abs(num)}`);
  };

  const updatePercentages = (percentages: Record<AccountKey, number>) => {
    setState((prev) => ({
      ...prev,
      percentages,
    }));
    showToast('Distribution rules updated successfully');
  };

  const updateSettings = (settingsUpdate: Partial<AppSettings>) => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...settingsUpdate,
      },
    }));
    showToast('Business settings saved');
  };

  // CRM Contacts
  const addContact = (contactData: Omit<ClientContact, 'id' | 'createdAt' | 'ltv' | 'dealsWon' | 'onTimePaymentPct'>): string => {
    const id = `c-${Date.now()}`;
    const newContact: ClientContact = {
      ...contactData,
      id,
      ltv: 0,
      dealsWon: 0,
      onTimePaymentPct: 100,
      createdAt: new Date().toISOString(),
      lastContactedAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      contacts: [newContact, ...prev.contacts],
    }));

    showToast(`Added client ${contactData.name}`);
    return id;
  };

  const updateContact = (id: string, updates: Partial<ClientContact>) => {
    setState((prev) => ({
      ...prev,
      contacts: prev.contacts.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
    showToast('Client details updated');
  };

  const deleteContact = (id: string) => {
    setState((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((c) => c.id !== id),
    }));
    showToast('Client record deleted');
  };

  // Deals & Pipeline
  const addDeal = (dealData: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): string => {
    const id = `d-${Date.now()}`;
    const newDeal: Deal = {
      ...dealData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      deals: [newDeal, ...prev.deals],
    }));

    showToast(`New deal "${dealData.name}" added to pipeline`);
    return id;
  };

  const updateDeal = (id: string, updates: Partial<Deal>) => {
    setState((prev) => ({
      ...prev,
      deals: prev.deals.map((d) => (d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d)),
    }));
  };

  const updateDealStage = (id: string, stage: DealStage) => {
    let closedDeal: Deal | null = null;

    setState((prev) => {
      const target = prev.deals.find((d) => d.id === id);
      if (!target) return prev;

      const wasWon = target.stage === 'won';
      const isNowWon = stage === 'won';
      if (!wasWon && isNowWon) {
        closedDeal = { ...target, stage: 'won' };
      }

      return {
        ...prev,
        deals: prev.deals.map((d) => (d.id === id ? { ...d, stage, updatedAt: new Date().toISOString() } : d)),
      };
    });

    if (stage === 'won' && closedDeal) {
      // Trigger automated invoicing!
      const deal = closedDeal as Deal;
      const invNumber = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
      const newInvoice: Invoice = {
        id: `inv-${Date.now()}`,
        invoiceNum: invNumber,
        contactId: deal.contactId,
        contactName: deal.contactName,
        contactEmail: `${deal.contactName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'client'}@example.com`,
        dealId: deal.id,
        dealName: deal.name,
        items: [
          {
            id: `item-${Date.now()}`,
            description: deal.name,
            quantity: 1,
            unitPrice: deal.value,
            amount: deal.value,
          },
        ],
        subtotal: deal.value,
        taxPct: 0,
        taxAmount: 0,
        total: deal.value,
        status: 'sent',
        issuedDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        notes: `Automated invoice generated upon winning deal "${deal.name}".`,
        autoGenerated: true,
      };

      // Create payment link automatically
      const code = `pay_${invNumber.toLowerCase()}_${Math.random().toString(36).slice(2, 6)}`;
      const newPayLink: PaymentLink = {
        id: `pl-${Date.now()}`,
        code,
        title: `Settlement for ${deal.name}`,
        contactId: deal.contactId,
        contactName: deal.contactName,
        contactEmail: newInvoice.contactEmail,
        amount: deal.value,
        status: 'pending',
        invoiceId: newInvoice.id,
        url: `https://pay.cimpres.app/l/${code}`,
        createdAt: new Date().toISOString(),
      };

      setState((prev) => {
        // Also update contact LTV and deals won
        const updatedContacts = prev.contacts.map((c) => {
          if (c.id === deal.contactId) {
            return {
              ...c,
              ltv: (c.ltv || 0) + deal.value,
              dealsWon: (c.dealsWon || 0) + 1,
            };
          }
          return c;
        });

        return {
          ...prev,
          contacts: updatedContacts,
          invoices: [newInvoice, ...prev.invoices],
          paymentLinks: [newPayLink, ...prev.paymentLinks],
        };
      });

      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      showToast(`🎉 Deal WON! Auto-generated ${invNumber} & payment link`);
    } else {
      showToast(`Deal moved to ${stage.toUpperCase()}`);
    }
  };

  const deleteDeal = (id: string) => {
    setState((prev) => ({
      ...prev,
      deals: prev.deals.filter((d) => d.id !== id),
    }));
    showToast('Deal removed');
  };

  // Automated Invoicing
  const createInvoice = (invoiceData: Omit<Invoice, 'id' | 'invoiceNum' | 'status'>, autoPay = false): Invoice => {
    const invNum = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
    const id = `inv-${Date.now()}`;
    const newInvoice: Invoice = {
      ...invoiceData,
      id,
      invoiceNum: invNum,
      status: autoPay ? 'paid' : 'sent',
      paidDate: autoPay ? new Date().toISOString().split('T')[0] : undefined,
    };

    // Payment link
    const code = `pay_${invNum.toLowerCase()}_${Math.random().toString(36).slice(2, 6)}`;
    const newPayLink: PaymentLink = {
      id: `pl-${Date.now()}`,
      code,
      title: `Invoice ${invNum} - ${invoiceData.contactName}`,
      contactId: invoiceData.contactId,
      contactName: invoiceData.contactName,
      contactEmail: invoiceData.contactEmail,
      amount: invoiceData.total,
      status: autoPay ? 'paid' : 'pending',
      invoiceId: id,
      url: `https://pay.cimpres.app/l/${code}`,
      createdAt: new Date().toISOString(),
      paidAt: autoPay ? new Date().toISOString() : undefined,
    };

    setState((prev) => ({
      ...prev,
      invoices: [newInvoice, ...prev.invoices],
      paymentLinks: [newPayLink, ...prev.paymentLinks],
    }));

    if (autoPay) {
      recordCashIn(newInvoice.total, `Invoice Payment: ${invNum} (${newInvoice.contactName})`);
    }

    showToast(`Invoice ${invNum} created successfully`);
    return newInvoice;
  };

  const updateInvoiceStatus = (id: string, status: InvoiceStatus, paymentMethod = 'Direct Transfer') => {
    let invoiceToFund: Invoice | null = null;

    setState((prev) => {
      const inv = prev.invoices.find((i) => i.id === id);
      if (!inv) return prev;

      const wasPaid = inv.status === 'paid';
      const isNowPaid = status === 'paid';

      if (!wasPaid && isNowPaid) {
        invoiceToFund = { ...inv, status: 'paid', paidDate: new Date().toISOString().split('T')[0], paymentMethod };
      }

      // Update associated payment link if present
      const updatedPayLinks = prev.paymentLinks.map((pl) => {
        if (pl.invoiceId === id) {
          return {
            ...pl,
            status: isNowPaid ? ('paid' as const) : pl.status,
            paidAt: isNowPaid ? new Date().toISOString() : pl.paidAt,
          };
        }
        return pl;
      });

      return {
        ...prev,
        invoices: prev.invoices.map((i) =>
          i.id === id
            ? {
                ...i,
                status,
                paidDate: isNowPaid ? new Date().toISOString().split('T')[0] : i.paidDate,
                paymentMethod: isNowPaid ? paymentMethod : i.paymentMethod,
              }
            : i
        ),
        paymentLinks: updatedPayLinks,
      };
    });

    if (invoiceToFund) {
      const inv = invoiceToFund as Invoice;
      recordCashIn(inv.total, `Automated Invoice Settlement: ${inv.invoiceNum} (${inv.contactName})`);
      showToast(`Invoice ${inv.invoiceNum} marked PAID and routed into 7 accounts!`);
    } else {
      showToast(`Invoice updated to ${status}`);
    }
  };

  const deleteInvoice = (id: string) => {
    setState((prev) => ({
      ...prev,
      invoices: prev.invoices.filter((i) => i.id !== id),
      paymentLinks: prev.paymentLinks.filter((pl) => pl.invoiceId !== id),
    }));
    showToast('Invoice deleted');
  };

  // Payment Links
  const createPaymentLink = (data: { title: string; contactName: string; contactEmail: string; amount: number; invoiceId?: string }): PaymentLink => {
    const code = `pay_${Math.random().toString(36).slice(2, 8)}`;
    const newLink: PaymentLink = {
      id: `pl-${Date.now()}`,
      code,
      title: data.title,
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      amount: data.amount,
      status: 'pending',
      invoiceId: data.invoiceId,
      url: `https://pay.cimpres.app/l/${code}`,
      createdAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      paymentLinks: [newLink, ...prev.paymentLinks],
    }));

    showToast('Payment link generated');
    return newLink;
  };

  const payPaymentLink = (id: string) => {
    let linkPaid: PaymentLink | null = null;

    setState((prev) => {
      const link = prev.paymentLinks.find((pl) => pl.id === id);
      if (!link || link.status === 'paid') return prev;

      linkPaid = { ...link, status: 'paid', paidAt: new Date().toISOString() };

      const updatedLinks = prev.paymentLinks.map((pl) => (pl.id === id ? linkPaid! : pl));
      const updatedInvoices = link.invoiceId
        ? prev.invoices.map((inv) =>
            inv.id === link.invoiceId
              ? {
                  ...inv,
                  status: 'paid' as const,
                  paidDate: new Date().toISOString().split('T')[0],
                  paymentMethod: 'Instant Payment Link (Card/ACH)',
                }
              : inv
          )
        : prev.invoices;

      return {
        ...prev,
        paymentLinks: updatedLinks,
        invoices: updatedInvoices,
      };
    });

    if (linkPaid) {
      const link = linkPaid as PaymentLink;
      recordCashIn(link.amount, `Online Payment Link Settlement: ${link.title} (${link.contactName})`);
      showToast(`Payment received for ${link.title}! Funds allocated.`);
    }
  };

  // Tasks
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'done'>) => {
    const newTask: Task = {
      ...taskData,
      id: `t-${Date.now()}`,
      done: false,
      createdAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
    }));
    showToast('New task added');
  };

  const toggleTask = (id: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    }));
  };

  const deleteTask = (id: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
    showToast('Task deleted');
  };

  // Quotes
  const addQuote = (quoteData: Omit<Quote, 'id' | 'quoteNum' | 'createdAt'>) => {
    const quoteNum = `QUO-${Math.floor(1000 + Math.random() * 9000)}`;
    const newQuote: Quote = {
      ...quoteData,
      id: `q-${Date.now()}`,
      quoteNum,
      createdAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      quotes: [newQuote, ...prev.quotes],
    }));
    showToast(`Quote ${quoteNum} created`);
  };

  const acceptQuote = (quoteId: string): Invoice => {
    let createdInvoice: Invoice | null = null;

    setState((prev) => {
      const quote = prev.quotes.find((q) => q.id === quoteId);
      if (!quote) return prev;

      const invNum = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
      const newInvoice: Invoice = {
        id: `inv-${Date.now()}`,
        invoiceNum: invNum,
        contactId: '',
        contactName: quote.clientName,
        contactEmail: quote.clientEmail,
        items: quote.items,
        subtotal: quote.total,
        taxPct: 0,
        taxAmount: 0,
        total: quote.total,
        status: 'sent',
        issuedDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        notes: `Converted from accepted quote ${quote.quoteNum}.`,
        autoGenerated: true,
      };

      createdInvoice = newInvoice;

      // Also create payment link
      const code = `pay_${invNum.toLowerCase()}_${Math.random().toString(36).slice(2, 6)}`;
      const newPayLink: PaymentLink = {
        id: `pl-${Date.now()}`,
        code,
        title: `Settlement for ${quote.title}`,
        contactName: quote.clientName,
        contactEmail: quote.clientEmail,
        amount: quote.total,
        status: 'pending',
        invoiceId: newInvoice.id,
        url: `https://pay.cimpres.app/l/${code}`,
        createdAt: new Date().toISOString(),
      };

      return {
        ...prev,
        quotes: prev.quotes.map((q) => (q.id === quoteId ? { ...q, status: 'accepted' as const } : q)),
        invoices: [newInvoice, ...prev.invoices],
        paymentLinks: [newPayLink, ...prev.paymentLinks],
      };
    });

    showToast(`Quote accepted & converted to Invoice!`);
    return createdInvoice!;
  };

  const deleteQuote = (id: string) => {
    setState((prev) => ({
      ...prev,
      quotes: prev.quotes.filter((q) => q.id !== id),
    }));
    showToast('Quote removed');
  };

  // Communications
  const sendEmailMessage = (msg: { toEmail: string; toName: string; subject: string; body: string }) => {
    setState((prev) => ({
      ...prev,
      emails: [
        {
          id: `em-${Date.now()}`,
          fromName: prev.settings.businessName,
          fromEmail: prev.settings.businessEmail,
          toEmail: msg.toEmail,
          subject: msg.subject,
          preview: msg.body.slice(0, 80) + '...',
          body: msg.body,
          time: new Date().toISOString(),
          unread: false,
          tag: 'sent',
        },
        ...prev.emails,
      ],
    }));
    showToast(`Email sent to ${msg.toName}`);
  };

  const sendCampaign = (camp: { channel: 'sms' | 'whatsapp' | 'email'; title: string; message: string }) => {
    const recipients = state.contacts.length || 15;
    setState((prev) => ({
      ...prev,
      campaigns: [
        {
          id: `cmp-${Date.now()}`,
          channel: camp.channel,
          title: camp.title,
          message: camp.message,
          sentCount: recipients,
          deliveredCount: recipients,
          clickedCount: Math.floor(recipients * 0.6),
          status: 'active',
          date: new Date().toISOString().split('T')[0],
        },
        ...prev.campaigns,
      ],
    }));
    showToast(`${camp.channel.toUpperCase()} campaign dispatched to ${recipients} clients!`);
  };

  const toggleAutomation = (id: string) => {
    setState((prev) => ({
      ...prev,
      automations: prev.automations.map((a) => (a.id === id ? { ...a, active: !a.active } : a)),
    }));
    showToast('Automation status updated');
  };

  const resetToDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(INITIAL_STATE);
    showToast('Reset to original sample data');
  };

  const openAuthModal = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const login = (email: string, name?: string, companyName?: string) => {
    const cleanEmail = email.trim() || 'cimpresstool@gmail.com';
    const computedName =
      name?.trim() ||
      (cleanEmail.includes('@')
        ? cleanEmail.split('@')[0].replace(/[._-]/g, ' ')
        : 'Finance Lead');
    const computedCompany = companyName?.trim() || 'Cimpres Enterprise';

    const user: UserProfile = {
      name: computedName.replace(/\b\w/g, (c) => c.toUpperCase()),
      email: cleanEmail,
      companyName: computedCompany,
      role: 'Executive Administrator',
      createdAt: new Date().toISOString(),
    };

    setCurrentUser(user);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
    setIsAuthModalOpen(false);
    setIsLandingPageActive(false);
    showToast(`Welcome back, ${user.name}!`);
  };

  const signup = (email: string, name: string, companyName: string) => {
    const user: UserProfile = {
      name: name.trim() || 'Business Founder',
      email: email.trim() || 'founder@business.com',
      companyName: companyName.trim() || 'Growth Ventures Inc.',
      role: 'Owner & Managing Director',
      createdAt: new Date().toISOString(),
    };

    setCurrentUser(user);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
    setIsAuthModalOpen(false);
    setIsLandingPageActive(false);
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
    showToast(`Account successfully created! Welcome to your Cimpres cockpit.`);
  };

  const quickDemoLogin = () => {
    login('cimpresstool@gmail.com', 'Alex Vance', 'Cimpres Global Group');
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
    setIsLandingPageActive(true);
    showToast('Logged out of Cimpres. Returning to home landing page.');
  };

  return (
    <AppContext.Provider
      value={{
        state,
        activeTab,
        setActiveTab,
        currentUser,
        isAuthenticated: !!currentUser,
        isLandingPageActive,
        setIsLandingPageActive,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openAuthModal,
        login,
        signup,
        quickDemoLogin,
        logout,
        isCashInModalOpen,
        setIsCashInModalOpen,
        isNewInvoiceModalOpen,
        setIsNewInvoiceModalOpen,
        isNewDealModalOpen,
        setIsNewDealModalOpen,
        isNewClientModalOpen,
        setIsNewClientModalOpen,
        previewInvoice,
        setPreviewInvoice,
        activePaymentLink,
        setActivePaymentLink,
        selectedContact,
        setSelectedContact,
        recordCashIn,
        adjustAccountBalance,
        updatePercentages,
        updateSettings,
        addContact,
        updateContact,
        deleteContact,
        addDeal,
        updateDealStage,
        updateDeal,
        deleteDeal,
        createInvoice,
        updateInvoiceStatus,
        deleteInvoice,
        createPaymentLink,
        payPaymentLink,
        addTask,
        toggleTask,
        deleteTask,
        addQuote,
        acceptQuote,
        deleteQuote,
        sendEmailMessage,
        sendCampaign,
        toggleAutomation,
        resetToDemoData,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
