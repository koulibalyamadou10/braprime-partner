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
}

export interface PartnerOrder {
  id: string
  user_id: string
  customer_name: string
  customer_phone: string
  items: any[]
  status: string
  total: number
  delivery_fee: number
  grand_total: number
  delivery_address: string
  delivery_instructions?: string
  payment_method: string
  payment_status: string
  created_at: string
  updated_at: string
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
  is_featured: boolean
  preparation_time: number
  allergens: string[]
  nutritional_info: any
}

export class PartnerDashboardService {
  // Récupérer le business du partenaire connecté
  static async getPartnerBusiness(): Promise<{ business: PartnerBusiness | null; error: string | null }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return { business: null, error: 'Utilisateur non authentifié' }
      }

      const { data: business, error } = await supabase
        .from('businesses')
        .select(`
          *,
          business_types(name)
        `)
        .eq('owner_id', user.id)
        .single()

      if (error) {
        console.error('Erreur récupération business:', error)
        return { business: null, error: error.message }
      }

      if (!business) {
        return { business: null, error: 'Aucun business trouvé pour ce partenaire' }
      }

      const partnerBusiness: PartnerBusiness = {
        id: business.id,
        name: business.name,
        description: business.description,
        business_type_id: business.business_type_id,
        business_type: business.business_types?.name || 'Autre',
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

  // Récupérer les statistiques du partenaire
  static async getPartnerStats(businessId: number): Promise<{ stats: PartnerStats | null; error: string | null }> {
    try {
      // Récupérer les commandes du business
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('business_id', businessId)

      if (ordersError) {
        console.error('Erreur récupération commandes:', ordersError)
        return { stats: null, error: ordersError.message }
      }

      const totalOrders = orders?.length || 0
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.grand_total || 0), 0) || 0
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
      const completedOrders = orders?.filter(order => order.status === 'delivered').length || 0
      const pendingOrders = orders?.filter(order => order.status === 'pending').length || 0
      const cancelledOrders = orders?.filter(order => order.status === 'cancelled').length || 0

      // Récupérer les clients uniques
      const uniqueCustomers = new Set(orders?.map(order => order.user_id).filter(Boolean) || []).size

      // Récupérer les avis
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('business_id', businessId)

      if (reviewsError) {
        console.error('Erreur récupération avis:', reviewsError)
      }

      const rating = reviews && reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0

      const stats: PartnerStats = {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        completedOrders,
        pendingOrders,
        cancelledOrders,
        totalCustomers: uniqueCustomers,
        rating,
        reviewCount: reviews?.length || 0
      }

      return { stats, error: null }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error)
      return { stats: null, error: 'Erreur lors de la récupération des statistiques' }
    }
  }

  // Récupérer les commandes récentes du partenaire
  static async getPartnerOrders(businessId: number, limit: number = 10): Promise<{ orders: PartnerOrder[] | null; error: string | null }> {
    try {
      // D'abord, récupérer les commandes sans la jointure
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Erreur récupération commandes:', error)
        return { orders: null, error: error.message }
      }

      // Ensuite, récupérer les profils utilisateur séparément
      const userIds = orders?.map(order => order.user_id).filter(Boolean) || []
      let userProfiles: any[] = []

      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('user_profiles')
          .select('id, name, phone_number')
          .in('id', userIds)

        if (profilesError) {
          console.error('Erreur récupération profils:', profilesError)
        } else {
          userProfiles = profiles || []
        }
      }

      // Créer un map pour accéder rapidement aux profils
      const profilesMap = new Map(userProfiles.map(profile => [profile.id, profile]))

      const partnerOrders: PartnerOrder[] = (orders || []).map(order => {
        const profile = profilesMap.get(order.user_id)
        return {
          id: order.id,
          user_id: order.user_id,
          customer_name: profile?.name || 'Client',
          customer_phone: profile?.phone_number || '',
          items: order.items || [],
          status: order.status,
          total: order.total,
          delivery_fee: order.delivery_fee,
          grand_total: order.grand_total,
          delivery_address: order.delivery_address,
          delivery_instructions: order.delivery_instructions,
          payment_method: order.payment_method,
          payment_status: order.payment_status,
          created_at: order.created_at,
          updated_at: order.updated_at
        }
      })

      return { orders: partnerOrders, error: null }
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error)
      return { orders: null, error: 'Erreur lors de la récupération des commandes' }
    }
  }

  // Récupérer les articles de menu du partenaire
  static async getPartnerMenu(businessId: number): Promise<{ menu: PartnerMenuItem[] | null; error: string | null }> {
    try {
      const { data: menuItems, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          menu_categories(name)
        `)
        .eq('business_id', businessId)
        .order('category_id', { ascending: true })
        .order('name', { ascending: true })

      if (error) {
        console.error('Erreur récupération menu:', error)
        return { menu: null, error: error.message }
      }

      const partnerMenu: PartnerMenuItem[] = (menuItems || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        category_id: item.category_id,
        category_name: item.menu_categories?.name || 'Sans catégorie',
        is_available: item.is_available,
        is_featured: item.is_featured,
        preparation_time: item.preparation_time || 15,
        allergens: item.allergens || [],
        nutritional_info: item.nutritional_info || {}
      }))

      return { menu: partnerMenu, error: null }
    } catch (error) {
      console.error('Erreur lors de la récupération du menu:', error)
      return { menu: null, error: 'Erreur lors de la récupération du menu' }
    }
  }

  // Mettre à jour le statut d'une commande
  static async updateOrderStatus(orderId: string, status: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId)

      if (error) {
        console.error('Erreur mise à jour statut commande:', error)
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
      return { success: false, error: 'Erreur lors de la mise à jour du statut' }
    }
  }

  // Mettre à jour les informations du business
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

  // Changer le statut ouvert/fermé du business
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

  // Récupérer les notifications du partenaire
  static async getPartnerNotifications(businessId: number, limit: number = 10): Promise<{ notifications: any[] | null; error: string | null }> {
    try {
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Erreur récupération notifications:', error)
        return { notifications: null, error: error.message }
      }

      return { notifications: notifications || [], error: null }
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error)
      return { notifications: null, error: 'Erreur lors de la récupération des notifications' }
    }
  }

  // Diagnostic pour vérifier l'authentification et les données
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

      // Vérifier le profil utilisateur
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // Vérifier le business
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .single()

      // Vérifier les commandes
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('business_id', business?.id || 0)
        .limit(5)

      const diagnosticData = {
        user: {
          id: user.id,
          email: user.email,
          email_confirmed: user.email_confirmed_at ? true : false
        },
        profile: profile || null,
        business: business || null,
        orders: orders || [],
        errors: {
          profile: profileError?.message,
          business: businessError?.message,
          orders: ordersError?.message
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

  // Récupérer les livreurs d'un business
  static async getPartnerDrivers(businessId: number): Promise<{ drivers: any[] | null; error: string | null }> {
    try {
      const { data: drivers, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erreur récupération livreurs:', error)
        return { drivers: null, error: error.message }
      }

      return { drivers: drivers || [], error: null }
    } catch (error) {
      console.error('Erreur lors de la récupération des livreurs:', error)
      return { drivers: null, error: 'Erreur lors de la récupération des livreurs' }
    }
  }

  // Ajouter un livreur
  static async addDriver(driverData: {
    name: string
    phone: string
    email?: string
    business_id: number
    vehicle_type?: string
    vehicle_plate?: string
  }): Promise<{ driver: any | null; error: string | null }> {
    try {
      const { data: driver, error } = await supabase
        .from('drivers')
        .insert([{
          id: crypto.randomUUID(),
          ...driverData,
          is_active: true,
          rating: 0,
          total_deliveries: 0
        }])
        .select()
        .single()

      if (error) {
        console.error('Erreur ajout livreur:', error)
        return { driver: null, error: error.message }
      }

      return { driver, error: null }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du livreur:', error)
      return { driver: null, error: 'Erreur lors de l\'ajout du livreur' }
    }
  }

  // Mettre à jour un livreur
  static async updateDriver(driverId: string, updates: {
    name?: string
    phone?: string
    email?: string
    vehicle_type?: string
    vehicle_plate?: string
    is_active?: boolean
  }): Promise<{ driver: any | null; error: string | null }> {
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

      return { driver, error: null }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du livreur:', error)
      return { driver: null, error: 'Erreur lors de la mise à jour du livreur' }
    }
  }

  // Supprimer un livreur
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
} 