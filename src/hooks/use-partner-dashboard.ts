import { useState, useEffect, useCallback } from 'react'
import { PartnerDashboardService, PartnerBusiness, PartnerStats, PartnerOrder, PartnerMenuItem } from '@/lib/services/partner-dashboard'
import { useAuth } from '@/contexts/AuthContext'

export const usePartnerDashboard = () => {
  const { currentUser, isAuthenticated } = useAuth()
  const [business, setBusiness] = useState<PartnerBusiness | null>(null)
  const [stats, setStats] = useState<PartnerStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<PartnerOrder[]>([])
  const [menu, setMenu] = useState<PartnerMenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Charger les données du business
  const loadBusinessData = useCallback(async () => {
    if (!isAuthenticated || currentUser?.role !== 'partner') {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Récupérer le business du partenaire
      const { business: partnerBusiness, error: businessError } = await PartnerDashboardService.getPartnerBusiness()
      
      if (businessError) {
        setError(businessError)
        setIsLoading(false)
        return
      }

      if (!partnerBusiness) {
        setError('Aucun business trouvé pour ce partenaire')
        setIsLoading(false)
        return
      }

      setBusiness(partnerBusiness)

      // Récupérer les statistiques
      const { stats: partnerStats, error: statsError } = await PartnerDashboardService.getPartnerStats(partnerBusiness.id)
      if (!statsError && partnerStats) {
        setStats(partnerStats)
      }

      // Récupérer les commandes récentes
      const { orders, error: ordersError } = await PartnerDashboardService.getPartnerOrders(partnerBusiness.id, 5)
      if (!ordersError && orders) {
        setRecentOrders(orders)
      }

      // Récupérer le menu
      const { menu: partnerMenu, error: menuError } = await PartnerDashboardService.getPartnerMenu(partnerBusiness.id)
      if (!menuError && partnerMenu) {
        setMenu(partnerMenu)
      }

    } catch (err) {
      console.error('Erreur lors du chargement des données:', err)
      setError('Erreur lors du chargement des données')
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, currentUser?.role])

  // Mettre à jour le statut d'une commande
  const updateOrderStatus = useCallback(async (orderId: string, status: string) => {
    if (!business) return false

    try {
      const { success, error } = await PartnerDashboardService.updateOrderStatus(orderId, status)
      
      if (success) {
        // Recharger les données
        await loadBusinessData()
        return true
      } else {
        console.error('Erreur mise à jour statut:', error)
        return false
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err)
      return false
    }
  }, [business, loadBusinessData])

  // Changer le statut ouvert/fermé du business
  const toggleBusinessStatus = useCallback(async (isOpen: boolean) => {
    if (!business) return false

    try {
      const { success, error } = await PartnerDashboardService.toggleBusinessStatus(business.id, isOpen)
      
      if (success) {
        setBusiness(prev => prev ? { ...prev, is_open: isOpen } : null)
        return true
      } else {
        console.error('Erreur changement statut business:', error)
        return false
      }
    } catch (err) {
      console.error('Erreur lors du changement de statut:', err)
      return false
    }
  }, [business])

  // Mettre à jour les informations du business
  const updateBusinessInfo = useCallback(async (updates: Partial<PartnerBusiness>) => {
    if (!business) return false

    try {
      const { success, error } = await PartnerDashboardService.updateBusinessInfo(business.id, updates)
      
      if (success) {
        setBusiness(prev => prev ? { ...prev, ...updates } : null)
        return true
      } else {
        console.error('Erreur mise à jour business:', error)
        return false
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour du business:', err)
      return false
    }
  }, [business])

  // Recharger toutes les données
  const refresh = useCallback(() => {
    loadBusinessData()
  }, [loadBusinessData])

  // Charger les données au montage et quand l'authentification change
  useEffect(() => {
    loadBusinessData()
  }, [loadBusinessData])

  return {
    // Données
    business,
    stats,
    recentOrders,
    menu,
    
    // État
    isLoading,
    error,
    isAuthenticated,
    currentUser,
    
    // Actions
    updateOrderStatus,
    toggleBusinessStatus,
    updateBusinessInfo,
    refresh,
    loadBusinessData
  }
} 