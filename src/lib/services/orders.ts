import { supabase } from '@/lib/supabase'
import type { Inserts } from '@/lib/supabase'
import { NotificationService } from './notifications'

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
  estimated_delivery?: string
  actual_delivery?: string
  driver_id?: string
  driver_name?: string
  driver_phone?: string
  driver_location?: any
  customer_rating?: number
  customer_review?: string
  pickup_coordinates?: any
  delivery_coordinates?: any
  estimated_pickup_time?: string
  estimated_delivery_time?: string
  actual_pickup_time?: string
  actual_delivery_time?: string
  created_at: string
  updated_at: string
  preferred_delivery_time?: string
  delivery_type: 'asap' | 'scheduled'
  available_for_drivers: boolean
  scheduled_delivery_window_start?: string
  scheduled_delivery_window_end?: string
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
  delivery_instructions?: string
  landmark?: string // Point de repère pour la livraison
  delivery_method: string
  payment_method?: string
  payment_status?: string
  // Champs pour les types de livraison
  delivery_type: 'asap' | 'scheduled'
  available_for_drivers: boolean
  preferred_delivery_time?: string
  scheduled_delivery_window_start?: string
  scheduled_delivery_window_end?: string
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

      // Créer une notification pour la nouvelle commande
      await NotificationService.create({
        user_id: orderData.user_id,
        type: 'order_status',
        title: 'Commande confirmée',
        message: `Votre commande #${data.id.substring(0, 8)} a été confirmée et est en cours de préparation.`,
        priority: 'medium',
        data: {
          order_id: data.id,
          business_name: orderData.business_name,
          total: orderData.grand_total
        }
      })

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

      // Créer une notification selon le nouveau statut
      if (data) {
        await createStatusNotification(data, status)
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
    console.log('🔌 Tentative de subscription pour la commande:', orderId);
    
    let subscriptionTimeout: NodeJS.Timeout;
    let retryCount = 0;
    const maxRetries = 3;
    
    const setupSubscription = () => {
      console.log(`🔄 Tentative de subscription ${retryCount + 1}/${maxRetries + 1}`);
      
      const channel = supabase
        .channel(`order-${orderId}-${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders',
            filter: `id=eq.${orderId}`
          },
          (payload) => {
            console.log('📡 Changement détecté pour la commande:', orderId, payload);
            retryCount = 0; // Reset retry count on successful update
            callback(payload.new as Order);
          }
        )
        .subscribe((status) => {
          console.log('📡 Statut de la subscription:', status, 'pour la commande:', orderId);
          
          if (status === 'SUBSCRIBED') {
            console.log('✅ Subscription réussie pour la commande:', orderId);
            retryCount = 0;
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ Erreur de canal pour la commande:', orderId);
            handleSubscriptionError();
          } else if (status === 'TIMED_OUT') {
            console.error('⏰ Timeout de la subscription pour la commande:', orderId);
            handleSubscriptionError();
          } else if (status === 'CLOSED') {
            console.log('🔌 Canal fermé pour la commande:', orderId);
            handleSubscriptionError();
          }
        });

      // Timeout pour détecter les problèmes de connexion
      subscriptionTimeout = setTimeout(() => {
        console.warn('⚠️ Timeout de subscription pour la commande:', orderId);
        handleSubscriptionError();
      }, 10000); // 10 secondes

      return channel;
    };

    const handleSubscriptionError = () => {
      if (subscriptionTimeout) {
        clearTimeout(subscriptionTimeout);
      }
      
      if (retryCount < maxRetries) {
        retryCount++;
        console.log(`🔄 Nouvelle tentative de subscription (${retryCount}/${maxRetries})`);
        setTimeout(() => {
          setupSubscription();
        }, 2000 * retryCount); // Délai progressif
      } else {
        console.error('❌ Nombre maximum de tentatives atteint pour la commande:', orderId);
      }
    };

    const channel = setupSubscription();

    // Retourner une fonction de désabonnement
    return () => {
      console.log('🔌 Désabonnement de la commande:', orderId);
      if (subscriptionTimeout) {
        clearTimeout(subscriptionTimeout);
      }
      try {
        supabase.removeChannel(channel);
      } catch (error) {
        console.error('❌ Erreur lors de la désabonnement:', error);
      }
    };
  }

  // Écouter les nouvelles commandes d'un commerce
  static subscribeToBusinessOrders(businessId: number, callback: (order: Order) => void) {
    const channel = supabase
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

    // Retourner une fonction de désabonnement
    return () => {
      supabase.removeChannel(channel)
    }
  }

  // Écouter les changements de statut des commandes d'un utilisateur
  static subscribeToUserOrderStatus(userId: string, callback: (order: Order) => void) {
    const channel = supabase
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

    // Retourner une fonction de désabonnement
    return () => {
      supabase.removeChannel(channel)
    }
  }
}

// Fonction helper pour créer des notifications selon le statut
const createStatusNotification = async (order: Order, status: string) => {
  const statusMessages = {
    'confirmed': {
      title: 'Commande confirmée',
      message: `Votre commande #${order.id.substring(0, 8)} a été confirmée par ${order.business_name}.`,
      priority: 'medium' as const
    },
    'preparing': {
      title: 'Commande en préparation',
      message: `Votre commande #${order.id.substring(0, 8)} est en cours de préparation chez ${order.business_name}.`,
      priority: 'medium' as const
    },
    'ready': {
      title: 'Commande prête',
      message: `Votre commande #${order.id.substring(0, 8)} est prête pour la livraison.`,
      priority: 'high' as const
    },
    'picked_up': {
      title: 'Commande en livraison',
      message: `Votre commande #${order.id.substring(0, 8)} est en cours de livraison.`,
      priority: 'high' as const
    },
    'delivered': {
      title: 'Commande livrée',
      message: `Votre commande #${order.id.substring(0, 8)} a été livrée. Bon appétit !`,
      priority: 'medium' as const
    },
    'cancelled': {
      title: 'Commande annulée',
      message: `Votre commande #${order.id.substring(0, 8)} a été annulée.`,
      priority: 'high' as const
    }
  }

  const notificationData = statusMessages[status as keyof typeof statusMessages]
  
  if (notificationData) {
    await NotificationService.create({
      user_id: order.user_id,
      type: 'order_status',
      title: notificationData.title,
      message: notificationData.message,
      priority: notificationData.priority,
      data: {
        order_id: order.id,
        business_name: order.business_name,
        status: status
      }
    })
  }
} 