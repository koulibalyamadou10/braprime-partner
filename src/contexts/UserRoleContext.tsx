import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';

type Role = 'admin' | 'partner' | 'driver' | 'customer';

type Permissions = {
  [key: string]: boolean;
};

interface UserRoleContextType {
  role: Role | null;
  permissions: Permissions;
  isAdmin: boolean;
  isPartner: boolean;
  isDriver: boolean;
  isCustomer: boolean;
  can: (permission: string) => boolean;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export const UserRoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const role = currentUser?.role as Role | null;

  // Debug: Afficher le rôle dans la console
  console.log('🔍 [UserRoleProvider] Rôle utilisateur:', {
    role,
    currentUser: currentUser ? {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role
    } : null,
    isAuthenticated: !!currentUser
  });

  const permissions: Permissions = useMemo(() => {
    if (!role) return {};
    switch (role) {
      case 'admin':
        return {
          'dashboard:access': true,
          'users:manage': true,
          'orders:manage': true,
          'businesses:manage': true,
          'drivers:manage': true,
          'content:manage': true,
          'analytics:view': true,
          'system:manage': true,
        };
      case 'partner':
        return {
          'dashboard:access': true,
          'orders:manage': true,
          'menu:manage': true,
          'drivers:manage': true,
        };
      case 'driver':
        return {
          'dashboard:access': true,
          'orders:view': true,
          'location:update': true,
        };
      case 'customer':
        return {
          'dashboard:access': true,
          'orders:view': true,
          'favorites:manage': true,
        };
      default:
        return {};
    }
  }, [role]);

  const value = useMemo(() => ({
    role,
    permissions,
    isAdmin: role === 'admin',
    isPartner: role === 'partner',
    isDriver: role === 'driver',
    isCustomer: role === 'customer',
    can: (perm: string) => !!permissions[perm],
  }), [role, permissions]);

  // Debug: Afficher les permissions dans la console
  console.log('🔐 [UserRoleProvider] Permissions:', {
    role,
    permissions,
    isAdmin: value.isAdmin,
    isPartner: value.isPartner,
    isDriver: value.isDriver,
    isCustomer: value.isCustomer
  });

  return (
    <UserRoleContext.Provider value={value}>
      {children}
    </UserRoleContext.Provider>
  );
};

export const useUserRole = () => {
  const ctx = useContext(UserRoleContext);
  if (!ctx) throw new Error('useUserRole must be used within a UserRoleProvider');
  return ctx;
}; 