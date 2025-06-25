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