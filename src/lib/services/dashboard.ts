import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

export interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  growthPercentage: number
  pendingOrders: number
  completedOrders: number
  cancelledOrders: number
}

export interface OrderStats {
  today: number
  thisWeek: number
  thisMonth: number
  thisYear: number
}

export interface RevenueStats {
  today: number
  thisWeek: number
  thisMonth: number
  thisYear: number
  growth: number
}

export interface TopItem {
  name: string
  count: number
  revenue: number
  percentage: number
}

export interface RecentOrder {
  id: string
  customer_name: string
  restaurant_name: string
  status: string
  total: number
  created_at: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
}

export interface Notification {
  id: string
  type: 'order' | 'review' | 'payment' | 'system'
  message: string
  created_at: string
  read: boolean
}

export class DashboardService {
  // Vérifier l'authentification avant toute requête
  private static async checkAuth() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error)
      throw new Error(`Erreur d'authentification: ${error.message}`)
    }
    if (!user) {
      console.error('Aucun utilisateur authentifié')
      throw new Error('Utilisateur non authentifié')
    }
    console.log('Utilisateur authentifié:', user.id)
    return user
  }

  // Statistiques générales pour les partenaires
  static async getPartnerStats(partnerId: string, period: 'today' | 'week' | 'month' | 'year' = 'month'): Promise<DashboardStats> {
    try {
      // Vérifier l'authentification
      const user = await this.checkAuth()
      console.log('Récupération des statistiques pour le partenaire:', partnerId)

      const now = new Date()
      let startDate: Date

      switch (period) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1)
          break
      }

      // Récupérer d'abord les IDs des restaurants du partenaire
      const { data: restaurants, error: restaurantsError } = await supabase
        .from('restaurants')
        .select('id')
        .eq('partner_id', partnerId)

      if (restaurantsError) {
        console.error('Erreur lors de la récupération des restaurants:', restaurantsError)
        return this.getDefaultStats()
      }

      if (!restaurants?.length) {
        console.log('Aucun restaurant trouvé pour le partenaire:', partnerId)
        return this.getDefaultStats()
      }

      const restaurantIds = restaurants.map(r => r.id)
      console.log('Restaurants trouvés:', restaurantIds)

      // Récupérer les commandes des restaurants du partenaire
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .in('restaurant_id', restaurantIds)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', now.toISOString())

      if (error) {
        console.error('Erreur lors de la récupération des commandes:', error)
        console.error('Détails de l\'erreur:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        return this.getDefaultStats()
      }

      console.log('Commandes trouvées:', orders?.length || 0)

      const totalOrders = orders?.length || 0
      const totalRevenue = orders?.reduce((sum, order) => sum + order.grand_total, 0) || 0
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
      const pendingOrders = orders?.filter(order => order.status === 'pending').length || 0
      const completedOrders = orders?.filter(order => order.status === 'delivered').length || 0
      const cancelledOrders = orders?.filter(order => order.status === 'cancelled').length || 0

      // Calculer la croissance (simplifié pour l'exemple)
      const growthPercentage = 15 // À remplacer par un calcul réel

      return {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        growthPercentage,
        pendingOrders,
        completedOrders,
        cancelledOrders
      }
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error)
      if (error instanceof Error) {
        console.error('Message d\'erreur:', error.message)
      }
      return this.getDefaultStats()
    }
  }

  // Statistiques pour les clients
  static async getCustomerStats(userId: string): Promise<{
    totalOrders: number
    totalSpent: number
    favoriteRestaurants: number
    savedAddresses: number
  }> {
    try {
      // Vérifier l'authentification
      await this.checkAuth()

      // Récupérer les commandes du client
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)

      if (ordersError) {
        console.error('Erreur lors de la récupération des commandes:', ordersError)
        return { totalOrders: 0, totalSpent: 0, favoriteRestaurants: 0, savedAddresses: 0 }
      }

      const totalOrders = orders?.length || 0
      const totalSpent = orders?.reduce((sum, order) => sum + order.grand_total, 0) || 0

      // Récupérer les adresses sauvegardées
      const { data: addresses, error: addressesError } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', userId)

      const savedAddresses = addresses?.length || 0

      // Calculer les restaurants favoris (simplifié)
      const favoriteRestaurants = 3 // À remplacer par un calcul réel

      return {
        totalOrders,
        totalSpent,
        favoriteRestaurants,
        savedAddresses
      }
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques client:', error)
      return { totalOrders: 0, totalSpent: 0, favoriteRestaurants: 0, savedAddresses: 0 }
    }
  }

  // Commandes récentes pour les partenaires
  static async getRecentPartnerOrders(partnerId: string, limit: number = 10): Promise<RecentOrder[]> {
    try {
      // Vérifier l'authentification
      await this.checkAuth()

      // Récupérer d'abord les IDs des restaurants du partenaire
      const { data: restaurants, error: restaurantsError } = await supabase
        .from('restaurants')
        .select('id')
        .eq('partner_id', partnerId)

      if (restaurantsError || !restaurants?.length) {
        console.error('Erreur lors de la récupération des restaurants:', restaurantsError)
        return []
      }

      const restaurantIds = restaurants.map(r => r.id)

      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id,
          user_id,
          restaurant_name,
          status,
          total,
          grand_total,
          items,
          created_at
        `)
        .in('restaurant_id', restaurantIds)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Erreur lors de la récupération des commandes récentes:', error)
        return []
      }

      // Récupérer les noms des utilisateurs séparément
      const userIds = [...new Set(orders?.map(order => order.user_id) || [])]
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, name')
        .in('id', userIds)

      if (usersError) {
        console.error('Erreur lors de la récupération des utilisateurs:', usersError)
      }

      const userMap = new Map(users?.map(user => [user.id, user.name]) || [])

      return orders?.map(order => ({
        id: order.id,
        customer_name: userMap.get(order.user_id) || 'Client inconnu',
        restaurant_name: order.restaurant_name,
        status: order.status,
        total: order.grand_total,
        created_at: order.created_at,
        items: Array.isArray(order.items) ? order.items : []
      })) || []
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes récentes:', error)
      return []
    }
  }

  // Commandes récentes pour les clients
  static async getRecentCustomerOrders(userId: string, limit: number = 5): Promise<RecentOrder[]> {
    try {
      // Vérifier l'authentification
      await this.checkAuth()

      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Erreur lors de la récupération des commandes récentes:', error)
        return []
      }

      return orders?.map(order => ({
        id: order.id,
        customer_name: 'Vous',
        restaurant_name: order.restaurant_name,
        status: order.status,
        total: order.grand_total,
        created_at: order.created_at,
        items: Array.isArray(order.items) ? order.items : []
      })) || []
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes récentes:', error)
      return []
    }
  }

  // Articles les plus populaires
  static async getTopItems(partnerId: string, period: 'week' | 'month' = 'month'): Promise<TopItem[]> {
    try {
      // Vérifier l'authentification
      await this.checkAuth()

      // Récupérer d'abord les IDs des restaurants du partenaire
      const { data: restaurants, error: restaurantsError } = await supabase
        .from('restaurants')
        .select('id')
        .eq('partner_id', partnerId)

      if (restaurantsError || !restaurants?.length) {
        console.error('Erreur lors de la récupération des restaurants:', restaurantsError)
        return []
      }

      const restaurantIds = restaurants.map(r => r.id)

      const now = new Date()
      const startDate = period === 'week' 
        ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        : new Date(now.getFullYear(), now.getMonth(), 1)

      const { data: orders, error } = await supabase
        .from('orders')
        .select('items')
        .in('restaurant_id', restaurantIds)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', now.toISOString())

      if (error) {
        console.error('Erreur lors de la récupération des articles populaires:', error)
        return []
      }

      // Analyser les articles dans les commandes
      const itemStats: Record<string, { count: number; revenue: number }> = {}

      orders?.forEach(order => {
        if (Array.isArray(order.items)) {
          order.items.forEach((item: any) => {
            const itemName = item.name || 'Article inconnu'
            if (!itemStats[itemName]) {
              itemStats[itemName] = { count: 0, revenue: 0 }
            }
            itemStats[itemName].count += item.quantity || 1
            itemStats[itemName].revenue += (item.price || 0) * (item.quantity || 1)
          })
        }
      })

      // Convertir en tableau et trier
      const topItems = Object.entries(itemStats)
        .map(([name, stats]) => ({
          name,
          count: stats.count,
          revenue: stats.revenue,
          percentage: 0 // À calculer
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      // Calculer les pourcentages
      const totalCount = topItems.reduce((sum, item) => sum + item.count, 0)
      topItems.forEach(item => {
        item.percentage = totalCount > 0 ? (item.count / totalCount) * 100 : 0
      })

      return topItems
    } catch (error) {
      console.error('Erreur lors du calcul des articles populaires:', error)
      return []
    }
  }

  // Notifications
  static async getNotifications(userId: string, type: 'customer' | 'partner' = 'customer'): Promise<Notification[]> {
    try {
      // Vérifier l'authentification
      await this.checkAuth()

      // Pour l'instant, retourner des notifications simulées
      // À remplacer par une vraie table de notifications
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'order',
          message: 'Nouvelle commande reçue: ORD-002',
          created_at: new Date().toISOString(),
          read: false
        },
        {
          id: '2',
          type: 'review',
          message: 'Un client a donné une note de 5 étoiles',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read: false
        },
        {
          id: '3',
          type: 'payment',
          message: 'Paiement reçu: 1,250,000 GNF',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          read: true
        }
      ]

      return mockNotifications
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error)
      return []
    }
  }

  // Données de revenus par période
  static async getRevenueData(partnerId: string, period: 'daily' | 'weekly' | 'monthly'): Promise<{
    date: string
    revenue: number
    orders: number
  }[]> {
    try {
      // Vérifier l'authentification
      await this.checkAuth()

      // Récupérer d'abord les IDs des restaurants du partenaire
      const { data: restaurants, error: restaurantsError } = await supabase
        .from('restaurants')
        .select('id')
        .eq('partner_id', partnerId)

      if (restaurantsError || !restaurants?.length) {
        console.error('Erreur lors de la récupération des restaurants:', restaurantsError)
        return []
      }

      const restaurantIds = restaurants.map(r => r.id)

      const now = new Date()
      let startDate: Date
      let interval: string

      switch (period) {
        case 'daily':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // 7 jours
          interval = 'day'
          break
        case 'weekly':
          startDate = new Date(now.getTime() - 4 * 7 * 24 * 60 * 60 * 1000) // 4 semaines
          interval = 'week'
          break
        case 'monthly':
          startDate = new Date(now.getFullYear(), 0, 1) // Année en cours
          interval = 'month'
          break
      }

      const { data: orders, error } = await supabase
        .from('orders')
        .select('grand_total, created_at')
        .in('restaurant_id', restaurantIds)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', now.toISOString())

      if (error) {
        console.error('Erreur lors de la récupération des données de revenus:', error)
        return []
      }

      // Grouper par période
      const groupedData: Record<string, { revenue: number; orders: number }> = {}

      orders?.forEach(order => {
        const date = new Date(order.created_at)
        let key: string

        switch (interval) {
          case 'day':
            key = date.toISOString().split('T')[0]
            break
          case 'week':
            const weekStart = new Date(date)
            weekStart.setDate(date.getDate() - date.getDay())
            key = weekStart.toISOString().split('T')[0]
            break
          case 'month':
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            break
        }

        if (!groupedData[key]) {
          groupedData[key] = { revenue: 0, orders: 0 }
        }
        groupedData[key].revenue += order.grand_total
        groupedData[key].orders += 1
      })

      // Convertir en tableau et trier
      return Object.entries(groupedData)
        .map(([date, data]) => ({
          date,
          revenue: data.revenue,
          orders: data.orders
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
    } catch (error) {
      console.error('Erreur lors du calcul des données de revenus:', error)
      return []
    }
  }

  // Statistiques par défaut
  private static getDefaultStats(): DashboardStats {
    return {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      growthPercentage: 0,
      pendingOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0
    }
  }

  // Méthode de test pour diagnostiquer les problèmes
  static async diagnoseAuthAndData() {
    console.log('=== DIAGNOSTIC DASHBOARD ===')
    
    try {
      // 1. Vérifier l'authentification
      console.log('1. Vérification de l\'authentification...')
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error('❌ Erreur d\'authentification:', authError)
        return { success: false, error: 'Erreur d\'authentification', details: authError }
      }
      
      if (!user) {
        console.error('❌ Aucun utilisateur connecté')
        return { success: false, error: 'Aucun utilisateur connecté' }
      }
      
      console.log('✅ Utilisateur connecté:', user.id, user.email)
      
      // 2. Vérifier le profil utilisateur
      console.log('2. Vérification du profil utilisateur...')
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profileError) {
        console.error('❌ Erreur profil utilisateur:', profileError)
        return { success: false, error: 'Erreur profil utilisateur', details: profileError }
      }
      
      if (!userProfile) {
        console.error('❌ Profil utilisateur non trouvé')
        return { success: false, error: 'Profil utilisateur non trouvé' }
      }
      
      console.log('✅ Profil utilisateur:', userProfile)
      
      // 3. Vérifier les restaurants (si partenaire)
      if (userProfile.role === 'partner') {
        console.log('3. Vérification des restaurants...')
        const { data: restaurants, error: restaurantsError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('partner_id', user.id)
        
        if (restaurantsError) {
          console.error('❌ Erreur restaurants:', restaurantsError)
          return { success: false, error: 'Erreur restaurants', details: restaurantsError }
        }
        
        console.log('✅ Restaurants trouvés:', restaurants?.length || 0, restaurants)
        
        // 4. Vérifier les commandes (si restaurants existent)
        if (restaurants?.length) {
          console.log('4. Vérification des commandes...')
          const restaurantIds = restaurants.map(r => r.id)
          const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .in('restaurant_id', restaurantIds)
            .limit(5)
          
          if (ordersError) {
            console.error('❌ Erreur commandes:', ordersError)
            return { success: false, error: 'Erreur commandes', details: ordersError }
          }
          
          console.log('✅ Commandes trouvées:', orders?.length || 0, orders)
        }
      } else {
        // 3. Vérifier les commandes (si client)
        console.log('3. Vérification des commandes client...')
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .limit(5)
        
        if (ordersError) {
          console.error('❌ Erreur commandes client:', ordersError)
          return { success: false, error: 'Erreur commandes client', details: ordersError }
        }
        
        console.log('✅ Commandes client trouvées:', orders?.length || 0, orders)
      }
      
      console.log('✅ Diagnostic terminé avec succès')
      return { success: true, user: userProfile }
      
    } catch (error) {
      console.error('❌ Erreur lors du diagnostic:', error)
      return { success: false, error: 'Erreur lors du diagnostic', details: error }
    }
  }

  // Récupérer les services d'un partenaire
  static async getPartnerServices(partnerId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          service_types (
            id,
            name,
            icon,
            color
          )
        `)
        .eq('partner_id', partnerId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des services du partenaire:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des services du partenaire:', error);
      throw error;
    }
  }

  // Récupérer les statistiques du dashboard selon le type de service
  static async getDashboardStats(partnerId: string, serviceType?: string): Promise<any> {
    try {
      let servicesQuery = supabase
        .from('services')
        .select('id')
        .eq('partner_id', partnerId)
        .eq('is_active', true);

      // Filtrer par type de service si spécifié
      if (serviceType) {
        servicesQuery = servicesQuery.eq('service_type_id', serviceType);
      }

      const { data: services, error: servicesError } = await servicesQuery;
      if (servicesError) throw servicesError;

      const serviceIds = services?.map(s => s.id) || [];

      if (serviceIds.length === 0) {
        return {
          totalOrders: 0,
          totalRevenue: 0,
          averageRating: 0,
          totalProducts: 0,
          recentOrders: 0,
          pendingOrders: 0
        };
      }

      // Statistiques des commandes
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .in('service_id', serviceIds)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (ordersError) throw ordersError;

      // Statistiques des produits
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id')
        .in('service_id', serviceIds)
        .eq('is_available', true);

      if (productsError) throw productsError;

      // Calculer les statistiques
      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + order.grand_total, 0) || 0;
      const recentOrders = orders?.filter(order => 
        new Date(order.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length || 0;
      const pendingOrders = orders?.filter(order => 
        ['pending', 'confirmed', 'preparing'].includes(order.status)
      ).length || 0;

      // Calculer la note moyenne
      const { data: servicesWithRating, error: ratingError } = await supabase
        .from('services')
        .select('rating, review_count')
        .in('id', serviceIds);

      if (ratingError) throw ratingError;

      const totalRating = servicesWithRating?.reduce((sum, service) => 
        sum + (service.rating * service.review_count), 0
      ) || 0;
      const totalReviews = servicesWithRating?.reduce((sum, service) => 
        sum + service.review_count, 0
      ) || 0;
      const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

      return {
        totalOrders,
        totalRevenue,
        averageRating: Math.round(averageRating * 10) / 10,
        totalProducts: products?.length || 0,
        recentOrders,
        pendingOrders
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques du dashboard:', error);
      throw error;
    }
  }

  // Récupérer les commandes récentes d'un partenaire
  static async getRecentOrders(partnerId: string, limit: number = 10): Promise<any[]> {
    try {
      // D'abord récupérer les IDs des services du partenaire
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('id')
        .eq('partner_id', partnerId)
        .eq('is_active', true);

      if (servicesError) throw servicesError;

      const serviceIds = services?.map(s => s.id) || [];

      if (serviceIds.length === 0) {
        return [];
      }

      // Récupérer les commandes récentes
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          services (
            id,
            name,
            service_types (
              id,
              name,
              icon,
              color
            )
          )
        `)
        .in('service_id', serviceIds)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erreur lors de la récupération des commandes récentes:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes récentes:', error);
      throw error;
    }
  }

  // Récupérer les produits d'un partenaire
  static async getPartnerProducts(partnerId: string, limit: number = 20): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          services (
            id,
            name,
            service_types (
              id,
              name,
              icon,
              color
            )
          ),
          categories (
            id,
            name
          )
        `)
        .eq('services.partner_id', partnerId)
        .eq('is_available', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erreur lors de la récupération des produits du partenaire:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des produits du partenaire:', error);
      throw error;
    }
  }

  // Récupérer les types de services disponibles
  static async getAvailableServiceTypes(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('service_types')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Erreur lors de la récupération des types de services:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des types de services:', error);
      throw error;
    }
  }

  // Récupérer les catégories de produits
  static async getProductCategories(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Erreur lors de la récupération des catégories:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
      throw error;
    }
  }

  // Créer un nouveau service pour un partenaire
  static async createService(serviceData: any): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert(serviceData)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création du service:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la création du service:', error);
      throw error;
    }
  }

  // Mettre à jour un service
  static async updateService(serviceId: number, updates: any): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', serviceId)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour du service:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du service:', error);
      throw error;
    }
  }

  // Créer un nouveau produit
  static async createProduct(productData: any): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création du produit:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la création du produit:', error);
      throw error;
    }
  }

  // Mettre à jour un produit
  static async updateProduct(productId: number, updates: any): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', productId)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour du produit:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du produit:', error);
      throw error;
    }
  }
} 