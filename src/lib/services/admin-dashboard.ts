import { supabase } from '@/lib/supabase';

// Types pour les données du dashboard admin
export interface AdminStats {
  totalUsers: number;
  totalBusinesses: number;
  totalOrders: number;
  totalDrivers: number;
  totalRevenue: number;
  pendingOrders: number;
  activeDrivers: number;
  activeBusinesses: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone_number?: string;
  address?: string;
  profile_image?: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
  total_orders?: number;
  total_spent?: number;
}

export interface AdminBusiness {
  id: number;
  name: string;
  description?: string;
  business_type: string;
  category: string;
  address: string;
  phone?: string;
  email?: string;
  rating: number;
  review_count: number;
  is_active: boolean;
  is_open: boolean;
  owner_name?: string;
  owner_email?: string;
  created_at: string;
  total_orders: number;
  total_revenue: number;
}

export interface AdminOrder {
  id: string;
  order_number?: string;
  user_name: string;
  user_email: string;
  business_name: string;
  items: any[];
  status: string;
  total: number;
  delivery_fee: number;
  grand_total: number;
  payment_method: string;
  payment_status: string;
  delivery_address?: string;
  driver_name?: string;
  driver_phone?: string;
  created_at: string;
  estimated_delivery?: string;
  actual_delivery?: string;
}

export interface AdminDriver {
  id: string;
  name: string;
  phone: string;
  email?: string;
  business_name?: string;
  is_active: boolean;
  is_verified: boolean;
  rating: number;
  total_deliveries: number;
  total_earnings: number;
  vehicle_type?: string;
  vehicle_plate?: string;
  created_at: string;
  documents_count: number;
  active_sessions: number;
}

export interface AdminAnalytics {
  revenueByMonth: { month: string; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
  topBusinesses: { name: string; revenue: number; orders: number }[];
  topDrivers: { name: string; deliveries: number; earnings: number }[];
  userGrowth: { month: string; users: number }[];
  orderGrowth: { month: string; orders: number }[];
}

export interface AvailableBusiness {
  id: number;
  name: string;
  business_type: string;
  category: string;
  is_active: boolean;
}

export class AdminDashboardService {
  // Récupérer les statistiques générales
  static async getStats(): Promise<{ data: AdminStats | null; error: string | null }> {
    try {
      // Compter les utilisateurs par rôle
      const { data: userStats, error: userError } = await supabase
        .from('user_profiles')
        .select('role_id, user_roles(name)')
        .eq('is_active', true);

      if (userError) throw userError;

      // Compter les commerces
      const { count: businessCount, error: businessError } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (businessError) throw businessError;

      // Compter les commandes
      const { count: orderCount, error: orderError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      if (orderError) throw orderError;

      // Compter les livreurs
      const { count: driverCount, error: driverError } = await supabase
        .from('drivers')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (driverError) throw driverError;

      // Calculer le revenu total
      const { data: revenueData, error: revenueError } = await supabase
        .from('orders')
        .select('grand_total')
        .eq('payment_status', 'completed');

      if (revenueError) throw revenueError;

      const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.grand_total || 0), 0) || 0;

      // Compter les commandes en attente
      const { count: pendingOrders, error: pendingError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'confirmed', 'preparing']);

      if (pendingError) throw pendingError;

      // Compter les livreurs actifs (avec une session active)
      const { count: activeDrivers, error: activeDriversError } = await supabase
        .from('work_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (activeDriversError) throw activeDriversError;

      // Compter les commerces ouverts
      const { count: activeBusinesses, error: activeBusinessesError } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('is_open', true);

      if (activeBusinessesError) throw activeBusinessesError;

      // Calculer les statistiques par rôle
      const roleCounts = userStats?.reduce((acc, user) => {
        const roleName = user.user_roles?.name || 'customer';
        acc[roleName] = (acc[roleName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const stats: AdminStats = {
        totalUsers: userStats?.length || 0,
        totalBusinesses: businessCount || 0,
        totalOrders: orderCount || 0,
        totalDrivers: driverCount || 0,
        totalRevenue,
        pendingOrders: pendingOrders || 0,
        activeDrivers: activeDrivers || 0,
        activeBusinesses: activeBusinesses || 0,
      };

      return { data: stats, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return { data: null, error: 'Erreur lors de la récupération des statistiques' };
    }
  }

  // Récupérer la liste des utilisateurs
  static async getUsers(page = 1, limit = 10, search = ''): Promise<{ data: AdminUser[] | null; error: string | null; total: number }> {
    try {
      let query = supabase
        .from('user_profiles')
        .select(`
          id,
          name,
          email,
          phone_number,
          address,
          profile_image,
          is_active,
          created_at,
          role_id,
          user_roles(name)
        `, { count: 'exact' });

      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const { data: users, error, count } = await query
        .range((page - 1) * limit, page * limit - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Récupérer les statistiques des commandes pour chaque utilisateur
      const usersWithStats = await Promise.all(
        users?.map(async (user) => {
          const { count: orderCount } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

          const { data: orderTotals } = await supabase
            .from('orders')
            .select('grand_total')
            .eq('user_id', user.id)
            .eq('payment_status', 'completed');

          const totalSpent = orderTotals?.reduce((sum, order) => sum + (order.grand_total || 0), 0) || 0;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.user_roles?.name || 'customer',
            phone_number: user.phone_number,
            address: user.address,
            profile_image: user.profile_image,
            is_active: user.is_active,
            created_at: user.created_at,
            total_orders: orderCount || 0,
            total_spent: totalSpent,
          };
        }) || []
      );

      return { data: usersWithStats, error: null, total: count || 0 };
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      return { data: null, error: 'Erreur lors de la récupération des utilisateurs', total: 0 };
    }
  }

  // Récupérer la liste des commerces
  static async getBusinesses(page = 1, limit = 10, search = ''): Promise<{ data: AdminBusiness[] | null; error: string | null; total: number }> {
    try {
      let query = supabase
        .from('businesses')
        .select(`
          id,
          name,
          description,
          address,
          phone,
          email,
          rating,
          review_count,
          is_active,
          is_open,
          created_at,
          business_type_id,
          category_id,
          owner_id,
          business_types(name),
          categories(name)
        `, { count: 'exact' });

      if (search) {
        query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%`);
      }

      const { data: businesses, error, count } = await query
        .range((page - 1) * limit, page * limit - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Récupérer les statistiques des commandes pour chaque commerce
      const businessesWithStats = await Promise.all(
        businesses?.map(async (business) => {
          const { count: orderCount } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('business_id', business.id);

          const { data: orderTotals } = await supabase
            .from('orders')
            .select('grand_total')
            .eq('business_id', business.id)
            .eq('payment_status', 'completed');

          const totalRevenue = orderTotals?.reduce((sum, order) => sum + (order.grand_total || 0), 0) || 0;

          // Récupérer les informations du propriétaire
          let owner_name = '';
          let owner_email = '';
          if (business.owner_id) {
            const { data: owner } = await supabase
              .from('user_profiles')
              .select('name, email')
              .eq('id', business.owner_id)
              .single();

            if (owner) {
              owner_name = owner.name;
              owner_email = owner.email;
            }
          }

          return {
            id: business.id,
            name: business.name,
            description: business.description,
            business_type: business.business_types?.name || 'Non défini',
            category: business.categories?.name || 'Non défini',
            address: business.address,
            phone: business.phone,
            email: business.email,
            rating: business.rating || 0,
            review_count: business.review_count || 0,
            is_active: business.is_active,
            is_open: business.is_open,
            owner_name,
            owner_email,
            created_at: business.created_at,
            total_orders: orderCount || 0,
            total_revenue: totalRevenue,
          };
        }) || []
      );

      return { data: businessesWithStats, error: null, total: count || 0 };
    } catch (error) {
      console.error('Erreur lors de la récupération des commerces:', error);
      return { data: null, error: 'Erreur lors de la récupération des commerces', total: 0 };
    }
  }

  // Récupérer la liste des commandes
  static async getOrders(page = 1, limit = 10, status = ''): Promise<{ data: AdminOrder[] | null; error: string | null; total: number }> {
    try {
      let query = supabase
        .from('orders')
        .select(`
          id,
          business_name,
          items,
          status,
          total,
          delivery_fee,
          grand_total,
          payment_method,
          payment_status,
          delivery_address,
          driver_name,
          driver_phone,
          created_at,
          estimated_delivery,
          actual_delivery,
          user_id
        `, { count: 'exact' });

      if (status) {
        query = query.eq('status', status);
      }

      const { data: orders, error, count } = await query
        .range((page - 1) * limit, page * limit - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Récupérer les informations utilisateur pour chaque commande
      const formattedOrders: AdminOrder[] = await Promise.all(
        (orders || []).map(async (order) => {
          let user_name = 'Utilisateur inconnu';
          let user_email = 'Email inconnu';

          if (order.user_id) {
            const { data: user } = await supabase
        .from('user_profiles')
              .select('name, email')
              .eq('id', order.user_id)
              .single();
            
            if (user) {
              user_name = user.name;
              user_email = user.email;
            }
          }

      return {
            id: order.id,
            user_name,
            user_email,
            business_name: order.business_name,
            items: order.items || [],
            status: order.status,
            total: order.total,
            delivery_fee: order.delivery_fee || 0,
            grand_total: order.grand_total,
            payment_method: order.payment_method,
            payment_status: order.payment_status,
            delivery_address: order.delivery_address,
            driver_name: order.driver_name,
            driver_phone: order.driver_phone,
            created_at: order.created_at,
            estimated_delivery: order.estimated_delivery,
            actual_delivery: order.actual_delivery,
      };
        })
      );

      return { data: formattedOrders, error: null, total: count || 0 };
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      return { data: null, error: 'Erreur lors de la récupération des commandes', total: 0 };
    }
  }

  // Récupérer la liste des livreurs
  static async getDrivers(page = 1, limit = 10, search = ''): Promise<{ data: AdminDriver[] | null; error: string | null; total: number }> {
    try {
      let query = supabase
        .from('drivers')
        .select(`
          id,
          name,
          phone,
          email,
          is_active,
          is_verified,
          rating,
          total_deliveries,
          total_earnings,
          vehicle_type,
          vehicle_plate,
          created_at,
          business_id
        `, { count: 'exact' });

      if (search) {
        query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
      }

      const { data: drivers, error, count } = await query
        .range((page - 1) * limit, page * limit - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Récupérer les statistiques supplémentaires pour chaque livreur
      const driversWithStats = await Promise.all(
        drivers?.map(async (driver) => {
          // Compter les documents
          const { count: documentsCount } = await supabase
            .from('driver_documents')
            .select('*', { count: 'exact', head: true })
            .eq('driver_id', driver.id);

          // Compter les sessions actives
          const { count: activeSessions } = await supabase
            .from('work_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('driver_id', driver.id)
            .eq('status', 'active');

          // Récupérer le nom du commerce
          let business_name = '';
          if (driver.business_id) {
            const { data: business } = await supabase
              .from('businesses')
              .select('name')
              .eq('id', driver.business_id)
              .single();
            
            if (business) {
              business_name = business.name;
            }
          }

          return {
            id: driver.id,
            name: driver.name,
            phone: driver.phone,
            email: driver.email,
            business_name,
            is_active: driver.is_active,
            is_verified: driver.is_verified,
            rating: driver.rating || 0,
            total_deliveries: driver.total_deliveries || 0,
            total_earnings: driver.total_earnings || 0,
            vehicle_type: driver.vehicle_type,
            vehicle_plate: driver.vehicle_plate,
            created_at: driver.created_at,
            documents_count: documentsCount || 0,
            active_sessions: activeSessions || 0,
          };
        }) || []
      );

      return { data: driversWithStats, error: null, total: count || 0 };
    } catch (error) {
      console.error('Erreur lors de la récupération des livreurs:', error);
      return { data: null, error: 'Erreur lors de la récupération des livreurs', total: 0 };
    }
  }

  // Récupérer les analytics
  static async getAnalytics(): Promise<{ data: AdminAnalytics | null; error: string | null }> {
    try {
      // Revenus par mois (6 derniers mois)
      const { data: revenueData, error: revenueError } = await supabase
        .from('orders')
        .select('grand_total, created_at')
        .eq('payment_status', 'completed')
        .gte('created_at', new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString());

      if (revenueError) throw revenueError;

      // Commandes par statut
      const { data: statusData, error: statusError } = await supabase
        .from('orders')
        .select('status');

      if (statusError) throw statusError;

      // Top commerces
      const { data: topBusinesses, error: topBusinessesError } = await supabase
        .from('orders')
        .select('business_name, grand_total')
        .eq('payment_status', 'completed');

      if (topBusinessesError) throw topBusinessesError;

      // Top livreurs
      const { data: topDrivers, error: topDriversError } = await supabase
        .from('drivers')
        .select('name, total_deliveries, total_earnings')
        .order('total_deliveries', { ascending: false })
        .limit(10);

      if (topDriversError) throw topDriversError;

      // Croissance des utilisateurs
      const { data: userGrowth, error: userGrowthError } = await supabase
        .from('user_profiles')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString());

      if (userGrowthError) throw userGrowthError;

      // Croissance des commandes
      const { data: orderGrowth, error: orderGrowthError } = await supabase
        .from('orders')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString());

      if (orderGrowthError) throw orderGrowthError;

      // Traitement des données
      const analytics: AdminAnalytics = {
        revenueByMonth: this.processMonthlyData(revenueData, 'grand_total'),
        ordersByStatus: this.processStatusData(statusData),
        topBusinesses: this.processTopBusinesses(topBusinesses),
        topDrivers: topDrivers?.map(driver => ({
          name: driver.name,
          deliveries: driver.total_deliveries || 0,
          earnings: driver.total_earnings || 0,
        })) || [],
        userGrowth: this.processMonthlyData(userGrowth, 'count'),
        orderGrowth: this.processMonthlyData(orderGrowth, 'count'),
      };

      return { data: analytics, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des analytics:', error);
      return { data: null, error: 'Erreur lors de la récupération des analytics' };
    }
  }

  // Méthodes utilitaires pour traiter les données
  private static processMonthlyData(data: any[], valueField: string) {
    const months = {};
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    data?.forEach(item => {
      const date = new Date(item.created_at);
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      
      if (!months[monthKey]) {
        months[monthKey] = valueField === 'count' ? 0 : 0;
      }
      
      if (valueField === 'count') {
        months[monthKey]++;
      } else {
        months[monthKey] += item[valueField] || 0;
      }
    });

    return Object.entries(months).map(([month, value]) => ({
      month,
      [valueField === 'count' ? 'count' : 'revenue']: value,
    }));
  }

  private static processStatusData(data: any[]) {
    const statusCounts = {};
    
    data?.forEach(item => {
      statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
    });

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
    }));
  }

  private static processTopBusinesses(data: any[]) {
    const businessStats = {};
    
    data?.forEach(item => {
      if (!businessStats[item.business_name]) {
        businessStats[item.business_name] = { revenue: 0, orders: 0 };
      }
      businessStats[item.business_name].revenue += item.grand_total || 0;
      businessStats[item.business_name].orders++;
    });

    return Object.entries(businessStats)
      .map(([name, stats]: [string, any]) => ({
        name,
        revenue: stats.revenue,
        orders: stats.orders,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }

  // Récupérer les commerces disponibles pour l'assignation des livreurs
  static async getAvailableBusinesses(): Promise<{ data: AvailableBusiness[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          id,
          name,
          business_type_id,
          business_types(name),
          category,
          is_active
        `)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      // Transformer les données pour correspondre à l'interface
      const transformedData = data?.map(business => ({
        id: business.id,
        name: business.name,
        business_type: business.business_types?.name || 'Non défini',
        category: business.category || 'Non défini',
        is_active: business.is_active
      }));

      return { data: transformedData, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des commerces disponibles:', error);
      return { data: null, error: 'Erreur lors de la récupération des commerces disponibles' };
    }
  }
} 