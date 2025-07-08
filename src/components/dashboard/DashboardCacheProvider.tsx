import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardService } from '@/lib/services/dashboard';

interface DashboardCacheContextType {
  prefetchCustomerData: () => Promise<void>;
  clearCustomerCache: () => void;
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
      console.error('Erreur lors du préchargement des données:', error);
    }
  };

  // Nettoyer le cache du client
  const clearCustomerCache = () => {
    queryClient.removeQueries({ queryKey: ['customer-stats'] });
    queryClient.removeQueries({ queryKey: ['recent-customer-orders'] });
    queryClient.removeQueries({ queryKey: ['notifications'] });
  };

  // Précharger automatiquement quand l'utilisateur se connecte
  useEffect(() => {
    if (isAuthenticated && currentUser?.role === 'customer') {
      // Délai pour éviter de bloquer le rendu initial
      const timer = setTimeout(() => {
        prefetchCustomerData();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, currentUser?.id, currentUser?.role]);

  // Nettoyer le cache quand l'utilisateur se déconnecte
  useEffect(() => {
    if (!isAuthenticated) {
      clearCustomerCache();
    }
  }, [isAuthenticated]);

  const value: DashboardCacheContextType = {
    prefetchCustomerData,
    clearCustomerCache,
  };

  return (
    <DashboardCacheContext.Provider value={value}>
      {children}
    </DashboardCacheContext.Provider>
  );
}; 