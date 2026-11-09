/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Phone, Plus, Trash2, CheckCircle2, Cloud, ArrowRight } from 'lucide-react';
import type { PhoneNumber, Assistant } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface PhoneNumberManagerProps {
  phoneNumbers: PhoneNumber[];
  assistants: Assistant[];
  onCreate: (payload: Partial<PhoneNumber>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const PhoneNumberManager: React.FC<PhoneNumberManagerProps> = ({
  phoneNumbers,
  assistants,
  onCreate,
  onDelete,
}) => {
  const { permissions } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    number: '',
    name: '',
    provider: 'vapi' as 'vapi' | 'twilio' | 'vonage',
    assistantId: assistants[0]?.id || '',
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.number || !formData.name) return;
    try {
      await onCreate(formData);
      setIsModalOpen(false);
      setFormData({
        number: '',
        name: '',
        provider: 'vapi',
        assistantId: assistants[0]?.id || '',
      });
    } catch (err) {
      console.error(err);
      alert('Failed to register phone number');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">
            Telephony & Phone Lines
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage inbound DID lines and outbound campaign dialer numbers connected to Vapi and Twilio trunks.
          </p>
        </div>
        {permissions.canCreateCampaign && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Link Phone Number</span>
          </button>
        )}
      </div>

      {/* Phone Numbers Table */}
      <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Line Label</th>
                <th className="py-2.5 px-3">Phone Number (E.164)</th>
                <th className="py-2.5 px-3">Carrier / Trunk</th>
                <th className="py-2.5 px-3">Assigned Voice Assistant</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Vapi Sync</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {phoneNumbers.map((phone) => (
                <tr key={phone.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 text-slate-200 font-sans font-medium">
                    {phone.name}
                  </td>
                  <td className="py-3 px-3 text-indigo-300 font-bold tabular-nums">
                    {phone.number}
                  </td>
                  <td className="py-3 px-3 text-slate-300 font-sans capitalize">
                    {phone.provider}
                  </td>
                  <td className="py-3 px-3 text-slate-300 font-sans">
                    {phone.assistantName || 'Unassigned'}
                  </td>
                  <td className="py-3 px-3">
                    <span className="flex items-center gap-1 text-[10px] uppercase text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/60 w-fit">
                      <CheckCircle2 className="w-2.5 h-2.5" /> {phone.status}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {phone.syncedToVapi ? (
                      <span className="flex items-center gap-1 text-[10px] text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-900/60 w-fit">
                        <Cloud className="w-2.5 h-2.5" /> Synchronized
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-900/60 w-fit">
                        Local Only
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {permissions.canDeleteCampaign && (
                      <button
                        onClick={() => {
                          if (confirm(`Remove phone number ${phone.number}?`)) {
                            onDelete(phone.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded cursor-pointer"
                        title="Delete phone line"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Link Number Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-slate-100">
                Link Telephony Number
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Line Friendly Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. US West Outbound Sales"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Phone Number (E.164 Format) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  placeholder="+1 (555) 234-5678"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Carrier / Trunk Provider
                </label>
                <select
                  value={formData.provider}
                  onChange={(e) =>
                    setFormData({ ...formData, provider: e.target.value as 'vapi' | 'twilio' | 'vonage' })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                >
                  <option value="vapi">Vapi Native Telephony</option>
                  <option value="twilio">Twilio SIP Trunk</option>
                  <option value="vonage">Vonage Voice API</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Attach Default Voice Assistant
                </label>
                <select
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

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg cursor-pointer shadow-sm"
                >
                  Link & Sync Line
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
