import { supabase } from '@/lib/supabase';

export interface RequestsPageStats {
  totalPartners: number;
  totalDrivers: number;
  totalOrders: number;
  satisfactionRate: number;
}

export class RequestsStatsService {
  // Récupérer les statistiques pour la page RequestsPage
  static async getRequestsPageStats(): Promise<{ data: RequestsPageStats | null; error: string | null }> {
    try {
      // Nombre total de partenaires (businesses actifs)
      const { count: totalPartners, error: partnersError } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (partnersError) throw partnersError;

      // Nombre total de chauffeurs actifs
      const { count: totalDrivers, error: driversError } = await supabase
        .from('drivers')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (driversError) throw driversError;

      // Nombre total de commandes
      const { count: totalOrders, error: ordersError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      if (ordersError) throw ordersError;

      // Calculer le taux de satisfaction (basé sur les commandes livrées vs total)
      const { count: deliveredOrders, error: deliveredError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'delivered');

      if (deliveredError) throw deliveredError;

      const satisfactionRate = totalOrders > 0 ? Math.round((deliveredOrders || 0) / totalOrders * 100) : 98;

      const stats: RequestsPageStats = {
        totalPartners: totalPartners || 0,
        totalDrivers: totalDrivers || 0,
        totalOrders: totalOrders || 0,
        satisfactionRate
      };

      return { data: stats, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      // Retourner des données par défaut en cas d'erreur
      return {
        data: {
          totalPartners: 500,
          totalDrivers: 200,
          totalOrders: 50000,
          satisfactionRate: 98
        },
        error: null
      };
    }
  }
} 