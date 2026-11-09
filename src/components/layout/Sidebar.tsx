/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  Bot,
  Phone,
  Radio,
  Activity,
  FileSpreadsheet,
  Users,
  Settings,
  Server,
  Cloud,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { BlueSpiderLogo } from './BlueSpiderLogo.tsx';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadCallsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  unreadCallsCount = 0,
}) => {
  const { permissions } = useAuth();

  const navigation = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'assistants', label: 'Voice AI Assistants', icon: Bot },
    { id: 'phone-numbers', label: 'Phone Numbers', icon: Phone },
    { id: 'campaigns', label: 'Campaigns & Dialer', icon: Radio },
    { id: 'monitor', label: 'Live Call Monitor', icon: Activity },
    { id: 'logs', label: 'Call Logs & Transcripts', icon: FileSpreadsheet, badge: unreadCallsCount > 0 ? unreadCallsCount : undefined },
    { id: 'users', label: 'Team & RBAC', icon: Users, adminOnly: !permissions.canManageUsers },
    { id: 'settings', label: 'API Keys & Supabase', icon: Settings },
    { id: 'deployment', label: 'Ubuntu & Docker Deploy', icon: Server },
  ];

  return (
    <aside className="w-64 shrink-0 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between p-3.5 min-h-[calc(100vh-53px)] select-none">
      <div className="space-y-5">
        {/* Workspace section label */}
        <div>
          <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-cyan-400/80 uppercase flex items-center justify-between">
            <span>BlueSpider AI</span>
            <span className="text-[9px] font-mono text-slate-500">v2.5</span>
          </div>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                    isActive
                      ? 'bg-cyan-950/60 text-cyan-300 font-semibold border border-cyan-800/60 shadow-sm shadow-cyan-950/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="font-mono text-[10px] px-1.5 py-0.2 text-cyan-300 bg-cyan-950 border border-cyan-800 rounded">
                      {item.badge}
                    </span>
                  ) : null}
                  {item.adminOnly && (
                    <span className="text-[9px] text-slate-400 uppercase font-mono">view</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sync & Cloud Status */}
        <div className="p-3 bg-slate-900/60 border border-slate-800/70 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Cloud className="w-3.5 h-3.5 text-cyan-400" />
              Vapi &amp; Supabase
            </span>
            <span className="font-mono text-[10px] text-emerald-400">SYNC READY</span>
          </div>
          <div className="text-[11px] text-slate-400 leading-snug">
            Assistants, phone numbers, campaign queues, and audio logs synchronized with BlueSpider.
          </div>
        </div>
      </div>

      {/* Footer system details */}
      <div className="pt-3 border-t border-slate-800/70 text-[11px] text-slate-400 space-y-1">
        <div className="flex justify-between items-center">
          <span>Engine Runtime</span>
          <span className="font-mono text-cyan-400">BlueSpider + Vapi</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Environment</span>
          <span className="font-mono text-slate-300">Ubuntu Docker Ready</span>
        </div>
      </div>
    </aside>
  );
};
