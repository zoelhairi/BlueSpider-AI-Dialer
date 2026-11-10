/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PhoneCall, Shield, RefreshCw, CheckCircle2, AlertCircle, ChevronDown, UserCircle, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import type { UserRole } from '../../types/index.ts';
import { BlueSpiderLogo } from './BlueSpiderLogo.tsx';

interface HeaderProps {
  onOpenSimulator: () => void;
  onSyncVapi: (key?: string) => Promise<void>;
  isSyncing: boolean;
  syncMessage?: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSimulator,
  onSyncVapi,
  isSyncing,
  syncMessage,
  activeTab,
  setActiveTab,
  isMobileMenuOpen = false,
  onToggleMobileMenu,
}) => {
  const { currentUser, role, switchRole } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const roleLabels: Record<UserRole, { label: string; color: string }> = {
    super_admin: { label: 'Super Admin', color: 'text-sky-400 bg-sky-950/60 border-sky-800' },
    campaign_manager: { label: 'Campaign Manager', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800' },
    analyst: { label: 'Data Analyst', color: 'text-amber-400 bg-amber-950/60 border-amber-800' },
    viewer: { label: 'Auditor / Viewer', color: 'text-slate-400 bg-slate-900 border-slate-700' },
  };

  const navLinks = [
    { id: 'dashboard', label: 'Analytics' },
    { id: 'assistants', label: 'Voice Assistants' },
    { id: 'phone-numbers', label: 'Phone Lines' },
    { id: 'campaigns', label: 'Campaigns' },
    { id: 'monitor', label: 'Live Monitor' },
    { id: 'logs', label: 'Call Records' },
  ];

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-3 sm:gap-6 px-3 sm:px-6 py-2.5 sm:py-3 bg-slate-950/95 backdrop-blur-md border-b border-slate-850">
      {/* Zone 1: Mobile hamburger + BlueSpider Logo */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-1.5 sm:p-2 text-slate-300 hover:text-white bg-slate-900/90 border border-slate-800 rounded-lg cursor-pointer transition-colors"
            title="Toggle Menu"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4 text-sky-400" /> : <Menu className="w-4 h-4 text-sky-400" />}
          </button>
        )}
        <BlueSpiderLogo size="sm" showText={true} />
      </div>

      {/* Zone 2: Desktop single-line text navigation links */}
      <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-xs font-medium text-slate-400">
        {navLinks.map((link) => (
          <button
            key={link.id}
            onClick={() => setActiveTab(link.id)}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer ${
              activeTab === link.id
                ? 'text-sky-400 font-semibold border-b-2 border-sky-400'
                : 'hover:text-slate-200'
            }`}
          >
            {link.label}
          </button>
        ))}
      </nav>

      {/* Zone 3: Primary action + RBAC selector */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Sync Button */}
        <button
          onClick={() => onSyncVapi()}
          disabled={isSyncing}
          title={syncMessage || 'Sync state with Cloud Engine'}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${isSyncing ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline whitespace-nowrap">Cloud Sync</span>
        </button>

        {/* Primary CTA: Launch Test Voice Call */}
        <button
          onClick={onOpenSimulator}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg shadow-sm shadow-sky-950 transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Test Call</span>
        </button>

        {/* RBAC Role Switcher & User Pill */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-2.5 py-1 text-xs bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
              <UserCircle className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-medium text-slate-200 text-[11px] leading-tight truncate max-w-[100px]">
                {currentUser?.name || 'Zoel Hairi'}
              </span>
              <span className={`text-[10px] uppercase tracking-wider font-semibold ${roleLabels[role]?.color.split(' ')[0]}`}>
                {role.replace('_', ' ')}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Dropdown Menu for RBAC Demonstration */}
          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-56 p-1.5 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95">
              <div className="px-2.5 py-1.5 border-b border-slate-800 mb-1 text-[11px] text-slate-400">
                Switch Role (RBAC Simulation):
              </div>
              {(['super_admin', 'campaign_manager', 'analyst', 'viewer'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    switchRole(r);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                    role === r ? 'bg-cyan-950/60 text-cyan-300 font-medium' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>{roleLabels[r].label}</span>
                  {role === r && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              ))}
              <div className="mt-1.5 pt-1.5 border-t border-slate-800 px-2 text-[10px] text-slate-400">
                Logged in as <span className="text-slate-300 font-mono">zoelhairi@gmail.com</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
