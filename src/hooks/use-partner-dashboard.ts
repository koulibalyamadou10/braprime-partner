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
    staleTime: 10 * 60 * 1000, // Augmenté à 10 minutes (le business change rarement)
    gcTime: 30 * 60 * 1000, // Augmenté à 30 minutes
    retry: (failureCount, error: any) => {
      if (error?.code === 'PGRST116' || error?.status === 401) {
        return false
      }
      return failureCount < 2
    }
  })

  const business = businessQuery.data?.business
  const businessError = businessQuery.data?.error

  // OPTIMISATION: Précharger les données dès que le business est disponible
  // Cela lance les requêtes en parallèle AVANT que les hooks ne s'activent
  if (business?.id && !businessQuery.isLoading) {
    // Précharger les stats
    queryClient.prefetchQuery({
      queryKey: ['partner-stats', business.id],
      queryFn: () => PartnerDashboardService.getPartnerStats(business.id),
      staleTime: 2 * 60 * 1000,
    })
    
    // Précharger les commandes récentes
    queryClient.prefetchQuery({
      queryKey: ['partner-recent-orders', business.id],
      queryFn: () => PartnerDashboardService.getPartnerOrders(business.id, 5),
      staleTime: 30 * 1000,
    })

    // Précharger les données hebdomadaires
    queryClient.prefetchQuery({
      queryKey: ['partner-weekly-data', business.id],
      queryFn: () => PartnerDashboardService.getWeeklyData(business.id),
      staleTime: 5 * 60 * 1000,
    })
  }

  // Récupérer les statistiques du partenaire
  const statsQuery = useQuery({
    queryKey: ['partner-stats', business?.id],
    queryFn: () => PartnerDashboardService.getPartnerStats(business!.id),
    enabled: !!business?.id,
    staleTime: 3 * 60 * 1000, // Augmenté à 3 minutes
    gcTime: 10 * 60 * 1000, // Cache de 10 minutes
    refetchInterval: false,
    placeholderData: (previousData) => previousData, // Garde les données précédentes pendant le refetch
    retry: (failureCount, error: any) => {
      if (error?.code === 'PGRST116' || error?.status === 401) {
        return false
      }
      return failureCount < 1 // Réduit à 1 seule tentative
    }
  })

  // Récupérer les commandes récentes
  const recentOrdersQuery = useQuery({
    queryKey: ['partner-recent-orders', business?.id],
    queryFn: () => PartnerDashboardService.getPartnerOrders(business!.id, 5),
    enabled: !!business?.id,
    staleTime: 1 * 60 * 1000, // Augmenté à 1 minute
    gcTime: 5 * 60 * 1000,
    refetchInterval: false,
    placeholderData: (previousData) => previousData, // Garde les données précédentes
    retry: (failureCount, error: any) => {
      if (error?.code === 'PGRST116' || error?.status === 401) {
        return false
      }
      return failureCount < 1
    }
  })

  // OPTIMISATION: Récupérer le menu et les drivers en LAZY LOADING
  // Ces données ne sont PAS critiques pour l'affichage initial du dashboard
  // On les charge seulement après un délai pour ne pas bloquer les données importantes
  const menuQuery = useQuery({
    queryKey: ['partner-menu', business?.id],
    queryFn: () => PartnerDashboardService.getPartnerMenu(business!.id, 50),
    enabled: false, // DÉSACTIVÉ - Sera chargé manuellement ou quand nécessaire
    staleTime: 15 * 60 * 1000, // 15 minutes (le menu change très rarement)
    gcTime: 60 * 60 * 1000, // 1 heure
    refetchInterval: false,
    placeholderData: (previousData) => previousData,
    retry: (failureCount, error: any) => {
      if (error?.code === 'PGRST116' || error?.status === 401) {
        return false
      }
      return failureCount < 1
    }
  })

  // Récupérer les livreurs en LAZY LOADING
  const driversQuery = useQuery({
    queryKey: ['partner-drivers', business?.id],
    queryFn: () => PartnerDashboardService.getPartnerDrivers(business!.id, 20),
    enabled: false, // DÉSACTIVÉ - Sera chargé manuellement ou quand nécessaire
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,
    refetchInterval: false,
    placeholderData: (previousData) => previousData,
    retry: (failureCount, error: any) => {
      if (error?.code === 'PGRST116' || error?.status === 401) {
        return false
      }
      return failureCount < 1
    }
  })

  // Récupérer les données hebdomadaires
  const weeklyDataQuery = useQuery({
    queryKey: ['partner-weekly-data', business?.id],
    queryFn: () => PartnerDashboardService.getWeeklyData(business!.id),
    enabled: !!business?.id,
    staleTime: 10 * 60 * 1000, // Augmenté à 10 minutes
    gcTime: 30 * 60 * 1000,
    refetchInterval: false,
    placeholderData: (previousData) => previousData,
    retry: (failureCount, error: any) => {
      if (error?.code === 'PGRST116' || error?.status === 401) {
        return false
      }
      return failureCount < 1
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
    }) => {
      if (!business?.id) {
        throw new Error('Business non trouvé. Veuillez réessayer.')
      }
      return PartnerDashboardService.addDriver({
        ...driverData,
        business_id: business.id
      })
    },
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
      // Vérifier que le business est chargé
      if (!business?.id) {
        return { success: false, error: 'Business non trouvé. Veuillez réessayer.' }
      }
      
      const result = await addDriverMutation.mutateAsync(driverData)
      return { success: !!result.driver, error: result.error }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du livreur:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Erreur lors de l\'ajout du livreur' }
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

  // États de chargement améliorés - chargement progressif
  const isBusinessLoading = businessQuery.isLoading
  const isStatsLoading = statsQuery.isLoading
  const isOrdersLoading = recentOrdersQuery.isLoading
  const isMenuLoading = menuQuery.isLoading
  const isDriversLoading = driversQuery.isLoading
  const isWeeklyDataLoading = weeklyDataQuery.isLoading

  // Chargement principal - SEULEMENT le business, pas les données secondaires
  const isLoading = isBusinessLoading
  
  // Chargement des données secondaires - seulement si le business est chargé mais pas les autres données
  const isSecondaryDataLoading = business && (isStatsLoading || isOrdersLoading || isMenuLoading || isDriversLoading || isWeeklyDataLoading)
  
  // Chargement global - pour l'état initial (NE PAS utiliser ça pour masquer le skeleton)
  const isInitialLoading = isBusinessLoading

  // Erreurs
  const error = businessError || statsQuery.data?.error || recentOrdersQuery.data?.error || menuQuery.data?.error || driversQuery.data?.error || weeklyDataQuery.data?.error

  return {
    // Données
    business: business || null,
    stats: statsQuery.data?.stats || null,
    recentOrders: recentOrdersQuery.data?.orders || [],
    menu: menuQuery.data?.menu || [],
    drivers: driversQuery.data?.drivers || [],
    weeklyData: weeklyDataQuery.data?.data || [],
    
    // États de chargement améliorés
    isLoading: isInitialLoading,
    isBusinessLoading,
    isStatsLoading,
    isOrdersLoading,
    isMenuLoading,
    isDriversLoading,
    isWeeklyDataLoading,
    isSecondaryDataLoading,
    
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
    weeklyDataError: weeklyDataQuery.data?.error,
    
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
    
    // NOUVELLES Actions pour le lazy loading
    loadMenu: () => menuQuery.refetch(),
    loadDrivers: () => driversQuery.refetch(),
    
    // Mutations directes (pour les cas avancés)
    updateOrderStatusMutation,
    toggleBusinessStatusMutation,
    updateBusinessInfoMutation,
    addDriverMutation,
    updateDriverMutation,
    deleteDriverMutation
  }
} 