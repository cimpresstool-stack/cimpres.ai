import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { CashFlowView } from './components/CashFlowView';
import { InvoicingView } from './components/InvoicingView';
import { FinancialReportingView } from './components/FinancialReportingView';
import { PaymentLinksView } from './components/PaymentLinksView';
import { SettingsView } from './components/SettingsView';
import { LandingPage } from './components/landing/LandingPage';

// Modals
import { CashInModal } from './components/modals/CashInModal';
import { NewInvoiceModal } from './components/modals/NewInvoiceModal';
import { InvoicePreviewModal } from './components/modals/InvoicePreviewModal';
import { AuthModal } from './components/modals/AuthModal';

const AppContent: React.FC = () => {
  const { activeTab, toastMessage, isLandingPageActive } = useApp();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // If visitor is on the public landing page, render high-converting marketing landing page
  if (isLandingPageActive) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white">
        <LandingPage />
        <AuthModal />
        <InvoicePreviewModal />

        {/* Toast Notification Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-800 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-200 max-w-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <p className="text-xs font-semibold">{toastMessage}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Fixed Sidebar */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area (Offset by Sidebar Width on Desktop) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Top Navbar */}
        <Navbar onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)} />

        {/* Tab Route Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <DashboardView />}
          {(activeTab === 'cashflow' || activeTab === 'cashin' || activeTab === 'accounts') && (
            <CashFlowView />
          )}
          {activeTab === 'invoices' && <InvoicingView />}
          {activeTab === 'reports' && <FinancialReportingView />}
          {(activeTab === 'payment-links' || activeTab === 'paylinks') && <PaymentLinksView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Interactive Global Modals */}
      <CashInModal />
      <NewInvoiceModal />
      <InvoicePreviewModal />
      <AuthModal />

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-200 max-w-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <p className="text-xs font-semibold">{toastMessage}</p>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
