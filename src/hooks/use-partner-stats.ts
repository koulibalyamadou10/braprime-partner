import { useQuery } from '@tanstack/react-query';
import { PartnerStatsService, type PartnerStats, type BusinessTypeStats, type PartnerTestimonial, type PartnerRequest } from '@/lib/services/partner-stats';

// Hook pour les statistiques générales des partenaires
export const usePartnerStats = () => {
  return useQuery({
    queryKey: ['partner-stats'],
    queryFn: () => PartnerStatsService.getPartnerStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.code === 'PGRST116' || error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    }
  });
};

// Hook pour les statistiques par type de commerce
export const useBusinessTypeStats = () => {
  return useQuery({
    queryKey: ['business-type-stats'],
    queryFn: () => PartnerStatsService.getBusinessTypeStats(),
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      if (error?.code === 'PGRST116' || error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    }
  });
};

// Hook pour les témoignages des partenaires
export const usePartnerTestimonials = (limit: number = 3) => {
  return useQuery({
    queryKey: ['partner-testimonials', limit],
    queryFn: () => PartnerStatsService.getPartnerTestimonials(limit),
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount, error: any) => {
      if (error?.code === 'PGRST116' || error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    }
  });
};

// Hook pour les demandes de partenariat
export const usePartnerRequests = (limit: number = 10) => {
  return useQuery({
    queryKey: ['partner-requests', limit],
    queryFn: () => PartnerStatsService.getPartnerRequests(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error: any) => {
      if (error?.code === 'PGRST116' || error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    }
  });
};

// Hook combiné pour toutes les données partenaires
export const usePartnerData = () => {
  const stats = usePartnerStats();
  const businessTypes = useBusinessTypeStats();
  const testimonials = usePartnerTestimonials(3);



  return {
    stats: stats.data,
    businessTypes: businessTypes.data || [],
    testimonials: testimonials.data || [],
    isLoading: stats.isLoading || businessTypes.isLoading || testimonials.isLoading,
    error: stats.error || businessTypes.error || testimonials.error,
    isSuccess: stats.isSuccess && businessTypes.isSuccess && testimonials.isSuccess
  };
}; 