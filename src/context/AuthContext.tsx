/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, UserRole } from '../types/index.ts';
import { fetchCurrentAuth, switchUserRole } from '../services/api.ts';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole;
  isLoading: boolean;
  switchRole: (role: UserRole) => Promise<void>;
  permissions: {
    canCreateAssistant: boolean;
    canEditAssistant: boolean;
    canDeleteAssistant: boolean;
    canCreateCampaign: boolean;
    canStartCampaign: boolean;
    canDeleteCampaign: boolean;
    canExportReports: boolean;
    canManageUsers: boolean;
    canManageSettings: boolean;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = async () => {
    try {
      setIsLoading(true);
      const data = await fetchCurrentAuth();
      setCurrentUser(data.user);
    } catch (err) {
      console.error('Failed to load active user session:', err);
      // Fallback
      setCurrentUser({
        id: 'usr-admin-01',
        name: 'Zoel Hairi',
        email: 'zoelhairi@gmail.com',
        role: 'super_admin',
        department: 'Engineering',
        status: 'active',
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const switchRole = async (newRole: UserRole) => {
    try {
      const res = await switchUserRole(newRole);
      setCurrentUser(res.user);
    } catch (err) {
      console.error('Failed to switch user role:', err);
      if (currentUser) {
        setCurrentUser({ ...currentUser, role: newRole });
      }
    }
  };

  const role: UserRole = currentUser?.role || 'super_admin';

  const permissions = {
    canCreateAssistant: ['super_admin', 'campaign_manager'].includes(role),
    canEditAssistant: ['super_admin', 'campaign_manager'].includes(role),
    canDeleteAssistant: ['super_admin'].includes(role),
    canCreateCampaign: ['super_admin', 'campaign_manager'].includes(role),
    canStartCampaign: ['super_admin', 'campaign_manager'].includes(role),
    canDeleteCampaign: ['super_admin'].includes(role),
    canExportReports: ['super_admin', 'campaign_manager', 'analyst', 'viewer'].includes(role),
    canManageUsers: ['super_admin'].includes(role),
    canManageSettings: ['super_admin'].includes(role),
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        isLoading,
        switchRole,
        permissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
