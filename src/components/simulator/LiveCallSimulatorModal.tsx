/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  Bot,
  User,
  Clock,
} from 'lucide-react';
import type { Assistant, CallLog } from '../../types/index.ts';

interface LiveCallSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  assistants: Assistant[];
  onCallCompleted: (newCall: CallLog) => void;
}

export const LiveCallSimulatorModal: React.FC<LiveCallSimulatorModalProps> = ({
  isOpen,
  onClose,
  assistants,
  onCallCompleted,
}) => {
  const [selectedAssistantId, setSelectedAssistantId] = useState<string>(assistants[0]?.id || '');
  const [callState, setCallState] = useState<'idle' | 'ringing' | 'connected' | 'ended'>('idle');
  const [messages, setMessages] = useState<{ role: 'bot' | 'user'; text: string; time: string }[]>([]);
  const [userInput, setUserInput] = useState('');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceAudioEnabled, setVoiceAudioEnabled] = useState(true);

  const assistant = assistants.find((a) => a.id === selectedAssistantId) || assistants[0];

  // Duration timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (callState === 'connected') {
      timer = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callState]);

  // Handle Assistant Speech Synthesis
  const speakText = (text: string) => {
    if (!voiceAudioEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = assistant?.voice?.speed || 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const startCall = () => {
    setCallState('ringing');
    setMessages([]);
    setDuration(0);

    setTimeout(() => {
      setCallState('connected');
      const greeting = assistant?.firstMessage || 'Hello! How may I assist you today?';
      setMessages([{ role: 'bot', text: greeting, time: new Date().toLocaleTimeString() }]);
      speakText(greeting);
    }, 1500);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || callState !== 'connected') return;

    const userText = userInput.trim();
    setUserInput('');

    const newMsgs = [
      ...messages,
      { role: 'user' as const, text: userText, time: new Date().toLocaleTimeString() },
    ];
    setMessages(newMsgs);

    // Simulate intelligent Vapi assistant response
    setTimeout(() => {
      let botResponse = '';
      const lower = userText.toLowerCase();

      if (lower.includes('price') || lower.includes('cost') || lower.includes('pricing')) {
        botResponse = 'Our voice automation starts at $0.05 per minute with zero upfront commitment. Would you like me to send over our enterprise tiered rates?';
      } else if (lower.includes('schedule') || lower.includes('demo') || lower.includes('time') || lower.includes('thursday')) {
        botResponse = 'I would be delighted to schedule that. I have available openings on Thursday at 2:00 PM or Friday at 10:00 AM PST. Which works best for you?';
      } else if (lower.includes('integration') || lower.includes('api') || lower.includes('vapi') || lower.includes('supabase')) {
        botResponse = 'We support real-time webhooks, Supabase bidirectional sync, and Vapi native telephony trunks with sub-400 millisecond response times.';
      } else if (lower.includes('bye') || lower.includes('goodbye') || lower.includes('thank')) {
        botResponse = assistant?.endCallMessage || 'Thank you so much for your time. Have an outstanding day!';
      } else {
        botResponse = `Understood. In regard to "${userText}", our voice AI platform orchestrates real-time conversation models with high naturalness. What other questions can I answer for you?`;
      }

      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: botResponse, time: new Date().toLocaleTimeString() },
      ]);
      speakText(botResponse);
    }, 700);
  };

  const endCall = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCallState('ended');

    // Create CallLog record to persist
    const newCallLog: CallLog = {
      id: `sim-call-${Date.now()}`,
      vapiCallId: `vapi-sim-${Math.random().toString(36).substring(2, 9)}`,
      assistantId: assistant?.id || 'asst-01',
      assistantName: assistant?.name || 'Voice Assistant',
      customerPhone: '+1 (555) 998-1200',
      customerName: 'Interactive Web Caller',
      phoneNumber: '+1 (800) 555-0199',
      type: 'webCall',
      status: 'ended',
      startedAt: new Date(Date.now() - duration * 1000).toISOString(),
      endedAt: new Date().toISOString(),
      durationSeconds: Math.max(15, duration),
      cost: Number((Math.max(15, duration) * 0.0015).toFixed(4)),
      costBreakdown: { transport: 0.005, stt: 0.004, llm: 0.008, tts: 0.006, vapi: 0.002 },
      endReason: 'customer-ended-call',
      transcript: messages.map((m, idx) => ({
        id: `t-sim-${idx}`,
        role: m.role,
        message: m.text,
        time: idx * 4,
        timestamp: m.time,
      })),
      analysis: {
        summary: `Interactive voice test with ${assistant?.name}. ${messages.length} conversational turns conducted.`,
        structuredData: { demoTest: true, turns: messages.length },
        successEvaluation: true,
        userSentiment: 'positive',
      },
      latencyMetrics: { ttftMs: 340, llmLatencyMs: 380, ttsLatencyMs: 180 },
      syncedToVapi: true,
      syncedToSupabase: true,
    };

    onCallCompleted(newCallLog);
  };

  if (!isOpen) return null;

  const mins = Math.floor(duration / 60);
  const secs = duration % 60;
  const timeFormatted = `${mins}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                Interactive Voice AI Simulator
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">
                Web Speech Synthesis & Duplex Dialogue
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              onClose();
            }}
            className="text-slate-400 hover:text-slate-200 text-sm font-mono cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Assistant Selector & Voice Toggle */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex-1">
            <label className="block text-[11px] text-slate-400 mb-1 font-medium">
              Select Voice Assistant
            </label>
            <select
              disabled={callState === 'connected' || callState === 'ringing'}
              value={selectedAssistantId}
              onChange={(e) => setSelectedAssistantId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none"
            >
              {assistants.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.model.provider} / {a.model.model})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-medium">
              Voice Audio
            </label>
            <button
              onClick={() => setVoiceAudioEnabled(!voiceAudioEnabled)}
              className={`p-1.5 rounded border text-xs flex items-center gap-1 cursor-pointer ${
                voiceAudioEnabled
                  ? 'bg-indigo-950/70 border-indigo-800 text-indigo-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {voiceAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Live Call Canvas */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
          {callState === 'idle' && (
            <div className="text-center py-8 space-y-3">
              <div className="w-14 h-14 rounded-full bg-indigo-950/60 border border-indigo-800/80 flex items-center justify-center mx-auto text-indigo-400">
                <Bot className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">{assistant?.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click below to dial into the interactive voice session.
                </p>
              </div>
              <button
                onClick={startCall}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs cursor-pointer shadow-lg shadow-emerald-950/50 inline-flex items-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Dial & Connect Call</span>
              </button>
            </div>
          )}

          {callState === 'ringing' && (
            <div className="text-center py-8 space-y-3">
              <div className="w-14 h-14 rounded-full bg-amber-950/60 border border-amber-800/80 flex items-center justify-center mx-auto text-amber-400 animate-pulse">
                <PhoneCall className="w-7 h-7" />
              </div>
              <div className="text-xs text-amber-400 font-mono">
                Initiating WebRTC audio session with Vapi...
              </div>
            </div>
          )}

          {callState === 'connected' && (
            <div className="space-y-3">
              {/* Call active status bar */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="font-semibold text-slate-200">{assistant?.name}</span>
                </div>
                <div className="font-mono font-bold text-emerald-400 tabular-nums">
                  {timeFormatted}
                </div>
              </div>

              {/* Live conversation turns */}
              <div className="h-48 overflow-y-auto space-y-2 pr-1 text-xs">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border ${
                      m.role === 'bot'
                        ? 'bg-slate-900 border-slate-800 text-slate-200'
                        : 'bg-indigo-950/60 border-indigo-900/60 text-indigo-100 ml-6'
                    }`}
                  >
                    <div className="text-[10px] text-slate-400 mb-0.5 flex justify-between">
                      <span className="font-semibold text-indigo-400">
                        {m.role === 'bot' ? 'Assistant' : 'You'}
                      </span>
                      <span className="font-mono">{m.time}</span>
                    </div>
                    <p>{m.text}</p>
                  </div>
                ))}
              </div>

              {/* Chat Input / Simulated Speech */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type what you want to say to the assistant..."
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Hangup button */}
              <div className="text-center pt-2">
                <button
                  onClick={endCall}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-xs cursor-pointer shadow-md shadow-rose-950/40 inline-flex items-center gap-2"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>End Call & Save Telemetry</span>
                </button>
              </div>
            </div>
          )}

          {callState === 'ended' && (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-800/80 flex items-center justify-center mx-auto text-emerald-400">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Call Completed</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Recorded duration: {timeFormatted}. Telemetry has been mirrored to Vapi Call Logs and Supabase.
                </p>
              </div>
              <button
                onClick={() => setCallState('idle')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs cursor-pointer"
              >
                Start New Session
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
