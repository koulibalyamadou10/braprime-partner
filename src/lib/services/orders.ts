import { supabase } from '@/lib/supabase'
import type { Inserts } from '@/lib/supabase'

export interface Order {
  id: string
  user_id: string
  business_id: number
  business_name: string
  items: any[]
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled'
  total: number
  delivery_fee: number
  tax: number
  grand_total: number
  delivery_method: string
  delivery_address: string
  delivery_instructions?: string
  payment_method: string
  payment_status: string
  estimated_delivery: string
  actual_delivery?: string
  driver_id?: string
  driver_name?: string
  driver_phone?: string
  driver_location?: any
  customer_rating?: number
  customer_review?: string
  created_at: string
  updated_at: string
}

// Type pour la création de commande
export interface CreateOrderData {
  id: string
  user_id: string
  business_id: number
  business_name: string
  items: any[]
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled'
  total: number
  delivery_fee: number
  tax: number
  grand_total: number
  delivery_address: string
  delivery_method: string
  estimated_delivery: string
  payment_method?: string
  payment_status?: string
}

export class OrderService {
  // Créer une nouvelle commande
  static async createOrder(orderData: CreateOrderData): Promise<{ order: Order | null; error: string | null }> {
    try {
      console.log('Création de commande:', orderData)
      
      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single()

      if (error) {
        console.error('Erreur création commande:', error)
        return { order: null, error: error.message }
      }

      console.log('Commande créée avec succès:', data)
      return { order: data, error: null }
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error)
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

  // Récupérer les commandes d'un commerce (pour les partenaires)
  static async getBusinessOrders(businessId: number): Promise<{ orders: Order[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })

      if (error) {
        return { orders: [], error: error.message }
      }

      return { orders: data || [], error: null }
    } catch (error) {
      return { orders: [], error: 'Erreur lors de la récupération des commandes du commerce' }
    }
  }

  // Mettre à jour le statut d'une commande
  static async updateOrderStatus(orderId: string, status: Order['status']): Promise<{ order: Order | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status, 
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

  // Assigner un livreur à une commande
  static async assignDriver(orderId: string, driverId: string, driverName: string, driverPhone: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          driver_id: driverId,
          driver_name: driverName,
          driver_phone: driverPhone,
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId)

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      return { error: 'Erreur lors de l\'assignation du livreur' }
    }
  }

  // Mettre à jour la position du livreur
  static async updateDriverLocation(orderId: string, location: { lat: number; lng: number }): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          driver_location: location,
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId)

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      return { error: 'Erreur lors de la mise à jour de la position' }
    }
  }

  // Ajouter une note et avis client
  static async addCustomerReview(orderId: string, rating: number, review: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          customer_rating: rating,
          customer_review: review,
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId)

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      return { error: 'Erreur lors de l\'ajout de l\'avis' }
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

  // Écouter les changements de commandes en temps réel
  static subscribeToOrderChanges(orderId: string, callback: (order: Order) => void) {
    return supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          callback(payload.new as Order)
        }
      )
      .subscribe()
  }

  // Écouter les nouvelles commandes d'un commerce
  static subscribeToBusinessOrders(businessId: number, callback: (order: Order) => void) {
    return supabase
      .channel(`business-orders-${businessId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `business_id=eq.${businessId}`
        },
        (payload) => {
          callback(payload.new as Order)
        }
      )
      .subscribe()
  }

  // Écouter les changements de statut des commandes d'un utilisateur
  static subscribeToUserOrderStatus(userId: string, callback: (order: Order) => void) {
    return supabase
      .channel(`user-orders-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as Order)
        }
      )
      .subscribe()
  }
} 