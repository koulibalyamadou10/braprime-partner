import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { HomepageService } from '@/lib/services/homepage';

// Gestionnaire de préchargement pour optimiser les performances
const PreloadManager = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Précharger les données essentielles en arrière-plan
    const preloadEssentialData = async () => {
      try {
        // Précharger les statistiques
        await queryClient.prefetchQuery({
          queryKey: ['homepage-stats'],
          queryFn: () => HomepageService.getHomepageStats(),
          staleTime: 10 * 60 * 1000,
        });

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
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Précharger les restaurants populaires
        await queryClient.prefetchQuery({
          queryKey: ['popular-restaurants', 8],
          queryFn: () => HomepageService.getPopularRestaurants(8),
          staleTime: 10 * 60 * 1000,
        });

        // Précharger les articles en vedette
        await queryClient.prefetchQuery({
          queryKey: ['featured-items', 8],
          queryFn: () => HomepageService.getFeaturedProducts(8),
          staleTime: 5 * 60 * 1000,
        });

        console.log('✅ Données secondaires préchargées avec succès');
      } catch (error) {
        console.warn('⚠️ Erreur lors du préchargement secondaire:', error);
      }
    };

    // Lancer le préchargement
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