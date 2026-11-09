/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  Plus,
  Shield,
  CheckCircle2,
  Trash2,
  Edit2,
  KeyRound,
  Lock,
  UserCheck,
} from 'lucide-react';
import type { User, UserRole } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface UserManagementViewProps {
  users: User[];
  onCreateUser: (payload: Partial<User>) => Promise<void>;
  onUpdateUser: (id: string, payload: Partial<User>) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
}) => {
  const { permissions, currentUser, switchRole } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'campaign_manager' as UserRole,
    department: 'Voice Operations',
  });

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'campaign_manager',
      department: 'Voice Operations',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    try {
      if (editingUser) {
        await onUpdateUser(editingUser.id, formData);
      } else {
        await onCreateUser(formData);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save user.');
    }
  };

  const roleMeta: Record<UserRole, { label: string; color: string; desc: string }> = {
    super_admin: {
      label: 'Super Admin',
      color: 'text-indigo-400 bg-indigo-950/60 border-indigo-800',
      desc: 'Full administrative access: API keys, user management, assistant creation, deletions & export.',
    },
    campaign_manager: {
      label: 'Campaign Manager',
      color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
      desc: 'Campaign dialer control, contact upload, assistant configuration & reporting.',
    },
    analyst: {
      label: 'Data Analyst',
      color: 'text-amber-400 bg-amber-950/60 border-amber-800',
      desc: 'Read-only access to analytics dashboards, call logs, recording waveforms & PDF exports.',
    },
    viewer: {
      label: 'Auditor / Viewer',
      color: 'text-slate-400 bg-slate-900 border-slate-700',
      desc: 'Restricted inspection view for compliance auditors without editing rights.',
    },
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">
            User Authentication & Role-Based Access Control (RBAC)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enforce granular administrative oversight across telephony campaigns, assistant prompts, and data export.
          </p>
        </div>

        {permissions.canManageUsers && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Invite Team Member</span>
          </button>
        )}
      </div>

      {/* RBAC Permission Matrix Card */}
      <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-200">
            Platform Roles & Access Entitlements
          </h2>
          <p className="text-xs text-slate-400">
            Administrative policy configuration mapped to Vapi API and Supabase RLS security rules
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {(['super_admin', 'campaign_manager', 'analyst', 'viewer'] as UserRole[]).map((r) => {
            const meta = roleMeta[r];
            const isCurrent = currentUser?.role === r;

            return (
              <div
                key={r}
                className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-indigo-950/40 border-indigo-500/80'
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${meta.color}`}>
                      {meta.label}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-mono text-indigo-400">ACTIVE ROLE</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-snug pt-1">
                    {meta.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/60 mt-3">
                  <button
                    onClick={() => switchRole(r)}
                    className="w-full text-center py-1 text-[11px] font-medium text-slate-300 hover:text-indigo-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded cursor-pointer transition-colors"
                  >
                    Test as {meta.label}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team Members Table */}
      <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-200">
            Registered Team Operators ({users.length})
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Encrypted Session Store
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Name & Email</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Role Authority</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Last Active</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {users.map((u) => {
                const meta = roleMeta[u.role] || roleMeta.viewer;
                const isYou = u.id === currentUser?.id;

                return (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-sans">
                      <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                        {u.name}
                        {isYou && (
                          <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950 px-1.5 py-0.2 rounded border border-indigo-900">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-sans">
                      {u.department}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${meta.color}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/60 w-fit">
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {new Date(u.lastActiveAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {permissions.canManageUsers && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded cursor-pointer"
                            title="Edit User Role"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {!isYou && (
                            <button
                              onClick={() => {
                                if (confirm(`Remove user ${u.name}?`)) {
                                  onDeleteUser(u.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded cursor-pointer"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for User Invite & Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-slate-100">
                {editingUser ? 'Update Team Member' : 'Invite New Team Member'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Corporate Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="alex.morgan@company.com"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g. Telecom Operations"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  RBAC Role & Authority *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                >
                  <option value="super_admin">Super Admin (Full Administrative Authority)</option>
                  <option value="campaign_manager">Campaign Manager (Dialer & Assistants CRUD)</option>
                  <option value="analyst">Data Analyst (Read-Only & Reporting)</option>
                  <option value="viewer">Auditor / Viewer (Strict Read-Only)</option>
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
                  {editingUser ? 'Save Changes' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
