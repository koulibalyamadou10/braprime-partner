import { useQuery } from '@tanstack/react-query'
import { HomepageService } from '@/lib/services/homepage'
import { useAuth } from '@/contexts/AuthContext'

// Hook pour les statistiques de la page d'accueil
export const useHomepageStats = () => {
  const { currentUser } = useAuth()
  
  return useQuery({
    queryKey: ['homepage-stats'],
    queryFn: () => HomepageService.getHomepageStats(),
    enabled: !!currentUser,
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

// Hook pour les catégories populaires
export const usePopularCategories = () => {
  const { currentUser } = useAuth()
  
  return useQuery({
    queryKey: ['popular-categories'],
    queryFn: () => HomepageService.getPopularCategories(),
    enabled: !!currentUser,
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

// Hook pour les services populaires
export const usePopularServices = (limit: number = 6) => {
  const { currentUser } = useAuth()
  
  return useQuery({
    queryKey: ['popular-services', limit],
    queryFn: () => HomepageService.getPopularServices(limit),
    enabled: !!currentUser,
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

// Hook pour les articles en vedette
export const useFeaturedProducts = (limit: number = 8) => {
  const { currentUser } = useAuth()
  
  return useQuery({
    queryKey: ['featured-products', limit],
    queryFn: () => HomepageService.getFeaturedProducts(limit),
    enabled: !!currentUser,
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

// Hook pour récupérer un service spécifique
export const useServiceById = (id: string) => {
  const { currentUser } = useAuth()
  
  return useQuery({
    queryKey: ['service', id],
    queryFn: () => HomepageService.getServiceById(id),
    enabled: !!id && !!currentUser,
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

// Hook pour récupérer les catégories de produits
export const useProductCategories = () => {
  const { currentUser } = useAuth()
  
  return useQuery({
    queryKey: ['product-categories'],
    queryFn: () => HomepageService.getProductCategories(),
    enabled: !!currentUser,
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

// Hook pour récupérer les types de services
export const useServiceTypes = () => {
  const { currentUser } = useAuth()
  
  return useQuery({
    queryKey: ['service-types'],
    queryFn: () => HomepageService.getServiceTypes(),
    enabled: !!currentUser,
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

// Hook pour les restaurants populaires
export const usePopularRestaurants = (limit: number = 8) => {
  return useQuery({
    queryKey: ['popular-restaurants', limit],
    queryFn: () => HomepageService.getPopularRestaurants(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook pour les catégories avec compteurs
export const useCategoriesWithCounts = () => {
  return useQuery({
    queryKey: ['categories-with-counts'],
    queryFn: () => HomepageService.getCategoriesWithCounts(),
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
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

// Hook combiné pour la page d'accueil
export const useHomepage = () => {
  const stats = useHomepageStats()
  const popularRestaurants = usePopularRestaurants(8)
  const categories = useCategoriesWithCounts()
  const featuredItems = useFeaturedProducts(8)

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