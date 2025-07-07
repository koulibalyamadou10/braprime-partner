import { useQuery } from '@tanstack/react-query';
import { RequestsStatsService, type RequestsPageStats } from '@/lib/services/requests-stats';

// Hook pour les statistiques de la page RequestsPage
export const useRequestsPageStats = () => {
  return useQuery({
    queryKey: ['requests-page-stats'],
    queryFn: () => RequestsStatsService.getRequestsPageStats(),
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