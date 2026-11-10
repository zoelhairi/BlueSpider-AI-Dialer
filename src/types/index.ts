/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'super_admin' | 'campaign_manager' | 'analyst' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  department: string;
  createdAt: string;
  lastActiveAt: string;
  status: 'active' | 'suspended';
}

export type LLMProvider = 'openai' | 'anthropic' | 'groq' | 'together-ai' | 'anyscale';
export type VoiceProvider = '11labs' | 'playht' | 'deepgram' | 'azure' | 'openai' | 'cartesia';
export type TranscriberProvider = 'deepgram' | 'whisper' | 'talkscriber';

export interface AssistantModelConfig {
  provider: LLMProvider;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  knowledgeBaseUrl?: string;
}

export interface AssistantVoiceConfig {
  provider: VoiceProvider;
  voiceId: string;
  speed: number;
  stability?: number;
  similarityBoost?: number;
  fillerWords?: boolean;
}

export interface AssistantTranscriberConfig {
  provider: TranscriberProvider;
  model: string;
  language: string;
}

export interface Assistant {
  id: string;
  vapiId?: string;
  name: string;
  description: string;
  model: AssistantModelConfig;
  voice: AssistantVoiceConfig;
  transcriber: AssistantTranscriberConfig;
  firstMessage: string;
  firstMessageMode?: 'assistant-speaks-first' | 'user-speaks-first';
  endCallPhrases: string[];
  endCallMessage?: string;
  recordingEnabled: boolean;
  serverUrl?: string;
  silenceTimeoutSeconds: number;
  maxDurationSeconds: number;
  createdAt: string;
  updatedAt: string;
  syncedToVapi: boolean;
  lastSyncedAt?: string;
}

export interface PhoneNumber {
  id: string;
  vapiId?: string;
  number: string;
  name: string;
  provider: 'twilio' | 'vonage' | 'vapi';
  assistantId?: string;
  assistantName?: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  syncedToVapi: boolean;
}

export type CampaignStatus = 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'failed';
export type CampaignType = 'outbound' | 'inbound';

export interface CampaignContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  variables: Record<string, string>;
  status: 'pending' | 'calling' | 'completed' | 'failed' | 'voicemail' | 'no-answer' | 'busy';
  callId?: string;
  vapiCallId?: string;
  callDurationSeconds?: number;
  callOutcome?: string;
  lastAttemptAt?: string;
  retryCount: number;
}

export interface Campaign {
  id: string;
  vapiId?: string;
  name: string;
  description: string;
  type: CampaignType;
  status: CampaignStatus;
  phoneNumberId: string;
  phoneNumber: string;
  assistantId: string;
  assistantName: string;
  audienceCount: number;
  completedCalls: number;
  successfulCalls: number;
  failedCalls: number;
  concurrentCalls: number;
  retryAttempts: number;
  retryIntervalMinutes: number;
  scheduleStart?: string;
  scheduleEnd?: string;
  contacts: CampaignContact[];
  createdAt: string;
  updatedAt: string;
  syncedToVapi: boolean;
  syncedToSupabase: boolean;
  lastSyncedAt?: string;
}

export type CallStatus = 'queued' | 'ringing' | 'in-progress' | 'forwarding' | 'ended';

export interface TranscriptMessage {
  id: string;
  role: 'bot' | 'user' | 'system';
  message: string;
  time: number; // offset in seconds from call start
  timestamp: string;
}

export interface CallLog {
  id: string;
  vapiCallId: string;
  campaignId?: string;
  campaignName?: string;
  assistantId: string;
  assistantName: string;
  customerPhone: string;
  customerName?: string;
  phoneNumber: string;
  type: 'outboundPhoneCall' | 'inboundPhoneCall' | 'webCall';
  status: CallStatus;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  cost: number;
  costBreakdown: {
    transport: number;
    stt: number;
    llm: number;
    tts: number;
    vapi: number;
  };
  endReason:
    | 'customer-ended-call'
    | 'assistant-ended-call'
    | 'silence-timeout'
    | 'max-duration'
    | 'voicemail'
    | 'failed'
    | 'busy'
    | 'in-progress'
    | 'operator-ended-call'
    | 'cleared-by-operator'
    | string;
  transcript: TranscriptMessage[];
  recordingUrl?: string;
  analysis: {
    summary: string;
    structuredData: Record<string, any>;
    successEvaluation: boolean;
    userSentiment: 'positive' | 'neutral' | 'negative';
  };
  latencyMetrics: {
    ttftMs: number;
    llmLatencyMs: number;
    ttsLatencyMs: number;
  };
  syncedToVapi: boolean;
  syncedToSupabase: boolean;
  lastSyncedAt?: string;
}

export interface CallAnalytics {
  totalCalls: number;
  completedCalls: number;
  inProgressCalls: number;
  failedCalls: number;
  totalDurationSeconds: number;
  avgDurationSeconds: number;
  totalCost: number;
  avgCostPerCall: number;
  connectionRate: number; // percentage 0-100
  positiveSentimentRate: number; // percentage 0-100
  callsByStatus: Record<string, number>;
  callsByEndReason: Record<string, number>;
  callsBySentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  volumeHistory: {
    date: string;
    calls: number;
    successRate: number;
    totalCost: number;
  }[];
}

export interface SystemSettings {
  vapiKey: string;
  vapiPublicKey: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceKey?: string;
  autoSyncIntervalMinutes: number;
  webhookUrl: string;
  isConfigured: boolean;
  syncStatus: {
    lastVapiSync?: string;
    lastSupabaseSync?: string;
    vapiStatus: 'connected' | 'unconfigured' | 'error';
    supabaseStatus: 'connected' | 'unconfigured' | 'error';
    syncMessage?: string;
  };
}
