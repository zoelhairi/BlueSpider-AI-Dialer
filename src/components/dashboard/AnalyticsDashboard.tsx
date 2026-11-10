/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  PhoneCall,
  Clock,
  DollarSign,
  TrendingUp,
  Smile,
  Activity,
  Play,
  Pause,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import type { CallAnalytics, Campaign, CallLog } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface AnalyticsDashboardProps {
  analytics: CallAnalytics | null;
  campaigns: Campaign[];
  recentCalls: CallLog[];
  onSelectCall: (call: CallLog) => void;
  onNavigateTab: (tab: string) => void;
  onStartCampaign: (id: string) => Promise<any>;
  onPauseCampaign: (id: string) => Promise<void>;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  analytics,
  campaigns,
  recentCalls,
  onSelectCall,
  onNavigateTab,
  onStartCampaign,
  onPauseCampaign,
}) => {
  const { permissions } = useAuth();

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
        Loading voice analytics telemetry...
      </div>
    );
  }

  const minutes = Math.floor(analytics.totalDurationSeconds / 60);
  const seconds = analytics.totalDurationSeconds % 60;
  const avgMins = Math.floor(analytics.avgDurationSeconds / 60);
  const avgSecs = analytics.avgDurationSeconds % 60;

  const kpis = [
    {
      label: 'Total Processed Calls',
      value: analytics.totalCalls.toLocaleString(),
      subtext: `${analytics.inProgressCalls} active in queue`,
      icon: PhoneCall,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-950/40 border-indigo-900/50',
    },
    {
      label: 'Telephony Duration',
      value: `${minutes}m ${seconds}s`,
      subtext: `Avg: ${avgMins}m ${avgSecs}s / call`,
      icon: Clock,
      color: 'text-sky-400',
      bgColor: 'bg-sky-950/40 border-sky-900/50',
    },
    {
      label: 'Connection / Reach Rate',
      value: `${analytics.connectionRate}%`,
      subtext: `${analytics.completedCalls} completed sessions`,
      icon: TrendingUp,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-950/40 border-emerald-900/50',
    },
    {
      label: 'Customer CSAT Sentiment',
      value: `${analytics.positiveSentimentRate}%`,
      subtext: `${analytics.callsBySentiment.positive} positive responses`,
      icon: Smile,
      color: 'text-amber-400',
      bgColor: 'bg-amber-950/40 border-amber-900/50',
    },
    {
      label: 'Total Platform Cost',
      value: `$${analytics.totalCost.toFixed(2)}`,
      subtext: `$${analytics.avgCostPerCall.toFixed(3)} avg / call`,
      icon: DollarSign,
      color: 'text-purple-400',
      bgColor: 'bg-purple-950/40 border-purple-900/50',
    },
    {
      label: 'Live Active Lines',
      value: `${analytics.inProgressCalls}`,
      subtext: 'Concurrent channel capacity: 20',
      icon: Activity,
      color: 'text-rose-400',
      bgColor: 'bg-rose-950/40 border-rose-900/50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">
            BlueSpider AI Dialer · Real-Time Operations
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise batch campaign dispatch, sub-500ms voice monitoring, and autonomous cloud telephony synchronization.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('campaigns')}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Manage Campaigns
          </button>
          <button
            onClick={() => onNavigateTab('monitor')}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Open Live Monitor
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border ${kpi.bgColor} flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400 truncate">
                  {kpi.label}
                </span>
                <Icon className={`w-3.5 h-3.5 ${kpi.color}`} />
              </div>
              <div className="mt-2">
                <div className="text-xl font-bold font-mono tabular-nums text-slate-100">
                  {kpi.value}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 truncate font-mono">
                  {kpi.subtext}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Call Volume & Cost Trend (2 cols) */}
        <div className="lg:col-span-2 p-5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-200">
                Weekly Call Velocity & Cost Trend
              </h2>
              <p className="text-xs text-slate-400">
                Daily completed calls volume and telephony provider expense
              </p>
            </div>
            <span className="text-[11px] font-mono text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-900/50">
              7-Day Window
            </span>
          </div>

          {/* Bar Chart Representation */}
          <div className="pt-2">
            <div className="h-44 flex items-end gap-3 sm:gap-6 px-2 border-b border-slate-800">
              {analytics.volumeHistory.map((item, index) => {
                const maxCalls = 60;
                const heightPercent = Math.max(15, Math.min(100, Math.round((item.calls / maxCalls) * 100)));
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1.5 group">
                    <div className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      ${item.totalCost.toFixed(1)}
                    </div>
                    <div className="w-full bg-slate-800/60 rounded-t h-36 flex items-end justify-center overflow-hidden">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-indigo-600 group-hover:bg-indigo-500 rounded-t transition-all flex items-start justify-center pt-1"
                      >
                        <span className="text-[9px] font-mono text-white font-semibold">
                          {item.calls}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400 group-hover:text-slate-200">
                      {item.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-indigo-600 rounded-sm"></span>
                Completed Call Volume
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-slate-700 rounded-sm"></span>
                Capacity Target
              </span>
            </div>
            <span className="font-mono text-slate-400">Total 7-day: 247 calls</span>
          </div>
        </div>

        {/* Sentiment & Outcome Breakdown (1 col) */}
        <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-200">
              Sentiment & Disposition
            </h2>
            <p className="text-xs text-slate-400">
              AI speech analysis of customer intent
            </p>
          </div>

          {/* Sentiment Meter */}
          <div className="space-y-2.5 pt-1">
            <div className="flex justify-between text-xs">
              <span className="text-emerald-400 font-medium">Positive / Converted</span>
              <span className="font-mono tabular-nums text-slate-300">
                {analytics.callsBySentiment.positive} calls ({analytics.positiveSentimentRate}%)
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                style={{ width: `${analytics.positiveSentimentRate}%` }}
                className="bg-emerald-500 h-full rounded-full"
              ></div>
            </div>

            <div className="flex justify-between text-xs pt-2">
              <span className="text-amber-400 font-medium">Neutral / Voicemail</span>
              <span className="font-mono tabular-nums text-slate-300">
                {analytics.callsBySentiment.neutral} calls
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                style={{
                  width: `${analytics.totalCalls ? Math.round((analytics.callsBySentiment.neutral / analytics.totalCalls) * 100) : 0}%`,
                }}
                className="bg-amber-500 h-full rounded-full"
              ></div>
            </div>

            <div className="flex justify-between text-xs pt-2">
              <span className="text-rose-400 font-medium">Negative / Objections</span>
              <span className="font-mono tabular-nums text-slate-300">
                {analytics.callsBySentiment.negative} calls
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                style={{
                  width: `${analytics.totalCalls ? Math.round((analytics.callsBySentiment.negative / analytics.totalCalls) * 100) : 0}%`,
                }}
                className="bg-rose-500 h-full rounded-full"
              ></div>
            </div>
          </div>

          {/* Outcome breakdown tags */}
          <div className="pt-3 border-t border-slate-800 space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Primary End Dispositions
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              {Object.entries(analytics.callsByEndReason).slice(0, 4).map(([reason, count]) => (
                <div key={reason} className="p-2 bg-slate-950/70 rounded-lg border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 truncate">{reason.replace(/-/g, ' ')}</div>
                  <div className="text-sm font-bold font-mono text-slate-200 mt-0.5">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Active Campaigns Strip */}
      <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-200">
              Active Outbound Campaigns
            </h2>
            <p className="text-xs text-slate-400">
              Campaign dialer queues and contact progression
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('campaigns')}
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
          >
            <span>View All Campaigns</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.slice(0, 2).map((camp) => {
            const progress = camp.audienceCount > 0 ? Math.round((camp.completedCalls / camp.audienceCount) * 100) : 0;
            const isRunning = camp.status === 'running';

            return (
              <div
                key={camp.id}
                className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{camp.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>{camp.phoneNumber}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{camp.assistantName}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${
                      isRunning
                        ? 'text-emerald-400 bg-emerald-950/50 border-emerald-800'
                        : 'text-amber-400 bg-amber-950/50 border-amber-800'
                    }`}
                  >
                    {camp.status}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>Progress ({camp.completedCalls}/{camp.audienceCount} called)</span>
                    <span className="text-slate-200">{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${progress}%` }}
                      className="bg-indigo-500 h-full rounded-full transition-all"
                    ></div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-1">
                  <div className="text-xs text-slate-400 font-mono">
                    Success: <span className="text-emerald-400 font-semibold">{camp.successfulCalls}</span>
                  </div>
                  {permissions.canStartCampaign && (
                    <div className="flex gap-2">
                      {isRunning ? (
                        <button
                          onClick={() => onPauseCampaign(camp.id)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs text-amber-300 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-800 rounded cursor-pointer"
                        >
                          <Pause className="w-3 h-3" />
                          <span>Pause</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onStartCampaign(camp.id)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800 rounded cursor-pointer"
                        >
                          <Play className="w-3 h-3" />
                          <span>Dispatch Batch</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Call Logs Table Preview */}
      <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-200">
              Recent Call Stream Telemetry
            </h2>
            <p className="text-xs text-slate-400">
              Live records synced across Vapi and Supabase
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('logs')}
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
          >
            <span>View All Records & Export</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Call ID</th>
                <th className="py-2.5 px-3">Customer / Phone</th>
                <th className="py-2.5 px-3">Assistant</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3">Cost</th>
                <th className="py-2.5 px-3">Sentiment</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {recentCalls.slice(0, 5).map((call, idx) => {
                const mins = Math.floor(call.durationSeconds / 60);
                const secs = call.durationSeconds % 60;
                const durStr = `${mins}:${secs.toString().padStart(2, '0')}`;
                const sentiment = call.analysis?.userSentiment || 'neutral';

                return (
                  <tr
                    key={call.id ? `recent-${call.id}-${idx}` : `recent-${idx}`}
                    onClick={() => onSelectCall(call)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 text-indigo-300 font-semibold truncate max-w-[120px]">
                      {call.vapiCallId}
                    </td>
                    <td className="py-2.5 px-3 text-slate-200 font-sans">
                      <div className="font-medium">{call.customerName || 'Prospect'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{call.customerPhone}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 font-sans truncate max-w-[160px]">
                      {call.assistantName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 tabular-nums">
                      {durStr}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 tabular-nums">
                      ${call.cost.toFixed(3)}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span
                        className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                          sentiment === 'positive'
                            ? 'text-emerald-400 bg-emerald-950/60'
                            : sentiment === 'negative'
                            ? 'text-rose-400 bg-rose-950/60'
                            : 'text-amber-400 bg-amber-950/60'
                        }`}
                      >
                        {sentiment}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
                          call.status === 'in-progress'
                            ? 'text-indigo-400 bg-indigo-950'
                            : 'text-slate-400 bg-slate-900'
                        }`}
                      >
                        {call.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCall(call);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
