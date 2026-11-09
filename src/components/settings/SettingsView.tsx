/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Settings,
  Key,
  Database,
  Cloud,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Shield,
  Clock,
  Eye,
  EyeOff,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import type { SystemSettings } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface SettingsViewProps {
  settings: SystemSettings | null;
  onSaveSettings: (payload: Partial<SystemSettings>) => Promise<void>;
  onSyncVapi: (key?: string) => Promise<void>;
  onSyncSupabase: (url?: string, key?: string) => Promise<void>;
  isSyncing: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onSyncVapi,
  onSyncSupabase,
  isSyncing,
}) => {
  const { permissions } = useAuth();
  const [formData, setFormData] = useState<Partial<SystemSettings>>({
    vapiKey: settings?.vapiKey || '',
    vapiPublicKey: settings?.vapiPublicKey || '',
    supabaseUrl: settings?.supabaseUrl || '',
    supabaseAnonKey: settings?.supabaseAnonKey || '',
    autoSyncIntervalMinutes: settings?.autoSyncIntervalMinutes || 15,
  });

  const [showVapiKey, setShowVapiKey] = useState(false);
  const [showSupabaseKey, setShowSupabaseKey] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const handleCopyWebhook = () => {
    const url = settings?.webhookUrl || `${window.location.origin}/api/vapi/webhook`;
    navigator.clipboard.writeText(url);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await onSaveSettings(formData);
      setSyncFeedback({
        type: 'success',
        message: 'Credentials saved. Now verifying synchronization with Vapi API...',
      });
      // Also automatically trigger sync with the newly saved key
      if (formData.vapiKey) {
        await onSyncVapi(formData.vapiKey);
        setSyncFeedback({
          type: 'success',
          message: 'Settings saved and Vapi API successfully synchronized!',
        });
      }
      setTimeout(() => setSyncFeedback(null), 4000);
    } catch (err: any) {
      console.error(err);
      setSyncFeedback({
        type: 'error',
        message: err.message || 'Failed to save settings.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDirectKeySync = async () => {
    if (!formData.vapiKey?.trim()) {
      setSyncFeedback({
        type: 'error',
        message: 'Please paste your Vapi Private API Key first.',
      });
      return;
    }

    try {
      setSyncFeedback({
        type: 'info',
        message: 'Connecting to Vapi API to fetch assistants, phone numbers, and call logs...',
      });
      // Save key first
      await onSaveSettings({ vapiKey: formData.vapiKey });
      // Then sync
      await onSyncVapi(formData.vapiKey);
      setSyncFeedback({
        type: 'success',
        message: 'Vapi API connected! Live assistants, phone lines, and call records synced to BlueSpider.',
      });
      setTimeout(() => setSyncFeedback(null), 5000);
    } catch (err: any) {
      setSyncFeedback({
        type: 'error',
        message: `Sync failed: ${err.message}`,
      });
    }
  };

  const handleTriggerSupabaseSync = async () => {
    try {
      setSyncFeedback({
        type: 'info',
        message: 'Initiating bidirectional sync with Supabase tables...',
      });
      await onSyncSupabase(formData.supabaseUrl, formData.supabaseAnonKey);
      setSyncFeedback({
        type: 'success',
        message: 'Successfully mirrored assistants, campaigns, and call logs to Supabase.',
      });
      setTimeout(() => setSyncFeedback(null), 4000);
    } catch (err: any) {
      setSyncFeedback({
        type: 'error',
        message: `Supabase sync error: ${err.message}`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">
            BlueSpider AI Dialer · API Credentials & Sync
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Connect your Vapi account to manage assistants, dial campaigns, and mirror audio call logs with Supabase.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDirectKeySync()}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync to Vapi</span>
          </button>
          <button
            onClick={handleTriggerSupabaseSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Sync to Supabase</span>
          </button>
        </div>
      </div>

      {/* Dynamic Feedback Banner */}
      {syncFeedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between animate-in fade-in ${
            syncFeedback.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
              : syncFeedback.type === 'error'
              ? 'bg-rose-950/60 border-rose-800 text-rose-200'
              : 'bg-indigo-950/60 border-indigo-800 text-indigo-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {syncFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : syncFeedback.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
            )}
            <span>{syncFeedback.message}</span>
          </div>
          <button
            onClick={() => setSyncFeedback(null)}
            className="text-slate-400 hover:text-slate-200 font-mono text-xs cursor-pointer ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Sync Status Banner */}
      <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-3">
        <div className="text-xs font-semibold text-slate-200 flex items-center gap-2">
          <Cloud className="w-4 h-4 text-cyan-400" />
          <span>Active Synchronization Telemetry</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-sans block">Vapi API Status</span>
            <div className="flex items-center gap-1.5 mt-1 font-bold text-slate-100">
              <span
                className={`w-2 h-2 rounded-full ${
                  settings?.syncStatus.vapiStatus === 'connected'
                    ? 'bg-emerald-400'
                    : settings?.syncStatus.vapiStatus === 'error'
                    ? 'bg-rose-400'
                    : 'bg-amber-400'
                }`}
              ></span>
              {settings?.syncStatus.vapiStatus === 'connected'
                ? 'CONNECTED / LIVE SYNC'
                : settings?.syncStatus.vapiStatus === 'error'
                ? 'AUTHENTICATION ERROR'
                : 'WAITING FOR PRIVATE KEY'}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block font-sans truncate">
              {settings?.syncStatus.syncMessage || 'Enter key to mirror assistants'}
            </span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-sans block">Supabase Cloud Sync</span>
            <div className="flex items-center gap-1.5 mt-1 font-bold text-slate-100">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              {settings?.syncStatus.supabaseStatus === 'connected' ? 'CONNECTED' : 'LOCAL EMULATION'}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block font-sans">
              PostgreSQL schema initialized & RLS active
            </span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-sans block">Sync Cadence</span>
            <div className="text-slate-100 font-bold mt-1">
              Every {formData.autoSyncIntervalMinutes || 15} Minutes
            </div>
            <span className="text-[10px] text-cyan-400 mt-1 block font-sans">
              Bidirectional background polling
            </span>
          </div>
        </div>
      </div>

      {/* Webhook Configuration Card */}
      <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-200">
              Vapi Server Webhook Endpoint
            </h2>
            <p className="text-xs text-slate-400">
              Add this webhook URL into your Vapi Dashboard to stream real-time call transcripts, function calls, and end-of-call reports directly into BlueSpider AI Dialer.
            </p>
          </div>
          <a
            href="https://dashboard.vapi.ai"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
          >
            <span>Vapi Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={settings?.webhookUrl || `${window.location.origin}/api/vapi/webhook`}
            className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-cyan-300 select-all focus:outline-none"
          />
          <button
            onClick={handleCopyWebhook}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
          >
            {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedWebhook ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* API Keys Configuration Form */}
      <form onSubmit={handleSave} className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-200">
              Credentials & Connection Keys
            </h2>
            <p className="text-xs text-slate-400">
              Changes take effect immediately on BlueSpider AI Dialer backend routes.
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            AES-256 Server Storage
          </span>
        </div>

        {/* Troubleshooting Callout for Vapi Private Key */}
        <div className="p-3 bg-cyan-950/40 border border-cyan-800/60 rounded-xl text-xs text-slate-300 space-y-1">
          <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>How to connect your Vapi account correctly:</span>
          </div>
          <ol className="list-decimal list-inside space-y-0.5 text-slate-400 text-[11px] pl-1">
            <li>
              Go to <a href="https://dashboard.vapi.ai" target="_blank" rel="noreferrer" className="text-cyan-400 underline">dashboard.vapi.ai</a> and log in.
            </li>
            <li>
              Click on <strong>API Keys</strong> in the left navigation sidebar.
            </li>
            <li>
              Copy your <strong>Private API Key</strong> (do not copy the Public Key).
            </li>
            <li>
              Paste it below and click <strong>Verify &amp; Sync Now</strong>.
            </li>
          </ol>
        </div>

        <div className="space-y-4 text-xs">
          {/* Vapi Private Key with Direct Verify Button */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-300 font-medium flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-cyan-400" />
                Vapi Private API Key *
              </label>
              <span className="text-[10px] text-slate-400">
                Required for assistants, phone numbers &amp; call sync
              </span>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showVapiKey ? 'text' : 'password'}
                  value={formData.vapiKey || ''}
                  onChange={(e) => setFormData({ ...formData, vapiKey: e.target.value })}
                  placeholder="Paste your Vapi Private Key here..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowVapiKey(!showVapiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showVapiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              <button
                type="button"
                onClick={handleDirectKeySync}
                disabled={isSyncing}
                className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs cursor-pointer transition-colors shadow-sm whitespace-nowrap shrink-0 disabled:opacity-50 flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Verify &amp; Sync Now</span>
              </button>
            </div>
          </div>

          {/* Vapi Public Key */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Vapi Public Key (Optional: for browser-native WebRTC calls)
            </label>
            <input
              type="text"
              value={formData.vapiPublicKey || ''}
              onChange={(e) => setFormData({ ...formData, vapiPublicKey: e.target.value })}
              placeholder="e.g. 8f6b... (Vapi Public Key)"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Supabase URL & Anon Key */}
          <div className="pt-2 border-t border-slate-800/80 space-y-4">
            <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Supabase Cloud Database Settings</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  value={formData.supabaseUrl || ''}
                  onChange={(e) => setFormData({ ...formData, supabaseUrl: e.target.value })}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-medium">
                    Supabase Anon / Service Role Key
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSupabaseKey(!showSupabaseKey)}
                    className="text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showSupabaseKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>
                <input
                  type={showSupabaseKey ? 'text' : 'password'}
                  value={formData.supabaseAnonKey || ''}
                  onChange={(e) => setFormData({ ...formData, supabaseAnonKey: e.target.value })}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Sync Interval */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Background Auto-Sync Cadence
              </label>
              <select
                value={formData.autoSyncIntervalMinutes}
                onChange={(e) =>
                  setFormData({ ...formData, autoSyncIntervalMinutes: parseInt(e.target.value, 10) })
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
              >
                <option value="5">Every 5 Minutes (Real-Time)</option>
                <option value="15">Every 15 Minutes (Standard)</option>
                <option value="30">Every 30 Minutes</option>
                <option value="60">Every 60 Minutes</option>
              </select>
            </div>
          </div>
        </div>

        {permissions.canManageSettings && (
          <div className="flex items-center justify-end pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs cursor-pointer shadow-sm transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving Keys...' : 'Save Configuration'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
