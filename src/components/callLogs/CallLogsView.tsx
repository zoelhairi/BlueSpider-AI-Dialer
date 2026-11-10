/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Search,
  Filter,
  Download,
  Play,
  Pause,
  Cloud,
  Clock,
  DollarSign,
  Zap,
  Mic,
  Bot,
  User,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import type { CallLog, Campaign, Assistant, CallAnalytics } from '../../types/index.ts';
import { exportCallsToCSV, exportCallsToPDF } from '../../services/exportService.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface CallLogsViewProps {
  calls: CallLog[];
  campaigns: Campaign[];
  assistants: Assistant[];
  analytics: CallAnalytics | null;
  selectedCall: CallLog | null;
  onSelectCall: (call: CallLog | null) => void;
  onSyncVapi: () => Promise<void>;
  onSyncSupabase: () => Promise<void>;
}

export const CallLogsView: React.FC<CallLogsViewProps> = ({
  calls,
  campaigns,
  assistants,
  analytics,
  selectedCall,
  onSelectCall,
  onSyncVapi,
  onSyncSupabase,
}) => {
  const { permissions } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playbackSeconds, setPlaybackSeconds] = useState(0);

  // Audio player simulation
  const togglePlayAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
  };

  const filteredCalls = calls.filter((c) => {
    const matchesSearch =
      searchTerm === '' ||
      c.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerPhone.includes(searchTerm) ||
      c.vapiCallId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.analysis?.summary?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCampaign = campaignFilter === '' || c.campaignId === campaignFilter;
    const matchesSentiment = sentimentFilter === '' || c.analysis?.userSentiment === sentimentFilter;

    return matchesSearch && matchesCampaign && matchesSentiment;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">
            Call Logs & Speech Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Audit conversational audio recordings, inspect turn-by-turn transcripts, and export compliance reports.
          </p>
        </div>

        {/* Export buttons */}
        <div className="flex items-center gap-2">
          {permissions.canExportReports && (
            <>
              <button
                onClick={() => exportCallsToCSV(filteredCalls)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => exportCallsToPDF(filteredCalls, analytics || undefined)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Export PDF Report</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, phone number, Vapi call ID, or keywords..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Campaign Filter */}
          <select
            value={campaignFilter}
            onChange={(e) => setCampaignFilter(e.target.value)}
            className="px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none"
          >
            <option value="">All Campaigns</option>
            {campaigns.map((camp) => (
              <option key={camp.id} value={camp.id}>
                {camp.name}
              </option>
            ))}
          </select>

          {/* Sentiment Filter */}
          <select
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value)}
            className="px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none"
          >
            <option value="">All Sentiments</option>
            <option value="positive">Positive / Converted</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative / Objections</option>
          </select>
        </div>
      </div>

      {/* Main Table and Drawer Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Call Logs Table (2 cols or full if no selection) */}
        <div className={`${selectedCall ? 'lg:col-span-2' : 'lg:col-span-3'} p-5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-4`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Showing {filteredCalls.length} call records</span>
            <span className="font-mono text-sky-400/80">Synchronized Cloud Records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Call ID / Engine</th>
                  <th className="py-2.5 px-3">Customer / Phone</th>
                  <th className="py-2.5 px-3">Campaign</th>
                  <th className="py-2.5 px-3">Assistant</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Cost</th>
                  <th className="py-2.5 px-3">Sentiment</th>
                  <th className="py-2.5 px-3">End Reason</th>
                  <th className="py-2.5 px-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredCalls.map((call, idx) => {
                  const mins = Math.floor(call.durationSeconds / 60);
                  const secs = call.durationSeconds % 60;
                  const durStr = `${mins}:${secs.toString().padStart(2, '0')}`;
                  const sentiment = call.analysis?.userSentiment || 'neutral';
                  const isSelected = selectedCall?.id === call.id;

                  return (
                    <tr
                      key={call.id ? `call-${call.id}-${idx}` : `call-${idx}`}
                      onClick={() => onSelectCall(call)}
                      className={`hover:bg-slate-800/40 cursor-pointer transition-colors ${
                        isSelected ? 'bg-sky-950/40 border-l-2 border-sky-400' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-sky-300 font-semibold truncate max-w-[110px]">
                        {call.vapiCallId}
                      </td>
                      <td className="py-3 px-3 text-slate-200 font-sans">
                        <div className="font-medium">{call.customerName || 'Prospect'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{call.customerPhone}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-400 font-sans truncate max-w-[130px]">
                        {call.campaignName || 'Direct'}
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-sans truncate max-w-[140px]">
                        {call.assistantName}
                      </td>
                      <td className="py-3 px-3 text-slate-300 tabular-nums">
                        {durStr}
                      </td>
                      <td className="py-3 px-3 text-slate-300 tabular-nums font-semibold">
                        ${(call.cost || 0).toFixed(3)}
                      </td>
                      <td className="py-3 px-3 font-sans">
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
                      <td className="py-3 px-3 text-slate-400 font-sans text-[11px] truncate max-w-[120px]">
                        {(call.endReason || 'ended').replace(/-/g, ' ')}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCall(call);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Call Inspector Drawer (1 col) */}
        {selectedCall && (
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase text-sky-400">
                  Call Telemetry Inspector
                </span>
                <h3 className="text-sm font-bold text-slate-100 truncate">
                  {selectedCall.customerName || 'Prospect'} ({selectedCall.customerPhone})
                </h3>
              </div>
              <button
                onClick={() => onSelectCall(null)}
                className="text-slate-400 hover:text-slate-200 font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Audio Waveform Player Simulation */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-sky-400" />
                  Dual-Channel Audio Recording
                </span>
                <span className="text-[10px] font-mono text-emerald-400">48kHz STEREO</span>
              </div>

              {/* Waveform graphic */}
              <div className="h-10 flex items-center justify-between gap-1 px-2 bg-slate-900/60 rounded-lg">
                {[40, 75, 30, 90, 60, 85, 20, 95, 45, 70, 80, 50, 65, 90, 35, 75, 85, 40, 60, 90].map(
                  (val, idx) => (
                    <div
                      key={idx}
                      style={{ height: `${val}%` }}
                      className={`w-1 rounded-full transition-all ${
                        isPlayingAudio ? 'bg-sky-400 animate-pulse' : 'bg-slate-700'
                      }`}
                    ></div>
                  )
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={togglePlayAudio}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded cursor-pointer"
                >
                  {isPlayingAudio ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{isPlayingAudio ? 'Pause' : 'Play Audio'}</span>
                </button>
                <span className="font-mono text-xs text-slate-400 tabular-nums">
                  {Math.floor(selectedCall.durationSeconds / 60)}:
                  {(selectedCall.durationSeconds % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* AI Summary */}
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-semibold text-sky-400 uppercase tracking-wider">
                Automated AI Summary
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {selectedCall.analysis?.summary || 'No summary available.'}
              </p>
            </div>

            {/* Sub-Second Latency & Cost Breakdown */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Time to First Token</span>
                <span className="text-slate-100 font-bold tabular-nums">
                  {selectedCall.latencyMetrics?.ttftMs || 350} ms
                </span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Total Session Cost</span>
                <span className="text-emerald-400 font-bold tabular-nums">
                  ${(selectedCall.cost || 0).toFixed(4)}
                </span>
              </div>
            </div>

            {/* Turn-by-Turn Transcript Dialogue */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Transcript Turn Log ({selectedCall.transcript.length} turns)</span>
                <span className="text-[10px] font-mono text-slate-400">Timestamped</span>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
                {selectedCall.transcript.map((msg, idx) => (
                  <div
                    key={msg.id ? `${msg.id}-${idx}` : `msg-${idx}`}
                    className={`p-2.5 rounded-xl border text-xs space-y-1 ${
                      msg.role === 'bot'
                        ? 'bg-slate-950/90 border-slate-800'
                        : 'bg-indigo-950/40 border-indigo-900/50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-slate-300 flex items-center gap-1">
                        {msg.role === 'bot' ? (
                          <>
                            <Bot className="w-3 h-3 text-indigo-400" /> Assistant
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3 text-sky-400" /> Customer
                          </>
                        )}
                      </span>
                      <span className="font-mono text-slate-500">{msg.timestamp}</span>
                    </div>
                    <p className="text-slate-200 leading-snug">{msg.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Synchronization Metadata */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <Cloud className="w-3 h-3" /> Vapi ID: {selectedCall.vapiCallId}
              </span>
              <span>Supabase OK</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
