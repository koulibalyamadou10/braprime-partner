import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isInternalUser } from '@/hooks/use-internal-users';

export interface InternalUser {
  id: string;
  user_id: string;
  business_id: number;
  name: string;
  email: string;
  phone?: string;
  is_active: boolean;
  last_login?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  roles: string[];
}

interface InternalUserContextType {
  internalUser: InternalUser | null;
  isLoading: boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
  canAccessPage: (pageName: string) => boolean;
  refreshInternalUser: () => Promise<void>;
}

const InternalUserContext = createContext<InternalUserContextType | undefined>(undefined);

export const InternalUserProvider = ({ children }: { children: ReactNode }) => {
  const [internalUser, setInternalUser] = useState<InternalUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshInternalUser = async () => {
    try {
      setIsLoading(true);
      const result = await isInternalUser();
      
      if (result.isInternal && result.data) {
        setInternalUser(result.data);
      } else {
        setInternalUser(null);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur interne:', error);
      setInternalUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshInternalUser();
  }, []);

  // Vérifier si l'utilisateur a un rôle spécifique
  const hasRole = (role: string): boolean => {
    if (!internalUser || !internalUser.is_active) return false;
    return internalUser.roles.includes(role);
  };

  // Vérifier si l'utilisateur a au moins un des rôles
  const hasAnyRole = (roles: string[]): boolean => {
    if (!internalUser || !internalUser.is_active) return false;
    return roles.some(role => internalUser.roles.includes(role));
  };

  // Vérifier si l'utilisateur a tous les rôles
  const hasAllRoles = (roles: string[]): boolean => {
    if (!internalUser || !internalUser.is_active) return false;
    return roles.every(role => internalUser.roles.includes(role));
  };

  // Vérifier si l'utilisateur peut accéder à une page spécifique
  const canAccessPage = (pageName: string): boolean => {
    if (!internalUser || !internalUser.is_active) return false;
    
    const pageRoleMapping: { [key: string]: string[] } = {
      'orders': ['admin', 'commandes'],
      'menu': ['admin', 'menu'],
      'reservations': ['admin', 'reservations'],
      'revenue': ['admin', 'revenu'],
      'users': ['admin', 'user'],
      'billing': ['admin', 'facturation'],
      'profile': ['admin', 'commandes', 'menu', 'reservations', 'revenu', 'user', 'facturation'],
      'settings': ['admin', 'commandes', 'menu', 'reservations', 'revenu', 'user', 'facturation'],
      'drivers': ['admin', 'livreurs'],
      'dashboard': ['admin', 'commandes', 'menu', 'reservations', 'revenu', 'user', 'facturation', 'livreurs']
    };

    const requiredRoles = pageRoleMapping[pageName] || ['admin'];
    return hasAnyRole(requiredRoles);
  };

  const value: InternalUserContextType = {
    internalUser,
    isLoading,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    canAccessPage,
    refreshInternalUser
  };

  return (
    <InternalUserContext.Provider value={value}>
      {children}
    </InternalUserContext.Provider>
  );
};

export const useInternalUser = () => {
  const context = useContext(InternalUserContext);
  if (context === undefined) {
    throw new Error('useInternalUser must be used within an InternalUserProvider');
  }
  return context;
};
