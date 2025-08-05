import { supabase } from '@/lib/supabase'

export interface DriverActiveOrders {
  driver_id: string
  driver_name: string
  driver_phone: string
  vehicle_type: string
  vehicle_plate: string
  current_location: any
  active_orders_count: number
  active_order_ids: string[]
  business_names: string[]
  delivery_addresses: string[]
  estimated_deliveries: string[]
}

export interface DriverOrderDetails {
  order_id: string
  business_name: string
  delivery_address: string
  landmark?: string // Point de repère
  estimated_delivery: string
  status: string
  grand_total: number
  customer_phone: string
  delivery_instructions: string
}

export interface DriverStats {
  total_deliveries: number
  total_earnings: number
  average_rating: number
  active_orders_count: number
  completed_today: number
  earnings_today: number
}

export class DriverAssignmentService {
  // Assigner une commande à un chauffeur
  static async assignOrderToDriver(
    orderId: string, 
    driverId: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('assign_order_to_driver', {
        order_uuid: orderId,
        driver_uuid: driverId
      })

      if (error) {
        console.error('Erreur lors de l\'assignation:', error)
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de l\'assignation' 
      }
    }
  }

  // Libérer une commande d'un chauffeur
  static async unassignOrderFromDriver(
    orderId: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('unassign_order_from_driver', {
        order_uuid: orderId
      })

      if (error) {
        console.error('Erreur lors de la libération:', error)
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (error) {
      console.error('Erreur lors de la libération:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de la libération' 
      }
    }
  }

  // Obtenir les commandes actives d'un chauffeur
  static async getDriverActiveOrders(
    driverId: string
  ): Promise<{ data: DriverOrderDetails[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('get_driver_active_orders', {
        driver_uuid: driverId
      })

      if (error) {
        console.error('Erreur lors de la récupération des commandes actives:', error)
        return { data: null, error: error.message }
      }

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes actives:', error)
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Erreur lors de la récupération des commandes actives' 
      }
    }
  }

  // Obtenir les statistiques d'un chauffeur
  static async getDriverStats(
    driverId: string
  ): Promise<{ data: DriverStats | null; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('get_driver_stats', {
        driver_uuid: driverId
      })

      if (error) {
        console.error('Erreur lors de la récupération des statistiques:', error)
        return { data: null, error: error.message }
      }

      return { data: data?.[0] || null, error: null }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error)
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Erreur lors de la récupération des statistiques' 
      }
    }
  }

  // Obtenir tous les chauffeurs avec leurs commandes actives
  static async getAllDriversWithActiveOrders(): Promise<{ 
    data: DriverActiveOrders[] | null; 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('driver_active_orders')
        .select('*')
        .order('active_orders_count', { ascending: false })

      if (error) {
        console.error('Erreur lors de la récupération des chauffeurs:', error)
        return { data: null, error: error.message }
      }

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Erreur lors de la récupération des chauffeurs:', error)
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Erreur lors de la récupération des chauffeurs' 
      }
    }
  }

  // Obtenir les chauffeurs disponibles pour un business
  static async getAvailableDriversForBusiness(
    businessId: number
  ): Promise<{ data: DriverActiveOrders[] | null; error: string | null }> {
    try {
      // Récupérer tous les chauffeurs avec leurs commandes actives
      const { data: allDrivers, error: allDriversError } = await this.getAllDriversWithActiveOrders()
      
      if (allDriversError) {
        return { data: null, error: allDriversError }
      }

      // Filtrer les chauffeurs du business et ceux qui ont moins de 3 commandes actives
      const availableDrivers = allDrivers?.filter(driver => {
        // Vérifier si le chauffeur appartient au business ou est indépendant
        // et s'il a moins de 3 commandes actives (limite recommandée)
        return driver.active_orders_count < 3
      }) || []

      return { data: availableDrivers, error: null }
    } catch (error) {
      console.error('Erreur lors de la récupération des chauffeurs disponibles:', error)
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Erreur lors de la récupération des chauffeurs disponibles' 
      }
    }
  }

  // Vérifier si un chauffeur peut accepter une nouvelle commande
  static async canDriverAcceptOrder(
    driverId: string,
    maxOrders: number = 3
  ): Promise<{ canAccept: boolean; currentOrders: number; error: string | null }> {
    try {
      const { data: activeOrders, error } = await this.getDriverActiveOrders(driverId)
      
      if (error) {
        return { canAccept: false, currentOrders: 0, error }
      }

      const currentOrders = activeOrders?.length || 0
      const canAccept = currentOrders < maxOrders

      return { canAccept, currentOrders, error: null }
    } catch (error) {
      console.error('Erreur lors de la vérification:', error)
      return { 
        canAccept: false, 
        currentOrders: 0, 
        error: error instanceof Error ? error.message : 'Erreur lors de la vérification' 
      }
    }
  }

  // Assigner plusieurs commandes à un chauffeur
  static async assignMultipleOrdersToDriver(
    orderIds: string[],
    driverId: string
  ): Promise<{ 
    success: boolean; 
    assigned: string[]; 
    failed: string[]; 
    error: string | null 
  }> {
    try {
      const assigned: string[] = []
      const failed: string[] = []

      for (const orderId of orderIds) {
        const { success, error } = await this.assignOrderToDriver(orderId, driverId)
        
        if (success) {
          assigned.push(orderId)
        } else {
          failed.push(orderId)
          console.error(`Échec de l'assignation de la commande ${orderId}:`, error)
        }
      }

      return { 
        success: assigned.length > 0, 
        assigned, 
        failed, 
        error: failed.length > 0 ? `${failed.length} commandes n'ont pas pu être assignées` : null 
      }
    } catch (error) {
      console.error('Erreur lors de l\'assignation multiple:', error)
      return { 
        success: false, 
        assigned: [], 
        failed: orderIds, 
        error: error instanceof Error ? error.message : 'Erreur lors de l\'assignation multiple' 
      }
    }
  }

  // Obtenir les commandes non assignées pour un business
  static async getUnassignedOrders(
    businessId: number
  ): Promise<{ data: any[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('business_id', businessId)
        .is('driver_id', null)
        .in('status', ['confirmed', 'preparing', 'ready'])
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Erreur lors de la récupération des commandes non assignées:', error)
        return { data: null, error: error.message }
      }

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes non assignées:', error)
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Erreur lors de la récupération des commandes non assignées' 
      }
    }
  }
} 