import React, { useState } from 'react';
import {
  Radio,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Users,
  Upload,
  PhoneCall,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  Cloud,
  AlertTriangle,
  Key,
  PhoneForwarded,
  Zap,
  Shield,
  X,
  RefreshCw,
  Phone,
} from 'lucide-react';
import type { Campaign, CampaignContact, Assistant, PhoneNumber, SystemSettings } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface CampaignManagerProps {
  campaigns: Campaign[];
  assistants: Assistant[];
  phoneNumbers: PhoneNumber[];
  settings?: SystemSettings | null;
  onSaveSettings?: (payload: Partial<SystemSettings>) => Promise<void>;
  onCreateCampaign: (payload: Partial<Campaign>) => Promise<void>;
  onUpdateCampaign: (id: string, payload: Partial<Campaign>) => Promise<void>;
  onDeleteCampaign: (id: string) => Promise<void>;
  onStartCampaign: (id: string, vapiKey?: string) => Promise<any>;
  onPauseCampaign: (id: string) => Promise<void>;
  onResetCampaign: (id: string) => Promise<void>;
  onCallContact?: (campaignId: string, contactId: string, vapiKey?: string) => Promise<any>;
  onDialSingle?: (payload: {
    customerNumber: string;
    customerName?: string;
    assistantId?: string;
    phoneNumberId?: string;
    vapiKey?: string;
  }) => Promise<any>;
  onCompleteContactCall: (
    campaignId: string,
    contactId: string,
    outcome: string,
    status: string,
    duration?: number
  ) => Promise<void>;
  onNavigateToMonitor: () => void;
}

export const CampaignManager: React.FC<CampaignManagerProps> = ({
  campaigns,
  assistants,
  phoneNumbers,
  settings,
  onSaveSettings,
  onCreateCampaign,
  onDeleteCampaign,
  onStartCampaign,
  onPauseCampaign,
  onResetCampaign,
  onCallContact,
  onDialSingle,
  onCompleteContactCall,
  onNavigateToMonitor,
}) => {
  const { permissions } = useAuth();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(campaigns[0] || null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Vapi Real Outbound Dialing State & Feedback
  const [callingContactId, setCallingContactId] = useState<string | null>(null);
  const [isDispatchingBatch, setIsDispatchingBatch] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
  } | null>(null);

  // API Key Prompt Modal State
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [inputApiKey, setInputApiKey] = useState(settings?.vapiKey || '');
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    | { type: 'dispatch_batch'; campaignId: string }
    | { type: 'call_contact'; contact: CampaignContact }
    | null
  >(null);

  // Quick Direct Dial Modal State
  const [isQuickDialOpen, setIsQuickDialOpen] = useState(false);
  const [quickDialData, setQuickDialData] = useState({
    customerNumber: '+628999956403',
    customerName: 'Zoel',
    assistantId: assistants[0]?.id || '',
    phoneNumberId: phoneNumbers[0]?.id || '',
  });
  const [isQuickDialing, setIsQuickDialing] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Campaign>>({
    name: '',
    description: '',
    type: 'outbound',
    phoneNumberId: phoneNumbers[0]?.id || '',
    assistantId: assistants[0]?.id || '',
    concurrentCalls: 3,
    retryAttempts: 2,
    retryIntervalMinutes: 30,
    contacts: [],
  });

  const [manualContact, setManualContact] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
  });

  const openCreateModal = () => {
    setFormData({
      name: '',
      description: '',
      type: 'outbound',
      phoneNumberId: phoneNumbers[0]?.id || '',
      assistantId: assistants[0]?.id || '',
      concurrentCalls: 3,
      retryAttempts: 2,
      retryIntervalMinutes: 30,
      contacts: [],
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.assistantId) return;

    try {
      setIsSubmitting(true);
      await onCreateCampaign(formData);
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddManualContact = () => {
    if (!manualContact.name || !manualContact.phone) return;
    const newContact: CampaignContact = {
      id: `cnt-m-${Date.now()}`,
      name: manualContact.name,
      phone: manualContact.phone,
      email: manualContact.email,
      company: manualContact.company,
      variables: {},
      status: 'pending',
      retryCount: 0,
    };
    setFormData((prev) => ({
      ...prev,
      contacts: [...(prev.contacts || []), newContact],
    }));
    setManualContact({ name: '', phone: '', email: '', company: '' });
  };

  const handleLoadSampleLeads = () => {
    const samples: CampaignContact[] = [
      {
        id: `cnt-sample-1`,
        name: 'Jordan Miller',
        phone: '+1 (415) 555-8821',
        email: 'jordan@strataflow.com',
        company: 'StrataFlow Systems',
        variables: { title: 'Head of Infrastructure', interest: 'Telephony API' },
        status: 'pending',
        retryCount: 0,
      },
      {
        id: `cnt-sample-2`,
        name: 'Rachel Sterling',
        phone: '+1 (650) 555-3349',
        email: 'rsterling@quantumlogic.io',
        company: 'Quantum Logic Corp',
        variables: { title: 'VP Customer Operations', interest: 'Call Center AI' },
        status: 'pending',
        retryCount: 0,
      },
      {
        id: `cnt-sample-3`,
        name: 'Carlos Mendoza',
        phone: '+1 (212) 555-9012',
        email: 'cmendoza@manhattanfin.com',
        company: 'Manhattan Financial',
        variables: { title: 'Operations Director', interest: 'Compliance Auditing' },
        status: 'pending',
        retryCount: 0,
      },
      {
        id: `cnt-sample-4`,
        name: 'Evelyn Wright',
        phone: '+1 (312) 555-4420',
        email: 'ewright@chicagohealth.org',
        company: 'Midwest Medical Partners',
        variables: { title: 'Patient Services Lead', interest: 'Appointment Reminders' },
        status: 'pending',
        retryCount: 0,
      },
    ];
    setFormData((prev) => ({
      ...prev,
      contacts: [...(prev.contacts || []), ...samples],
    }));
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      if (lines.length < 2) return;

      const parsed: CampaignContact[] = [];
      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
        if (parts.length >= 2 && parts[0] && parts[1]) {
          parsed.push({
            id: `cnt-csv-${Date.now()}-${i}`,
            name: parts[0],
            phone: parts[1],
            email: parts[2] || '',
            company: parts[3] || '',
            variables: {},
            status: 'pending',
            retryCount: 0,
          });
        }
      }

      setFormData((prev) => ({
        ...prev,
        contacts: [...(prev.contacts || []), ...parsed],
      }));
    };
    reader.readAsText(file);
  };

  // Keep selectedCampaign in sync
  const currentCampaign = campaigns.find((c) => c.id === selectedCampaign?.id) || campaigns[0] || null;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">
            Outbound & Inbound Campaigns Dialer
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated batch dispatching with concurrent voice lines, retry schedules, and synchronized Vapi & Supabase queue records.
          </p>
        </div>
        {permissions.canCreateCampaign && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Campaign</span>
          </button>
        )}
      </div>

      {/* Campaigns Listing & Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Campaigns List (1 col) */}
        <div className="space-y-3">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            All Campaigns ({campaigns.length})
          </div>

          <div className="space-y-2.5">
            {campaigns.map((camp) => {
              const isSelected = currentCampaign?.id === camp.id;
              const isRunning = camp.status === 'running';
              const progress =
                camp.audienceCount > 0 ? Math.round((camp.completedCalls / camp.audienceCount) * 100) : 0;

              return (
                <div
                  key={camp.id}
                  onClick={() => setSelectedCampaign(camp)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500/80 shadow-md shadow-indigo-950/40'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Radio className={`w-4 h-4 ${isRunning ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
                      <h3 className="text-xs font-bold text-slate-100 truncate max-w-[150px]">
                        {camp.name}
                      </h3>
                    </div>
                    <span
                      className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded border ${
                        isRunning
                          ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800'
                          : camp.status === 'completed'
                          ? 'text-indigo-400 bg-indigo-950/60 border-indigo-800'
                          : 'text-amber-400 bg-amber-950/60 border-amber-800'
                      }`}
                    >
                      {camp.status}
                    </span>
                  </div>

                  <div className="mt-2 text-[11px] text-slate-400 truncate">
                    {camp.phoneNumber} · {camp.assistantName}
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2.5 space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>{camp.completedCalls} / {camp.audienceCount} reached</span>
                      <span className="text-slate-200">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${progress}%` }}
                        className="bg-indigo-500 h-full rounded-full transition-all"
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Campaign Workspace & Contact Queue (2 cols) */}
        {currentCampaign ? (
          <div className="lg:col-span-2 space-y-4">
            {/* Campaign Control Bar */}
            <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-100">
                      {currentCampaign.name}
                    </h2>
                    <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-900/60">
                      {currentCampaign.type.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {currentCampaign.description || 'Automated voice campaign pipeline.'}
                  </p>
                </div>

                {/* Dialer Action Buttons */}
                <div className="flex items-center gap-2">
                  {currentCampaign.status === 'running' ? (
                    <button
                      onClick={() => onPauseCampaign(currentCampaign.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-800 rounded-lg cursor-pointer transition-colors"
                    >
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause Dialer</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onStartCampaign(currentCampaign.id)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm cursor-pointer transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Dispatch Batch ({currentCampaign.concurrentCalls} Lines)</span>
                    </button>
                  )}

                  <button
                    onClick={() => onResetCampaign(currentCampaign.id)}
                    title="Reset call outcomes and re-queue all contacts"
                    className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-lg cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  {permissions.canDeleteCampaign && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete campaign "${currentCampaign.name}"?`)) {
                          onDeleteCampaign(currentCampaign.id);
                        }
                      }}
                      title="Delete Campaign"
                      className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Metrics bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/70">
                  <span className="text-[10px] text-slate-400 block font-sans">Assigned Line</span>
                  <span className="text-slate-200 font-bold truncate block">{currentCampaign.phoneNumber}</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/70">
                  <span className="text-[10px] text-slate-400 block font-sans">Voice Assistant</span>
                  <span className="text-slate-200 font-bold truncate block">{currentCampaign.assistantName}</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/70">
                  <span className="text-[10px] text-slate-400 block font-sans">Concurrent Channels</span>
                  <span className="text-slate-200 font-bold block">{currentCampaign.concurrentCalls} Calls</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/70">
                  <span className="text-[10px] text-slate-400 block font-sans">Successful Reached</span>
                  <span className="text-emerald-400 font-bold block">
                    {currentCampaign.successfulCalls} / {currentCampaign.audienceCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Contacts Queue Table */}
            <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">
                    Target Contact Queue ({currentCampaign.contacts.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Live call progression for leads in this campaign batch
                  </p>
                </div>
                <button
                  onClick={onNavigateToMonitor}
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                >
                  <span>Open Live Monitor</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {currentCampaign.contacts.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl space-y-2">
                  <Users className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-400">
                    No contacts assigned to this campaign yet.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                        <th className="py-2 px-3">Lead Contact</th>
                        <th className="py-2 px-3">Phone</th>
                        <th className="py-2 px-3">Company</th>
                        <th className="py-2 px-3">Dialer Status</th>
                        <th className="py-2 px-3">Duration</th>
                        <th className="py-2 px-3">Outcome</th>
                        <th className="py-2 px-3 text-right">Simulate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {currentCampaign.contacts.map((contact) => (
                        <tr key={contact.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-2.5 px-3 text-slate-200 font-sans font-medium">
                            {contact.name}
                          </td>
                          <td className="py-2.5 px-3 text-indigo-300 font-semibold tabular-nums">
                            {contact.phone}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 font-sans truncate max-w-[120px]">
                            {contact.company || 'N/A'}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
                                contact.status === 'calling'
                                  ? 'text-indigo-400 bg-indigo-950 animate-pulse font-bold'
                                  : contact.status === 'completed'
                                  ? 'text-emerald-400 bg-emerald-950/70'
                                  : contact.status === 'voicemail'
                                  ? 'text-amber-400 bg-amber-950/70'
                                  : contact.status === 'failed'
                                  ? 'text-rose-400 bg-rose-950/70'
                                  : 'text-slate-400 bg-slate-900'
                              }`}
                            >
                              {contact.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-300 tabular-nums">
                            {contact.callDurationSeconds ? `${contact.callDurationSeconds}s` : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 font-sans truncate max-w-[180px]">
                            {contact.callOutcome || 'Queued for dispatch'}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {contact.status === 'calling' && (
                              <button
                                onClick={() =>
                                  onCompleteContactCall(
                                    currentCampaign.id,
                                    contact.id,
                                    'Call concluded with meeting scheduled',
                                    'completed',
                                    125
                                  )
                                }
                                className="px-2 py-0.5 text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 rounded hover:bg-emerald-900 cursor-pointer"
                              >
                                Wrap Up
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* Create Campaign Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-100">
                  Create Outbound Voice Campaign
                </h2>
                <p className="text-xs text-slate-400">
                  Configure phone number trunk, voice assistant model, and audience contact queue.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Q4 Cloud Infrastructure Outreach"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Campaign Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  >
                    <option value="outbound">Outbound Dialing Campaign</option>
                    <option value="inbound">Inbound Queue Router</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Description / Campaign Objective
                </label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Outline the qualification goals and target audience profile..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Binding Line & Assistant */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Telephony Phone Line *
                  </label>
                  <select
                    required
                    value={formData.phoneNumberId}
                    onChange={(e) => setFormData({ ...formData, phoneNumberId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono"
                  >
                    {phoneNumbers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.number} ({p.name})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Assigned Voice Assistant *
                  </label>
                  <select
                    required
                    value={formData.assistantId}
                    onChange={(e) => setFormData({ ...formData, assistantId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  >
                    {assistants.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Concurrency & Retry Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Concurrent Calls Capacity: {formData.concurrentCalls} Lines
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={formData.concurrentCalls || 3}
                    onChange={(e) => setFormData({ ...formData, concurrentCalls: parseInt(e.target.value, 10) })}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Retry Attempts for Voicemail / Busy
                  </label>
                  <select
                    value={formData.retryAttempts}
                    onChange={(e) => setFormData({ ...formData, retryAttempts: parseInt(e.target.value, 10) })}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-slate-200 font-mono"
                  >
                    <option value="1">1 Retry Attempt</option>
                    <option value="2">2 Retry Attempts</option>
                    <option value="3">3 Retry Attempts</option>
                  </select>
                </div>
              </div>

              {/* Target Contacts Queue Importer */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-200">
                    Target Contacts ({formData.contacts?.length || 0} Added)
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleLoadSampleLeads}
                      className="flex items-center gap-1 px-2.5 py-1 bg-indigo-950 text-indigo-300 hover:bg-indigo-900 border border-indigo-800 rounded text-[11px] cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Load 4 Sample Leads</span>
                    </button>
                    <label className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] cursor-pointer">
                      <Upload className="w-3 h-3" />
                      <span>Upload CSV</span>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleCSVUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Manual contact adder */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  <input
                    type="text"
                    placeholder="Name"
                    value={manualContact.name}
                    onChange={(e) => setManualContact({ ...manualContact, name: e.target.value })}
                    className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Phone (+1...)"
                    value={manualContact.phone}
                    onChange={(e) => setManualContact({ ...manualContact, phone: e.target.value })}
                    className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 font-mono text-xs"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={manualContact.email}
                    onChange={(e) => setManualContact({ ...manualContact, email: e.target.value })}
                    className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Company"
                    value={manualContact.company}
                    onChange={(e) => setManualContact({ ...manualContact, company: e.target.value })}
                    className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddManualContact}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
