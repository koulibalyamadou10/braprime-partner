import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface DriverManagementData {
  id: string;
  name: string;
  email: string;
  phone: string;
  driver_type: 'independent' | 'service';
  business_id?: number;
  business_name?: string;
  is_verified: boolean;
  is_active: boolean;
  avatar_url?: string;
  vehicle_type?: string;
  vehicle_plate?: string;
  documents_count: number;
  total_deliveries: number;
  total_earnings: number;
  rating: number;
  active_sessions: number;
  created_at: string;
  last_active?: string;
}

export interface DriverCreateData {
  name: string;
  email: string;
  phone: string;
  password: string;
  driver_type: 'independent' | 'service';
  business_id?: number;
  vehicle_type?: string;
  vehicle_plate?: string;
}

export interface DriverUpdateData {
  name?: string;
  phone?: string;
  vehicle_type?: string;
  vehicle_plate?: string;
  is_verified?: boolean;
  is_active?: boolean;
  business_id?: number;
}

export interface DriverFilters {
  driver_type?: 'independent' | 'service';
  is_verified?: boolean;
  is_active?: boolean;
  business_id?: number;
  search?: string;
}

export class DriverManagementService {
  // Récupérer tous les livreurs avec filtres et pagination
  static async getDrivers(
    filters: DriverFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{ drivers: DriverManagementData[]; total: number; error?: string }> {
    try {
      let query = supabase
        .from('drivers')
        .select(`
          *,
          businesses!drivers_business_id_fkey (
            name
          )
        `, { count: 'exact' });

      // Appliquer les filtres
      if (filters.driver_type) {
        query = query.eq('driver_type', filters.driver_type);
      }
      if (filters.is_verified !== undefined) {
        query = query.eq('is_verified', filters.is_verified);
      }
      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }
      if (filters.business_id) {
        query = query.eq('business_id', filters.business_id);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
      }

      // Pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to).order('created_at', { ascending: false });

      const { data: drivers, error, count } = await query;

      if (error) {
        throw new Error(error.message);
      }

      const driversData: DriverManagementData[] = (drivers || []).map(driver => ({
        id: driver.id,
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        driver_type: driver.driver_type,
        business_id: driver.business_id,
        business_name: driver.businesses?.name,
        is_verified: driver.is_verified,
        is_active: driver.is_active,
        avatar_url: driver.avatar_url,
        vehicle_type: driver.vehicle_type,
        vehicle_plate: driver.vehicle_plate,
        documents_count: driver.documents_count || 0,
        total_deliveries: driver.total_deliveries || 0,
        total_earnings: driver.total_earnings || 0,
        rating: driver.rating || 0,
        active_sessions: driver.active_sessions || 0,
        created_at: driver.created_at,
        last_active: driver.last_active
      }));

      return { drivers: driversData, total: count || 0 };
    } catch (error) {
      console.error('Erreur lors de la récupération des livreurs:', error);
      return { 
        drivers: [], 
        total: 0, 
        error: error instanceof Error ? error.message : 'Erreur lors de la récupération' 
      };
    }
  }

  // Récupérer un livreur par ID
  static async getDriverById(driverId: string): Promise<{ driver?: DriverManagementData; error?: string }> {
    try {
      const { data: driver, error } = await supabase
        .from('drivers')
        .select(`
          *,
          businesses!drivers_business_id_fkey (
            name
          )
        `)
        .eq('id', driverId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (!driver) {
        throw new Error('Livreur non trouvé');
      }

      const driverData: DriverManagementData = {
        id: driver.id,
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        driver_type: driver.driver_type,
        business_id: driver.business_id,
        business_name: driver.businesses?.name,
        is_verified: driver.is_verified,
        is_active: driver.is_active,
        avatar_url: driver.avatar_url,
        vehicle_type: driver.vehicle_type,
        vehicle_plate: driver.vehicle_plate,
        documents_count: driver.documents_count || 0,
        total_deliveries: driver.total_deliveries || 0,
        total_earnings: driver.total_earnings || 0,
        rating: driver.rating || 0,
        active_sessions: driver.active_sessions || 0,
        created_at: driver.created_at,
        last_active: driver.last_active
      };

      return { driver: driverData };
    } catch (error) {
      console.error('Erreur lors de la récupération du livreur:', error);
      return { error: error instanceof Error ? error.message : 'Erreur lors de la récupération' };
    }
  }

  // Créer un nouveau livreur
  static async createDriver(driverData: DriverCreateData): Promise<{ driver?: DriverManagementData; error?: string }> {
    try {
      // 1. Créer l'utilisateur dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: driverData.email,
        password: driverData.password,
        email_confirm: true,
        user_metadata: {
          role: 'driver',
          name: driverData.name,
          phone: driverData.phone
        }
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Erreur lors de la création du compte');
      }

      // 2. Créer le profil livreur
      const { data: driverProfile, error: profileError } = await supabase
        .from('drivers')
        .insert({
          id: authData.user.id,
          name: driverData.name,
          email: driverData.email,
          phone: driverData.phone,
          driver_type: driverData.driver_type,
          business_id: driverData.business_id || null,
          vehicle_type: driverData.vehicle_type || null,
          vehicle_plate: driverData.vehicle_plate || null,
          is_verified: false,
          is_active: true,
          total_deliveries: 0,
          total_earnings: 0,
          rating: 0,
          active_sessions: 0
        })
        .select()
        .single();

      if (profileError) {
        // Supprimer l'utilisateur créé si le profil échoue
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw new Error(profileError.message);
      }

      // 3. Récupérer les données complètes
      return await this.getDriverById(authData.user.id);
    } catch (error) {
      console.error('Erreur lors de la création du livreur:', error);
      return { error: error instanceof Error ? error.message : 'Erreur lors de la création' };
    }
  }

  // Mettre à jour un livreur
  static async updateDriver(
    driverId: string, 
    updateData: DriverUpdateData
  ): Promise<{ driver?: DriverManagementData; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .update(updateData)
        .eq('id', driverId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Récupérer les données complètes mises à jour
      return await this.getDriverById(driverId);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du livreur:', error);
      return { error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour' };
    }
  }

  // Supprimer un livreur
  static async deleteDriver(driverId: string): Promise<{ error?: string }> {
    try {
      // 1. Supprimer le profil livreur
      const { error: profileError } = await supabase
        .from('drivers')
        .delete()
        .eq('id', driverId);

      if (profileError) {
        throw new Error(profileError.message);
      }

      // 2. Supprimer l'utilisateur auth
      const { error: authError } = await supabase.auth.admin.deleteUser(driverId);

      if (authError) {
        console.warn('Erreur lors de la suppression de l\'utilisateur auth:', authError);
        // Ne pas faire échouer l'opération si la suppression auth échoue
      }

      toast.success('Livreur supprimé avec succès');
      return {};
    } catch (error) {
      console.error('Erreur lors de la suppression du livreur:', error);
      return { error: error instanceof Error ? error.message : 'Erreur lors de la suppression' };
    }
  }

  // Activer/Désactiver un livreur
  static async toggleDriverStatus(driverId: string, isActive: boolean): Promise<{ error?: string }> {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ is_active: isActive })
        .eq('id', driverId);

      if (error) {
        throw new Error(error.message);
      }

      toast.success(`Livreur ${isActive ? 'activé' : 'désactivé'} avec succès`);
      return {};
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      return { error: error instanceof Error ? error.message : 'Erreur lors du changement de statut' };
    }
  }

  // Vérifier un livreur
  static async verifyDriver(driverId: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ is_verified: true })
        .eq('id', driverId);

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Livreur vérifié avec succès');
      return {};
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      return { error: error instanceof Error ? error.message : 'Erreur lors de la vérification' };
    }
  }

  // Récupérer les statistiques des livreurs
  static async getDriverStats(): Promise<{ stats: any; error?: string }> {
    try {
      // Statistiques globales
      const { data: totalDrivers, error: totalError } = await supabase
        .from('drivers')
        .select('id', { count: 'exact' });

      const { data: activeDrivers, error: activeError } = await supabase
        .from('drivers')
        .select('id', { count: 'exact' })
        .eq('is_active', true);

      const { data: verifiedDrivers, error: verifiedError } = await supabase
        .from('drivers')
        .select('id', { count: 'exact' })
        .eq('is_verified', true);

      const { data: independentDrivers, error: independentError } = await supabase
        .from('drivers')
        .select('id', { count: 'exact' })
        .eq('driver_type', 'independent');

      const { data: serviceDrivers, error: serviceError } = await supabase
        .from('drivers')
        .select('id', { count: 'exact' })
        .eq('driver_type', 'service');

      if (totalError || activeError || verifiedError || independentError || serviceError) {
        throw new Error('Erreur lors du calcul des statistiques');
      }

      const stats = {
        total: totalDrivers?.length || 0,
        active: activeDrivers?.length || 0,
        verified: verifiedDrivers?.length || 0,
        independent: independentDrivers?.length || 0,
        service: serviceDrivers?.length || 0,
        pending_verification: (totalDrivers?.length || 0) - (verifiedDrivers?.length || 0),
        inactive: (totalDrivers?.length || 0) - (activeDrivers?.length || 0)
      };

      return { stats };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      return { 
        stats: {}, 
        error: error instanceof Error ? error.message : 'Erreur lors du calcul des statistiques' 
      };
    }
  }

  // Récupérer les livreurs d'un service/commerce
  static async getServiceDrivers(businessId: number): Promise<{ drivers: DriverManagementData[]; error?: string }> {
    try {
      const { data: drivers, error } = await supabase
        .from('drivers')
        .select(`
          *,
          businesses!drivers_business_id_fkey (
            name
          )
        `)
        .eq('business_id', businessId)
        .order('name');

      if (error) {
        throw new Error(error.message);
      }

      const driversData: DriverManagementData[] = (drivers || []).map(driver => ({
        id: driver.id,
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        driver_type: driver.driver_type,
        business_id: driver.business_id,
        business_name: driver.businesses?.name,
        is_verified: driver.is_verified,
        is_active: driver.is_active,
        avatar_url: driver.avatar_url,
        vehicle_type: driver.vehicle_type,
        vehicle_plate: driver.vehicle_plate,
        documents_count: driver.documents_count || 0,
        total_deliveries: driver.total_deliveries || 0,
        total_earnings: driver.total_earnings || 0,
        rating: driver.rating || 0,
        active_sessions: driver.active_sessions || 0,
        created_at: driver.created_at,
        last_active: driver.last_active
      }));

      return { drivers: driversData };
    } catch (error) {
      console.error('Erreur lors de la récupération des livreurs du service:', error);
      return { 
        drivers: [], 
        error: error instanceof Error ? error.message : 'Erreur lors de la récupération' 
      };
    }
  }

  // Réinitialiser le mot de passe d'un livreur
  static async resetDriverPassword(driverId: string, newPassword: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.admin.updateUserById(driverId, {
        password: newPassword
      });

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Mot de passe réinitialisé avec succès');
      return {};
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      return { error: error instanceof Error ? error.message : 'Erreur lors de la réinitialisation' };
    }
  }

  // Envoyer un email de réinitialisation
  static async sendPasswordResetEmail(email: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/driver/reset-password`
      });

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Email de réinitialisation envoyé');
      return {};
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      return { error: error instanceof Error ? error.message : 'Erreur lors de l\'envoi' };
    }
  }
} 