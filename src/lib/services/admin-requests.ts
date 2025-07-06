import { supabase } from '@/lib/supabase';
import { Request, RequestStats, RequestFilters } from '@/lib/types';

export class AdminRequestsService {
  // Récupérer toutes les demandes avec filtres
  static async getRequests(filters: RequestFilters = {}): Promise<{ data: Request[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('requests')
        .select(`
          *,
          user_profiles!requests_user_id_fkey (
            name,
            email,
            phone_number
          )
        `)
        .order('created_at', { ascending: false });

      // Appliquer les filtres
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }
      if (filters.search) {
        query = query.or(`user_name.ilike.%${filters.search}%,business_name.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erreur lors de la récupération des demandes:', error);
        return { data: null, error: error.message };
      }

      // Transformer les données
      const requests: Request[] = data?.map(item => ({
        id: item.id,
        type: item.type,
        status: item.status,
        user_id: item.user_id,
        user_name: item.user_profiles?.name || item.user_name,
        user_email: item.user_profiles?.email || item.user_email,
        user_phone: item.user_profiles?.phone_number || item.user_phone,
        business_name: item.business_name,
        business_type: item.business_type,
        business_address: item.business_address,
        vehicle_type: item.vehicle_type,
        vehicle_plate: item.vehicle_plate,
        documents: item.documents || [],
        notes: item.notes,
        admin_notes: item.admin_notes,
        created_at: item.created_at,
        updated_at: item.updated_at,
        reviewed_at: item.reviewed_at,
        reviewed_by: item.reviewed_by
      })) || [];

      return { data: requests, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes:', error);
      return { data: null, error: 'Erreur lors de la récupération des demandes' };
    }
  }

  // Récupérer une demande spécifique
  static async getRequest(id: string): Promise<{ data: Request | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('requests')
        .select(`
          *,
          user_profiles!requests_user_id_fkey (
            name,
            email,
            phone_number
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération de la demande:', error);
        return { data: null, error: error.message };
      }

      const request: Request = {
        id: data.id,
        type: data.type,
        status: data.status,
        user_id: data.user_id,
        user_name: data.user_profiles?.name || data.user_name,
        user_email: data.user_profiles?.email || data.user_email,
        user_phone: data.user_profiles?.phone_number || data.user_phone,
        business_name: data.business_name,
        business_type: data.business_type,
        business_address: data.business_address,
        vehicle_type: data.vehicle_type,
        vehicle_plate: data.vehicle_plate,
        documents: data.documents || [],
        notes: data.notes,
        admin_notes: data.admin_notes,
        created_at: data.created_at,
        updated_at: data.updated_at,
        reviewed_at: data.reviewed_at,
        reviewed_by: data.reviewed_by
      };

      return { data: request, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération de la demande:', error);
      return { data: null, error: 'Erreur lors de la récupération de la demande' };
    }
  }

  // Mettre à jour le statut d'une demande
  static async updateRequestStatus(
    id: string, 
    status: 'approved' | 'rejected' | 'under_review',
    admin_notes?: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('requests')
        .update({
          status,
          admin_notes,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        return { success: false, error: error.message };
      }

      // Si la demande est approuvée, créer le profil correspondant
      if (status === 'approved') {
        const { data: request } = await this.getRequest(id);
        if (request) {
          await this.createProfileFromRequest(request);
        }
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      return { success: false, error: 'Erreur lors de la mise à jour du statut' };
    }
  }

  // Créer un profil à partir d'une demande approuvée
  private static async createProfileFromRequest(request: Request): Promise<void> {
    try {
      if (request.type === 'partner') {
        // Créer un profil partenaire
        await supabase
          .from('user_profiles')
          .update({
            role_id: 2, // ID du rôle partenaire
            is_verified: true
          })
          .eq('id', request.user_id);

        // Créer le commerce si les informations sont fournies
        if (request.business_name && request.business_address) {
          await supabase
            .from('businesses')
            .insert({
              name: request.business_name,
              business_type_id: this.getBusinessTypeId(request.business_type),
              address: request.business_address,
              owner_id: request.user_id,
              is_active: true
            });
        }
      } else if (request.type === 'driver') {
        // Créer un profil chauffeur
        await supabase
          .from('user_profiles')
          .update({
            role_id: 4, // ID du rôle chauffeur
            is_verified: true
          })
          .eq('id', request.user_id);

        // Créer le profil chauffeur
        await supabase
          .from('drivers')
          .insert({
            user_id: request.user_id,
            name: request.user_name,
            phone: request.user_phone,
            email: request.user_email,
            vehicle_type: request.vehicle_type,
            vehicle_plate: request.vehicle_plate,
            is_verified: true,
            is_active: true
          });
      }
    } catch (error) {
      console.error('Erreur lors de la création du profil:', error);
    }
  }

  // Obtenir l'ID du type de business
  private static getBusinessTypeId(businessType?: string): number {
    const typeMap: Record<string, number> = {
      'restaurant': 1,
      'cafe': 2,
      'market': 3,
      'supermarket': 4,
      'pharmacy': 5,
      'electronics': 6,
      'beauty': 7,
      'hairdressing': 8,
      'hardware': 9,
      'bookstore': 10,
      'document_service': 11
    };
    return typeMap[businessType || 'restaurant'] || 1;
  }

  // Récupérer les statistiques des demandes
  static async getRequestStats(): Promise<{ data: RequestStats | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('requests')
        .select('type, status');

      if (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        return { data: null, error: error.message };
      }

      const stats: RequestStats = {
        total: data?.length || 0,
        pending: data?.filter(r => r.status === 'pending').length || 0,
        approved: data?.filter(r => r.status === 'approved').length || 0,
        rejected: data?.filter(r => r.status === 'rejected').length || 0,
        under_review: data?.filter(r => r.status === 'under_review').length || 0,
        partner_requests: data?.filter(r => r.type === 'partner').length || 0,
        driver_requests: data?.filter(r => r.type === 'driver').length || 0
      };

      return { data: stats, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return { data: null, error: 'Erreur lors de la récupération des statistiques' };
    }
  }

  // Supprimer une demande
  static async deleteRequest(id: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('requests')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la suppression de la demande:', error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur lors de la suppression de la demande:', error);
      return { success: false, error: 'Erreur lors de la suppression de la demande' };
    }
  }

  // Ajouter des notes admin
  static async addAdminNotes(id: string, notes: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('requests')
        .update({
          admin_notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de l\'ajout des notes:', error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur lors de l\'ajout des notes:', error);
      return { success: false, error: 'Erreur lors de l\'ajout des notes' };
    }
  }
} 