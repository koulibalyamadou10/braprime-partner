import { supabase } from '@/lib/supabase'
import type { Tables, Inserts, Updates } from '@/lib/supabase'

export type Order = Tables<'orders'>

export interface OrderItem {
  id: number
  name: string
  price: number
  quantity: number
  image?: string
}

export class OrderService {
  // Créer une nouvelle commande
  static async createOrder(orderData: Inserts<'orders'>): Promise<{ order: Order | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single()

      if (error) {
        return { order: null, error: error.message }
      }

      return { order: data, error: null }
    } catch (error) {
      return { order: null, error: 'Erreur lors de la création de la commande' }
    }
  }

  // Récupérer une commande par ID
  static async getOrderById(orderId: string): Promise<{ order: Order | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (error) {
        return { order: null, error: error.message }
      }

      return { order: data, error: null }
    } catch (error) {
      return { order: null, error: 'Erreur lors de la récupération de la commande' }
    }
  }

  // Récupérer les commandes d'un utilisateur
  static async getUserOrders(userId: string): Promise<{ orders: Order[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        return { orders: [], error: error.message }
      }

      return { orders: data || [], error: null }
    } catch (error) {
      return { orders: [], error: 'Erreur lors de la récupération des commandes' }
    }
  }

  // Récupérer les commandes d'un restaurant (pour les partenaires)
  static async getRestaurantOrders(restaurantId: number): Promise<{ orders: Order[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false })

      if (error) {
        return { orders: [], error: error.message }
      }

      return { orders: data || [], error: null }
    } catch (error) {
      return { orders: [], error: 'Erreur lors de la récupération des commandes du restaurant' }
    }
  }

  // Mettre à jour le statut d'une commande
  static async updateOrderStatus(orderId: string, status: Order['status']): Promise<{ order: Order | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select()
        .single()

      if (error) {
        return { order: null, error: error.message }
      }

      return { order: data, error: null }
    } catch (error) {
      return { order: null, error: 'Erreur lors de la mise à jour du statut' }
    }
  }

  // Annuler une commande
  static async cancelOrder(orderId: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId)

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      return { error: 'Erreur lors de l\'annulation de la commande' }
    }
  }

  // Mettre à jour les informations du livreur
  static async updateDriverInfo(orderId: string, driverInfo: {
    driver_name?: string
    driver_phone?: string
    driver_location?: { lat: number; lng: number }
  }): Promise<{ order: Order | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          ...driverInfo,
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId)
        .select()
        .single()

      if (error) {
        return { order: null, error: error.message }
      }

      return { order: data, error: null }
    } catch (error) {
      return { order: null, error: 'Erreur lors de la mise à jour des informations du livreur' }
    }
  }

  // Récupérer les commandes par statut
  static async getOrdersByStatus(status: Order['status']): Promise<{ orders: Order[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (error) {
        return { orders: [], error: error.message }
      }

      return { orders: data || [], error: null }
    } catch (error) {
      return { orders: [], error: 'Erreur lors de la récupération des commandes' }
    }
  }

  // Récupérer les commandes récentes (dernières 24h)
  static async getRecentOrders(): Promise<{ orders: Order[]; error: string | null }> {
    try {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', yesterday.toISOString())
        .order('created_at', { ascending: false })

      if (error) {
        return { orders: [], error: error.message }
      }

      return { orders: data || [], error: null }
    } catch (error) {
      return { orders: [], error: 'Erreur lors de la récupération des commandes récentes' }
    }
  }

  // Calculer les statistiques des commandes pour un restaurant
  static async getRestaurantOrderStats(restaurantId: number): Promise<{
    totalOrders: number
    totalRevenue: number
    averageOrderValue: number
    pendingOrders: number
    error: string | null
  }> {
    try {
      // Total des commandes
      const { count: totalOrders, error: countError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restaurantId)

      if (countError) {
        return { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0, pendingOrders: 0, error: countError.message }
      }

      // Revenus totaux
      const { data: revenueData, error: revenueError } = await supabase
        .from('orders')
        .select('grand_total')
        .eq('restaurant_id', restaurantId)
        .eq('status', 'delivered')

      if (revenueError) {
        return { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0, pendingOrders: 0, error: revenueError.message }
      }

      const totalRevenue = revenueData?.reduce((sum, order) => sum + order.grand_total, 0) || 0
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      // Commandes en attente
      const { count: pendingOrders, error: pendingError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restaurantId)
        .in('status', ['pending', 'confirmed', 'preparing'])

      if (pendingError) {
        return { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0, pendingOrders: 0, error: pendingError.message }
      }

      return {
        totalOrders: totalOrders || 0,
        totalRevenue,
        averageOrderValue,
        pendingOrders: pendingOrders || 0,
        error: null
      }
    } catch (error) {
      return { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0, pendingOrders: 0, error: 'Erreur lors du calcul des statistiques' }
    }
  }

  // Écouter les changements de commandes en temps réel
  static onOrderChange(callback: (order: Order) => void) {
    return supabase
      .channel('orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        callback(payload.new as Order)
      })
      .subscribe()
  }
} 