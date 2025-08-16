import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardService } from '@/lib/services/dashboard';
import { PartnerDashboardService } from '@/lib/services/partner-dashboard';

interface DashboardCacheContextType {
  prefetchCustomerData: () => Promise<void>;
  prefetchPartnerData: () => Promise<void>;
  clearCustomerCache: () => void;
  clearPartnerCache: () => void;
}

const DashboardCacheContext = createContext<DashboardCacheContextType | undefined>(undefined);

export const useDashboardCache = () => {
  const context = useContext(DashboardCacheContext);
  if (!context) {
    throw new Error('useDashboardCache must be used within a DashboardCacheProvider');
  }
  return context;
};

interface DashboardCacheProviderProps {
  children: ReactNode;
}

export const DashboardCacheProvider: React.FC<DashboardCacheProviderProps> = ({ children }) => {
  const queryClient = useQueryClient();
  const { currentUser, isAuthenticated } = useAuth();

  // Précharger les données du client
  const prefetchCustomerData = async () => {
    if (!currentUser?.id || currentUser.role !== 'customer') return;

    try {
      // Précharger les données en parallèle
      await Promise.allSettled([
        queryClient.prefetchQuery({
          queryKey: ['customer-stats', currentUser.id],
          queryFn: () => DashboardService.getCustomerStats(currentUser.id),
          staleTime: 2 * 60 * 1000,
        }),
        queryClient.prefetchQuery({
          queryKey: ['recent-customer-orders', currentUser.id, 5],
          queryFn: () => DashboardService.getRecentCustomerOrders(currentUser.id, 5),
          staleTime: 1 * 60 * 1000,
        }),
        queryClient.prefetchQuery({
          queryKey: ['notifications', currentUser.id, 'customer'],
          queryFn: () => DashboardService.getNotifications(currentUser.id, 'customer'),
          staleTime: 15 * 1000,
        }),
      ]);
    } catch (error) {
      console.error('Erreur lors du préchargement des données client:', error);
    }
  };

  // Précharger les données du partenaire
  const prefetchPartnerData = async () => {
    if (!currentUser?.id || currentUser.role !== 'partner') return;

    try {
      // Précharger d'abord le business
      const businessResult = await queryClient.prefetchQuery({
        queryKey: ['partner-business', currentUser.id],
        queryFn: () => PartnerDashboardService.getPartnerBusiness(),
        staleTime: 10 * 60 * 1000,
      });

      // Si le business est chargé, précharger les autres données
      if (businessResult && businessResult.business) {
        await Promise.allSettled([
          queryClient.prefetchQuery({
            queryKey: ['partner-stats', businessResult.business.id],
            queryFn: () => PartnerDashboardService.getPartnerStats(businessResult.business.id),
            staleTime: 2 * 60 * 1000,
          }),
          queryClient.prefetchQuery({
            queryKey: ['partner-recent-orders', businessResult.business.id, 5],
            queryFn: () => PartnerDashboardService.getPartnerOrders(businessResult.business.id, 5),
            staleTime: 30 * 1000,
          }),
          queryClient.prefetchQuery({
            queryKey: ['partner-menu', businessResult.business.id, 50],
            queryFn: () => PartnerDashboardService.getPartnerMenu(businessResult.business.id, 50),
            staleTime: 5 * 60 * 1000,
          }),
        ]);
      }
    } catch (error) {
      console.error('Erreur lors du préchargement des données partenaire:', error);
    }
  };

  // Nettoyer le cache du client
  const clearCustomerCache = () => {
    queryClient.removeQueries({ queryKey: ['customer-stats'] });
    queryClient.removeQueries({ queryKey: ['recent-customer-orders'] });
    queryClient.removeQueries({ queryKey: ['notifications'] });
  };

  // Nettoyer le cache du partenaire
  const clearPartnerCache = () => {
    queryClient.removeQueries({ queryKey: ['partner-business'] });
    queryClient.removeQueries({ queryKey: ['partner-stats'] });
    queryClient.removeQueries({ queryKey: ['partner-recent-orders'] });
    queryClient.removeQueries({ queryKey: ['partner-menu'] });
    queryClient.removeQueries({ queryKey: ['partner-drivers'] });
  };

  // Précharger automatiquement quand l'utilisateur se connecte
  useEffect(() => {
    if (isAuthenticated && currentUser?.id) {
      // Délai pour éviter de bloquer le rendu initial
      const timer = setTimeout(() => {
        if (currentUser.role === 'customer') {
          prefetchCustomerData();
        } else if (currentUser.role === 'partner') {
          prefetchPartnerData();
        }
      }, 300); // Réduit de 500ms à 300ms pour un chargement plus rapide

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, currentUser?.id, currentUser?.role]);

  // Nettoyer le cache quand l'utilisateur se déconnecte
  useEffect(() => {
    if (!isAuthenticated) {
      clearCustomerCache();
      clearPartnerCache();
    }
  }, [isAuthenticated]);

  const value: DashboardCacheContextType = {
    prefetchCustomerData,
    prefetchPartnerData,
    clearCustomerCache,
    clearPartnerCache,
  };

  return (
    <DashboardCacheContext.Provider value={value}>
      {children}
    </DashboardCacheContext.Provider>
  );
}; 