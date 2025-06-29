import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoritesService, type FavoriteBusiness, type FavoriteMenuItem, type BusinessWithFavorite, type MenuItemWithFavorite } from '@/lib/services/favorites';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useFavorites = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  // ============================================================================
  // QUERIES
  // ============================================================================

  // Récupérer les businesses favoris
  const {
    data: favoriteBusinesses = [],
    isLoading: isLoadingFavoriteBusinesses,
    error: errorFavoriteBusinesses,
    refetch: refetchFavoriteBusinesses
  } = useQuery({
    queryKey: ['favorites', 'businesses'],
    queryFn: () => favoritesService.getFavoriteBusinesses(),
    enabled: !!currentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Récupérer les menu items favoris
  const {
    data: favoriteMenuItems = [],
    isLoading: isLoadingFavoriteMenuItems,
    error: errorFavoriteMenuItems,
    refetch: refetchFavoriteMenuItems
  } = useQuery({
    queryKey: ['favorites', 'menu-items'],
    queryFn: () => favoritesService.getFavoriteMenuItems(),
    enabled: !!currentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Récupérer le nombre de favoris
  const {
    data: favoritesCount = { businesses: 0, menuItems: 0 },
    isLoading: isLoadingFavoritesCount,
    error: errorFavoritesCount
  } = useQuery({
    queryKey: ['favorites', 'count'],
    queryFn: () => favoritesService.getFavoritesCount(),
    enabled: !!currentUser,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  // Basculer le statut favori d'un business
  const toggleBusinessFavoriteMutation = useMutation({
    mutationFn: (businessId: number) => favoritesService.toggleBusinessFavorite(businessId),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        // Invalider les caches concernés
        queryClient.invalidateQueries({ queryKey: ['favorites', 'businesses'] });
        queryClient.invalidateQueries({ queryKey: ['favorites', 'count'] });
        queryClient.invalidateQueries({ queryKey: ['businesses'] });
        queryClient.invalidateQueries({ queryKey: ['businesses', 'with-favorites'] });
      } else {
        toast.error(data.message);
      }
    },
    onError: (error) => {
      console.error('Erreur lors du basculement des favoris:', error);
      toast.error('Erreur lors de la modification des favoris');
    }
  });

  // Basculer le statut favori d'un menu item
  const toggleMenuItemFavoriteMutation = useMutation({
    mutationFn: (menuItemId: number) => favoritesService.toggleMenuItemFavorite(menuItemId),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        // Invalider les caches concernés
        queryClient.invalidateQueries({ queryKey: ['favorites', 'menu-items'] });
        queryClient.invalidateQueries({ queryKey: ['favorites', 'count'] });
        queryClient.invalidateQueries({ queryKey: ['menu-items'] });
        queryClient.invalidateQueries({ queryKey: ['menu-items', 'with-favorites'] });
      } else {
        toast.error(data.message);
      }
    },
    onError: (error) => {
      console.error('Erreur lors du basculement des favoris:', error);
      toast.error('Erreur lors de la modification des favoris');
    }
  });

  // ============================================================================
  // FONCTIONS UTILITAIRES
  // ============================================================================

  const toggleBusinessFavorite = (businessId: number) => {
    if (!currentUser) {
      toast.error('Vous devez être connecté pour ajouter aux favoris');
      return;
    }
    toggleBusinessFavoriteMutation.mutate(businessId);
  };

  const toggleMenuItemFavorite = (menuItemId: number) => {
    if (!currentUser) {
      toast.error('Vous devez être connecté pour ajouter aux favoris');
      return;
    }
    toggleMenuItemFavoriteMutation.mutate(menuItemId);
  };

  const isBusinessFavorite = (businessId: number): boolean => {
    return favoriteBusinesses.some(fav => fav.business_id === businessId);
  };

  const isMenuItemFavorite = (menuItemId: number): boolean => {
    return favoriteMenuItems.some(fav => fav.menu_item_id === menuItemId);
  };

  return {
    // Données
    favoriteBusinesses,
    favoriteMenuItems,
    favoritesCount,
    
    // États de chargement
    isLoadingFavoriteBusinesses,
    isLoadingFavoriteMenuItems,
    isLoadingFavoritesCount,
    isLoading: isLoadingFavoriteBusinesses || isLoadingFavoriteMenuItems || isLoadingFavoritesCount,
    
    // États d'erreur
    errorFavoriteBusinesses,
    errorFavoriteMenuItems,
    errorFavoritesCount,
    hasError: !!(errorFavoriteBusinesses || errorFavoriteMenuItems || errorFavoritesCount),
    
    // Actions
    toggleBusinessFavorite,
    toggleMenuItemFavorite,
    isBusinessFavorite,
    isMenuItemFavorite,
    
    // Refetch
    refetchFavoriteBusinesses,
    refetchFavoriteMenuItems,
    
    // États des mutations
    isTogglingBusiness: toggleBusinessFavoriteMutation.isPending,
    isTogglingMenuItem: toggleMenuItemFavoriteMutation.isPending
  };
};

// Hook spécialisé pour les businesses avec statut favori
export const useBusinessesWithFavorites = () => {
  const queryClient = useQueryClient();

  const {
    data: businesses = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['businesses', 'with-favorites'],
    queryFn: () => favoritesService.getBusinessesWithFavorites(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    businesses,
    isLoading,
    error,
    refetch
  };
};

// Hook spécialisé pour les menu items avec statut favori
export const useMenuItemsWithFavorites = (businessId?: number) => {
  const queryClient = useQueryClient();

  const {
    data: menuItems = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['menu-items', 'with-favorites', businessId],
    queryFn: () => favoritesService.getMenuItemsWithFavorites(businessId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    menuItems,
    isLoading,
    error,
    refetch
  };
}; 