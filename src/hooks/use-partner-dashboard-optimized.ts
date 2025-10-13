/**
 * Hook optimisé pour le dashboard partenaire
 * Utilise la fonction RPC get_partner_dashboard_data pour charger
 * toutes les données en une seule requête
 */

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { isInternalUser } from './use-internal-users'

export interface DashboardData {
  stats: {
    totalOrders: number
    totalRevenue: number
    averageOrderValue: number
    completedOrders: number
    pendingOrders: number
    cancelledOrders: number
    totalCustomers: number
    rating: number
    reviewCount: number
    todayOrders: number
    todayRevenue: number
    weekOrders: number
    weekRevenue: number
    monthOrders: number
    monthRevenue: number
  }
  weeklyData: Array<{
    day: string
    date: string
    orders: number
    revenue: number
  }>
  recentOrders: Array<{
    id: string
    order_number: string
    user_id: string
    status: string
    total: number
    delivery_fee: number
    grand_total: number
    delivery_method: string
    delivery_address: string
    payment_method: string
    payment_status: string
    created_at: string
    updated_at: string
    customer: {
      name: string
      phone_number: string
    }
    driver?: {
      name: string
      phone_number: string
    }
  }>
}

/**
 * Hook pour charger toutes les données du dashboard en une seule requête RPC
 */
export const usePartnerDashboardOptimized = () => {
  const { currentUser, isAuthenticated } = useAuth()

  // Récupérer le business ID
  const businessIdQuery = useQuery({
    queryKey: ['partner-business-id', currentUser?.id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')
      
      const { businessId } = await isInternalUser()
      return businessId
    },
    enabled: !!currentUser?.id && isAuthenticated,
    staleTime: 10 * 60 * 1000, // 10 minutes (le business ID ne change pas souvent)
    gcTime: 30 * 60 * 1000,
  })

  // Charger toutes les données du dashboard en une seule requête
  const dashboardQuery = useQuery({
    queryKey: ['partner-dashboard-optimized', businessIdQuery.data],
    queryFn: async (): Promise<DashboardData> => {
      const businessId = businessIdQuery.data
      if (!businessId) throw new Error('Business ID non disponible')

      console.log('🚀 [usePartnerDashboardOptimized] Chargement dashboard via RPC pour businessId:', businessId)

      // Appeler la fonction RPC qui charge tout en une seule requête
      const { data, error } = await supabase.rpc('get_partner_dashboard_data', {
        p_business_id: businessId
      })

      if (error) {
        console.error('❌ [usePartnerDashboardOptimized] Erreur RPC:', error)
        throw error
      }

      console.log('✅ [usePartnerDashboardOptimized] Dashboard chargé avec succès')
      return data as DashboardData
    },
    enabled: !!businessIdQuery.data,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch automatique toutes les 5 minutes
    retry: (failureCount, error: any) => {
      // Ne pas retry si la fonction RPC n'existe pas
      if (error?.code === '42883') { // PostgreSQL "function does not exist"
        console.warn('⚠️ Fonction RPC get_partner_dashboard_data non trouvée')
        return false
      }
      return failureCount < 2
    }
  })

  return {
    // État du chargement
    isLoading: businessIdQuery.isLoading || dashboardQuery.isLoading,
    isError: businessIdQuery.isError || dashboardQuery.isError,
    error: businessIdQuery.error || dashboardQuery.error,
    
    // Business ID
    businessId: businessIdQuery.data,
    
    // Données du dashboard
    stats: dashboardQuery.data?.stats || null,
    weeklyData: dashboardQuery.data?.weeklyData || [],
    recentOrders: dashboardQuery.data?.recentOrders || [],
    
    // Fonctions de refetch
    refetch: dashboardQuery.refetch,
    refetchBusiness: businessIdQuery.refetch,
  }
}

/**
 * Hook pour utiliser la méthode hybride (RPC + fallback)
 * Essaie d'abord la fonction RPC, puis utilise les hooks individuels si elle n'existe pas
 */
export const usePartnerDashboardHybrid = () => {
  const optimized = usePartnerDashboardOptimized()
  
  // TODO: Si la RPC échoue, utiliser les hooks individuels comme fallback
  // Pour l'instant, on retourne juste les résultats optimisés
  
  return optimized
}

