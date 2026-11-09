/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  Assistant,
  PhoneNumber,
  Campaign,
  CallLog,
  CallAnalytics,
  User,
  UserRole,
  SystemSettings,
} from '../types/index.ts';

const API_BASE = '/api';

export async function fetchCurrentAuth(): Promise<{ user: User; availableRoles: UserRole[] }> {
  const res = await fetch(`${API_BASE}/auth/current`);
  if (!res.ok) throw new Error('Failed to fetch current user');
  return res.json();
}

export async function switchUserRole(role?: UserRole, userId?: string): Promise<{ success: boolean; user: User }> {
  const res = await fetch(`${API_BASE}/auth/switch-role`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, userId }),
  });
  if (!res.ok) throw new Error('Failed to switch user role');
  return res.json();
}

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE}/users`);
  if (!res.ok) throw new Error('Failed to fetch users');
  const data = await res.json();
  return data.users;
}

export async function createUser(payload: Partial<User>): Promise<User> {
  const res = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create user');
  const data = await res.json();
  return data.user;
}

export async function updateUser(id: string, payload: Partial<User>): Promise<User> {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update user');
  const data = await res.json();
  return data.user;
}

export async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete user');
}

export async function fetchAssistants(): Promise<Assistant[]> {
  const res = await fetch(`${API_BASE}/assistants`);
  if (!res.ok) throw new Error('Failed to fetch assistants');
  const data = await res.json();
  return data.assistants;
}

export async function createAssistant(payload: Partial<Assistant>): Promise<Assistant> {
  const res = await fetch(`${API_BASE}/assistants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create assistant');
  const data = await res.json();
  return data.assistant;
}

export async function updateAssistant(id: string, payload: Partial<Assistant>): Promise<Assistant> {
  const res = await fetch(`${API_BASE}/assistants/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update assistant');
  const data = await res.json();
  return data.assistant;
}

export async function deleteAssistant(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/assistants/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete assistant');
}

export async function fetchPhoneNumbers(): Promise<PhoneNumber[]> {
  const res = await fetch(`${API_BASE}/phone-numbers`);
  if (!res.ok) throw new Error('Failed to fetch phone numbers');
  const data = await res.json();
  return data.phoneNumbers;
}

export async function createPhoneNumber(payload: Partial<PhoneNumber>): Promise<PhoneNumber> {
  const res = await fetch(`${API_BASE}/phone-numbers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to register phone number');
  const data = await res.json();
  return data.phoneNumber;
}

export async function deletePhoneNumber(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/phone-numbers/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete phone number');
}

export async function fetchCampaigns(): Promise<Campaign[]> {
  const res = await fetch(`${API_BASE}/campaigns`);
  if (!res.ok) throw new Error('Failed to fetch campaigns');
  const data = await res.json();
  return data.campaigns;
}

export async function createCampaign(payload: Partial<Campaign>): Promise<Campaign> {
  const res = await fetch(`${API_BASE}/campaigns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create campaign');
  const data = await res.json();
  return data.campaign;
}

export async function updateCampaign(id: string, payload: Partial<Campaign>): Promise<Campaign> {
  const res = await fetch(`${API_BASE}/campaigns/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update campaign');
  const data = await res.json();
  return data.campaign;
}

export async function deleteCampaign(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/campaigns/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete campaign');
}

export async function startCampaign(
  id: string,
  vapiKey?: string
): Promise<{
  success: boolean;
  campaign: Campaign;
  dispatchedCount: number;
  message?: string;
  dispatchedCalls?: any[];
  dispatchErrors?: any[];
  requiresKey?: boolean;
}> {
  const res = await fetch(`${API_BASE}/campaigns/${id}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vapiKey }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: any = new Error(data.message || data.error || 'Failed to start campaign');
    err.requiresKey = data.requiresKey;
    err.data = data;
    throw err;
  }
  return data;
}

export async function callCampaignContact(
  campaignId: string,
  contactId: string,
  vapiKey?: string
): Promise<{
  success: boolean;
  contact: any;
  call: CallLog;
  message: string;
}> {
  const res = await fetch(`${API_BASE}/campaigns/${campaignId}/contacts/${contactId}/call`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vapiKey }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: any = new Error(data.message || data.error || 'Failed to call contact');
    err.requiresKey = data.requiresKey;
    err.data = data;
    throw err;
  }
  return data;
}

export async function dialSingle(payload: {
  customerNumber: string;
  customerName?: string;
  assistantId?: string;
  phoneNumberId?: string;
  vapiKey?: string;
}): Promise<{
  success: boolean;
  call: CallLog;
  message: string;
}> {
  const res = await fetch(`${API_BASE}/calls/dial-single`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: any = new Error(data.message || data.error || 'Failed to place call');
    err.requiresKey = data.requiresKey;
    err.data = data;
    throw err;
  }
  return data;
}

export async function pauseCampaign(id: string): Promise<{ success: boolean; campaign: Campaign }> {
  const res = await fetch(`${API_BASE}/campaigns/${id}/pause`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to pause campaign');
  return res.json();
}

export async function resetCampaign(id: string): Promise<{ success: boolean; campaign: Campaign }> {
  const res = await fetch(`${API_BASE}/campaigns/${id}/reset`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset campaign');
  return res.json();
}

export async function completeContactCall(
  campaignId: string,
  contactId: string,
  outcome: string,
  status: string,
  duration = 90
): Promise<any> {
  const res = await fetch(`${API_BASE}/campaigns/${campaignId}/contacts/${contactId}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ outcome, status, duration }),
  });
  if (!res.ok) throw new Error('Failed to update contact status');
  return res.json();
}

export async function fetchCalls(params: {
  campaignId?: string;
  assistantId?: string;
  status?: string;
  sentiment?: string;
  search?: string;
} = {}): Promise<{ calls: CallLog[]; total: number }> {
  const query = new URLSearchParams();
  if (params.campaignId) query.set('campaignId', params.campaignId);
  if (params.assistantId) query.set('assistantId', params.assistantId);
  if (params.status) query.set('status', params.status);
  if (params.sentiment) query.set('sentiment', params.sentiment);
  if (params.search) query.set('search', params.search);

  const res = await fetch(`${API_BASE}/calls?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch calls');
  return res.json();
}

export async function fetchCallById(id: string): Promise<CallLog> {
  const res = await fetch(`${API_BASE}/calls/${id}`);
  if (!res.ok) throw new Error('Failed to fetch call log');
  const data = await res.json();
  return data.call;
}

export async function fetchAnalytics(): Promise<CallAnalytics> {
  const res = await fetch(`${API_BASE}/analytics`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function simulateCall(payload: {
  assistantId: string;
  customerName?: string;
  customerPhone?: string;
}): Promise<CallLog> {
  const res = await fetch(`${API_BASE}/calls/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to initiate simulated call');
  const data = await res.json();
  return data.call;
}

export async function syncVapi(vapiKey?: string): Promise<any> {
  const res = await fetch(`${API_BASE}/vapi/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vapiKey }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(data.error || data.message || 'Failed to sync with Vapi API');
  }
  return data;
}

export async function syncSupabase(supabaseUrl?: string, supabaseAnonKey?: string): Promise<any> {
  const res = await fetch(`${API_BASE}/supabase/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ supabaseUrl, supabaseAnonKey }),
  });
  if (!res.ok) throw new Error('Failed to sync with Supabase');
  return res.json();
}

export async function fetchSettings(): Promise<SystemSettings> {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error('Failed to fetch settings');
  const data = await res.json();
  return data.settings;
}

export async function saveSettings(payload: Partial<SystemSettings>): Promise<SystemSettings> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to save settings');
  const data = await res.json();
  return data.settings;
}
