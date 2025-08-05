import { supabase } from '@/lib/supabase';

export interface DriverRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicle_type: string;
  vehicle_plate?: string;
  driver_type: 'independent' | 'service';
  experience_years?: number;
  availability_hours?: string;
  preferred_zones?: string[];
  notes?: string;
  request_status: 'pending' | 'approved' | 'rejected';
  request_notes?: string;
  application_date: string;
  reviewed_at?: string;
  reviewed_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DriverRequestFilters {
  status?: string;
  search?: string;
  vehicle_type?: string;
  driver_type?: string;
}

export interface DriverRequestStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface DriverAccountCredentials {
  email: string;
  password: string;
  driverName: string;
  dashboardUrl: string;
}

export class AdminDriverRequestsService {
  // Récupérer toutes les demandes de chauffeurs
  static async getDriverRequests(filters: DriverRequestFilters = {}): Promise<DriverRequest[]> {
    try {
      let query = supabase
        .from('drivers')
        .select('*')
        .order('created_at', { ascending: false });

      // Appliquer les filtres
      if (filters.status && filters.status !== 'all') {
        query = query.eq('request_status', filters.status);
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
      }

      if (filters.vehicle_type) {
        query = query.eq('vehicle_type', filters.vehicle_type);
      }

      if (filters.driver_type) {
        query = query.eq('driver_type', filters.driver_type);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erreur lors de la récupération des demandes de chauffeurs:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur dans getDriverRequests:', error);
      throw error;
    }
  }

  // Récupérer les statistiques des demandes de chauffeurs
  static async getDriverRequestStats(): Promise<DriverRequestStats> {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('request_status');

      if (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        throw error;
      }

      const stats = {
        total: data?.length || 0,
        pending: data?.filter(d => d.request_status === 'pending').length || 0,
        approved: data?.filter(d => d.request_status === 'approved').length || 0,
        rejected: data?.filter(d => d.request_status === 'rejected').length || 0
      };

      return stats;
    } catch (error) {
      console.error('Erreur dans getDriverRequestStats:', error);
      throw error;
    }
  }

  // Approuver une demande de chauffeur
  static async approveDriverRequest(driverId: string, adminNotes?: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Utiliser la fonction PostgreSQL pour approuver et créer le compte
      const { data, error } = await supabase
        .rpc('approve_driver_request_with_account', {
          p_driver_id: driverId,
          p_admin_notes: adminNotes || ''
        });

      if (error) {
        console.error('Erreur approbation chauffeur:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur dans approveDriverRequest:', error);
      return { success: false, error: 'Erreur lors de l\'approbation' };
    }
  }

  // Rejeter une demande de chauffeur
  static async rejectDriverRequest(driverId: string, reason: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .rpc('reject_driver_request', {
          p_driver_id: driverId,
          p_reason: reason
        });

      if (error) {
        console.error('Erreur rejet demande chauffeur:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur dans rejectDriverRequest:', error);
      return { success: false, error: 'Erreur lors du rejet' };
    }
  }

  // Créer un compte chauffeur avec identifiants
  static async createDriverAccount(driverId: string): Promise<{ 
    success: boolean; 
    error?: string; 
    credentials?: DriverAccountCredentials 
  }> {
    try {
      // Récupérer les informations du chauffeur
      const { data: driver, error: driverError } = await supabase
        .from('drivers')
        .select('*')
        .eq('id', driverId)
        .single();

      if (driverError || !driver) {
        return { success: false, error: 'Chauffeur non trouvé' };
      }

      // Vérifier que la demande est approuvée
      if (driver.request_status !== 'approved') {
        return { success: false, error: 'La demande doit être approuvée avant de créer un compte' };
      }

      // Vérifier si un compte existe déjà
      if (driver.user_id) {
        return { success: false, error: 'Un compte existe déjà pour ce chauffeur' };
      }

      // Utiliser la fonction PostgreSQL pour créer le compte
      const { data, error } = await supabase
        .rpc('approve_driver_request_with_account', {
          p_driver_id: driverId,
          p_admin_notes: ''
        });

      if (error) {
        console.error('Erreur création compte chauffeur:', error);
        return { success: false, error: error.message };
      }

      if (!data || !data.success) {
        return { success: false, error: data?.error || 'Erreur lors de la création du compte' };
      }

      // Retourner les identifiants
      const credentials: DriverAccountCredentials = {
        email: data.credentials.email,
        password: data.credentials.password,
        driverName: data.credentials.driverName,
        dashboardUrl: data.credentials.dashboardUrl
      };

      return { success: true, credentials };
    } catch (error) {
      console.error('Erreur dans createDriverAccount:', error);
      return { success: false, error: 'Erreur lors de la création du compte' };
    }
  }

  // Supprimer une demande de chauffeur
  static async deleteDriverRequest(driverId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', driverId);

      if (error) {
        console.error('Erreur suppression demande chauffeur:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur dans deleteDriverRequest:', error);
      return { success: false, error: 'Erreur lors de la suppression' };
    }
  }

  // Générer un mot de passe sécurisé
  private static generatePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
} 