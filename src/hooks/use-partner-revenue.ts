import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { PartnerRevenueService, type RevenueData, type TopMenuItem, type RevenueStats } from '@/lib/services/partner-revenue'
import { PartnerDashboardService } from '@/lib/services/partner-dashboard'

// Hook pour les données de revenus (optimisé)
export const usePartnerRevenueData = (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
  const { currentUser, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  
  return useQuery({
    queryKey: ['partner-revenue-data', currentUser?.id, period],
    queryFn: async () => {
      if (!currentUser?.id) throw new Error('Utilisateur non connecté')
      
      // Récupérer le business du partenaire
      const { business, error: businessError } = await PartnerDashboardService.getPartnerBusiness()
      if (businessError || !business) {
        throw new Error(businessError || 'Business non trouvé')
      }
      
      const { data, error } = await PartnerRevenueService.getRevenueData(business.id, period)
      if (error) throw new Error(error)
      
      return data || []
    },
    enabled: !!currentUser?.id && currentUser.role === 'partner' && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      if (error?.code === 'PGRST116' || error?.status === 401) {
        return false
      }
      return failureCount < 3
    },
    onError: (error) => {
      console.error('Erreur lors de la récupération des données de revenus:', error)
    }
  })
}

// Hook pour les articles populaires (optimisé)
export const usePartnerTopItems = (period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly') => {
  const { currentUser, isAuthenticated } = useAuth()
  
  return useQuery({
    queryKey: ['partner-top-items', currentUser?.id, period],
    queryFn: async () => {
      if (!currentUser?.id) throw new Error('Utilisateur non connecté')
      
      // Récupérer le business du partenaire
      const { business, error: businessError } = await PartnerDashboardService.getPartnerBusiness()
      if (businessError || !business) {
        throw new Error(businessError || 'Business non trouvé')
      }
      
      const { data, error } = await PartnerRevenueService.getTopItems(business.id, period)
      if (error) throw new Error(error)
      
      return data || []
    },
    enabled: !!currentUser?.id && currentUser.role === 'partner' && isAuthenticated,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 15 * 60 * 1000, // 15 minutes
    retry: (failureCount, error: any) => {
      if (error?.code === 'PGRST116' || error?.status === 401) {
        return false
      }
      return failureCount < 3
    },
    onError: (error) => {
      console.error('Erreur lors de la récupération des articles populaires:', error)
    }
  })
}

// Hook pour les statistiques de revenus (optimisé)
export const usePartnerRevenueStats = (period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly') => {
  const { currentUser, isAuthenticated } = useAuth()
  
  return useQuery({
    queryKey: ['partner-revenue-stats', currentUser?.id, period],
    queryFn: async () => {
      if (!currentUser?.id) throw new Error('Utilisateur non connecté')
      
      // Récupérer le business du partenaire
      const { business, error: businessError } = await PartnerDashboardService.getPartnerBusiness()
      if (businessError || !business) {
        throw new Error(businessError || 'Business non trouvé')
      }
      
      const { data, error } = await PartnerRevenueService.getRevenueStats(business.id, period)
      if (error) throw new Error(error)
      
      return data
    },
    enabled: !!currentUser?.id && currentUser.role === 'partner' && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      if (error?.code === 'PGRST116' || error?.status === 401) {
        return false
      }
      return failureCount < 3
    },
    onError: (error) => {
      console.error('Erreur lors de la récupération des statistiques de revenus:', error)
    }
  })
}

// Hook combiné pour les revenus (optimisé)
export const usePartnerRevenue = (period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly') => {
  const { currentUser, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  
  const revenueData = usePartnerRevenueData(period)
  const topItems = usePartnerTopItems(period)
  const stats = usePartnerRevenueStats(period)

  // Fonction de rafraîchissement manuel
  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ['partner-revenue-data'] })
    queryClient.invalidateQueries({ queryKey: ['partner-top-items'] })
    queryClient.invalidateQueries({ queryKey: ['partner-revenue-stats'] })
  }

  return {
    revenueData: revenueData.data || [],
    topItems: topItems.data || [],
    stats: stats.data,
    isLoading: revenueData.isLoading || topItems.isLoading || stats.isLoading,
    error: revenueData.error || topItems.error || stats.error,
    refetch,
    isAuthenticated,
    currentUser
  }
}

// Hook pour les données de revenus avec cache optimisé
export const usePartnerRevenueWithCache = (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
  const { currentUser, isAuthenticated } = useAuth()
  
  return useQuery({
    queryKey: ['partner-revenue-cached', currentUser?.id, period],
    queryFn: async () => {
      if (!currentUser?.id) throw new Error('Utilisateur non connecté')
      
      // Récupérer le business du partenaire
      const { business, error: businessError } = await PartnerDashboardService.getPartnerBusiness()
      if (businessError || !business) {
        throw new Error(businessError || 'Business non trouvé')
      }
      
      // Récupérer toutes les données en parallèle pour optimiser les performances
      const [revenueData, topItems, stats] = await Promise.all([
        PartnerRevenueService.getRevenueData(business.id, period),
        PartnerRevenueService.getTopItems(business.id, period),
        PartnerRevenueService.getRevenueStats(business.id, period)
      ])
      
      return {
        revenueData: revenueData.data || [],
        topItems: topItems.data || [],
        stats: stats.data,
        business
      }
    },
    enabled: !!currentUser?.id && currentUser.role === 'partner' && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount, error: any) => {
      if (error?.code === 'PGRST116' || error?.status === 401) {
        return false
      }
      return failureCount < 3
    },
    onError: (error) => {
      console.error('Erreur lors de la récupération des données de revenus:', error)
    }
  })
} 