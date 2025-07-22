import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

export interface Business {
  id: number;
  name: string;
  description: string;
  business_type_id: number;
  category_id: number;
  address: string;
  phone: string;
  email: string;
  is_active: boolean;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export const useUserBusiness = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-business', user?.id],
    queryFn: async (): Promise<Business | null> => {
      if (!user?.id) {
        console.log('❌ [useUserBusiness] Aucun utilisateur connecté');
        return null;
      }

      try {
        console.log('🔍 [useUserBusiness] Recherche du business pour l\'utilisateur:', user.id);
        console.log('🔍 [useUserBusiness] Rôle utilisateur:', user.role);

        // Méthode 1: Récupérer le business par owner_id (comme usePartnerProfile)
        const { data: businessByOwner, error: ownerError } = await supabase
          .from('businesses')
          .select('*')
          .eq('owner_id', user.id)
          .single();

        if (ownerError) {
          console.log('⚠️ [useUserBusiness] Erreur lors de la recherche par owner_id:', ownerError);
        }

        if (businessByOwner) {
          console.log('✅ [useUserBusiness] Business trouvé par owner_id:', businessByOwner.id);
          return businessByOwner;
        }

        // Méthode 2: Vérifier tous les businesses pour cet utilisateur
        const { data: allBusinesses, error: allError } = await supabase
          .from('businesses')
          .select('*')
          .eq('owner_id', user.id);

        if (allError) {
          console.log('⚠️ [useUserBusiness] Erreur lors de la recherche de tous les businesses:', allError);
        }

        if (allBusinesses && allBusinesses.length > 0) {
          console.log('✅ [useUserBusiness] Business trouvé dans la liste:', allBusinesses[0].id);
          return allBusinesses[0];
        }

        console.log('⚠️ [useUserBusiness] Aucun business trouvé, tentative de création...');

        // Si aucun business trouvé, créer un business par défaut pour les tests
        const { data: newBusiness, error: createError } = await supabase
          .from('businesses')
          .insert({
            name: 'Business de Test',
            description: 'Business créé automatiquement pour les tests',
            business_type_id: 1,
            category_id: 1,
            address: 'Adresse de test',
            phone: '+224 123 456 789',
            email: user.email,
            owner_id: user.id,
            is_active: true,
            is_open: true,
            delivery_time: '30-45 min',
            delivery_fee: 5000,
            opening_hours: '8h-22h',
            cuisine_type: 'Général',
            rating: 0,
            review_count: 0,
            cover_image: '',
            logo: ''
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ [useUserBusiness] Erreur lors de la création du business de test:', createError);
          return null;
        }

        console.log('✅ [useUserBusiness] Business de test créé avec succès:', newBusiness.id);
        return newBusiness;
      } catch (error) {
        console.error('❌ [useUserBusiness] Erreur lors de la récupération du business:', error);
        return null;
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}; 