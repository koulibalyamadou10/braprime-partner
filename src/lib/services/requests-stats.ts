import { supabase } from '@/lib/supabase';

export interface RequestsPageStats {
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  partner_requests: number;
  driver_requests: number;
  recent_requests: Array<{
    id: string;
    type: 'partner' | 'driver';
    status: string;
    created_at: string;
    name: string;
  }>;
}

export class RequestsStatsService {
  static async getRequestsPageStats(): Promise<RequestsPageStats> {
    try {
      // Récupérer les statistiques des demandes partenaires
      const { data: partnerRequests, error: partnerError } = await supabase
        .from('businesses')
        .select('id, name, request_status, created_at')
        .not('request_status', 'is', null);

      if (partnerError) throw partnerError;

      // Récupérer les statistiques des demandes chauffeurs
      const { data: driverRequests, error: driverError } = await supabase
        .from('drivers')
        .select('id, name, request_status, created_at')
        .not('request_status', 'is', null);

      if (driverError) throw driverError;

      // Combiner et analyser les données
      const allRequests = [
        ...(partnerRequests?.map(req => ({ ...req, type: 'partner' as const })) || []),
        ...(driverRequests?.map(req => ({ ...req, type: 'driver' as const })) || [])
      ];

      const stats: RequestsPageStats = {
        total_requests: allRequests.length,
        pending_requests: allRequests.filter(req => req.request_status === 'pending').length,
        approved_requests: allRequests.filter(req => req.request_status === 'approved').length,
        rejected_requests: allRequests.filter(req => req.request_status === 'rejected').length,
        partner_requests: allRequests.filter(req => req.type === 'partner').length,
        driver_requests: allRequests.filter(req => req.type === 'driver').length,
        recent_requests: allRequests
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 10)
          .map(req => ({
            id: req.id,
            type: req.type,
            status: req.request_status,
            created_at: req.created_at,
            name: req.name
          }))
      };

      return stats;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }
} 