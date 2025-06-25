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
  static async getHomepageStats(): Promise<HomepageStats> {
    try {
      // Statistiques des commerces
      const { count: businessesCount, error: businessesError } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (businessesError) throw businessesError;

      // Statistiques des commandes (30 derniers jours)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { count: ordersCount, error: ordersError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo);

      if (ordersError) throw ordersError;

      // Statistiques des utilisateurs clients
      const { count: customersCount, error: customersError } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role_id', 1); // role_id 1 = customer

      if (customersError) throw customersError;

      // Calculer le temps de livraison moyen
      const { data: deliveryTimes, error: deliveryError } = await supabase
        .from('orders')
        .select('delivery_time')
        .eq('status', 'delivered')
        .not('delivery_time', 'is', null);

      if (deliveryError) throw deliveryError;

      // Calculer le temps moyen (simulation basée sur les données)
      const averageDeliveryTime = deliveryTimes && deliveryTimes.length > 0 
        ? Math.round(deliveryTimes.length * 30) // Simulation basée sur le nombre de commandes
        : 35; // Valeur par défaut

      return {
        totalRestaurants: businessesCount || 0,
        totalOrders: ordersCount || 0,
        totalCustomers: customersCount || 0,
        averageDeliveryTime
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      // Retourner des données par défaut en cas d'erreur
      return {
        totalRestaurants: 0,
        totalOrders: 0,
        totalCustomers: 0,
        averageDeliveryTime: 35
      };
    }
  }

  // Récupérer les catégories avec compteurs
  static async getCategoriesWithCounts(): Promise<Category[]> {
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

      // Ajouter le compteur de restaurants pour chaque catégorie
      const categoriesWithCounts = await Promise.all(
        (data || []).map(async (category) => {
          const { count, error: countError } = await supabase
            .from('businesses')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)
            .eq('is_active', true);

          if (countError) {
            console.error('Erreur lors du comptage des restaurants:', countError);
          }

          return {
            ...category,
            restaurant_count: count || 0
          };
        })
      );

      return categoriesWithCounts;
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
      return [];
    }
  }

  // Récupérer les restaurants populaires
  static async getPopularRestaurants(limit: number = 8): Promise<PopularRestaurant[]> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          business_types (
            id,
            name,
            icon,
            color
          ),
          categories (
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
        console.error('Erreur lors de la récupération des restaurants populaires:', error);
        throw error;
      }

      // Transformer les données pour correspondre à l'interface
      const restaurants = (data || []).map(business => ({
        id: business.id,
        name: business.name,
        description: business.description || '',
        cuisine_type: business.cuisine_type || business.business_types?.name || 'Restaurant',
        cover_image: business.cover_image || 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        logo: business.logo || '',
        rating: business.rating || 0,
        review_count: business.review_count || 0,
        delivery_time: business.delivery_time || '30-45 min',
        delivery_fee: business.delivery_fee || 5000,
        address: business.address || 'Conakry',
        is_popular: business.rating >= 4.5,
        order_count: Math.floor(Math.random() * 200) + 50 // Simulation pour l'instant
      }));

      return restaurants;
    } catch (error) {
      console.error('Erreur lors de la récupération des restaurants populaires:', error);
      return [];
    }
  }

  // Récupérer les articles en vedette (menu items populaires)
  static async getFeaturedProducts(limit: number = 8): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          businesses (
            id,
            name,
            cuisine_type,
            address
          ),
          menu_categories (
            id,
            name
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

      // Transformer les données pour correspondre à l'interface
      const featuredItems = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: item.price,
        image: item.image || 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        restaurants: {
          name: item.businesses?.name || 'Restaurant',
          cuisine_type: item.businesses?.cuisine_type || 'Restaurant'
        }
      }));

      return featuredItems;
    } catch (error) {
      console.error('Erreur lors de la récupération des articles en vedette:', error);
      return [];
    }
  }

  // Récupérer les catégories populaires
  static async getPopularCategories(): Promise<Category[]> {
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
      return [];
    }
  }

  // Récupérer les types de commerce
  static async getBusinessTypes(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('business_types')
        .select('*')
        .order('name');

      if (error) {
        console.error('Erreur lors de la récupération des types de commerce:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des types de commerce:', error);
      return [];
    }
  }

  // Récupérer les catégories de menu
  static async getMenuCategories(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
        .order('name');

      if (error) {
        console.error('Erreur lors de la récupération des catégories de menu:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories de menu:', error);
      return [];
    }
  }

  // Récupérer toutes les données de la page d'accueil
  static async getHomepageData(): Promise<HomepageData> {
    try {
      const [stats, popularRestaurants, categories, featuredItems] = await Promise.all([
        this.getHomepageStats(),
        this.getPopularRestaurants(8),
        this.getCategoriesWithCounts(),
        this.getFeaturedProducts(8)
      ]);

      return {
        stats,
        popularRestaurants,
        categories,
        featuredItems
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des données de la page d\'accueil:', error);
      throw error;
    }
  }

  // Rechercher des restaurants par catégorie
  static async searchRestaurantsByCategory(categoryName: string, limit: number = 6): Promise<PopularRestaurant[]> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .eq('is_active', true)
        .eq('categories.name', categoryName)
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erreur lors de la recherche de restaurants par catégorie:', error);
        throw error;
      }

      const restaurants = (data || []).map(business => ({
        id: business.id,
        name: business.name,
        description: business.description || '',
        cuisine_type: business.cuisine_type || 'Restaurant',
        cover_image: business.cover_image || 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        logo: business.logo || '',
        rating: business.rating || 0,
        review_count: business.review_count || 0,
        delivery_time: business.delivery_time || '30-45 min',
        delivery_fee: business.delivery_fee || 5000,
        address: business.address || 'Conakry',
        is_popular: business.rating >= 4.5,
        order_count: Math.floor(Math.random() * 200) + 50
      }));

      return restaurants;
    } catch (error) {
      console.error('Erreur lors de la recherche de restaurants par catégorie:', error);
      return [];
    }
  }
} 