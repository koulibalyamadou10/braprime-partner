import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PartnerDashboardService, PartnerBusiness, PartnerStats, PartnerOrder, PartnerMenuItem, PartnerDriver } from '@/lib/services/partner-dashboard'
import { useAuth } from '@/contexts/AuthContext'

export const usePartnerDashboard = () => {
  const { currentUser, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  // Récupérer le business du partenaire
  const businessQuery = useQuery({
    queryKey: ['partner-business', currentUser?.id],
    queryFn: () => PartnerDashboardService.getPartnerBusiness(),
    enabled: !!currentUser?.id && currentUser.role === 'partner' && isAuthenticated,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount, error: any) => {
      if (error?.code === 'PGRST116' || error?.status === 401) {
        return false
      }
      return failureCount < 3
    }
  })

  const business = businessQuery.data?.business
  const businessError = businessQuery.data?.error

  // Récupérer les statistiques du partenaire
  const statsQuery = useQuery({
    queryKey: ['partner-stats', business?.id],
    queryFn: () => PartnerDashboardService.getPartnerStats(business!.id),
    enabled: !!business?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.code === 'PGRST116' || error?.status === 401) {
        return false
      }
      return failureCount < 3
    }
  })

  // Récupérer les commandes récentes
  const recentOrdersQuery = useQuery({
    queryKey: ['partner-recent-orders', business?.id],
    queryFn: () => PartnerDashboardService.getPartnerOrders(business!.id, 5),
    enabled: !!business?.id,
    staleTime: 30 * 1000, // 30 secondes
    refetchInterval: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error: any) => {
      if (error?.code === 'PGRST116' || error?.status === 401) {
        return false
      }
      return failureCount < 3
    }
  })

  // Récupérer le menu
  const menuQuery = useQuery({
    queryKey: ['partner-menu', business?.id],
    queryFn: () => PartnerDashboardService.getPartnerMenu(business!.id, 50),
    enabled: !!business?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.code === 'PGRST116' || error?.status === 401) {
        return false
      }
      return failureCount < 3
    }
  })

  // Récupérer les livreurs
  const driversQuery = useQuery({
    queryKey: ['partner-drivers', business?.id],
    queryFn: () => PartnerDashboardService.getPartnerDrivers(business!.id, 20),
    enabled: !!business?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error: any) => {
      if (error?.code === 'PGRST116' || error?.status === 401) {
        return false
      }
      return failureCount < 3
    }
  })

  // Mutations pour les actions
  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      PartnerDashboardService.updateOrderStatus(orderId, status, business?.id),
    onSuccess: () => {
      // Invalider les requêtes liées aux commandes
      queryClient.invalidateQueries({ queryKey: ['partner-recent-orders'] })
      queryClient.invalidateQueries({ queryKey: ['partner-stats'] })
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour du statut:', error)
    }
  })

  const toggleBusinessStatusMutation = useMutation({
    mutationFn: ({ isOpen }: { isOpen: boolean }) =>
      PartnerDashboardService.toggleBusinessStatus(business!.id, isOpen),
    onSuccess: () => {
      // Invalider les requêtes liées au business
      queryClient.invalidateQueries({ queryKey: ['partner-business'] })
    },
    onError: (error) => {
      console.error('Erreur lors du changement de statut:', error)
    }
  })

  const updateBusinessInfoMutation = useMutation({
    mutationFn: ({ updates }: { updates: Partial<PartnerBusiness> }) =>
      PartnerDashboardService.updateBusinessInfo(business!.id, updates),
    onSuccess: () => {
      // Invalider les requêtes liées au business
      queryClient.invalidateQueries({ queryKey: ['partner-business'] })
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour du business:', error)
    }
  })

  const addDriverMutation = useMutation({
    mutationFn: (driverData: {
      name: string
      phone: string
      email?: string
      vehicle_type?: string
      vehicle_plate?: string
    }) => PartnerDashboardService.addDriver({
      ...driverData,
      business_id: business!.id
    }),
    onSuccess: () => {
      // Invalider les requêtes liées aux livreurs
      queryClient.invalidateQueries({ queryKey: ['partner-drivers'] })
    },
    onError: (error) => {
      console.error('Erreur lors de l\'ajout du livreur:', error)
    }
  })

  const updateDriverMutation = useMutation({
    mutationFn: ({ driverId, updates }: { 
      driverId: string; 
      updates: {
        name?: string
        phone?: string
        email?: string
        vehicle_type?: string
        vehicle_plate?: string
        is_active?: boolean
      }
    }) => PartnerDashboardService.updateDriver(driverId, updates),
    onSuccess: () => {
      // Invalider les requêtes liées aux livreurs
      queryClient.invalidateQueries({ queryKey: ['partner-drivers'] })
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour du livreur:', error)
    }
  })

  const deleteDriverMutation = useMutation({
    mutationFn: (driverId: string) => PartnerDashboardService.deleteDriver(driverId),
    onSuccess: () => {
      // Invalider les requêtes liées aux livreurs
      queryClient.invalidateQueries({ queryKey: ['partner-drivers'] })
    },
    onError: (error) => {
      console.error('Erreur lors de la suppression du livreur:', error)
    }
  })

  // Fonction de rafraîchissement manuel
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['partner-business'] })
    queryClient.invalidateQueries({ queryKey: ['partner-stats'] })
    queryClient.invalidateQueries({ queryKey: ['partner-recent-orders'] })
    queryClient.invalidateQueries({ queryKey: ['partner-menu'] })
    queryClient.invalidateQueries({ queryKey: ['partner-drivers'] })
  }

  // Fonctions d'action simplifiées
  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const result = await updateOrderStatusMutation.mutateAsync({ orderId, status })
      return result.success
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
      return false
    }
  }

  const toggleBusinessStatus = async (isOpen: boolean) => {
    try {
      const result = await toggleBusinessStatusMutation.mutateAsync({ isOpen })
      return result.success
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error)
      return false
    }
  }

  const updateBusinessInfo = async (updates: Partial<PartnerBusiness>) => {
    try {
      const result = await updateBusinessInfoMutation.mutateAsync({ updates })
      return result.success
    } catch (error) {
      console.error('Erreur lors de la mise à jour du business:', error)
      return false
    }
  }

  const addDriver = async (driverData: {
    name: string
    phone: string
    email?: string
    vehicle_type?: string
    vehicle_plate?: string
  }) => {
    try {
      const result = await addDriverMutation.mutateAsync(driverData)
      return { success: !!result.driver, error: result.error }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du livreur:', error)
      return { success: false, error: 'Erreur lors de l\'ajout du livreur' }
    }
  }

  const updateDriver = async (driverId: string, updates: {
    name?: string
    phone?: string
    email?: string
    vehicle_type?: string
    vehicle_plate?: string
    is_active?: boolean
  }) => {
    try {
      const result = await updateDriverMutation.mutateAsync({ driverId, updates })
      return { success: !!result.driver, error: result.error }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du livreur:', error)
      return { success: false, error: 'Erreur lors de la mise à jour du livreur' }
    }
  }

  const deleteDriver = async (driverId: string) => {
    try {
      const result = await deleteDriverMutation.mutateAsync(driverId)
      return { success: result.success, error: result.error }
    } catch (error) {
      console.error('Erreur lors de la suppression du livreur:', error)
      return { success: false, error: 'Erreur lors de la suppression du livreur' }
    }
  }

  // États de chargement et d'erreur
  const isLoading = businessQuery.isLoading || statsQuery.isLoading || recentOrdersQuery.isLoading || menuQuery.isLoading || driversQuery.isLoading
  const error = businessError || statsQuery.data?.error || recentOrdersQuery.data?.error || menuQuery.data?.error || driversQuery.data?.error

  return {
    // Données
    business: business || null,
    stats: statsQuery.data?.stats || null,
    recentOrders: recentOrdersQuery.data?.orders || [],
    menu: menuQuery.data?.menu || [],
    drivers: driversQuery.data?.drivers || [],
    
    // États de chargement
    isLoading,
    isBusinessLoading: businessQuery.isLoading,
    isStatsLoading: statsQuery.isLoading,
    isOrdersLoading: recentOrdersQuery.isLoading,
    isMenuLoading: menuQuery.isLoading,
    isDriversLoading: driversQuery.isLoading,
    
    // États de mutation
    isUpdatingOrderStatus: updateOrderStatusMutation.isPending,
    isTogglingStatus: toggleBusinessStatusMutation.isPending,
    isUpdatingBusiness: updateBusinessInfoMutation.isPending,
    isAddingDriver: addDriverMutation.isPending,
    isUpdatingDriver: updateDriverMutation.isPending,
    isDeletingDriver: deleteDriverMutation.isPending,
    
    // Erreurs
    error,
    businessError,
    statsError: statsQuery.data?.error,
    ordersError: recentOrdersQuery.data?.error,
    menuError: menuQuery.data?.error,
    driversError: driversQuery.data?.error,
    
    // Authentification
    isAuthenticated,
    currentUser,
    
    // Actions
    updateOrderStatus,
    toggleBusinessStatus,
    updateBusinessInfo,
    refresh,
    addDriver,
    updateDriver,
    deleteDriver,
    
    // Mutations directes (pour les cas avancés)
    updateOrderStatusMutation,
    toggleBusinessStatusMutation,
    updateBusinessInfoMutation,
    addDriverMutation,
    updateDriverMutation,
    deleteDriverMutation
  }
} 