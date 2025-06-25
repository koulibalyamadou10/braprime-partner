import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PartnerMenuService, PartnerMenuItem, PartnerMenuCategory, MenuItemCreate, MenuItemUpdate, MenuCategoryCreate, MenuCategoryUpdate } from '@/lib/services/partner-menu';
import { useToast } from '@/hooks/use-toast';

export const usePartnerMenu = (businessId: number) => {
  return useQuery({
    queryKey: ['partner-menu', businessId],
    queryFn: () => PartnerMenuService.getMenuByBusinessId(businessId),
    enabled: !!businessId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateMenuItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (item: MenuItemCreate) => PartnerMenuService.createMenuItem(item),
    onSuccess: (data, variables) => {
      if (data.error) {
        toast({
          title: "Erreur",
          description: data.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Succès",
          description: "Article ajouté au menu avec succès",
        });
        // Invalider et refetch le menu
        queryClient.invalidateQueries({ queryKey: ['partner-menu', variables.business_id] });
      }
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'ajout de l'article",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateMenuItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, item }: { id: number; item: MenuItemUpdate }) => 
      PartnerMenuService.updateMenuItem(id, item),
    onSuccess: (data, variables) => {
      if (data.error) {
        toast({
          title: "Erreur",
          description: data.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Succès",
          description: "Article mis à jour avec succès",
        });
        // Invalider et refetch le menu
        queryClient.invalidateQueries({ queryKey: ['partner-menu'] });
      }
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour de l'article",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteMenuItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => PartnerMenuService.deleteMenuItem(id),
    onSuccess: (data, variables) => {
      if (data.error) {
        toast({
          title: "Erreur",
          description: data.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Succès",
          description: "Article supprimé avec succès",
        });
        // Invalider et refetch le menu
        queryClient.invalidateQueries({ queryKey: ['partner-menu'] });
      }
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression de l'article",
        variant: "destructive",
      });
    },
  });
};

export const useToggleMenuItemAvailability = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, isAvailable }: { id: number; isAvailable: boolean }) => 
      PartnerMenuService.toggleMenuItemAvailability(id, isAvailable),
    onSuccess: (data, variables) => {
      if (data.error) {
        toast({
          title: "Erreur",
          description: data.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Succès",
          description: `Article marqué comme ${variables.isAvailable ? 'disponible' : 'indisponible'}`,
        });
        // Invalider et refetch le menu
        queryClient.invalidateQueries({ queryKey: ['partner-menu'] });
      }
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors du changement de disponibilité",
        variant: "destructive",
      });
    },
  });
};

export const useCreateMenuCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (category: MenuCategoryCreate) => PartnerMenuService.createMenuCategory(category),
    onSuccess: (data, variables) => {
      if (data.error) {
        toast({
          title: "Erreur",
          description: data.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Succès",
          description: "Catégorie créée avec succès",
        });
        // Invalider et refetch le menu
        queryClient.invalidateQueries({ queryKey: ['partner-menu', variables.business_id] });
      }
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la création de la catégorie",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateMenuCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, category }: { id: number; category: MenuCategoryUpdate }) => 
      PartnerMenuService.updateMenuCategory(id, category),
    onSuccess: (data, variables) => {
      if (data.error) {
        toast({
          title: "Erreur",
          description: data.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Succès",
          description: "Catégorie mise à jour avec succès",
        });
        // Invalider et refetch le menu
        queryClient.invalidateQueries({ queryKey: ['partner-menu'] });
      }
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour de la catégorie",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteMenuCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => PartnerMenuService.deleteMenuCategory(id),
    onSuccess: (data, variables) => {
      if (data.error) {
        toast({
          title: "Erreur",
          description: data.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Succès",
          description: "Catégorie supprimée avec succès",
        });
        // Invalider et refetch le menu
        queryClient.invalidateQueries({ queryKey: ['partner-menu'] });
      }
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression de la catégorie",
        variant: "destructive",
      });
    },
  });
};

export const useReorderCategories = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ businessId, categoryOrders }: { businessId: number; categoryOrders: { id: number; sort_order: number }[] }) => 
      PartnerMenuService.reorderCategories(businessId, categoryOrders),
    onSuccess: (data, variables) => {
      if (data.error) {
        toast({
          title: "Erreur",
          description: data.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Succès",
          description: "Ordre des catégories mis à jour",
        });
        // Invalider et refetch le menu
        queryClient.invalidateQueries({ queryKey: ['partner-menu', variables.businessId] });
      }
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la réorganisation des catégories",
        variant: "destructive",
      });
    },
  });
}; 