import { useQuery } from "@tanstack/react-query";
import { supabase } from '@/lib/supabase';

export interface MenuCategory {
  id: number;
  name: string;
  description?: string;
  business_id: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Hook pour récupérer les catégories de menu d'un business
export const useMenuCategories = (businessId: string | undefined) => {
  return useQuery({
    queryKey: ['menu-categories', businessId],
    queryFn: async (): Promise<MenuCategory[]> => {
      if (!businessId) {
        throw new Error('Business ID requis');
      }

      const businessIdInt = parseInt(businessId, 10);
      if (isNaN(businessIdInt)) {
        throw new Error('Business ID invalide');
      }

      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('business_id', businessIdInt)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        throw new Error(`Erreur lors de la récupération des catégories: ${error.message}`);
      }

      return data || [];
    },
    enabled: !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
