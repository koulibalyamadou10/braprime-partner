import { useQuery } from '@tanstack/react-query';
import { BusinessService } from '@/lib/services/business';

export const useBusinessById = (id: string | undefined) => {
  return useQuery({
    queryKey: ['business', id],
    queryFn: async () => {
      if (!id) {
        throw new Error('ID du commerce requis');
      }
      return BusinessService.getById(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook pour récupérer un commerce avec les données organisées par catégories
export const useBusinessByIdWithOrganizedMenu = (id: string | undefined) => {
  return useQuery({
    queryKey: ['business-organized-menu', id],
    queryFn: async () => {
      if (!id) {
        throw new Error('ID du commerce requis');
      }
      return BusinessService.getByIdWithOrganizedMenu(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useAllBusinesses = () => {
  return useQuery({
    queryKey: ['businesses'],
    queryFn: () => BusinessService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const usePopularBusinesses = (limit: number = 10) => {
  return useQuery({
    queryKey: ['businesses', 'popular', limit],
    queryFn: () => BusinessService.getPopular(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook pour récupérer tous les commerces
export const useBusinesses = () => {
  return useQuery({
    queryKey: ['businesses'],
    queryFn: () => BusinessService.getAllBusinesses(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook pour récupérer un commerce spécifique
export const useBusiness = (id: string) => {
  return useQuery({
    queryKey: ['business', id],
    queryFn: () => BusinessService.getBusinessById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook pour récupérer les commerces par catégorie
export const useBusinessesByCategory = (categoryId: string) => {
  return useQuery({
    queryKey: ['businesses-by-category', categoryId],
    queryFn: () => BusinessService.getBusinessesByCategory(categoryId),
    enabled: !!categoryId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook pour rechercher des commerces
export const useSearchBusinesses = (searchTerm: string) => {
  return useQuery({
    queryKey: ['search-businesses', searchTerm],
    queryFn: () => BusinessService.searchBusinesses(searchTerm),
    enabled: !!searchTerm && searchTerm.length > 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook pour récupérer les commerces par type de commerce
export const useBusinessesByType = (businessTypeId: string) => {
  return useQuery({
    queryKey: ['businesses-by-type', businessTypeId],
    queryFn: () => BusinessService.getBusinessesByType(businessTypeId),
    enabled: !!businessTypeId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}; 