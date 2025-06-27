import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminDashboardService } from '@/lib/services/admin-dashboard';

export interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalBusinesses: number;
  orderGrowth: number;
  revenueGrowth: number;
  userGrowth: number;
  businessGrowth: number;
  customerCount: number;
  partnerCount: number;
  driverCount: number;
}

export interface AdminOrder {
  id: string;
  business_name: string;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
}

export interface AdminBusiness {
  id: number;
  name: string;
  category: string;
  owner_name: string;
  is_active: boolean;
  order_count: number;
  revenue: number;
  rating: number;
}

export interface SystemHealth {
  database: 'operational' | 'degraded' | 'down';
  api: 'operational' | 'degraded' | 'down';
  storage: 'operational' | 'degraded' | 'down';
  notifications: 'operational' | 'degraded' | 'down';
}

export const useAdminDashboard = () => {
  const queryClient = useQueryClient();

  // Statistiques principales
  const stats = useQuery({
    queryKey: ['admin-stats'],
    queryFn: AdminDashboardService.getStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Commandes récentes
  const recentOrders = useQuery({
    queryKey: ['admin-recent-orders'],
    queryFn: AdminDashboardService.getRecentOrders,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Top commerces
  const topBusinesses = useQuery({
    queryKey: ['admin-top-businesses'],
    queryFn: AdminDashboardService.getTopBusinesses,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Santé du système
  const systemHealth = useQuery({
    queryKey: ['admin-system-health'],
    queryFn: AdminDashboardService.getSystemHealth,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Fonction de rafraîchissement
  const refresh = useMutation({
    mutationFn: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-stats'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-recent-orders'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-top-businesses'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-system-health'] }),
      ]);
    },
  });

  return {
    stats,
    recentOrders,
    topBusinesses,
    systemHealth,
    refresh,
    isLoading: stats.isLoading || recentOrders.isLoading || topBusinesses.isLoading || systemHealth.isLoading,
    error: stats.error || recentOrders.error || topBusinesses.error || systemHealth.error,
  };
}; 