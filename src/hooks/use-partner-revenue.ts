import { useState, useEffect } from 'react';
import { kBilling, RevenueStats } from '@/lib/kservices/k-billing';
import { useAuth } from '@/contexts/AuthContext';
import { usePartnerProfile } from '@/hooks/use-partner-profile';

export const usePartnerRevenue = (period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly') => {
  const { currentUser } = useAuth();
  const { profile: business } = usePartnerProfile();
  
  console.log('🔍 Debug - Current user:', currentUser?.id);
  console.log('🔍 Debug - Business profile:', business);
  
  const [revenueData, setRevenueData] = useState<RevenueStats | null>(null);
  const [topItems, setTopItems] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRevenueData = async () => {
    if (!business?.id) {
      console.log('⚠️ Debug - No business ID available');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('🔍 Debug - Fetching revenue data for business:', business.id, 'period:', period);
      const data = await kBilling.getRevenueStats(business.id, period);
      console.log('🔍 Debug - Revenue data received:', data);
      
      setRevenueData(data);
      setTopItems(data.topItems);
      setStats({
        totalRevenue: data.totalRevenue,
        totalOrders: data.totalOrders,
        averageOrderValue: data.averageOrder,
        periodRevenue: data.totalRevenue,
        periodOrders: data.totalOrders
      });
    } catch (err) {
      console.error('❌ Debug - Error fetching revenue data:', err);
      setError(err instanceof Error ? err : new Error('Erreur lors du chargement des données'));
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    fetchRevenueData();
  };

  useEffect(() => {
    fetchRevenueData();
  }, [business?.id, period]);

  return {
    revenueData,
    topItems,
    stats,
    isLoading,
    error,
    refetch
  };
};

export default usePartnerRevenue; 