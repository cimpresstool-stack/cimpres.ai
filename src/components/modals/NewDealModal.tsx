import React, { useState } from 'react';
import { X, Trophy, DollarSign } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DealStage } from '../../types';

export const NewDealModal: React.FC = () => {
  const { state, isNewDealModalOpen, setIsNewDealModalOpen, addDeal } = useApp();

  const [contactId, setContactId] = useState<string>(state.contacts[0]?.id || '');
  const [name, setName] = useState<string>('');
  const [value, setValue] = useState<string>('5000');
  const [stage, setStage] = useState<DealStage>('qualified');
  const [probability, setProbability] = useState<string>('0.5');
  const [expectedCloseDate, setExpectedCloseDate] = useState<string>(
    new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>('');

  if (!isNewDealModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const foundContact = state.contacts.find((c) => c.id === contactId);
    if (!name.trim() || !foundContact) return;

    addDeal({
      name,
      contactId,
      contactName: `${foundContact.name} (${foundContact.company})`,
      value: parseFloat(value) || 0,
      stage,
      probability: parseFloat(probability) || 0.5,
      expectedCloseDate,
      notes,
    });

    setIsNewDealModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Add Deal to Pipeline</h3>
              <p className="text-xs text-slate-500">Track value and forecast incoming cash flow</p>
            </div>
          </div>
          <button
            onClick={() => setIsNewDealModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Deal Title
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Enterprise Security Audit & Implementation"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Client / Company
              </label>
              <select
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-purple-500 bg-white"
              >
                {state.contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.company})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Deal Value ({state.settings.currency})
              </label>
              <input
                type="number"
                step="100"
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="5000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold font-mono outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Pipeline Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as DealStage)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-purple-500 bg-white"
              >
                <option value="lead">Lead Inbound</option>
                <option value="qualified">Qualified Discovery</option>
                <option value="proposal">Proposal Sent</option>
                <option value="negotiation">Contract Negotiation</option>
                <option value="won">Won (Auto-Invoiced)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Probability
              </label>
              <select
                value={probability}
                onChange={(e) => setProbability(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-purple-500 bg-white"
              >
                <option value="0.2">20%</option>
                <option value="0.4">40%</option>
                <option value="0.6">60%</option>
                <option value="0.8">80%</option>
                <option value="1.0">100%</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Close Date
              </label>
              <input
                type="date"
                value={expectedCloseDate}
                onChange={(e) => setExpectedCloseDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Key project deliverables or client requirements..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-purple-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsNewDealModalOpen(false)}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Trophy className="w-4 h-4" />
              <span>Save Deal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
