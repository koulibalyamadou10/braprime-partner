import { HomepageService } from '@/lib/services/homepage'
import { useQuery } from '@tanstack/react-query'

// Hook pour les statistiques de la page d'accueil - Optimisé
export const useHomepageStats = () => {
  return useQuery({
    queryKey: ['homepage-stats'],
    queryFn: () => HomepageService.getHomepageStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes (augmenté)
    refetchInterval: 5 * 60 * 1000, // 5 minutes (augmenté)
    refetchOnWindowFocus: false, // Désactiver le refetch automatique
    retry: (failureCount, error: any) => {
      // Ne pas relancer si l'erreur est 401 (non autorisé)
      if (error?.code === 'PGRST116' || error?.status === 401) {
        return false
      }
      return failureCount < 2 // Réduire le nombre de tentatives
    }
  })
}

// Hook pour les catégories populaires
export const usePopularCategories = () => {
  return useQuery({
    queryKey: ['popular-categories'],
    queryFn: () => HomepageService.getPopularCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      // Ne pas relancer si l'erreur est 401 (non autorisé)
      if (error?.code === 'PGRST116' || error?.status === 401) {
        return false
      }
      return failureCount < 3
    }
  })
}

// Hook pour les types de commerce
export const useBusinessTypes = () => {
  return useQuery({
    queryKey: ['business-types'],
    queryFn: () => HomepageService.getBusinessTypes(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      // Ne pas relancer si l'erreur est 401 (non autorisé)
      if (error?.code === 'PGRST116' || error?.status === 401) {
        return false
      }
      return failureCount < 3
    }
  })
}

// Hook pour les articles en vedette
export const useFeaturedItems = (limit: number = 8) => {
  return useQuery({
    queryKey: ['featured-items', limit],
    queryFn: () => HomepageService.getFeaturedProducts(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Ne pas relancer si l'erreur est 401 (non autorisé)
      if (error?.code === 'PGRST116' || error?.status === 401) {
        return false
      }
      return failureCount < 3
    }
  })
}

// Hook pour les restaurants populaires
export const usePopularRestaurants = (limit: number = 8) => {
  return useQuery({
    queryKey: ['popular-restaurants', limit],
    queryFn: () => HomepageService.getPopularRestaurants(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook pour les catégories avec compteurs - Optimisé
export const useCategoriesWithCounts = () => {
  return useQuery({
    queryKey: ['categories-with-counts'],
    queryFn: () => HomepageService.getCategoriesWithCounts(),
    staleTime: 20 * 60 * 1000, // 20 minutes (augmenté)
    refetchInterval: 15 * 60 * 1000, // 15 minutes (augmenté)
    refetchOnWindowFocus: false, // Désactiver le refetch automatique
  })
}

// Hook pour toutes les données de la page d'accueil
export const useHomepageData = () => {
  return useQuery({
    queryKey: ['homepage-data'],
    queryFn: () => HomepageService.getHomepageData(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 2 * 60 * 1000, // 2 minutes
  })
}

// Hook pour rechercher des restaurants par catégorie
export const useRestaurantsByCategory = (categoryName: string, limit: number = 6) => {
  return useQuery({
    queryKey: ['restaurants-by-category', categoryName, limit],
    queryFn: () => HomepageService.searchRestaurantsByCategory(categoryName, limit),
    enabled: !!categoryName,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook combiné pour la page d'accueil - Optimisé pour les performances
export const useHomepage = () => {
  const stats = useHomepageStats()
  const popularRestaurants = usePopularRestaurants(8)
  const categories = useCategoriesWithCounts()
  const featuredItems = useFeaturedItems(8)

  return {
    stats,
    popularRestaurants,
    categories,
    featuredItems,
    isLoading: stats.isLoading || popularRestaurants.isLoading || categories.isLoading || featuredItems.isLoading,
    error: stats.error || popularRestaurants.error || categories.error || featuredItems.error,
    isSuccess: stats.isSuccess && popularRestaurants.isSuccess && categories.isSuccess && featuredItems.isSuccess
  }
}

// Hook optimisé pour charger seulement les données essentielles
export const useHomepageEssential = () => {
  const stats = useHomepageStats()
  const categories = useCategoriesWithCounts()

  return {
    stats,
    categories,
    isLoading: stats.isLoading || categories.isLoading,
    error: stats.error || categories.error,
    isSuccess: stats.isSuccess && categories.isSuccess
  }
}

// Hook pour récupérer les catégories de menu
export const useMenuCategories = () => {
  return useQuery({
    queryKey: ['menu-categories'],
    queryFn: () => HomepageService.getMenuCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      // Ne pas relancer si l'erreur est 401 (non autorisé)
      if (error?.code === 'PGRST116' || error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    }
  });
}; 