import { supabase } from '@/lib/supabase'

export interface PartnerBusiness {
  id: number
  name: string
  description: string
  business_type_id: number
  business_type: string
  address: string
  phone: string
  email: string
  opening_hours: string
  cuisine_type?: string
  rating: number
  review_count: number
  delivery_time: string
  delivery_fee: number
  is_active: boolean
  is_open: boolean
  owner_id: string
  created_at: string
  updated_at: string
}

export interface PartnerStats {
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

export interface PartnerOrder {
  id: string
  order_number?: string // Numéro de commande lisible
  user_id: string
  customer_name: string
  customer_phone: string
  items: any[] // Tableau vide car les items sont dans order_items
  status: string
  total: number
  delivery_fee: number
  grand_total: number
  delivery_address: string
  delivery_instructions?: string
  landmark?: string // Point de repère
  payment_method: string
  payment_status: string
  created_at: string
  updated_at: string
  estimated_delivery?: string
  driver_name?: string
  driver_phone?: string
  // Nouveaux champs pour la gestion des livraisons ASAP/Scheduled
  delivery_type: 'asap' | 'scheduled'
  preferred_delivery_time?: string
  scheduled_delivery_window_start?: string
  scheduled_delivery_window_end?: string
  available_for_drivers: boolean
  estimated_delivery_time?: string
  actual_delivery_time?: string
  // Champs pour les informations du livreur
  driver_id?: string
  driver_vehicle_type?: string
  driver_vehicle_plate?: string
  // Champs pour les frais et la vérification
  service_fee?: number
  verification_code?: string
  assigned_at?: string
  // Champs pour la zone de livraison
  zone?: string
  commune?: string
  quartier?: string
  // Champs pour les commandes groupées
  is_grouped_delivery?: boolean
  delivery_group_id?: string
}

export interface PartnerMenuItem {
  id: number
  name: string
  description: string
  price: number
  image: string
  category_id: number
  category_name: string
  is_available: boolean
  is_popular: boolean
  preparation_time: number
  allergens: string[]
  nutritional_info: any
  sort_order: number
}

export interface PartnerDriver {
  id: string
  name: string
  phone_number: string
  email?: string
  vehicle_type?: string
  vehicle_plate?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface WeeklyData {
  day: string
  orders: number
  revenue: number
  date: string
}

export class PartnerDashboardService {
  // Récupérer le business du partenaire connecté (ULTRA-OPTIMISÉ - 1 seule requête)
  static async getPartnerBusiness(): Promise<{ business: PartnerBusiness | null; error: string | null }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return { business: null, error: 'Utilisateur non authentifié' }
      }

      console.log('🚀 [getPartnerBusiness] Chargement optimisé pour user:', user.id)

      // OPTIMISATION MAJEURE: 1 seule requête au lieu de 3+
      // On récupère le business directement avec le business_type en jointure
      const { data: businesses, error } = await supabase
        .from('businesses')
        .select(`
          id,
          name,
          description,
          business_type_id,
          address,
          phone,
          email,
          opening_hours,
          cuisine_type,
          rating,
          review_count,
          delivery_time,
          delivery_fee,
          is_active,
          is_open,
          owner_id,
          created_at,
          updated_at,
          business_types(name)
        `)
        .eq('owner_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) {
        console.error('Erreur récupération business:', error)
        return { business: null, error: error.message }
      }

      if (!businesses || businesses.length === 0) {
        return { business: null, error: 'Aucun business trouvé pour ce partenaire' }
      }

      // Prendre le business le plus récent
      const business = businesses[0]

      const partnerBusiness: PartnerBusiness = {
        id: business.id,
        name: business.name,
        description: business.description,
        business_type_id: business.business_type_id,
        business_type: business.business_types?.[0]?.name || 'Autre',
        address: business.address,
        phone: business.phone,
        email: business.email,
        opening_hours: business.opening_hours,
        cuisine_type: business.cuisine_type,
        rating: business.rating || 0,
        review_count: business.review_count || 0,
        delivery_time: business.delivery_time,
        delivery_fee: business.delivery_fee,
        is_active: business.is_active,
        is_open: business.is_open,
        owner_id: business.owner_id,
        created_at: business.created_at,
        updated_at: business.updated_at
      }

      return { business: partnerBusiness, error: null }
    } catch (error) {
      console.error('Erreur lors de la récupération du business:', error)
      return { business: null, error: 'Erreur lors de la récupération du business' }
    }
  }

  // Récupérer les statistiques du partenaire (utilise la fonction RPC optimisée)
  static async getPartnerStats(businessId: number): Promise<{ stats: PartnerStats | null; error: string | null }> {
    try {
      console.log('🔍 [getPartnerStats] Utilisation de la fonction RPC pour businessId:', businessId)
      
      // Appeler la fonction RPC PostgreSQL optimisée
      const { data, error } = await supabase.rpc('get_partner_stats', {
        p_business_id: businessId
      })

      if (error) {
        console.error('❌ [getPartnerStats] Erreur RPC:', error)
        // Fallback si la fonction RPC n'existe pas encore
        console.log('⚠️ [getPartnerStats] Utilisation du fallback')
        return await this.getPartnerStatsFallback(businessId)
      }

      console.log('✅ [getPartnerStats] Statistiques récupérées via RPC')
      return { stats: data as PartnerStats, error: null }
    } catch (error) {
      console.error('❌ [getPartnerStats] Erreur:', error)
      // Fallback en cas d'erreur
      return await this.getPartnerStatsFallback(businessId)
    }
  }

  // Récupérer les données hebdomadaires pour le graphique (utilise la fonction RPC optimisée)
  static async getWeeklyData(businessId: number): Promise<{ data: WeeklyData[] | null; error: string | null }> {
    try {
      console.log('🔍 [getWeeklyData] Utilisation de la fonction RPC pour businessId:', businessId)
      
      // Appeler la fonction RPC PostgreSQL optimisée
      const { data, error } = await supabase.rpc('get_weekly_data', {
        p_business_id: businessId
      })

      if (error) {
        console.error('❌ [getWeeklyData] Erreur RPC:', error)
        // Fallback si la fonction RPC n'existe pas encore
        console.log('⚠️ [getWeeklyData] Utilisation du fallback')
        return await this.getWeeklyDataFallback(businessId)
      }

      console.log('✅ [getWeeklyData] Données hebdomadaires récupérées via RPC')
      return { data: data as WeeklyData[], error: null }
    } catch (error) {
      console.error('❌ [getWeeklyData] Erreur:', error)
      // Fallback en cas d'erreur
      return await this.getWeeklyDataFallback(businessId)
    }
  }

  // Fallback pour getWeeklyData (ancienne méthode)
  private static async getWeeklyDataFallback(businessId: number): Promise<{ data: WeeklyData[] | null; error: string | null }> {
    try {
      // Calculer le début de la semaine (lundi)
      const now = new Date()
      const dayOfWeek = now.getDay()
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToMonday)
      weekStart.setHours(0, 0, 0, 0)

      // Créer un tableau pour les 7 jours de la semaine
      const weekDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
      const weeklyData: WeeklyData[] = []

      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000)
        const nextDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)

        // Récupérer les commandes pour ce jour
        const { data: orders, error } = await supabase
          .from('orders')
          .select('grand_total, status')
          .eq('business_id', businessId)
          .gte('created_at', currentDate.toISOString())
          .lt('created_at', nextDate.toISOString())
          .in('status', ['delivered', 'completed', 'out_for_delivery'])

        if (error) {
          console.error(`Erreur récupération commandes pour ${weekDays[i]}:`, error)
          continue
        }

        const dayOrders = orders?.length || 0
        const dayRevenue = orders?.reduce((sum, order) => sum + (order.grand_total || 0), 0) || 0

        weeklyData.push({
          day: weekDays[i],
          orders: dayOrders,
          revenue: dayRevenue,
          date: currentDate.toISOString().split('T')[0]
        })
      }

      return { data: weeklyData, error: null }
    } catch (error) {
      console.error('Erreur lors de la récupération des données hebdomadaires:', error)
      return { data: null, error: 'Erreur lors de la récupération des données hebdomadaires' }
    }
  }

  // Fallback pour les statistiques si la fonction RPC n'existe pas
  private static async getPartnerStatsFallback(businessId: number): Promise<{ stats: PartnerStats | null; error: string | null }> {
    try {
      console.log('🔍 [getPartnerStatsFallback] Début pour businessId:', businessId)
      
      // Récupérer toutes les commandes pour calculer les statistiques
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('business_id', businessId)

      if (ordersError) {
        console.error('❌ [getPartnerStatsFallback] Erreur récupération commandes:', ordersError)
        return { stats: null, error: ordersError.message }
      }

      console.log('✅ [getPartnerStatsFallback] Commandes récupérées:', orders?.length || 0)

      // Calculer les statistiques globales
      const totalOrders = orders?.length || 0
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.grand_total || 0), 0) || 0
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
      const completedOrders = orders?.filter(order => order.status === 'delivered').length || 0
      const pendingOrders = orders?.filter(order => order.status === 'pending').length || 0
      const cancelledOrders = orders?.filter(order => order.status === 'cancelled').length || 0

      // Clients uniques
      const uniqueCustomers = new Set(orders?.map(order => order.user_id).filter(Boolean) || []).size

      // Avis
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('business_id', businessId)

      if (reviewsError) {
        console.error('Erreur récupération avis:', reviewsError)
      }

      const rating = reviewsData && reviewsData.length > 0 
        ? reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length 
        : 0

      // Statistiques par période
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

      // Calculer les statistiques par période
      const todayOrders = orders?.filter(order => new Date(order.created_at) >= today).length || 0
      const todayRevenue = orders?.filter(order => new Date(order.created_at) >= today)
        .reduce((sum, order) => sum + (order.grand_total || 0), 0) || 0

      const weekOrders = orders?.filter(order => new Date(order.created_at) >= weekAgo).length || 0
      const weekRevenue = orders?.filter(order => new Date(order.created_at) >= weekAgo)
        .reduce((sum, order) => sum + (order.grand_total || 0), 0) || 0

      const monthOrders = orders?.filter(order => new Date(order.created_at) >= monthAgo).length || 0
      const monthRevenue = orders?.filter(order => new Date(order.created_at) >= monthAgo)
        .reduce((sum, order) => sum + (order.grand_total || 0), 0) || 0

      // Construire les statistiques
      const stats: PartnerStats = {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        completedOrders,
        pendingOrders,
        cancelledOrders,
        totalCustomers: uniqueCustomers,
        rating,
        reviewCount: reviewsData?.length || 0,
        todayOrders,
        todayRevenue,
        weekOrders,
        weekRevenue,
        monthOrders,
        monthRevenue
      }

      console.log('✅ [getPartnerStatsFallback] Statistiques calculées:', {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        completedOrders,
        pendingOrders,
        cancelledOrders,
        totalCustomers: uniqueCustomers,
        rating,
        reviewCount: reviewsData?.length || 0,
        todayOrders,
        todayRevenue,
        weekOrders,
        weekRevenue,
        monthOrders,
        monthRevenue
      })

      return { stats, error: null }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques (fallback):', error)
      return { stats: null, error: 'Erreur lors de la récupération des statistiques' }
    }
  }

  // Récupérer les commandes récentes du partenaire (ULTRA-OPTIMISÉ avec jointures natives)
  static async getPartnerOrders(
    businessId: number, 
    limit: number = 10, 
    offset: number = 0,
    status?: string
  ): Promise<{ orders: PartnerOrder[] | null; error: string | null; total: number }> {
    try {
      console.log('🚀 [getPartnerOrders] Chargement optimisé avec jointures natives')

      // OPTIMISATION MAJEURE: Utiliser les jointures natives de Supabase
      // 1 seule requête au lieu de 4 (orders, profiles, drivers, items)
      let query = supabase
        .from('orders')
        .select(`
          id,
          order_number,
          user_id,
          status,
          total,
          delivery_fee,
          grand_total,
          delivery_method,
          delivery_address,
          delivery_instructions,
          payment_method,
          payment_status,
          created_at,
          updated_at,
          delivery_type,
          preferred_delivery_time,
          scheduled_delivery_window_start,
          scheduled_delivery_window_end,
          landmark,
          service_fee,
          verification_code,
          assigned_at,
          available_for_drivers,
          estimated_delivery,
          actual_delivery,
          driver_id,
          customer_rating,
          customer_review,
          user_profiles!orders_user_id_fkey(name, phone_number),
          driver_profiles!orders_driver_id_fkey(name, phone_number, vehicle_type, vehicle_plate),
          order_items(order_id, name, price, quantity, image, special_instructions)
        `, { count: 'exact' })
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      // Ajouter le filtre de statut si spécifié
      if (status) {
        query = query.eq('status', status)
      }

      const { data: orders, error, count } = await query

      if (error) {
        console.error('❌ [getPartnerOrders] Erreur:', error)
        return { orders: null, error: error.message, total: 0 }
      }

      console.log('✅ [getPartnerOrders] Commandes chargées:', orders?.length || 0)

      // Mapper les résultats sans requêtes supplémentaires
      const partnerOrders: PartnerOrder[] = (orders || []).map((order: any) => ({
        id: order.id,
        order_number: order.order_number,
        user_id: order.user_id,
        customer_name: order.user_profiles?.name || 'Client',
        customer_phone: order.user_profiles?.phone_number || '',
        items: order.order_items || [],
        status: order.status,
        total: order.total,
        delivery_fee: order.delivery_fee,
        grand_total: order.grand_total,
        delivery_address: order.delivery_address,
        delivery_instructions: order.delivery_instructions,
        landmark: order.landmark,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        created_at: order.created_at,
        updated_at: order.updated_at,
        estimated_delivery: order.estimated_delivery,
        driver_name: order.driver_profiles?.name || '',
        driver_phone: order.driver_profiles?.phone_number || '',
        delivery_type: order.delivery_type || 'asap',
        preferred_delivery_time: order.preferred_delivery_time,
        scheduled_delivery_window_start: order.scheduled_delivery_window_start,
        scheduled_delivery_window_end: order.scheduled_delivery_window_end,
        available_for_drivers: order.available_for_drivers || false,
        estimated_delivery_time: order.estimated_delivery,
        actual_delivery_time: order.actual_delivery,
        driver_id: order.driver_id,
        driver_vehicle_type: order.driver_profiles?.vehicle_type,
        driver_vehicle_plate: order.driver_profiles?.vehicle_plate,
        service_fee: order.service_fee,
        verification_code: order.verification_code,
        assigned_at: order.assigned_at
      }))

      return { 
        orders: partnerOrders, 
        error: null, 
        total: count || partnerOrders.length 
      }
    } catch (error) {
      console.error('❌ [getPartnerOrders] Exception:', error)
      return { orders: null, error: 'Erreur lors de la récupération des commandes', total: 0 }
    }
  }

  // Récupérer les articles de menu du partenaire (optimisé avec pagination)
  static async getPartnerMenu(
    businessId: number,
    limit: number = 50,
    offset: number = 0,
    categoryId?: number
  ): Promise<{ menu: PartnerMenuItem[] | null; error: string | null; total: number }> {
    try {
      // Construire la requête avec filtres optionnels
      let query = supabase
        .from('menu_items')
        .select(`
          id,
          name,
          description,
          price,
          image,
          category_id,
          is_available,
          is_popular,
          preparation_time,
          allergens,
          nutritional_info,
          sort_order,
          menu_categories!inner(name)
        `)
        .eq('business_id', businessId)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })
        .range(offset, offset + limit - 1)

      // Ajouter le filtre de catégorie si spécifié
      if (categoryId) {
        query = query.eq('category_id', categoryId)
      }

      const { data: menuItems, error, count } = await query

      if (error) {
        console.error('Erreur récupération menu:', error)
        return { menu: null, error: error.message, total: 0 }
      }

      const partnerMenu: PartnerMenuItem[] = (menuItems || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        category_id: item.category_id,
        category_name: item.menu_categories?.[0]?.name || 'Sans catégorie',
        is_available: item.is_available,
        is_popular: item.is_popular,
        preparation_time: item.preparation_time || 15,
        allergens: item.allergens || [],
        nutritional_info: item.nutritional_info || {},
        sort_order: item.sort_order || 0
      }))

      return { 
        menu: partnerMenu, 
        error: null, 
        total: count || partnerMenu.length 
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du menu:', error)
      return { menu: null, error: 'Erreur lors de la récupération du menu', total: 0 }
    }
  }

  // Mettre à jour le statut d'une commande (optimisé avec gestion des types de livraison)
  static async updateOrderStatus(orderId: string, status: string, businessId?: number): Promise<{ success: boolean; error: string | null }> {
    try {
      // Mise à jour basique du statut
      const { error } = await supabase
        .from('orders')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId)

      if (error) {
        console.error('Erreur mise à jour statut commande:', error)
        return { success: false, error: error.message }
      }

      // Si on a le businessId, gérer la logique spécifique aux types de livraison
      if (businessId && (status === 'ready' || status === 'out_for_delivery')) {
        const { DeliveryManagementService } = await import('./delivery-management')
        const result = await DeliveryManagementService.handleOrderStatusChange(orderId, status, businessId)
        
        if (!result.success) {
          console.warn('Erreur gestion livraison:', result.error)
          // Ne pas faire échouer la mise à jour du statut pour cette erreur
        }
      }

      return { success: true, error: null }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
      return { success: false, error: 'Erreur lors de la mise à jour du statut' }
    }
  }

  // Mettre à jour les informations du business (optimisé)
  static async updateBusinessInfo(businessId: number, updates: Partial<PartnerBusiness>): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', businessId)

      if (error) {
        console.error('Erreur mise à jour business:', error)
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du business:', error)
      return { success: false, error: 'Erreur lors de la mise à jour du business' }
    }
  }

  // Changer le statut ouvert/fermé du business (optimisé)
  static async toggleBusinessStatus(businessId: number, isOpen: boolean): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ 
          is_open: isOpen,
          updated_at: new Date().toISOString()
        })
        .eq('id', businessId)

      if (error) {
        console.error('Erreur changement statut business:', error)
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error)
      return { success: false, error: 'Erreur lors du changement de statut' }
    }
  }

  // Récupérer les notifications du partenaire (optimisé avec pagination)
  static async getPartnerNotifications(
    businessOwnerId: string, 
    limit: number = 10,
    offset: number = 0
  ): Promise<{ notifications: any[] | null; error: string | null; total: number }> {
    try {
      const { data: notifications, error, count } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', businessOwnerId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('Erreur récupération notifications:', error)
        return { notifications: null, error: error.message, total: 0 }
      }

      return { 
        notifications: notifications || [], 
        error: null, 
        total: count || (notifications?.length || 0)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error)
      return { notifications: null, error: 'Erreur lors de la récupération des notifications', total: 0 }
    }
  }

  // Récupérer les livreurs d'un business (optimisé avec pagination)
  static async getPartnerDrivers(
    businessId: number,
    limit: number = 20,
    offset: number = 0,
    isActive?: boolean
  ): Promise<{ drivers: PartnerDriver[] | null; error: string | null; total: number }> {
    try {
      let query = supabase
        .from('driver_profiles')
        .select(`
          id,
          name,
          phone_number,
          email,
          vehicle_type,
          vehicle_plate,
          is_active,
          created_at,
          updated_at
        `)
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      // Ajouter le filtre de statut si spécifié
      if (isActive !== undefined) {
        query = query.eq('is_active', isActive)
      }

      const { data: drivers, error, count } = await query

      if (error) {
        console.error('Erreur récupération livreurs:', error)
        return { drivers: null, error: error.message, total: 0 }
      }

      const partnerDrivers: PartnerDriver[] = (drivers || []).map(driver => ({
        id: driver.id,
        name: driver.name,
        phone_number: driver.phone_number,
        email: driver.email,
        vehicle_type: driver.vehicle_type,
        vehicle_plate: driver.vehicle_plate,
        is_active: driver.is_active,
        created_at: driver.created_at,
        updated_at: driver.updated_at
      }))

      return { 
        drivers: partnerDrivers, 
        error: null, 
        total: count || partnerDrivers.length 
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des livreurs:', error)
      return { drivers: null, error: 'Erreur lors de la récupération des livreurs', total: 0 }
    }
  }

  // Ajouter un livreur (optimisé)
  static async addDriver(driverData: {
    name: string
    phone: string
    email?: string
    business_id: number
    vehicle_type?: string
    vehicle_plate?: string
  }): Promise<{ driver: PartnerDriver | null; error: string | null }> {
    try {
      const { data: driver, error } = await supabase
        .from('driver_profiles')
        .insert([{
          id: crypto.randomUUID(),
          ...driverData,
          is_active: true,
        }])
        .select()
        .single()

      if (error) {
        console.error('Erreur ajout livreur:', error)
        return { driver: null, error: error.message }
      }

      const partnerDriver: PartnerDriver = {
        id: driver.id,
        name: driver.name,
        phone_number: driver.phone,
        email: driver.email,
        vehicle_type: driver.vehicle_type,
        vehicle_plate: driver.vehicle_plate,
        is_active: driver.is_active,
        created_at: driver.created_at,
        updated_at: driver.updated_at
      }

      return { driver: partnerDriver, error: null }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du livreur:', error)
      return { driver: null, error: 'Erreur lors de l\'ajout du livreur' }
    }
  }

  // Mettre à jour un livreur (optimisé)
  static async updateDriver(driverId: string, updates: {
    name?: string
    phone?: string
    email?: string
    vehicle_type?: string
    vehicle_plate?: string
    is_active?: boolean
  }): Promise<{ driver: PartnerDriver | null; error: string | null }> {
    try {
      const { data: driver, error } = await supabase
        .from('driver_profiles')
        .update(updates)
        .eq('id', driverId)
        .select()
        .single()

      if (error) {
        console.error('Erreur mise à jour livreur:', error)
        return { driver: null, error: error.message }
      }

      const partnerDriver: PartnerDriver = {
        id: driver.id,
        name: driver.name,
        phone_number: driver.phone_number,
        email: driver.email,
        vehicle_type: driver.vehicle_type,
        vehicle_plate: driver.vehicle_plate,
        is_active: driver.is_active,
        created_at: driver.created_at,
        updated_at: driver.updated_at
      }

      return { driver: partnerDriver, error: null }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du livreur:', error)
      return { driver: null, error: 'Erreur lors de la mise à jour du livreur' }
    }
  }

  // Supprimer un livreur (optimisé)
  static async deleteDriver(driverId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('driver_profiles')
        .delete()
        .eq('id', driverId)

      if (error) {
        console.error('Erreur suppression livreur:', error)
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (error) {
      console.error('Erreur lors de la suppression du livreur:', error)
      return { success: false, error: 'Erreur lors de la suppression du livreur' }
    }
  }

  // Diagnostic pour vérifier l'authentification et les données (optimisé)
  static async diagnoseAuthAndData(): Promise<{ success: boolean; data: any; error: string | null }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return { 
          success: false, 
          data: null, 
          error: 'Utilisateur non authentifié' 
        }
      }

      // Requêtes parallèles pour optimiser les performances
      const [profileResult, businessResult, ordersResult] = await Promise.allSettled([
        supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single(),
        supabase
          .from('businesses')
          .select('*')
          .eq('owner_id', user.id)
          .single(),
        supabase
          .from('orders')
          .select('count')
          .eq('business_id', 0) // Placeholder, sera mis à jour si business trouvé
          .limit(5)
      ])

      const diagnosticData = {
        user: {
          id: user.id,
          email: user.email,
          email_confirmed: user.email_confirmed_at ? true : false
        },
        profile: profileResult.status === 'fulfilled' ? profileResult.value.data : null,
        business: businessResult.status === 'fulfilled' ? businessResult.value.data : null,
        orders: ordersResult.status === 'fulfilled' ? ordersResult.value.data : [],
        errors: {
          profile: profileResult.status === 'rejected' ? 'Erreur profil' : profileResult.value?.error?.message,
          business: businessResult.status === 'rejected' ? 'Erreur business' : businessResult.value?.error?.message,
          orders: ordersResult.status === 'rejected' ? 'Erreur commandes' : ordersResult.value?.error?.message
        }
      }

      return { 
        success: true, 
        data: diagnosticData, 
        error: null 
      }
    } catch (error) {
      console.error('Erreur lors du diagnostic:', error)
      return { 
        success: false, 
        data: null, 
        error: 'Erreur lors du diagnostic' 
      }
    }
  }
} 