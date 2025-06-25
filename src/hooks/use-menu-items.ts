import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { MenuItem } from '@/lib/services/business';

// Hook pour récupérer les articles de menu d'un business
export const useMenuItems = (businessId: string | undefined) => {
  return useQuery({
    queryKey: ['menu-items', businessId],
    queryFn: async (): Promise<MenuItem[]> => {
      if (!businessId) {
        throw new Error('Business ID requis');
      }

      console.log('Business ID:', businessId);
      const businessIdInt = parseInt(businessId, 10);
      if (isNaN(businessIdInt)) {
        throw new Error('Business ID invalide');
      }

      // Requête très simple - juste les articles de menu
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('business_id', businessIdInt);

      console.log('Résultat de la requête simple:', data);
      console.log('Erreur de la requête:', error);

      if (error) {
        throw new Error(`Erreur lors de la récupération des articles: ${error.message}`);
      }

      // Retourner directement les données
      return data || [];
    },
    enabled: !!businessId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}; 