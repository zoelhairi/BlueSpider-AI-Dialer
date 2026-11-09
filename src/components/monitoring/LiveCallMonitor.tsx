/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Activity,
  PhoneOff,
  PhoneCall,
  Volume2,
  Clock,
  Sparkles,
  Zap,
  Mic,
  Smile,
  Shield,
  Layers,
} from 'lucide-react';
import type { CallLog } from '../../types/index.ts';

interface LiveCallMonitorProps {
  activeCalls: CallLog[];
  onEndCall: (callId: string) => Promise<void>;
  onTriggerSimulatedCall: () => void;
  onSelectCall: (call: CallLog) => void;
}

export const LiveCallMonitor: React.FC<LiveCallMonitorProps> = ({
  activeCalls,
  onEndCall,
  onTriggerSimulatedCall,
  onSelectCall,
}) => {
  // Live ticking timer
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-100">
              Live Call Monitoring & Telemetry
            </h1>
            <span className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-900/60 rounded">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              {activeCalls.length} LINE{activeCalls.length === 1 ? '' : 'S'} ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time audio stream monitor, latency tracking, and live conversational transcription.
          </p>
        </div>

        <button
          onClick={onTriggerSimulatedCall}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Launch Live Test Call</span>
        </button>
      </div>

      {/* Latency & Telemetry Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Speech Latency (TTFT)</span>
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="mt-1 text-base font-bold font-mono text-slate-100 tabular-nums">
            340 ms
          </div>
          <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
            Sub-500ms Human Target
          </div>
        </div>

        <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>LLM Response Time</span>
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="mt-1 text-base font-bold font-mono text-slate-100 tabular-nums">
            385 ms
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            GPT-4o Streaming
          </div>
        </div>

        <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>TTS Generation Latency</span>
            <Mic className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="mt-1 text-base font-bold font-mono text-slate-100 tabular-nums">
            195 ms
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            ElevenLabs Turbo v2.5
          </div>
        </div>

        <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Audio Packet Loss</span>
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-1 text-base font-bold font-mono text-slate-100 tabular-nums">
            0.02 %
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Opus 48kHz HD Audio
          </div>
        </div>
      </div>

      {/* Active Calls List */}
      {activeCalls.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800/60 flex items-center justify-center mx-auto text-slate-400">
            <Activity className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm font-bold text-slate-200">
              No Active Telephony Lines Running
            </h3>
            <p className="text-xs text-slate-400">
              All telephone lines are currently idle in standby. Launch an automated campaign batch or initiate a test assistant call to inspect live streaming telemetry.
            </p>
          </div>
          <button
            onClick={onTriggerSimulatedCall}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg cursor-pointer transition-colors shadow-sm inline-flex items-center gap-1.5"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Simulate Live Inbound / Outbound Call</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeCalls.map((call, idx) => {
            const latestTranscript = call.transcript[call.transcript.length - 1];
            const currentDuration = (call.durationSeconds || 0) + secondsElapsed;
            const mins = Math.floor(currentDuration / 60);
            const secs = currentDuration % 60;
            const formattedDuration = `${mins}:${secs.toString().padStart(2, '0')}`;

            return (
              <div
                key={call.id ? `active-${call.id}-${idx}` : `active-${idx}`}
                className="p-5 bg-slate-900/80 border border-indigo-500/40 shadow-lg shadow-indigo-950/20 rounded-xl space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top line with active indicator & timer */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                        <h3 className="text-sm font-bold text-slate-100">
                          {call.customerName || 'Inbound Prospect'}
                        </h3>
                        <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950 px-1.5 py-0.2 rounded border border-indigo-900">
                          {call.type === 'outboundPhoneCall' ? 'OUTBOUND' : 'LIVE WEB'}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-slate-400 mt-0.5">
                        {call.customerPhone} · Connected via {call.phoneNumber}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-bold font-mono text-emerald-400 tabular-nums">
                        {formattedDuration}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        ${(call.cost + (currentDuration * 0.001)).toFixed(3)}
                      </span>
                    </div>
                  </div>

                  {/* Audio Visualizer Wave Simulation */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                        Speaking: <strong className="text-slate-200">{call.assistantName}</strong>
                      </span>
                      <span className="font-mono text-[10px] text-emerald-400">AUDIO DUPLEX OK</span>
                    </div>

                    {/* Animated sound bars */}
                    <div className="h-8 flex items-center justify-center gap-1">
                      {[30, 65, 85, 45, 95, 70, 50, 90, 40, 80, 60, 100, 75, 45, 85, 55].map((h, i) => (
                        <div
                          key={i}
                          style={{
                            height: `${Math.max(15, (h * ((secondsElapsed + i) % 4 + 1)) % 100)}%`,
                          }}
                          className="w-1 bg-indigo-500 rounded-full transition-all duration-300"
                        ></div>
                      ))}
                    </div>
                  </div>

                  {/* Live Turn-by-Turn Dialogue Snippet */}
                  <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 text-xs space-y-1.5">
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Live Transcript Feed</span>
                      <span>Turn #{call.transcript.length}</span>
                    </div>
                    {latestTranscript ? (
                      <div className="text-slate-200 leading-relaxed font-sans">
                        <span className="font-semibold text-indigo-400 mr-1.5">
                          {latestTranscript.role === 'bot' ? 'Assistant:' : 'Prospect:'}
                        </span>
                        "{latestTranscript.message}"
                      </div>
                    ) : (
                      <div className="text-slate-400 italic">Connecting audio socket...</div>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <button
                    onClick={() => onSelectCall(call)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                  >
                    Inspect Full Call Telemetry
                  </button>

                  <button
                    onClick={() => onEndCall(call.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-950/70 hover:bg-rose-900/70 border border-rose-800 rounded-lg cursor-pointer transition-colors"
                  >
                    <PhoneOff className="w-3.5 h-3.5" />
                    <span>Wrap Up / Hang Up</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
