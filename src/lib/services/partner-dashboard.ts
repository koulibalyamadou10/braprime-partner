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
  id: string;
  order_number: string;
  status: string;
  total: number;
  delivery_fee: number;
  grand_total: number;
  delivery_method: string;
  delivery_address: string;
  delivery_instructions: string;
  payment_method: string;
  payment_status: string;
  estimated_delivery: string | null;
  actual_delivery: string | null;
  customer_rating: number | null;
  customer_review: string | null;
  created_at: string;
  updated_at: string;
  preferred_delivery_time: string | null;
  delivery_type: string;
  available_for_drivers: boolean;
  scheduled_delivery_window_start: string | null;
  scheduled_delivery_window_end: string | null;
  landmark: string | null;
  service_fee: number;
  verification_code: string | null;
  // Informations client
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  // Informations chauffeur
  driver_name: string | null;
  driver_phone: string | null;
  driver_email: string | null;
  // Éléments de commande
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string | null;
    special_instructions: string | null;
    menu_item_id: number | null;
  }>;
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
  phone: string
  email?: string
  vehicle_type?: string
  vehicle_plate?: string
  is_active: boolean
  rating: number
  total_deliveries: number
  total_earnings: number
  current_location?: any
  last_active?: string
  created_at: string
  updated_at: string
}

export class PartnerDashboardService {
  // Récupérer le business du partenaire connecté (optimisé)
  static async getPartnerBusiness(): Promise<{ business: PartnerBusiness | null; error: string | null }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return { business: null, error: 'Utilisateur non authentifié' }
      }

      // Requête simplifiée sans jointure complexe
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
          updated_at
        `)
        .eq('owner_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erreur récupération business:', error)
        return { business: null, error: error.message }
      }

      if (!businesses || businesses.length === 0) {
        return { business: null, error: 'Aucun business trouvé pour ce partenaire' }
      }

      // Prendre le business le plus récent
      const business = businesses[0]

      // Récupérer le type de business séparément si nécessaire
      let businessTypeName = 'Autre'
      if (business.business_type_id) {
        try {
          const { data: businessType } = await supabase
            .from('business_types')
            .select('name')
            .eq('id', business.business_type_id)
            .single()
          
          if (businessType) {
            businessTypeName = businessType.name
          }
        } catch (typeError) {
          console.warn('Impossible de récupérer le type de business:', typeError)
        }
      }

      const partnerBusiness: PartnerBusiness = {
        id: business.id,
        name: business.name,
        description: business.description,
        business_type_id: business.business_type_id,
        business_type: businessTypeName,
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

  // Récupérer les statistiques du partenaire (optimisé avec requêtes agrégées)
  static async getPartnerStats(businessId: number): Promise<{ stats: PartnerStats | null; error: string | null }> {
    try {
      // Utiliser directement le fallback car la fonction RPC n'existe probablement pas
      return await this.getPartnerStatsFallback(businessId)
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error)
      return { stats: null, error: 'Erreur lors de la récupération des statistiques' }
    }
  }

  // Fallback pour les statistiques si la fonction RPC n'existe pas
  private static async getPartnerStatsFallback(businessId: number): Promise<{ stats: PartnerStats | null; error: string | null }> {
    try {
      // Récupérer toutes les commandes pour calculer les statistiques
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('business_id', businessId)

      if (ordersError) {
        console.error('Erreur récupération commandes:', ordersError)
        return { stats: null, error: ordersError.message }
      }

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

      return { stats, error: null }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques (fallback):', error)
      return { stats: null, error: 'Erreur lors de la récupération des statistiques' }
    }
  }

  // Récupérer les commandes récentes du partenaire (optimisé avec jointure)
  static async getPartnerOrders(
    businessId: number, 
    limit: number = 10, 
    offset: number = 0,
    status?: string
  ): Promise<{ orders: PartnerOrder[] | null; error: string | null; total: number }> {
    try {
      console.log('🔍 Récupération des commandes pour le business:', businessId);
      
      // Construire la requête avec filtres optionnels
      let query = supabase
        .from('orders')
        .select(`
          id,
          order_number,
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
          estimated_delivery,
          actual_delivery,
          customer_rating,
          customer_review,
          preferred_delivery_time,
          delivery_type,
          available_for_drivers,
          scheduled_delivery_window_start,
          scheduled_delivery_window_end,
          landmark,
          service_fee,
          verification_code,
          user_id,
          driver_id
        `)
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      // Ajouter le filtre de statut si spécifié
      if (status) {
        query = query.eq('status', status)
      }

      const { data: orders, error, count } = await query

      if (error) {
        console.error('❌ Erreur récupération commandes:', error)
        return { orders: null, error: error.message, total: 0 }
      }

      if (!orders || orders.length === 0) {
        console.log('ℹ️ Aucune commande trouvée pour ce business');
        return { orders: [], error: null, total: 0 };
      }

      console.log('📦 Commandes récupérées:', orders.length);

      // Récupérer les éléments de commande et informations client/chauffeur pour chaque commande
      const ordersWithDetails = await Promise.all(
        orders.map(async (order) => {
          try {
            // Récupérer les éléments de commande
            const { data: orderItems, error: itemsError } = await supabase
              .from('order_items')
              .select('*')
              .eq('order_id', order.id);

            if (itemsError) {
              console.error('❌ Erreur lors de la récupération des éléments de commande:', itemsError);
              return null;
            }

            // Récupérer les informations client
            let customerName = null;
            let customerPhone = null;
            let customerEmail = null;

            if (order.user_id) {
              const { data: userProfile, error: userError } = await supabase
                .from('user_profiles')
                .select('name, phone_number, email')
                .eq('id', order.user_id)
                .single();

              if (!userError && userProfile) {
                customerName = userProfile.name;
                customerPhone = userProfile.phone_number;
                customerEmail = userProfile.email;
              }
            }

            // Récupérer les informations chauffeur
            let driverName = null;
            let driverPhone = null;
            let driverEmail = null;

            if (order.driver_id) {
              const { data: driverProfile, error: driverError } = await supabase
                .from('driver_profiles')
                .select('name, phone_number, email')
                .eq('user_id', order.driver_id)
                .single();

              if (!driverError && driverProfile) {
                driverName = driverProfile.name;
                driverPhone = driverProfile.phone_number;
                driverEmail = driverProfile.email;
              }
            }

            // Construire l'objet PartnerOrder
            const partnerOrder: PartnerOrder = {
              id: order.id,
              order_number: order.order_number || '',
              status: order.status,
              total: order.total,
              delivery_fee: order.delivery_fee,
              grand_total: order.grand_total,
              delivery_method: order.delivery_method || 'delivery',
              delivery_address: order.delivery_address || '',
              delivery_instructions: order.delivery_instructions || '',
              payment_method: order.payment_method || 'cash',
              payment_status: order.payment_status || 'pending',
              estimated_delivery: order.estimated_delivery,
              actual_delivery: order.actual_delivery,
              customer_rating: order.customer_rating,
              customer_review: order.customer_review,
              created_at: order.created_at,
              updated_at: order.updated_at,
              preferred_delivery_time: order.preferred_delivery_time,
              delivery_type: order.delivery_type || 'asap',
              available_for_drivers: order.available_for_drivers || false,
              scheduled_delivery_window_start: order.scheduled_delivery_window_start,
              scheduled_delivery_window_end: order.scheduled_delivery_window_end,
              landmark: order.landmark,
              service_fee: order.service_fee || 0,
              verification_code: order.verification_code,
              customer_name: customerName,
              customer_phone: customerPhone,
              customer_email: customerEmail,
              driver_name: driverName,
              driver_phone: driverPhone,
              driver_email: driverEmail,
              items: orderItems || []
            };

            return partnerOrder;
          } catch (itemError) {
            console.error('❌ Erreur lors du traitement de la commande:', order.id, itemError);
            return null;
          }
        })
      );

      const validOrders = ordersWithDetails.filter(order => order !== null) as PartnerOrder[];
      console.log('✅ Commandes avec détails récupérées:', validOrders.length);

      return { 
        orders: validOrders, 
        error: null, 
        total: count || validOrders.length 
      }
    } catch (error) {
      console.error('❌ Erreur inattendue lors de la récupération des commandes:', error)
      return { orders: null, error: error instanceof Error ? error.message : 'Erreur inattendue', total: 0 }
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
      // Construire la requête avec jointure correcte
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
          menu_categories!inner(
            id,
            name,
            description
          )
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
        .from('drivers')
        .select(`
          id,
          name,
          phone,
          email,
          vehicle_type,
          vehicle_plate,
          is_active,
          rating,
          total_deliveries,
          total_earnings,
          current_location,
          last_active,
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
        phone: driver.phone,
        email: driver.email,
        vehicle_type: driver.vehicle_type,
        vehicle_plate: driver.vehicle_plate,
        is_active: driver.is_active,
        rating: driver.rating || 0,
        total_deliveries: driver.total_deliveries || 0,
        total_earnings: driver.total_earnings || 0,
        current_location: driver.current_location,
        last_active: driver.last_active,
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
        .from('drivers')
        .insert([{
          id: crypto.randomUUID(),
          ...driverData,
          is_active: true,
          rating: 0,
          total_deliveries: 0,
          total_earnings: 0
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
        phone: driver.phone,
        email: driver.email,
        vehicle_type: driver.vehicle_type,
        vehicle_plate: driver.vehicle_plate,
        is_active: driver.is_active,
        rating: driver.rating || 0,
        total_deliveries: driver.total_deliveries || 0,
        total_earnings: driver.total_earnings || 0,
        current_location: driver.current_location,
        last_active: driver.last_active,
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
        .from('drivers')
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
        phone: driver.phone,
        email: driver.email,
        vehicle_type: driver.vehicle_type,
        vehicle_plate: driver.vehicle_plate,
        is_active: driver.is_active,
        rating: driver.rating || 0,
        total_deliveries: driver.total_deliveries || 0,
        total_earnings: driver.total_earnings || 0,
        current_location: driver.current_location,
        last_active: driver.last_active,
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
        .from('drivers')
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