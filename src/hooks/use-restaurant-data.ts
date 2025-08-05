import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface RestaurantData {
  business: any;
  categories: any[];
  menuItems: any[];
}

// Hook optimisé pour récupérer toutes les données d'un restaurant en une seule requête
export const useRestaurantData = (businessId: string | undefined) => {
  return useQuery({
    queryKey: ['restaurant-data', businessId],
    queryFn: async (): Promise<RestaurantData> => {
      if (!businessId) {
        throw new Error('Business ID requis');
      }

      const businessIdInt = parseInt(businessId, 10);
      if (isNaN(businessIdInt)) {
        throw new Error('Business ID invalide');
      }

      // Requête optimisée : récupérer business, catégories et menu items en parallèle
      const [businessResult, categoriesResult, menuItemsResult] = await Promise.all([
        // Récupérer les données du business
        supabase
          .from('businesses')
          .select('*')
          .eq('id', businessIdInt)
          .eq('is_active', true)
          .single(),

        // Récupérer les catégories de menu
        supabase
          .from('menu_categories')
          .select('*')
          .eq('business_id', businessIdInt)
          .eq('is_active', true)
          .order('sort_order', { ascending: true }),

        // Récupérer les articles de menu
        supabase
          .from('menu_items')
          .select('*')
          .eq('business_id', businessIdInt)
          .eq('is_available', true)
          .order('created_at', { ascending: false })
      ]);

      // Vérifier les erreurs
      if (businessResult.error) {
        throw new Error(`Erreur lors de la récupération du business: ${businessResult.error.message}`);
      }

      if (categoriesResult.error) {
        console.warn('Erreur lors de la récupération des catégories:', categoriesResult.error);
      }

      if (menuItemsResult.error) {
        console.warn('Erreur lors de la récupération des articles:', menuItemsResult.error);
      }

      return {
        business: businessResult.data,
        categories: categoriesResult.data || [],
        menuItems: menuItemsResult.data || []
      };
    },
    enabled: !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook pour récupérer seulement les données essentielles (business + catégories)
export const useRestaurantEssential = (businessId: string | undefined) => {
  return useQuery({
    queryKey: ['restaurant-essential', businessId],
    queryFn: async () => {
      if (!businessId) {
        throw new Error('Business ID requis');
      }

      const businessIdInt = parseInt(businessId, 10);
      if (isNaN(businessIdInt)) {
        throw new Error('Business ID invalide');
      }

      // Requête pour business + catégories seulement
      const [businessResult, categoriesResult] = await Promise.all([
        supabase
          .from('businesses')
          .select('*')
          .eq('id', businessIdInt)
          .eq('is_active', true)
          .single(),

        supabase
          .from('menu_categories')
          .select('*')
          .eq('business_id', businessIdInt)
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
      ]);

      if (businessResult.error) {
        throw new Error(`Erreur lors de la récupération du business: ${businessResult.error.message}`);
      }

      return {
        business: businessResult.data,
        categories: categoriesResult.data || []
      };
    },
    enabled: !!businessId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook pour récupérer les articles de menu avec lazy loading
export const useRestaurantMenuItems = (businessId: string | undefined, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['restaurant-menu-items', businessId],
    queryFn: async () => {
      if (!businessId) {
        throw new Error('Business ID requis');
      }

      const businessIdInt = parseInt(businessId, 10);
      if (isNaN(businessIdInt)) {
        throw new Error('Business ID invalide');
      }

      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('business_id', businessIdInt)
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Erreur lors de la récupération des articles: ${error.message}`);
      }

      return data || [];
    },
    enabled: !!businessId && enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}; 