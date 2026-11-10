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
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  unreadCallsCount = 0,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { permissions } = useAuth();

  const navigation = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'assistants', label: 'Voice AI Assistants', icon: Bot },
    { id: 'phone-numbers', label: 'Phone Lines', icon: Phone },
    { id: 'campaigns', label: 'Campaigns & Dialer', icon: Radio },
    { id: 'monitor', label: 'Live Call Monitor', icon: Activity },
    { id: 'logs', label: 'Call Logs & Transcripts', icon: FileSpreadsheet, badge: unreadCallsCount > 0 ? unreadCallsCount : undefined },
    { id: 'users', label: 'Team & RBAC', icon: Users, adminOnly: !permissions.canManageUsers },
    { id: 'settings', label: 'API Keys & Engine', icon: Settings },
    { id: 'deployment', label: 'Ubuntu & Docker Deploy', icon: Server },
  ];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full p-3.5 select-none overflow-y-auto">
      <div className="space-y-4">
        {/* Workspace section label */}
        <div>
          <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-sky-400/90 uppercase flex items-center justify-between">
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
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                    isActive
                      ? 'bg-sky-950/70 text-sky-300 font-semibold border border-sky-600/70 shadow-sm shadow-sky-950/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="font-mono text-[10px] px-1.5 py-0.2 text-sky-300 bg-sky-950 border border-sky-800 rounded">
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
              <Cloud className="w-3.5 h-3.5 text-sky-400" />
              Cloud Telephony
            </span>
            <span className="font-mono text-[10px] text-emerald-400 font-semibold">ONLINE</span>
          </div>
          <div className="text-[11px] text-slate-400 leading-snug">
            Autonomous assistants, phone lines, and campaign queues synchronized.
          </div>
        </div>
      </div>

      {/* Footer system details */}
      <div className="pt-3 border-t border-slate-800/70 text-[11px] text-slate-400 space-y-1">
        <div className="flex justify-between items-center">
          <span>Engine Runtime</span>
          <span className="font-mono text-sky-400">BlueSpider Voice Engine</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Environment</span>
          <span className="font-mono text-slate-300">Ubuntu Docker Ready</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-slate-950 border-r border-slate-850 flex-col min-h-[calc(100vh-53px)] sticky top-[53px]">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-out Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[85vw] bg-slate-950 border-r border-slate-800 h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
