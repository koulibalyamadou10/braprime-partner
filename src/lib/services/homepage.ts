import { supabase } from '@/lib/supabase'

export interface HomepageStats {
  totalRestaurants: number
  totalOrders: number
  totalCustomers: number
  averageDeliveryTime: number
}

export interface PopularRestaurant {
  id: number
  name: string
  description: string
  cuisine_type: string
  cover_image: string
  logo: string
  rating: number
  review_count: number
  delivery_time: string
  delivery_fee: number
  address: string
  is_popular: boolean
  order_count: number
}

export interface Category {
  id: number
  name: string
  icon: string
  color: string
  link: string
  is_active: boolean
  restaurant_count: number
}

export interface HomepageData {
  stats: HomepageStats
  popularRestaurants: PopularRestaurant[]
  categories: Category[]
  featuredItems: any[]
}

export class HomepageService {
  // Récupérer les statistiques de la page d'accueil
  static async getHomepageStats(): Promise<any> {
    try {
      // Statistiques des services
      const { data: servicesCount, error: servicesError } = await supabase
        .from('services')
        .select('id', { count: 'exact' })
        .eq('is_active', true);

      if (servicesError) throw servicesError;

      // Statistiques des commandes
      const { data: ordersCount, error: ordersError } = await supabase
        .from('orders')
        .select('id', { count: 'exact' })
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (ordersError) throw ordersError;

      // Statistiques des utilisateurs
      const { data: usersCount, error: usersError } = await supabase
        .from('users')
        .select('id', { count: 'exact' })
        .eq('role', 'customer');

      if (usersError) throw usersError;

      return {
        totalServices: servicesCount?.length || 0,
        totalOrders: ordersCount?.length || 0,
        totalCustomers: usersCount?.length || 0,
        totalRevenue: 0 // À calculer si nécessaire
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  // Récupérer les catégories populaires
  static async getPopularCategories(): Promise<any[]> {
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

  // Récupérer les services populaires
  static async getPopularServices(limit: number = 6): Promise<any[]> {
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
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erreur lors de la récupération des services populaires:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des services populaires:', error);
      throw error;
    }
  }

  // Récupérer les articles en vedette
  static async getFeaturedProducts(limit: number = 8): Promise<any[]> {
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
          )
        `)
        .eq('is_available', true)
        .eq('is_popular', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erreur lors de la récupération des articles en vedette:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des articles en vedette:', error);
      throw error;
    }
  }

  // Récupérer un service spécifique par ID
  static async getServiceById(id: string): Promise<any> {
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
          ),
          products (
            id,
            name,
            description,
            price,
            image,
            is_popular,
            category_id
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération du service:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération du service:', error);
      throw error;
    }
  }

  // Récupérer les catégories de produits
  static async getProductCategories(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Erreur lors de la récupération des catégories:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
      throw error;
    }
  }

  // Récupérer les types de services
  static async getServiceTypes(): Promise<any[]> {
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

      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des types de services:', error);
      throw error;
    }
  }
} 