import { supabase } from '@/lib/supabase';

export interface PartnerStats {
  totalPartners: number;
  totalOrders: number;
  satisfactionRate: number;
  activePartners: number;
  totalRevenue: number;
  averageRating: number;
  totalRequests: number;
  pendingRequests: number;
}

export interface BusinessTypeStats {
  id: number;
  name: string;
  icon: string;
  color: string;
  count: number;
  percentage: number;
}

export interface PartnerTestimonial {
  id: number;
  name: string;
  business_name: string;
  content: string;
  rating: number;
  created_at: string;
}

export interface PartnerRequest {
  id: string;
  type: string;
  status: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  business_name?: string;
  business_type?: string;
  business_address?: string;
  vehicle_type?: string;
  vehicle_plate?: string;
  documents: any[];
  notes?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export class PartnerStatsService {
  // Récupérer les statistiques générales des partenaires
  static async getPartnerStats(): Promise<PartnerStats> {
    try {
      // Nombre total de partenaires (tous, pas seulement actifs)
      const { count: totalPartners, error: partnersError } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true });

      if (partnersError) throw partnersError;



      // Nombre total de commandes
      const { count: totalOrders, error: ordersError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      if (ordersError) throw ordersError;

      // Calculer le taux de satisfaction (basé sur les commandes livrées)
      const { count: deliveredOrders, error: deliveredError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'delivered');

      if (deliveredError) throw deliveredError;

      const satisfactionRate = totalOrders > 0 ? Math.round((deliveredOrders || 0) / totalOrders * 100) : 98;

      // Partenaires actifs (ayant reçu au moins une commande dans les 30 derniers jours)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data: recentOrders, error: recentError } = await supabase
        .from('orders')
        .select('business_id')
        .gte('created_at', thirtyDaysAgo);

      if (recentError) throw recentError;

      const activePartners = recentOrders ? new Set(recentOrders.map(order => order.business_id)).size : 0;

      // Revenus totaux (estimation basée sur les commandes)
      const { data: orderAmounts, error: amountsError } = await supabase
        .from('orders')
        .select('grand_total')
        .eq('status', 'delivered');

      if (amountsError) throw amountsError;

      const totalRevenue = orderAmounts?.reduce((sum, order) => sum + (order.grand_total || 0), 0) || 0;

      // Note moyenne des partenaires
      const { data: ratings, error: ratingsError } = await supabase
        .from('businesses')
        .select('rating')
        .not('rating', 'is', null);

      if (ratingsError) throw ratingsError;

      const averageRating = ratings && ratings.length > 0 
        ? Math.round(ratings.reduce((sum, business) => sum + (business.rating || 0), 0) / ratings.length * 10) / 10
        : 4.5;

      // Nombre total de demandes
      const { count: totalRequests, error: requestsError } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'partner');

      if (requestsError) throw requestsError;

      // Nombre de demandes en attente
      const { count: pendingRequests, error: pendingError } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'partner')
        .eq('status', 'pending');



      if (pendingError) throw pendingError;

      const result = {
        totalPartners: totalPartners || 0,
        totalOrders: totalOrders || 0,
        satisfactionRate,
        activePartners,
        totalRevenue,
        averageRating,
        totalRequests: totalRequests || 0,
        pendingRequests: pendingRequests || 0
      };

      return result;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques partenaires:', error);
      // Retourner des données par défaut en cas d'erreur
      return {
        totalPartners: 0,
        totalOrders: 0,
        satisfactionRate: 98,
        activePartners: 0,
        totalRevenue: 0,
        averageRating: 4.5,
        totalRequests: 0,
        pendingRequests: 0
      };
    }
  }

  // Récupérer les statistiques par type de commerce
  static async getBusinessTypeStats(): Promise<BusinessTypeStats[]> {
    try {
      const { data: businessTypes, error: typesError } = await supabase
        .from('business_types')
        .select('*')
        .order('name');

      if (typesError) throw typesError;

      // Compter les commerces par type (tous, pas seulement actifs)
      const businessTypesWithCounts = await Promise.all(
        (businessTypes || []).map(async (businessType) => {
          const { count, error: countError } = await supabase
            .from('businesses')
            .select('*', { count: 'exact', head: true })
            .eq('business_type_id', businessType.id);

          if (countError) {
            console.error('Erreur lors du comptage des commerces:', countError);
          }

          return {
            id: businessType.id,
            name: businessType.name,
            icon: businessType.icon,
            color: businessType.color,
            count: count || 0,
            percentage: 0 // Sera calculé après
          };
        })
      );

      // Calculer les pourcentages
      const totalBusinesses = businessTypesWithCounts.reduce((sum, type) => sum + type.count, 0);
      
      return businessTypesWithCounts.map(type => ({
        ...type,
        percentage: totalBusinesses > 0 ? Math.round((type.count / totalBusinesses) * 100) : 0
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des types de commerce:', error);
      return [];
    }
  }

  // Récupérer les témoignages des partenaires
  static async getPartnerTestimonials(limit: number = 3): Promise<PartnerTestimonial[]> {
    try {
      // Pour l'instant, retourner des témoignages statiques
      // TODO: Créer une table testimonials dans Supabase
      return [
        {
          id: 1,
          name: 'Fatou Diallo',
          business_name: 'Restaurant Le Baoulé',
          content: 'BraPrime a transformé mon restaurant. Mes ventes ont augmenté de 300% en 6 mois !',
          rating: 5,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Mamadou Barry',
          business_name: 'Café Central',
          content: 'Le dashboard est très intuitif. Je gère mes commandes en quelques clics.',
          rating: 5,
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          name: 'Aissatou Camara',
          business_name: 'Market Fresh',
          content: 'Excellente plateforme pour développer mon activité. Je recommande !',
          rating: 5,
          created_at: new Date().toISOString()
        }
      ];
    } catch (error) {
      console.error('Erreur lors de la récupération des témoignages:', error);
      return [];
    }
  }

  // Récupérer la liste des demandes de partenariat
  static async getPartnerRequests(limit: number = 10): Promise<PartnerRequest[]> {
    try {
      const { data, error } = await supabase
        .from('requests')
        .select(`
          id,
          type,
          status,
          user_id,
          user_name,
          user_email,
          user_phone,
          business_name,
          business_type,
          business_address,
          vehicle_type,
          vehicle_plate,
          documents,
          notes,
          admin_notes,
          created_at,
          updated_at,
          reviewed_at,
          reviewed_by
        `)
        .eq('type', 'partner')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erreur lors de la récupération des demandes:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes:', error);
      return [];
    }
  }
} 