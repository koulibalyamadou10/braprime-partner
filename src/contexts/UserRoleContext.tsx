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

// import React, { createContext, useContext, useMemo, useEffect, useState } from 'react';
// import { useAuth } from './AuthContext';
// import { supabase } from '@/lib/supabase';
// import { PartnerBusiness } from '@/lib/services/partner-dashboard';

// type Role = 'admin' | 'partner' | 'driver' | 'customer' | 'internal';

// type InternalRole = 'admin' | 'commandes' | 'menu' | 'reservations' | 'livreurs' | 'revenu' | 'user' | 'facturation';

// type Permissions = {
//   [key: string]: boolean;
// };

// interface InternalUserProfile {
//   id: string;
//   user_id: string;
//   business_id: number;
//   name: string;
//   email: string;
//   phone?: string;
//   is_active: boolean;
//   roles: InternalRole[];
//   last_login?: string;
//   created_by: string;
//   created_at: string;
//   updated_at: string;
// }

// interface UserRoleContextType {
//   role: Role | null;
//   internalRoles: InternalRole[];
//   permissions: Permissions;
//   isAdmin: boolean;
//   isPartner: boolean;
//   isDriver: boolean;
//   isCustomer: boolean;
//   isInternalUser: boolean;
//   can: (permission: string) => boolean;
//   hasInternalRole: (role: InternalRole) => boolean;
//   isLoadingInternalRoles: boolean;
//   business: PartnerBusiness | null;
// }

// const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

// export const UserRoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const { currentUser } = useAuth();
//   const [internalUserProfile, setInternalUserProfile] = useState<InternalUserProfile | null>(null);
//   const [isLoadingInternalRoles, setIsLoadingInternalRoles] = useState(false);
//   const [business, setBusiness] = useState<PartnerBusiness | null>(null);
  
//   const role = currentUser?.role as Role | null;

//   // Charger le profil utilisateur interne si c'est un utilisateur interne
//   useEffect(() => {
//     const loadInternalUserProfile = async () => {
//       try {
//         setIsLoadingInternalRoles(true);
//       // recuperer l'utilisateur connecté depuis le supabase
//       const { data: user, error } = await supabase.auth.getUser();

//       // verifier si le mail du user est dans la table profile_internal_user
//       const { data: profileInternalUser, error: profileInternalUserError } = await supabase
//         .from('profil_internal_user')
//         .select('*')
//         .eq('email', user?.user?.email)
        
//       if (profileInternalUserError) {
//                 // recuperer le business du partenaire
//                 const { data: business, error: businessError } = await supabase
//                 .from('business')
//                 .select('*')
//                 .eq('id', profileInternalUser?.[0]?.business_id);

//                 if (businessError) {
//                   console.error('Erreur chargement business:', businessError);
//                 } else if (business) {
//                   setBusiness(business[0]);
//                 }
//       } else if (profileInternalUser) {
//         setInternalUserProfile(profileInternalUser[0]);
//         // recuperer le business du partenaire
//         const { data: business, error: businessError } = await supabase
//           .from('business')
//           .select('*')
//           .eq('owner_id', user?.user?.id);

//         if (businessError) {
//           console.error('Erreur chargement business:', businessError);
//         } else if (business) {
//           setBusiness(business[0]);
//         }
//       } 

//         setIsLoadingInternalRoles(false);
//       } catch (err) {
//         console.error('Erreur chargement profil interne:', err);
//       } finally {
//         setIsLoadingInternalRoles(false);
//       }
//     };

//     loadInternalUserProfile();
//   }, [currentUser?.id, role]);

//   const permissions: Permissions = useMemo(() => {
//     if (!role) return {};

//     // Permissions de base selon le rôle principal
//     const basePermissions: Permissions = {};
    
//     switch (role) {
//       case 'partner':
//         Object.assign(basePermissions, {
//           'dashboard:access': true,
//           'orders:manage': true,
//           'menu:manage': true,
//           'drivers:manage': true,
//         });
//       case 'internal':
//         // Permissions de base pour utilisateur interne
//         Object.assign(basePermissions, {
//           'dashboard:access': true,
//           'internal:access': true,
//         });
//         break;
//     }

//     // Si c'est un utilisateur interne, ajouter les permissions selon ses rôles
//     if (role === 'internal' && internalUserProfile) {
//       const internalPermissions: Permissions = {};
      
//       internalUserProfile.roles.forEach(role => {
//         switch (role) {
//           case 'admin':
//             Object.assign(internalPermissions, {
//               'internal:admin': true,
//               'internal:all': true,
//             });
//             break;
//           case 'commandes':
//             Object.assign(internalPermissions, {
//               'orders:view': true,
//               'orders:manage': true,
//               'orders:update': true,
//             });
//             break;
//           case 'menu':
//             Object.assign(internalPermissions, {
//               'menu:view': true,
//               'menu:manage': true,
//               'menu:create': true,
//               'menu:update': true,
//               'menu:delete': true,
//             });
//             break;
//           case 'reservations':
//             Object.assign(internalPermissions, {
//               'reservations:view': true,
//               'reservations:manage': true,
//               'reservations:update': true,
//             });
//             break;
//           case 'livreurs':
//             Object.assign(internalPermissions, {
//               'drivers:view': true,
//               'drivers:manage': true,
//               'drivers:assign': true,
//             });
//             break;
//           case 'revenu':
//             Object.assign(internalPermissions, {
//               'revenue:view': true,
//               'analytics:view': true,
//               'reports:view': true,
//             });
//             break;
//           case 'user':
//             Object.assign(internalPermissions, {
//               'users:view': true,
//               'users:manage': true,
//             });
//             break;
//           case 'facturation':
//             Object.assign(internalPermissions, {
//               'billing:view': true,
//               'billing:manage': true,
//               'subscriptions:view': true,
//             });
//             break;
//         }
//       });

//       // Fusionner les permissions de base avec les permissions internes
//       return { ...basePermissions, ...internalPermissions };
//     }

//     return basePermissions;
//   }, [role, internalUserProfile]);

//   const value = useMemo(() => ({
//     role,
//     internalRoles: internalUserProfile?.roles || [],
//     businessId: internalUserProfile?.business_id || null,
//     permissions,
//     isAdmin: role === 'admin',
//     isPartner: role === 'partner',
//     isDriver: role === 'driver',
//     isCustomer: role === 'customer',
//     isInternalUser: role === 'internal',
//     can: (perm: string) => !!permissions[perm],
//     hasInternalRole: (internalRole: InternalRole) => 
//       role === 'internal' && internalUserProfile?.roles.includes(internalRole) || false,
//     isLoadingInternalRoles,
//     business
//   }), [role, internalUserProfile, permissions, isLoadingInternalRoles, business]);

//   return (
//     <UserRoleContext.Provider value={value}>
//       {children}
//     </UserRoleContext.Provider>
//   );
// };

// export const useUserRole = () => {
//   const ctx = useContext(UserRoleContext);
//   if (!ctx) throw new Error('useUserRole must be used within a UserRoleProvider');
//   return ctx;
// };