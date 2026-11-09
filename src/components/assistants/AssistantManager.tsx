/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Bot,
  Plus,
  Copy,
  Trash2,
  Edit2,
  Volume2,
  Cloud,
  Check,
  Sparkles,
  Sliders,
  Mic,
  MessageSquare,
  Clock,
  PhoneForwarded,
} from 'lucide-react';
import type { Assistant, LLMProvider, VoiceProvider, TranscriberProvider } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface AssistantManagerProps {
  assistants: Assistant[];
  onCreate: (payload: Partial<Assistant>) => Promise<void>;
  onUpdate: (id: string, payload: Partial<Assistant>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onTestAssistant: (assistant: Assistant) => void;
}

export const AssistantManager: React.FC<AssistantManagerProps> = ({
  assistants,
  onCreate,
  onUpdate,
  onDelete,
  onTestAssistant,
}) => {
  const { permissions } = useAuth();
  const [editingAssistant, setEditingAssistant] = useState<Assistant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Assistant>>({
    name: '',
    description: '',
    model: {
      provider: 'openai',
      model: 'gpt-4o',
      temperature: 0.6,
      maxTokens: 300,
      systemPrompt: '',
    },
    voice: {
      provider: '11labs',
      voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel
      speed: 1.0,
      stability: 0.75,
      fillerWords: true,
    },
    transcriber: {
      provider: 'deepgram',
      model: 'nova-2',
      language: 'en',
    },
    firstMessage: 'Hello! How may I assist you today?',
    firstMessageMode: 'assistant-speaks-first',
    endCallPhrases: ['goodbye', 'have a nice day', 'talk soon'],
    recordingEnabled: true,
    silenceTimeoutSeconds: 30,
    maxDurationSeconds: 600,
  });

  const openCreateModal = () => {
    setEditingAssistant(null);
    setFormData({
      name: '',
      description: '',
      model: {
        provider: 'openai',
        model: 'gpt-4o',
        temperature: 0.6,
        maxTokens: 300,
        systemPrompt: 'You are a cordial, expert voice assistant for Acme Corp. Keep answers concise (under 2 sentences).',
      },
      voice: {
        provider: '11labs',
        voiceId: '21m00Tcm4TlvDq8ikWAM',
        speed: 1.0,
        stability: 0.75,
        fillerWords: true,
      },
      transcriber: {
        provider: 'deepgram',
        model: 'nova-2',
        language: 'en',
      },
      firstMessage: 'Hi there! This is Alex from Acme. How can I help you today?',
      firstMessageMode: 'assistant-speaks-first',
      endCallPhrases: ['goodbye', 'have a great day'],
      recordingEnabled: true,
      silenceTimeoutSeconds: 25,
      maxDurationSeconds: 600,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (asst: Assistant) => {
    setEditingAssistant(asst);
    setFormData({ ...asst });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    try {
      setIsSaving(true);
      if (editingAssistant) {
        await onUpdate(editingAssistant.id, formData);
      } else {
        await onCreate(formData);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save assistant.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDuplicate = async (asst: Assistant) => {
    const clone: Partial<Assistant> = {
      ...asst,
      name: `${asst.name} (Copy)`,
      vapiId: undefined,
    };
    await onCreate(clone);
  };

  // Preset Prompts loader
  const loadPreset = (type: 'sdr' | 'support' | 'reminder') => {
    if (type === 'sdr') {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || 'Outbound Sales Development Rep',
        firstMessage: 'Hi! This is Alex reaching out regarding your automated calling workflow. Do you have a quick moment?',
        model: {
          ...prev.model!,
          systemPrompt: 'You are an outbound sales representative. Qualify the prospect on their team size and current call volume. Offer to schedule a 15-minute briefing.',
        },
      }));
    } else if (type === 'support') {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || 'Tier-1 Technical Support Concierge',
        firstMessage: 'Thank you for calling Technical Support. My name is Jordan. What issue can I help troubleshoot today?',
        model: {
          ...prev.model!,
          systemPrompt: 'You are an empathetic technical support agent. Ask for their account email or device model and provide clear, step-by-step guidance.',
        },
      }));
    } else if (type === 'reminder') {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || 'Healthcare Patient Appointment Reminder',
        firstMessage: 'Hello, this is Sarah with Summit Health calling to confirm your upcoming appointment tomorrow. Will you be attending?',
        model: {
          ...prev.model!,
          systemPrompt: 'Confirm tomorrow appointment. If patient agrees, thank them and remind them to bring insurance cards. If rescheduling, record requested time.',
        },
      }));
    }
  };

  // Quick voice speech synthesis sample test
  const testVoiceSample = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = formData.voice?.speed || 1.0;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Speech synthesis audio test not supported in this browser.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">
            BlueSpider Voice AI Assistants
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure multi-model LLM instructions, ElevenLabs &amp; Deepgram voice synthesis, and real-time interruption parameters.
          </p>
        </div>
        {permissions.canCreateAssistant && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Assistant</span>
          </button>
        )}
      </div>

      {/* Assistants Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assistants.map((asst) => (
          <div
            key={asst.id}
            className="p-5 bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 rounded-xl flex flex-col justify-between transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-950/70 border border-indigo-800/70 flex items-center justify-center text-indigo-400 shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 leading-tight">
                      {asst.name}
                    </h3>
                    <span className="text-[10px] font-mono text-indigo-400">
                      {asst.vapiId || 'local-draft'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {asst.syncedToVapi ? (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-900/50">
                      <Cloud className="w-2.5 h-2.5" /> VAPI
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-900/50">
                      Pending Sync
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2">
                {asst.description || asst.model.systemPrompt}
              </p>

              {/* Stack specifications */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/70 text-[11px] font-mono">
                <div className="p-1.5 bg-slate-950 rounded border border-slate-800/70">
                  <span className="text-slate-400 text-[10px] block">LLM Engine</span>
                  <span className="text-slate-200 font-semibold truncate block">
                    {asst.model.provider} / {asst.model.model}
                  </span>
                </div>
                <div className="p-1.5 bg-slate-950 rounded border border-slate-800/70">
                  <span className="text-slate-400 text-[10px] block">Voice Provider</span>
                  <span className="text-slate-200 font-semibold truncate block">
                    {asst.voice.provider}
                  </span>
                </div>
              </div>

              {/* First message preview */}
              <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/60 text-xs text-slate-300 italic">
                <span className="text-indigo-400 not-italic font-semibold text-[10px] uppercase block mb-0.5">
                  Opening Greeting:
                </span>
                "{asst.firstMessage}"
              </div>
            </div>

            {/* Actions footer */}
            <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-800">
              <button
                onClick={() => onTestAssistant(asst)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-indigo-300 bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-800/60 rounded cursor-pointer transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Test Voice</span>
              </button>

              <div className="flex items-center gap-1">
                {permissions.canEditAssistant && (
                  <button
                    onClick={() => openEditModal(asst)}
                    title="Edit Assistant"
                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {permissions.canCreateAssistant && (
                  <button
                    onClick={() => handleDuplicate(asst)}
                    title="Duplicate Assistant"
                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                )}
                {permissions.canDeleteAssistant && (
                  <button
                    onClick={() => {
                      if (confirm(`Delete assistant "${asst.name}"?`)) {
                        onDelete(asst.id);
                      }
                    }}
                    title="Delete Assistant"
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Assistant Modal (Create & Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-100">
                  {editingAssistant ? 'Configure Voice Assistant' : 'Create New Voice Assistant'}
                </h2>
                <p className="text-xs text-slate-400">
                  Define conversational persona, speech synthesis engine, and interruption thresholds.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 text-[11px] font-semibold uppercase">
                Templates:
              </span>
              <button
                type="button"
                onClick={() => loadPreset('sdr')}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] cursor-pointer"
              >
                Sales SDR
              </button>
              <button
                type="button"
                onClick={() => loadPreset('support')}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] cursor-pointer"
              >
                Tier-1 Support
              </button>
              <button
                type="button"
                onClick={() => loadPreset('reminder')}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] cursor-pointer"
              >
                Clinic Reminder
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Name & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Assistant Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Inbound Concierge Lead Qualifier"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Vapi Identifier (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.vapiId || ''}
                    onChange={(e) => setFormData({ ...formData, vapiId: e.target.value })}
                    placeholder="vapi-asst-auto-generated"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* LLM Model Config */}
              <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
                <div className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" /> LLM Intelligence Engine
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Provider</label>
                    <select
                      value={formData.model?.provider || 'openai'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          model: { ...formData.model!, provider: e.target.value as LLMProvider },
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-slate-200"
                    >
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic</option>
                      <option value="groq">Groq</option>
                      <option value="together-ai">Together AI</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Model Name</label>
                    <select
                      value={formData.model?.model || 'gpt-4o'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          model: { ...formData.model!, model: e.target.value },
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-slate-200 font-mono"
                    >
                      <option value="gpt-4o">gpt-4o (Recommended)</option>
                      <option value="gpt-4o-mini">gpt-4o-mini (Low Latency)</option>
                      <option value="claude-3-5-sonnet">claude-3-5-sonnet</option>
                      <option value="llama-3.3-70b-versatile">llama-3.3-70b (Groq)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">
                      Temperature: {formData.model?.temperature}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={formData.model?.temperature ?? 0.6}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          model: { ...formData.model!, temperature: parseFloat(e.target.value) },
                        })
                      }
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    System Instructions & Behavioral Prompt *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.model?.systemPrompt || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        model: { ...formData.model!, systemPrompt: e.target.value },
                      })
                    }
                    placeholder="Provide detailed conversational instructions for the voice agent..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-500 font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Voice & TTS Engine */}
              <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5" /> Voice Synthesis (TTS) & Speed
                  </div>
                  <button
                    type="button"
                    onClick={() => testVoiceSample(formData.firstMessage || 'Hello, I am testing my voice.')}
                    className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Play Test Sample</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">TTS Provider</label>
                    <select
                      value={formData.voice?.provider || '11labs'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          voice: { ...formData.voice!, provider: e.target.value as VoiceProvider },
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-slate-200"
                    >
                      <option value="11labs">ElevenLabs (High Naturalness)</option>
                      <option value="playht">PlayHT</option>
                      <option value="deepgram">Deepgram Aura</option>
                      <option value="openai">OpenAI TTS</option>
                      <option value="cartesia">Cartesia Sonic</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Voice Character / ID</label>
                    <input
                      type="text"
                      value={formData.voice?.voiceId || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          voice: { ...formData.voice!, voiceId: e.target.value },
                        })
                      }
                      placeholder="e.g. 21m00Tcm4TlvDq8ikWAM (Rachel)"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">
                      Speaking Speed: {formData.voice?.speed}x
                    </label>
                    <input
                      type="range"
                      min="0.8"
                      max="1.3"
                      step="0.05"
                      value={formData.voice?.speed ?? 1.0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          voice: { ...formData.voice!, speed: parseFloat(e.target.value) },
                        })
                      }
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* First Message & End Call */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    First Message (Bot Greeting) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstMessage || ''}
                    onChange={(e) => setFormData({ ...formData, firstMessage: e.target.value })}
                    placeholder="Hello! This is Alex from Acme..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Silence Timeout (Seconds)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="120"
                    value={formData.silenceTimeoutSeconds || 30}
                    onChange={(e) =>
                      setFormData({ ...formData, silenceTimeoutSeconds: parseInt(e.target.value, 10) })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : editingAssistant ? 'Save Changes' : 'Create & Sync Assistant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
