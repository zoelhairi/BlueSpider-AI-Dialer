/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Header } from './components/layout/Header.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { AnalyticsDashboard } from './components/dashboard/AnalyticsDashboard.tsx';
import { AssistantManager } from './components/assistants/AssistantManager.tsx';
import { PhoneNumberManager } from './components/phoneNumbers/PhoneNumberManager.tsx';
import { CampaignManager } from './components/campaigns/CampaignManager.tsx';
import { LiveCallMonitor } from './components/monitoring/LiveCallMonitor.tsx';
import { CallLogsView } from './components/callLogs/CallLogsView.tsx';
import { UserManagementView } from './components/users/UserManagementView.tsx';
import { SettingsView } from './components/settings/SettingsView.tsx';
import { DeploymentGuideView } from './components/deployment/DeploymentGuideView.tsx';
import { LiveCallSimulatorModal } from './components/simulator/LiveCallSimulatorModal.tsx';

import type {
  Assistant,
  PhoneNumber,
  Campaign,
  CallLog,
  CallAnalytics,
  User,
  SystemSettings,
} from './types/index.ts';

import * as api from './services/api.ts';

function AppContent() {
  const { currentUser, role } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Core Data State
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [analytics, setAnalytics] = useState<CallAnalytics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  // Inspector and Simulator State
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | undefined>();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initial Data Fetch
  const loadAllData = async () => {
    try {
      const [assts, phones, camps, callData, anlt, usrs, sett] = await Promise.all([
        api.fetchAssistants(),
        api.fetchPhoneNumbers(),
        api.fetchCampaigns(),
        api.fetchCalls(),
        api.fetchAnalytics(),
        api.fetchUsers(),
        api.fetchSettings(),
      ]);

      setAssistants(assts);
      setPhoneNumbers(phones);
      setCampaigns(camps);
      setCalls(callData.calls);
      setAnalytics(anlt);
      setUsers(usrs);
      setSettings(sett);
    } catch (err) {
      console.error('Failed to load application data:', err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Periodic polling for active calls and analytics
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [callData, anlt, camps] = await Promise.all([
          api.fetchCalls(),
          api.fetchAnalytics(),
          api.fetchCampaigns(),
        ]);
        setCalls(callData.calls);
        setAnalytics(anlt);
        setCampaigns(camps);
      } catch (e) {
        // quiet background refresh
      }
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Sync to Vapi handler
  const handleSyncVapi = async (key?: string) => {
    try {
      setIsSyncing(true);
      setSyncFeedback('Synchronizing with Vapi API...');
      const res = await api.syncVapi(key);
      setSyncFeedback(res.message || 'Vapi sync complete');
      await loadAllData();
      setTimeout(() => setSyncFeedback(undefined), 3500);
    } catch (err: any) {
      setSyncFeedback(`Vapi sync error: ${err.message}`);
      setTimeout(() => setSyncFeedback(undefined), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync to Supabase handler
  const handleSyncSupabase = async (url?: string, key?: string) => {
    try {
      setIsSyncing(true);
      setSyncFeedback('Syncing records to Supabase tables...');
      const res = await api.syncSupabase(url, key);
      setSyncFeedback(res.message || 'Supabase sync complete');
      await loadAllData();
      setTimeout(() => setSyncFeedback(undefined), 3500);
    } catch (err: any) {
      setSyncFeedback(`Supabase sync error: ${err.message}`);
      setTimeout(() => setSyncFeedback(undefined), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  // Assistant CRUD Handlers
  const handleCreateAssistant = async (payload: Partial<Assistant>) => {
    const newAsst = await api.createAssistant(payload);
    setAssistants((prev) => [newAsst, ...prev]);
  };

  const handleUpdateAssistant = async (id: string, payload: Partial<Assistant>) => {
    const updated = await api.updateAssistant(id, payload);
    setAssistants((prev) => prev.map((a) => (a.id === id ? updated : a)));
  };

  const handleDeleteAssistant = async (id: string) => {
    await api.deleteAssistant(id);
    setAssistants((prev) => prev.filter((a) => a.id !== id));
  };

  // Phone Number Handlers
  const handleCreatePhoneNumber = async (payload: Partial<PhoneNumber>) => {
    const newPhone = await api.createPhoneNumber(payload);
    setPhoneNumbers((prev) => [newPhone, ...prev]);
  };

  const handleDeletePhoneNumber = async (id: string) => {
    await api.deletePhoneNumber(id);
    setPhoneNumbers((prev) => prev.filter((p) => p.id !== id));
  };

  // Campaign Handlers
  const handleCreateCampaign = async (payload: Partial<Campaign>) => {
    const newCamp = await api.createCampaign(payload);
    setCampaigns((prev) => [newCamp, ...prev]);
  };

  const handleUpdateCampaign = async (id: string, payload: Partial<Campaign>) => {
    const updated = await api.updateCampaign(id, payload);
    setCampaigns((prev) => prev.map((c) => (c.id === id ? updated : c)));
  };

  const handleDeleteCampaign = async (id: string) => {
    await api.deleteCampaign(id);
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  };

  const handleStartCampaign = async (id: string, vapiKey?: string) => {
    try {
      setSyncFeedback('Dispatching outbound call via Vapi API...');
      const res = await api.startCampaign(id, vapiKey);
      setCampaigns((prev) => prev.map((c) => (c.id === id ? res.campaign : c)));
      const [callData, anlt] = await Promise.all([api.fetchCalls(), api.fetchAnalytics()]);
      setCalls(callData.calls);
      setAnalytics(anlt);
      if (res.message) {
        setSyncFeedback(res.message);
        setTimeout(() => setSyncFeedback(undefined), 6000);
      }
      return res;
    } catch (err: any) {
      setSyncFeedback(`Dispatch failed: ${err.message}`);
      setTimeout(() => setSyncFeedback(undefined), 7000);
      throw err;
    }
  };

  const handleCallSingleContact = async (campaignId: string, contactId: string, vapiKey?: string) => {
    try {
      setSyncFeedback('Triggering live outbound call via Vapi...');
      const res = await api.callCampaignContact(campaignId, contactId, vapiKey);
      const [camps, callData, anlt] = await Promise.all([
        api.fetchCampaigns(),
        api.fetchCalls(),
        api.fetchAnalytics(),
      ]);
      setCampaigns(camps);
      setCalls(callData.calls);
      setAnalytics(anlt);
      if (res.message) {
        setSyncFeedback(res.message);
        setTimeout(() => setSyncFeedback(undefined), 6000);
      }
      return res;
    } catch (err: any) {
      setSyncFeedback(`Call failed: ${err.message}`);
      setTimeout(() => setSyncFeedback(undefined), 7000);
      throw err;
    }
  };

  const handleDialSingle = async (payload: {
    customerNumber: string;
    customerName?: string;
    assistantId?: string;
    phoneNumberId?: string;
    vapiKey?: string;
  }) => {
    try {
      setSyncFeedback(`Calling ${payload.customerNumber} via Vapi...`);
      const res = await api.dialSingle(payload);
      const [callData, anlt] = await Promise.all([api.fetchCalls(), api.fetchAnalytics()]);
      setCalls(callData.calls);
      setAnalytics(anlt);
      setSyncFeedback(res.message || 'Call successfully placed!');
      setTimeout(() => setSyncFeedback(undefined), 6000);
      return res;
    } catch (err: any) {
      setSyncFeedback(`Dial error: ${err.message}`);
      setTimeout(() => setSyncFeedback(undefined), 7000);
      throw err;
    }
  };

  const handlePauseCampaign = async (id: string) => {
    const res = await api.pauseCampaign(id);
    setCampaigns((prev) => prev.map((c) => (c.id === id ? res.campaign : c)));
  };

  const handleResetCampaign = async (id: string) => {
    const res = await api.resetCampaign(id);
    setCampaigns((prev) => prev.map((c) => (c.id === id ? res.campaign : c)));
  };

  const handleCompleteContactCall = async (
    campaignId: string,
    contactId: string,
    outcome: string,
    status: string,
    duration?: number
  ) => {
    await api.completeContactCall(campaignId, contactId, outcome, status, duration);
    const [camps, callData, anlt] = await Promise.all([
      api.fetchCampaigns(),
      api.fetchCalls(),
      api.fetchAnalytics(),
    ]);
    setCampaigns(camps);
    setCalls(callData.calls);
    setAnalytics(anlt);
  };

  // Call End / Hangup Handler
  const handleEndCall = async (callId: string) => {
    try {
      await api.endCall(callId);
      await loadAllData();
      setSyncFeedback('Call wrapped up');
      setTimeout(() => setSyncFeedback(undefined), 3000);
    } catch (err: any) {
      console.error('Failed to end call:', err);
      // Local fallback
      setCalls((prev) =>
        prev.map((c) => (c.id === callId ? { ...c, status: 'ended', endedAt: new Date().toISOString() } : c))
      );
    }
  };

  // Clear Stale / Inactive Lines
  const handleClearStaleCalls = async () => {
    try {
      setSyncFeedback('Clearing inactive lines...');
      const res = await api.clearStaleCalls();
      await loadAllData();
      setSyncFeedback(res.message || 'Inactive lines cleared');
      setTimeout(() => setSyncFeedback(undefined), 3500);
    } catch (err: any) {
      setSyncFeedback(`Clear error: ${err.message}`);
      setTimeout(() => setSyncFeedback(undefined), 4000);
    }
  };

  // Sync Active Calls from Vapi
  const handleSyncActiveCalls = async () => {
    try {
      setSyncFeedback('Querying live call telemetry...');
      const res = await api.syncActiveCalls();
      await loadAllData();
      setSyncFeedback(res.updatedCount > 0 ? `Synced ${res.updatedCount} active call(s)` : 'Active lines verified');
      setTimeout(() => setSyncFeedback(undefined), 3500);
    } catch (err: any) {
      setSyncFeedback(`Sync error: ${err.message}`);
      setTimeout(() => setSyncFeedback(undefined), 4000);
    }
  };

  // Live Simulator Completed Call
  const handleSimulatorCallCompleted = (newCall: CallLog) => {
    setCalls((prev) => [newCall, ...prev]);
    if (analytics) {
      setAnalytics({
        ...analytics,
        totalCalls: analytics.totalCalls + 1,
        completedCalls: analytics.completedCalls + 1,
      });
    }
  };

  // User Management Handlers
  const handleCreateUser = async (payload: Partial<User>) => {
    const newUser = await api.createUser(payload);
    setUsers((prev) => [...prev, newUser]);
  };

  const handleUpdateUser = async (id: string, payload: Partial<User>) => {
    const updated = await api.updateUser(id, payload);
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
  };

  const handleDeleteUser = async (id: string) => {
    await api.deleteUser(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const handleSaveSettings = async (payload: Partial<SystemSettings>) => {
    const updated = await api.saveSettings(payload);
    setSettings(updated);
  };

  const activeCalls = calls.filter((c) => c.status === 'in-progress' || c.status === 'ringing');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Header */}
      <Header
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onSyncVapi={handleSyncVapi}
        isSyncing={isSyncing}
        syncMessage={syncFeedback}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Main Body with Responsive Sidebar + Content */}
      <div className="flex flex-1 relative min-h-0">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          unreadCallsCount={activeCalls.length}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        <main className="flex-1 p-3 sm:p-5 md:p-8 overflow-y-auto max-w-7xl w-full min-w-0">
          {activeTab === 'dashboard' && (
            <AnalyticsDashboard
              analytics={analytics}
              campaigns={campaigns}
              recentCalls={calls}
              onSelectCall={(c) => {
                setSelectedCall(c);
                setActiveTab('logs');
              }}
              onNavigateTab={setActiveTab}
              onStartCampaign={handleStartCampaign}
              onPauseCampaign={handlePauseCampaign}
            />
          )}

          {activeTab === 'assistants' && (
            <AssistantManager
              assistants={assistants}
              onCreate={handleCreateAssistant}
              onUpdate={handleUpdateAssistant}
              onDelete={handleDeleteAssistant}
              onTestAssistant={(asst) => {
                setIsSimulatorOpen(true);
              }}
            />
          )}

          {activeTab === 'phone-numbers' && (
            <PhoneNumberManager
              phoneNumbers={phoneNumbers}
              assistants={assistants}
              onCreate={handleCreatePhoneNumber}
              onDelete={handleDeletePhoneNumber}
            />
          )}

          {activeTab === 'campaigns' && (
            <CampaignManager
              campaigns={campaigns}
              assistants={assistants}
              phoneNumbers={phoneNumbers}
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onCreateCampaign={handleCreateCampaign}
              onUpdateCampaign={handleUpdateCampaign}
              onDeleteCampaign={handleDeleteCampaign}
              onStartCampaign={handleStartCampaign}
              onPauseCampaign={handlePauseCampaign}
              onResetCampaign={handleResetCampaign}
              onCallContact={handleCallSingleContact}
              onDialSingle={handleDialSingle}
              onCompleteContactCall={handleCompleteContactCall}
              onNavigateToMonitor={() => setActiveTab('monitor')}
            />
          )}

          {activeTab === 'monitor' && (
            <LiveCallMonitor
              activeCalls={activeCalls}
              onEndCall={handleEndCall}
              onClearStaleCalls={handleClearStaleCalls}
              onSyncActiveCalls={handleSyncActiveCalls}
              onTriggerSimulatedCall={() => setIsSimulatorOpen(true)}
              onSelectCall={(c) => {
                setSelectedCall(c);
                setActiveTab('logs');
              }}
            />
          )}

          {activeTab === 'logs' && (
            <CallLogsView
              calls={calls}
              campaigns={campaigns}
              assistants={assistants}
              analytics={analytics}
              selectedCall={selectedCall}
              onSelectCall={setSelectedCall}
              onSyncVapi={handleSyncVapi}
              onSyncSupabase={handleSyncSupabase}
            />
          )}

          {activeTab === 'users' && (
            <UserManagementView
              users={users}
              onCreateUser={handleCreateUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onSyncVapi={handleSyncVapi}
              onSyncSupabase={handleSyncSupabase}
              isSyncing={isSyncing}
            />
          )}

          {activeTab === 'deployment' && <DeploymentGuideView />}
        </main>
      </div>

      {/* Real-Time Interactive Simulator Modal */}
      <LiveCallSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        assistants={assistants}
        onCallCompleted={handleSimulatorCallCompleted}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
