import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DashboardService, type DashboardStats, type RecentOrder, type TopItem, type Notification } from '@/lib/services/dashboard'
import { useAuth } from '@/contexts/AuthContext'

// Hook pour les statistiques du partenaire
export const usePartnerStats = (period: 'today' | 'week' | 'month' | 'year' = 'month') => {
  const { currentUser, isAuthenticated } = useAuth()
  
  return useQuery({
    queryKey: ['partner-stats', currentUser?.id, period],
    queryFn: () => DashboardService.getPartnerStats(currentUser?.id || '', period),
    enabled: !!currentUser?.id && currentUser.role === 'partner' && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // 30 secondes
    retry: (failureCount, error) => {
      // Ne pas retry en cas d'erreur 401 (non authentifié)
      if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
        return false
      }
      return failureCount < 3
    }
  })
}

// Hook pour les statistiques du client
export const useCustomerStats = () => {
  const { currentUser, isAuthenticated } = useAuth()
  
  return useQuery({
    queryKey: ['customer-stats', currentUser?.id],
    queryFn: () => DashboardService.getCustomerStats(currentUser?.id || ''),
    enabled: !!currentUser?.id && currentUser.role === 'customer' && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
        return false
      }
      return failureCount < 3
    }
  })
}

// Hook pour les commandes récentes du partenaire
export const useRecentPartnerOrders = (limit: number = 10) => {
  const { currentUser, isAuthenticated } = useAuth()
  
  return useQuery({
    queryKey: ['recent-partner-orders', currentUser?.id, limit],
    queryFn: () => DashboardService.getRecentPartnerOrders(currentUser?.id || '', limit),
    enabled: !!currentUser?.id && currentUser.role === 'partner' && isAuthenticated,
    staleTime: 30 * 1000, // 30 secondes
    refetchInterval: 10 * 1000, // 10 secondes
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
        return false
      }
      return failureCount < 3
    }
  })
}

// Hook pour les commandes récentes du client
export const useRecentCustomerOrders = (limit: number = 5) => {
  const { currentUser, isAuthenticated } = useAuth()
  
  return useQuery({
    queryKey: ['recent-customer-orders', currentUser?.id, limit],
    queryFn: () => DashboardService.getRecentCustomerOrders(currentUser?.id || '', limit),
    enabled: !!currentUser?.id && currentUser.role === 'customer' && isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
        return false
      }
      return failureCount < 3
    }
  })
}

// Hook pour les articles populaires
export const useTopItems = (period: 'week' | 'month' = 'month') => {
  const { currentUser, isAuthenticated } = useAuth()
  
  return useQuery({
    queryKey: ['top-items', currentUser?.id, period],
    queryFn: () => DashboardService.getTopItems(currentUser?.id || '', period),
    enabled: !!currentUser?.id && currentUser.role === 'partner' && isAuthenticated,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
        return false
      }
      return failureCount < 3
    }
  })
}

// Hook pour les notifications
export const useNotifications = (type: 'customer' | 'partner' = 'customer') => {
  const { currentUser, isAuthenticated } = useAuth()
  
  return useQuery({
    queryKey: ['notifications', currentUser?.id, type],
    queryFn: () => DashboardService.getNotifications(currentUser?.id || '', type),
    enabled: !!currentUser?.id && isAuthenticated,
    staleTime: 30 * 1000, // 30 secondes
    refetchInterval: 15 * 1000, // 15 secondes
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
        return false
      }
      return failureCount < 3
    }
  })
}

// Hook pour les données de revenus
export const useRevenueData = (period: 'daily' | 'weekly' | 'monthly') => {
  const { currentUser, isAuthenticated } = useAuth()
  
  return useQuery({
    queryKey: ['revenue-data', currentUser?.id, period],
    queryFn: () => DashboardService.getRevenueData(currentUser?.id || '', period),
    enabled: !!currentUser?.id && currentUser.role === 'partner' && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
        return false
      }
      return failureCount < 3
    }
  })
}

// Hook pour rafraîchir les données
export const useRefreshDashboard = () => {
  const queryClient = useQueryClient()
  const { currentUser, isAuthenticated } = useAuth()
  
  return useMutation({
    mutationFn: async () => {
      if (!isAuthenticated || !currentUser?.id) {
        throw new Error('Utilisateur non authentifié')
      }
      
      // Invalider toutes les requêtes du dashboard
      await queryClient.invalidateQueries({ queryKey: ['partner-stats'] })
      await queryClient.invalidateQueries({ queryKey: ['customer-stats'] })
      await queryClient.invalidateQueries({ queryKey: ['recent-partner-orders'] })
      await queryClient.invalidateQueries({ queryKey: ['recent-customer-orders'] })
      await queryClient.invalidateQueries({ queryKey: ['top-items'] })
      await queryClient.invalidateQueries({ queryKey: ['notifications'] })
      await queryClient.invalidateQueries({ queryKey: ['revenue-data'] })
    },
    onSuccess: () => {
      console.log('Dashboard data refreshed successfully')
    },
    onError: (error) => {
      console.error('Error refreshing dashboard data:', error)
    }
  })
}

// Hook combiné pour le dashboard partenaire
export const usePartnerDashboard = (period: 'today' | 'week' | 'month' | 'year' = 'month') => {
  const { currentUser, isAuthenticated } = useAuth()
  
  const stats = usePartnerStats(period)
  const recentOrders = useRecentPartnerOrders(10)
  const topItems = useTopItems('month')
  const notifications = useNotifications('partner')
  const revenueData = useRevenueData('monthly')
  const refresh = useRefreshDashboard()

  return {
    stats,
    recentOrders,
    topItems,
    notifications,
    revenueData,
    refresh,
    isLoading: stats.isLoading || recentOrders.isLoading || topItems.isLoading || notifications.isLoading || revenueData.isLoading,
    error: stats.error || recentOrders.error || topItems.error || notifications.error || revenueData.error,
    isAuthenticated,
    currentUser
  }
}

// Hook combiné pour le dashboard client
export const useCustomerDashboard = () => {
  const { currentUser, isAuthenticated } = useAuth()
  
  const stats = useCustomerStats()
  const recentOrders = useRecentCustomerOrders(5)
  const notifications = useNotifications('customer')
  const refresh = useRefreshDashboard()

  return {
    stats,
    recentOrders,
    notifications,
    refresh,
    isLoading: stats.isLoading || recentOrders.isLoading || notifications.isLoading,
    error: stats.error || recentOrders.error || notifications.error,
    isAuthenticated,
    currentUser
  }
}

// Hook pour récupérer les services d'un partenaire
export const usePartnerServices = () => {
  const { currentUser } = useAuth();
  
  return useQuery({
    queryKey: ['partner-services'],
    queryFn: () => DashboardService.getPartnerServices(currentUser?.id || ''),
    enabled: !!currentUser && currentUser.role === 'partner',
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.code === 'PGRST116' || error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    }
  });
};

// Hook pour récupérer les statistiques du dashboard
export const useDashboardStats = (serviceType?: string) => {
  const { currentUser } = useAuth();
  
  return useQuery({
    queryKey: ['dashboard-stats', serviceType],
    queryFn: () => DashboardService.getDashboardStats(currentUser?.id || '', serviceType),
    enabled: !!currentUser && currentUser.role === 'partner',
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error: any) => {
      if (error?.code === 'PGRST116' || error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    }
  });
};

// Hook pour récupérer les commandes récentes
export const useRecentOrders = (limit: number = 10) => {
  const { currentUser } = useAuth();
  
  return useQuery({
    queryKey: ['recent-orders', limit],
    queryFn: () => DashboardService.getRecentOrders(currentUser?.id || '', limit),
    enabled: !!currentUser && currentUser.role === 'partner',
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: (failureCount, error: any) => {
      if (error?.code === 'PGRST116' || error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    }
  });
};

// Hook pour récupérer les produits du partenaire
export const usePartnerProducts = (limit: number = 20) => {
  const { currentUser } = useAuth();
  
  return useQuery({
    queryKey: ['partner-products', limit],
    queryFn: () => DashboardService.getPartnerProducts(currentUser?.id || '', limit),
    enabled: !!currentUser && currentUser.role === 'partner',
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.code === 'PGRST116' || error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    }
  });
};

// Hook pour récupérer les types de services disponibles
export const useAvailableServiceTypes = () => {
  const { currentUser } = useAuth();
  
  return useQuery({
    queryKey: ['available-service-types'],
    queryFn: () => DashboardService.getAvailableServiceTypes(),
    enabled: !!currentUser && currentUser.role === 'partner',
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      if (error?.code === 'PGRST116' || error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    }
  });
};

// Hook pour récupérer les catégories de produits
export const useDashboardProductCategories = () => {
  const { currentUser } = useAuth();
  
  return useQuery({
    queryKey: ['dashboard-product-categories'],
    queryFn: () => DashboardService.getProductCategories(),
    enabled: !!currentUser && currentUser.role === 'partner',
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      if (error?.code === 'PGRST116' || error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    }
  });
};

// Hook pour créer un nouveau service
export const useCreateService = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  
  return useMutation({
    mutationFn: (serviceData: any) => DashboardService.createService({
      ...serviceData,
      partner_id: currentUser?.id
    }),
    onSuccess: () => {
      // Invalider et refetch les services du partenaire
      queryClient.invalidateQueries({ queryKey: ['partner-services'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (error) => {
      console.error('Erreur lors de la création du service:', error);
    }
  });
};

// Hook pour mettre à jour un service
export const useUpdateService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ serviceId, updates }: { serviceId: number; updates: any }) =>
      DashboardService.updateService(serviceId, updates),
    onSuccess: () => {
      // Invalider et refetch les données
      queryClient.invalidateQueries({ queryKey: ['partner-services'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour du service:', error);
    }
  });
};

// Hook pour créer un nouveau produit
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (productData: any) => DashboardService.createProduct(productData),
    onSuccess: () => {
      // Invalider et refetch les produits
      queryClient.invalidateQueries({ queryKey: ['partner-products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (error) => {
      console.error('Erreur lors de la création du produit:', error);
    }
  });
};

// Hook pour mettre à jour un produit
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ productId, updates }: { productId: number; updates: any }) =>
      DashboardService.updateProduct(productId, updates),
    onSuccess: () => {
      // Invalider et refetch les produits
      queryClient.invalidateQueries({ queryKey: ['partner-products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour du produit:', error);
    }
  });
}; 