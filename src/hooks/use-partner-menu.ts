import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PartnerMenuService, PartnerMenuItem, PartnerMenuCategory, MenuItemCreate, MenuItemUpdate, MenuCategoryCreate, MenuCategoryUpdate } from '@/lib/services/partner-menu';
import { useToast } from '@/hooks/use-toast';

// Hook pour récupérer le menu d'un business (optimisé avec pagination)
export const usePartnerMenu = (
  businessId: number, 
  limit: number = 50, 
  offset: number = 0,
  categoryId?: number
) => {
  return useQuery({
    queryKey: ['partner-menu', businessId, limit, offset, categoryId],
    queryFn: () => PartnerMenuService.getMenuByBusinessId(businessId, limit, offset, categoryId),
    enabled: !!businessId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.code === 'PGRST116' || error?.status === 401) {
        return false
      }
      return failureCount < 3
    }
  });
};

// Hook pour récupérer les catégories de menu (optimisé)
export const usePartnerMenuCategories = (businessId: number) => {
  return useQuery({
    queryKey: ['partner-menu-categories', businessId],
    queryFn: () => PartnerMenuService.getMenuCategories(businessId),
    enabled: !!businessId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount, error: any) => {
      if (error?.code === 'PGRST116' || error?.status === 401) {
        return false
      }
      return failureCount < 3
    }
  });
};

// Hook pour créer un article de menu (optimisé)
export const useCreateMenuItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (menuItem: MenuItemCreate) => PartnerMenuService.createMenuItem(menuItem),
    onSuccess: (data, variables) => {
      // Invalider et refetch le menu du business
      queryClient.invalidateQueries({ 
        queryKey: ['partner-menu', variables.business_id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['partner-menu-categories', variables.business_id] 
      });
      
      toast({
        title: "Succès",
        description: "Article de menu créé avec succès",
      });
    },
    onError: (error: any) => {
      console.error('Erreur lors de la création de l\'article:', error);
      toast({
        title: "Erreur",
        description: error?.message || "Erreur lors de la création de l'article",
        variant: "destructive",
      });
    }
  });
};

// Hook pour mettre à jour un article de menu (optimisé)
export const useUpdateMenuItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: MenuItemUpdate }) =>
      PartnerMenuService.updateMenuItem(id, updates),
    onSuccess: (data, variables) => {
      // Invalider et refetch le menu du business
      queryClient.invalidateQueries({ 
        queryKey: ['partner-menu'] 
      });
      
      toast({
        title: "Succès",
        description: "Article de menu mis à jour avec succès",
      });
    },
    onError: (error: any) => {
      console.error('Erreur lors de la mise à jour de l\'article:', error);
      toast({
        title: "Erreur",
        description: error?.message || "Erreur lors de la mise à jour de l'article",
        variant: "destructive",
      });
    }
  });
};

// Hook pour supprimer un article de menu (optimisé)
export const useDeleteMenuItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (id: number) => PartnerMenuService.deleteMenuItem(id),
    onSuccess: (data, variables) => {
      // Invalider et refetch le menu du business
      queryClient.invalidateQueries({ 
        queryKey: ['partner-menu'] 
      });
      
      toast({
        title: "Succès",
        description: "Article de menu supprimé avec succès",
      });
    },
    onError: (error: any) => {
      console.error('Erreur lors de la suppression de l\'article:', error);
      toast({
        title: "Erreur",
        description: error?.message || "Erreur lors de la suppression de l'article",
        variant: "destructive",
      });
    }
  });
};

// Hook pour basculer la disponibilité d'un article de menu
export const useToggleMenuItemAvailability = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, isAvailable }: { id: number; isAvailable: boolean }) =>
      PartnerMenuService.toggleMenuItemAvailability(id, isAvailable),
    onSuccess: (data, variables) => {
      // Invalider et refetch le menu du business
      queryClient.invalidateQueries({ 
        queryKey: ['partner-menu'] 
      });
      
      toast({
        title: "Succès",
        description: `Article ${variables.isAvailable ? 'disponible' : 'indisponible'} avec succès`,
      });
    },
    onError: (error: any) => {
      console.error('Erreur lors du changement de disponibilité:', error);
      toast({
        title: "Erreur",
        description: error?.message || "Erreur lors du changement de disponibilité",
        variant: "destructive",
      });
    }
  });
};

// Hook pour créer une catégorie de menu (optimisé)
export const useCreateMenuCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (category: MenuCategoryCreate) => PartnerMenuService.createMenuCategory(category),
    onSuccess: (data, variables) => {
      // Invalider et refetch les catégories du business
      queryClient.invalidateQueries({ 
        queryKey: ['partner-menu-categories', variables.business_id] 
      });
      
      toast({
        title: "Succès",
        description: "Catégorie de menu créée avec succès",
      });
    },
    onError: (error: any) => {
      console.error('Erreur lors de la création de la catégorie:', error);
      toast({
        title: "Erreur",
        description: error?.message || "Erreur lors de la création de la catégorie",
        variant: "destructive",
      });
    }
  });
};

// Hook pour mettre à jour une catégorie de menu (optimisé)
export const useUpdateMenuCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: MenuCategoryUpdate }) =>
      PartnerMenuService.updateMenuCategory(id, updates),
    onSuccess: (data, variables) => {
      // Invalider et refetch les catégories
      queryClient.invalidateQueries({ 
        queryKey: ['partner-menu-categories'] 
      });
      
      toast({
        title: "Succès",
        description: "Catégorie de menu mise à jour avec succès",
      });
    },
    onError: (error: any) => {
      console.error('Erreur lors de la mise à jour de la catégorie:', error);
      toast({
        title: "Erreur",
        description: error?.message || "Erreur lors de la mise à jour de la catégorie",
        variant: "destructive",
      });
    }
  });
};

// Hook pour supprimer une catégorie de menu (optimisé)
export const useDeleteMenuCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (id: number) => PartnerMenuService.deleteMenuCategory(id),
    onSuccess: (data, variables) => {
      // Invalider et refetch les catégories
      queryClient.invalidateQueries({ 
        queryKey: ['partner-menu-categories'] 
      });
      
      toast({
        title: "Succès",
        description: "Catégorie de menu supprimée avec succès",
      });
    },
    onError: (error: any) => {
      console.error('Erreur lors de la suppression de la catégorie:', error);
      toast({
        title: "Erreur",
        description: error?.message || "Erreur lors de la suppression de la catégorie",
        variant: "destructive",
      });
    }
  });
};

// Hook combiné pour la gestion complète du menu (optimisé)
export const usePartnerMenuManagement = (businessId: number) => {
  const queryClient = useQueryClient();
  
  const menu = usePartnerMenu(businessId);
  const categories = usePartnerMenuCategories(businessId);
  
  const createMenuItem = useCreateMenuItem();
  const updateMenuItem = useUpdateMenuItem();
  const deleteMenuItem = useDeleteMenuItem();
  const createCategory = useCreateMenuCategory();
  const updateCategory = useUpdateMenuCategory();
  const deleteCategory = useDeleteMenuCategory();

  // Fonction de rafraîchissement manuel
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['partner-menu', businessId] });
    queryClient.invalidateQueries({ queryKey: ['partner-menu-categories', businessId] });
  };

  return {
    // Données
    menu: menu.data?.menu || [],
    categories: categories.data || [],
    totalItems: menu.data?.total || 0,
    totalCategories: categories.data?.length || 0,
    
    // États de chargement
    isLoading: menu.isLoading || categories.isLoading,
    isMenuLoading: menu.isLoading,
    isCategoriesLoading: categories.isLoading,
    
    // États de mutation
    isCreatingItem: createMenuItem.isPending,
    isUpdatingItem: updateMenuItem.isPending,
    isDeletingItem: deleteMenuItem.isPending,
    isCreatingCategory: createCategory.isPending,
    isUpdatingCategory: updateCategory.isPending,
    isDeletingCategory: deleteCategory.isPending,
    
    // Erreurs
    error: menu.error || categories.error,
    menuError: menu.error,
    categoriesError: categories.error,
    
    // Actions
    refresh,
    createMenuItem: createMenuItem.mutate,
    updateMenuItem: updateMenuItem.mutate,
    deleteMenuItem: deleteMenuItem.mutate,
    createCategory: createCategory.mutate,
    updateCategory: updateCategory.mutate,
    deleteCategory: deleteCategory.mutate,
    
    // Mutations directes (pour les cas avancés)
    createMenuItemMutation: createMenuItem,
    updateMenuItemMutation: updateMenuItem,
    deleteMenuItemMutation: deleteMenuItem,
    createCategoryMutation: createCategory,
    updateCategoryMutation: updateCategory,
    deleteCategoryMutation: deleteCategory
  };
}; 