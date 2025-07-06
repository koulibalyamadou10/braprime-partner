import { supabase } from '@/lib/supabase';
import { Request } from '@/lib/types';

export interface CreateRequestData {
  type: 'partner' | 'driver';
  business_name?: string;
  business_type?: string;
  business_address?: string;
  vehicle_type?: string;
  vehicle_plate?: string;
  notes?: string;
}

export class RequestsService {
  // Créer une nouvelle demande
  static async createRequest(data: CreateRequestData): Promise<{ data: string | null; error: string | null }> {
    try {
      const { data: result, error } = await supabase
        .rpc('create_request', {
          p_type: data.type,
          p_business_name: data.business_name,
          p_business_type: data.business_type,
          p_business_address: data.business_address,
          p_vehicle_type: data.vehicle_type,
          p_vehicle_plate: data.vehicle_plate,
          p_notes: data.notes
        });

      if (error) {
        console.error('Erreur lors de la création de la demande:', error);
        return { data: null, error: error.message };
      }

      return { data: result, error: null };
    } catch (error) {
      console.error('Erreur lors de la création de la demande:', error);
      return { data: null, error: 'Erreur lors de la création de la demande' };
    }
  }

  // Récupérer les demandes de l'utilisateur connecté
  static async getUserRequests(): Promise<{ data: Request[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des demandes:', error);
        return { data: null, error: error.message };
      }

      const requests: Request[] = data?.map(item => ({
        id: item.id,
        type: item.type,
        status: item.status,
        user_id: item.user_id,
        user_name: item.user_name,
        user_email: item.user_email,
        user_phone: item.user_phone,
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
        .select('*')
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
        user_name: data.user_name,
        user_email: data.user_email,
        user_phone: data.user_phone,
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

  // Mettre à jour une demande (seulement si elle est en attente)
  static async updateRequest(
    id: string, 
    updates: Partial<CreateRequestData>
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('requests')
        .update(updates)
        .eq('id', id)
        .eq('status', 'pending');

      if (error) {
        console.error('Erreur lors de la mise à jour de la demande:', error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la demande:', error);
      return { success: false, error: 'Erreur lors de la mise à jour de la demande' };
    }
  }

  // Annuler une demande (seulement si elle est en attente)
  static async cancelRequest(id: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('requests')
        .delete()
        .eq('id', id)
        .eq('status', 'pending');

      if (error) {
        console.error('Erreur lors de l\'annulation de la demande:', error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la demande:', error);
      return { success: false, error: 'Erreur lors de l\'annulation de la demande' };
    }
  }

  // Vérifier si l'utilisateur a une demande en cours
  static async hasPendingRequest(): Promise<{ data: boolean; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('requests')
        .select('id')
        .in('status', ['pending', 'under_review'])
        .limit(1);

      if (error) {
        console.error('Erreur lors de la vérification des demandes:', error);
        return { data: false, error: error.message };
      }

      return { data: (data?.length || 0) > 0, error: null };
    } catch (error) {
      console.error('Erreur lors de la vérification des demandes:', error);
      return { data: false, error: 'Erreur lors de la vérification des demandes' };
    }
  }

  // Obtenir le statut de la demande en cours
  static async getCurrentRequestStatus(): Promise<{ data: string | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('requests')
        .select('status')
        .in('status', ['pending', 'under_review'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Aucune demande trouvée
          return { data: null, error: null };
        }
        console.error('Erreur lors de la récupération du statut:', error);
        return { data: null, error: error.message };
      }

      return { data: data.status, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération du statut:', error);
      return { data: null, error: 'Erreur lors de la récupération du statut' };
    }
  }
} 