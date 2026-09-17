import React, { useState } from 'react';
import {
  Mail,
  Send,
  MessageSquare,
  Zap,
  CheckCircle2,
  Clock,
  Sparkles,
  Smartphone,
  CheckCheck,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EmailMessage } from '../types';

export const CommunicationsView: React.FC = () => {
  const { state, sendEmailMessage, sendCampaign, toggleAutomation } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'inbox' | 'campaigns' | 'automations'>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(state.emails[0] || null);

  // Email composer
  const [replyBody, setReplyBody] = useState('');

  // Campaign composer
  const [campaignChannel, setCampaignChannel] = useState<'sms' | 'whatsapp' | 'email'>('sms');
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignMessage, setCampaignMessage] = useState('');

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmail || !replyBody.trim()) return;

    sendEmailMessage({
      toEmail: selectedEmail.fromEmail,
      toName: selectedEmail.fromName,
      subject: selectedEmail.subject.startsWith('Re:')
        ? selectedEmail.subject
        : `Re: ${selectedEmail.subject}`,
      body: replyBody,
    });

    setReplyBody('');
  };

  const handleDispatchCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignTitle.trim() || !campaignMessage.trim()) return;

    sendCampaign({
      channel: campaignChannel,
      title: campaignTitle,
      message: campaignMessage,
    });

    setCampaignTitle('');
    setCampaignMessage('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Communications & Automations
          </h2>
          <p className="text-sm text-slate-500">
            Synced client conversations, broadcast SMS/WhatsApp campaigns, and no-code trigger automations.
          </p>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveSubTab('inbox')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'inbox' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Client Inbox ({state.emails.length})
          </button>
          <button
            onClick={() => setActiveSubTab('campaigns')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'campaigns' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Broadcasts & SMS ({state.campaigns.length})
          </button>
          <button
            onClick={() => setActiveSubTab('automations')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'automations' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Automation Workflows ({state.automations.filter((a) => a.active).length} Active)
          </button>
        </div>
      </div>

      {/* Sub-Tab 1: Client Inbox */}
      {activeSubTab === 'inbox' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[520px]">
          {/* Email List */}
          <div className="md:col-span-5 border-r border-slate-200 divide-y divide-slate-100 overflow-y-auto max-h-[600px]">
            {state.emails.map((email) => {
              const isSelected = selectedEmail?.id === email.id;

              return (
                <div
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  className={`p-4 cursor-pointer transition ${
                    isSelected ? 'bg-blue-50/70 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-xs truncate">
                      {email.fromName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(email.time).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-800 text-xs truncate mb-1">
                    {email.subject}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {email.preview}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Email Detail / Thread Viewer */}
          <div className="md:col-span-7 p-6 flex flex-col justify-between">
            {selectedEmail ? (
              <div className="space-y-4">
                <div className="pb-4 border-b border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                    <span>
                      From: <strong className="text-slate-800">{selectedEmail.fromName}</strong> &lt;
                      {selectedEmail.fromEmail}&gt;
                    </span>
                    <span className="font-mono">
                      {new Date(selectedEmail.time).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedEmail.subject}</h3>
                </div>

                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line py-2 bg-slate-50/60 p-4 rounded-xl border border-slate-100">
                  {selectedEmail.body}
                </div>

                {/* Reply Box */}
                <form onSubmit={handleSendReply} className="pt-4 border-t border-slate-100 space-y-2">
                  <textarea
                    rows={3}
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    placeholder={`Reply to ${selectedEmail.fromName}...`}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:border-blue-500 outline-none resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!replyBody.trim()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Response</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                Select an email from the list to view the thread.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Campaigns */}
      {activeSubTab === 'campaigns' && (
        <div className="space-y-6">
          {/* Dispatch Form */}
          <form
            onSubmit={handleDispatchCampaign}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-slate-900">Broadcast SMS or WhatsApp Campaign</h3>
              <span className="text-xs text-slate-500">
                Will be sent to all {state.contacts.length} active client numbers
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Delivery Channel
                </label>
                <select
                  value={campaignChannel}
                  onChange={(e) => setCampaignChannel(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-bold bg-white outline-none focus:border-blue-500"
                >
                  <option value="sms">SMS Text Message (Direct)</option>
                  <option value="whatsapp">WhatsApp Business API</option>
                  <option value="email">Email Broadcast</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Campaign Title
                </label>
                <input
                  type="text"
                  required
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  placeholder="e.g. End-of-Quarter Priority Retainer Settlement"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Message Content
              </label>
              <textarea
                required
                rows={3}
                value={campaignMessage}
                onChange={(e) => setCampaignMessage(e.target.value)}
                placeholder="Include friendly prompt and instant payment link..."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:border-blue-500 outline-none resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                <span>Broadcast to {state.contacts.length} Clients</span>
              </button>
            </div>
          </form>

          {/* Historical Campaigns List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {state.campaigns.map((camp) => (
              <div key={camp.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase ${
                        camp.channel === 'whatsapp'
                          ? 'bg-emerald-100 text-emerald-800'
                          : camp.channel === 'sms'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {camp.channel}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{camp.title}</h4>
                  </div>
                  <p className="text-xs text-slate-500 italic max-w-xl">&quot;{camp.message}&quot;</p>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px]">SENT</span>
                    <span className="font-bold text-slate-800">{camp.sentCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">DELIVERED</span>
                    <span className="font-bold text-emerald-700">{camp.deliveredCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">CLICKS</span>
                    <span className="font-bold text-blue-700">{camp.clickedCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Marketing Automations */}
      {activeSubTab === 'automations' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Automations trigger automatically in the background as you move deals or clients pay invoices.
              </span>
            </div>
            <span className="font-bold text-blue-900 font-mono">Real-Time Event Hook</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.automations.map((rule) => (
              <div
                key={rule.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">{rule.name}</h4>
                    <button
                      onClick={() => toggleAutomation(rule.id)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        rule.active ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                          rule.active ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 mt-3">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                        Trigger:
                      </span>
                      <span className="font-medium text-slate-800">{rule.trigger}</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100">
                      <span className="text-[10px] uppercase font-bold text-emerald-700 block mb-0.5">
                        Automated Action:
                      </span>
                      <span className="font-medium text-emerald-950">{rule.action}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>Fired {rule.runCount} times</span>
                  <span
                    className={`font-bold text-[11px] ${
                      rule.active ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {rule.active ? 'Active & Watching' : 'Paused'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
