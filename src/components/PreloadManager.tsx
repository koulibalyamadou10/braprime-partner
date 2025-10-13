import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

// Gestionnaire de préchargement pour optimiser les performances
const PreloadManager = () => {
  const queryClient = useQueryClient();
  const { currentUser, isLoading: authLoading } = useAuth();

  useEffect(() => {
    // NE RIEN précharger si l'auth est en cours ou si l'utilisateur est un partenaire/driver
    if (authLoading) return;
    
    // Désactiver le préchargement pour les partenaires et drivers
    if (currentUser?.role === 'partner' || currentUser?.role === 'driver') {
      console.log('⚠️ Préchargement désactivé pour les partenaires/drivers');
      return;
    }

    // Précharger SEULEMENT pour les clients (customers)
    if (currentUser?.role !== 'customer') {
      return;
    }

    // Précharger les données essentielles en arrière-plan (SEULEMENT pour customers)
    const preloadEssentialData = async () => {
      try {
        const { HomepageService } = await import('@/lib/services/homepage');
        
        // Précharger les catégories
        await queryClient.prefetchQuery({
          queryKey: ['categories-with-counts'],
          queryFn: () => HomepageService.getCategoriesWithCounts(),
          staleTime: 20 * 60 * 1000,
        });

        console.log('✅ Données essentielles préchargées avec succès');
      } catch (error) {
        console.warn('⚠️ Erreur lors du préchargement:', error);
      }
    };

    // Précharger les données secondaires après un délai
    const preloadSecondaryData = async () => {
      try {
        // Attendre un peu avant de précharger les données secondaires
        await new Promise(resolve => setTimeout(resolve, 2000));

        const { HomepageService } = await import('@/lib/services/homepage');

        // Précharger les restaurants populaires
        await queryClient.prefetchQuery({
          queryKey: ['popular-restaurants', 8],
          queryFn: () => HomepageService.getPopularRestaurants(8),
          staleTime: 10 * 60 * 1000,
        });

        console.log('✅ Données secondaires préchargées avec succès');
      } catch (error) {
        console.warn('⚠️ Erreur lors du préchargement secondaire:', error);
      }
    };

    // Lancer le préchargement SEULEMENT pour les customers
    preloadEssentialData();
    preloadSecondaryData();

    // Nettoyer les requêtes inutilisées après 5 minutes
    const cleanupTimer = setTimeout(() => {
      queryClient.removeQueries({
        queryKey: ['homepage-stats'],
        exact: false,
      });
    }, 5 * 60 * 1000);

    return () => {
      clearTimeout(cleanupTimer);
    };
  }, [queryClient]);

  // Ce composant ne rend rien, il gère seulement le préchargement
  return null;
};

export default PreloadManager; 