import React from 'react';
import {
  KanbanSquare,
  Plus,
  ArrowRight,
  ArrowLeft,
  Trophy,
  CheckCircle2,
  Clock,
  Sparkles,
  DollarSign,
  Building,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatCompactCurrency } from '../data/constants';
import { DealStage, Deal } from '../types';

interface StageConfig {
  id: DealStage;
  label: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  defaultProbability: number;
}

const STAGES: StageConfig[] = [
  { id: 'lead', label: 'Lead Inbound', badgeBg: 'bg-slate-100', badgeText: 'text-slate-800', borderColor: 'border-slate-300', defaultProbability: 0.2 },
  { id: 'qualified', label: 'Qualified Discovery', badgeBg: 'bg-blue-100', badgeText: 'text-blue-800', borderColor: 'border-blue-300', defaultProbability: 0.4 },
  { id: 'proposal', label: 'Proposal Review', badgeBg: 'bg-amber-100', badgeText: 'text-amber-800', borderColor: 'border-amber-300', defaultProbability: 0.65 },
  { id: 'negotiation', label: 'Contract & Terms', badgeBg: 'bg-purple-100', badgeText: 'text-purple-800', borderColor: 'border-purple-300', defaultProbability: 0.85 },
  { id: 'won', label: 'Won & Auto-Invoiced', badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-800', borderColor: 'border-emerald-300', defaultProbability: 1.0 },
];

export const PipelineView: React.FC = () => {
  const { state, updateDealStage, deleteDeal, setIsNewDealModalOpen } = useApp();

  const activeDeals = state.deals.filter((d) => d.stage !== 'lost');
  const totalPipelineValue = activeDeals
    .filter((d) => d.stage !== 'won')
    .reduce((sum, d) => sum + d.value, 0);

  const weightedForecast = activeDeals
    .filter((d) => d.stage !== 'won')
    .reduce((sum, d) => sum + d.value * d.probability, 0);

  const wonDeals = state.deals.filter((d) => d.stage === 'won');
  const totalWonValue = wonDeals.reduce((sum, d) => sum + d.value, 0);

  const moveDeal = (deal: Deal, direction: 'next' | 'prev') => {
    const stageOrder: DealStage[] = ['lead', 'qualified', 'proposal', 'negotiation', 'won'];
    const currentIndex = stageOrder.indexOf(deal.stage);
    if (currentIndex === -1) return;

    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= 0 && nextIndex < stageOrder.length) {
      updateDealStage(deal.id, stageOrder[nextIndex]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Sales Pipeline & Deal Forecasting
          </h2>
          <p className="text-sm text-slate-500">
            Drag or advance deals through the funnel. Winning a deal triggers automated invoice generation and 7-account allocation.
          </p>
        </div>

        <button
          onClick={() => setIsNewDealModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-sm transition active:scale-[0.98] cursor-pointer flex items-center gap-2"
          id="pipeline-add-deal-btn"
        >
          <Plus className="w-4 h-4" />
          <span>New Deal</span>
        </button>
      </div>

      {/* 3 Pipeline Financial Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-500 block mb-1">
            Active Pipeline Value
          </span>
          <div className="text-2xl font-black text-slate-900">
            {formatCurrency(totalPipelineValue, state.settings.currency)}
          </div>
          <span className="text-xs text-blue-600 font-medium mt-1 block">
            {activeDeals.filter((d) => d.stage !== 'won').length} deals currently in discussion
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-500 block mb-1">
            Weighted Probability Forecast
          </span>
          <div className="text-2xl font-black text-purple-700">
            {formatCurrency(weightedForecast, state.settings.currency)}
          </div>
          <span className="text-xs text-purple-600 font-medium mt-1 block">
            Adjusted by stage win rate
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-500 block mb-1">
            Deals Won (Auto-Invoiced)
          </span>
          <div className="text-2xl font-black text-emerald-700">
            {formatCurrency(totalWonValue, state.settings.currency)}
          </div>
          <span className="text-xs text-emerald-700 font-medium mt-1 block">
            {wonDeals.length} won contracts funded
          </span>
        </div>
      </div>

      {/* Kanban Stages Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageDeals = state.deals.filter((d) => d.stage === stage.id);
          const stageSum = stageDeals.reduce((sum, d) => sum + d.value, 0);

          return (
            <div
              key={stage.id}
              className="bg-slate-100/70 rounded-2xl p-3 border border-slate-200/80 min-w-[240px] flex flex-col"
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-md text-xs font-black ${stage.badgeBg} ${stage.badgeText}`}
                  >
                    {stageDeals.length}
                  </span>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-tight">
                    {stage.label}
                  </h3>
                </div>
                <span className="text-xs font-extrabold text-slate-600">
                  {formatCompactCurrency(stageSum, state.settings.currency)}
                </span>
              </div>

              {/* Deal Cards Container */}
              <div className="space-y-3 min-h-[300px]">
                {stageDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition relative group"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="font-bold text-slate-900 text-sm leading-snug">
                        {deal.name}
                      </h4>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete deal "${deal.name}"?`)) {
                            deleteDeal(deal.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition p-1"
                        title="Delete Deal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Client Name */}
                    <p className="text-xs text-slate-500 flex items-center gap-1 font-medium mb-2.5">
                      <Building className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{deal.contactName}</span>
                    </p>

                    {/* Value & Probability */}
                    <div className="flex items-baseline justify-between py-2 px-2.5 rounded-lg bg-slate-50 border border-slate-100 mb-2">
                      <span className="text-sm font-black text-slate-900 font-mono">
                        {formatCurrency(deal.value, state.settings.currency)}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">
                        {Math.round(deal.probability * 100)}% prob
                      </span>
                    </div>

                    {/* Close Date & Notes */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3">
                      <span>Close: {deal.expectedCloseDate}</span>
                    </div>

                    {/* Stage Mover Controls */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      {stage.id !== 'lead' ? (
                        <button
                          onClick={() => moveDeal(deal, 'prev')}
                          className="p-1 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
                          title="Move back"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <div />
                      )}

                      {stage.id !== 'won' ? (
                        <button
                          onClick={() => updateDealStage(deal.id, 'won')}
                          className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition shadow-xs cursor-pointer flex items-center gap-1"
                          title="Win deal & trigger automated invoice"
                        >
                          <Trophy className="w-3 h-3" />
                          <span>Win Deal</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Invoiced</span>
                        </span>
                      )}

                      {stage.id !== 'won' ? (
                        <button
                          onClick={() => moveDeal(deal, 'next')}
                          className="p-1 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
                          title="Advance stage"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <div />
                      )}
                    </div>
                  </div>
                ))}

                {stageDeals.length === 0 && (
                  <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400 font-medium">
                    Empty stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
