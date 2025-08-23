import { useState, useEffect } from 'react';
import { kBilling, RevenueStats } from '@/lib/kservices/k-billing';
import { useAuth } from '@/contexts/AuthContext';
import { usePartnerProfile } from '@/hooks/use-partner-profile';

export const usePartnerRevenue = (period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly') => {
  const { currentUser } = useAuth();
  const { profile: business } = usePartnerProfile();
  
  const [revenueData, setRevenueData] = useState<RevenueStats | null>(null);
  const [topItems, setTopItems] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRevenueData = async () => {
    if (!business?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const data = await kBilling.getRevenueStats(business.id, period);
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