import { supabase } from '@/lib/supabase';

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email?: string;
  business_id: number;
  is_active: boolean;
  current_location?: any;
  current_order_id?: string;
  rating: number;
  total_deliveries: number;
  vehicle_type?: string;
  vehicle_plate?: string;
  total_earnings: number;
  is_verified: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export class DriverService {
  // Récupérer les livreurs d'un business
  static async getBusinessDrivers(businessId: number): Promise<{ drivers: Driver[] | null; error: string | null }> {
    try {
      const { data: drivers, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur récupération livreurs:', error);
        return { drivers: null, error: error.message };
      }

      return { drivers: drivers || [], error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des livreurs:', error);
      return { drivers: null, error: 'Erreur lors de la récupération des livreurs' };
    }
  }

  // Récupérer les livreurs disponibles (actifs et sans commande en cours)
  static async getAvailableDrivers(businessId: number): Promise<{ drivers: Driver[] | null; error: string | null }> {
    try {
      const { data: drivers, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .is('current_order_id', null)
        .order('rating', { ascending: false });

      if (error) {
        console.error('Erreur récupération livreurs disponibles:', error);
        return { drivers: null, error: error.message };
      }

      return { drivers: drivers || [], error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des livreurs disponibles:', error);
      return { drivers: null, error: 'Erreur lors de la récupération des livreurs disponibles' };
    }
  }

  // Assigner un livreur à une commande
  static async assignDriverToOrder(
    driverId: string, 
    orderId: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      // Vérifier que le livreur est disponible
      const { data: driver, error: driverError } = await supabase
        .from('drivers')
        .select('*')
        .eq('id', driverId)
        .eq('is_active', true)
        .is('current_order_id', null)
        .single();

      if (driverError || !driver) {
        return { success: false, error: 'Livreur non disponible' };
      }

      // Mettre à jour le livreur avec la commande assignée
      const { error: updateError } = await supabase
        .from('drivers')
        .update({ 
          current_order_id: orderId,
          updated_at: new Date().toISOString()
        })
        .eq('id', driverId);

      if (updateError) {
        console.error('Erreur assignation livreur:', updateError);
        return { success: false, error: updateError.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur lors de l\'assignation du livreur:', error);
      return { success: false, error: 'Erreur lors de l\'assignation du livreur' };
    }
  }

  // Libérer un livreur (retirer l'assignation de commande)
  static async releaseDriver(driverId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ 
          current_order_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', driverId);

      if (error) {
        console.error('Erreur libération livreur:', error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur lors de la libération du livreur:', error);
      return { success: false, error: 'Erreur lors de la libération du livreur' };
    }
  }

  // Mettre à jour la position d'un livreur
  static async updateDriverLocation(
    driverId: string, 
    location: { lat: number; lng: number }
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ 
          current_location: location,
          updated_at: new Date().toISOString()
        })
        .eq('id', driverId);

      if (error) {
        console.error('Erreur mise à jour position livreur:', error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la position:', error);
      return { success: false, error: 'Erreur lors de la mise à jour de la position' };
    }
  }

  // Ajouter un livreur
  static async addDriver(driverData: {
    name: string;
    phone: string;
    email?: string;
    business_id: number;
    vehicle_type?: string;
    vehicle_plate?: string;
  }): Promise<{ driver: Driver | null; error: string | null }> {
    try {
      const { data: driver, error } = await supabase
        .from('drivers')
        .insert([{
          ...driverData,
          is_active: true,
          rating: 0,
          total_deliveries: 0,
          total_earnings: 0,
          is_verified: false
        }])
        .select()
        .single();

      if (error) {
        console.error('Erreur ajout livreur:', error);
        return { driver: null, error: error.message };
      }

      return { driver, error: null };
    } catch (error) {
      console.error('Erreur lors de l\'ajout du livreur:', error);
      return { driver: null, error: 'Erreur lors de l\'ajout du livreur' };
    }
  }

  // Mettre à jour un livreur
  static async updateDriver(
    driverId: string, 
    updates: Partial<Driver>
  ): Promise<{ driver: Driver | null; error: string | null }> {
    try {
      const { data: driver, error } = await supabase
        .from('drivers')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', driverId)
        .select()
        .single();

      if (error) {
        console.error('Erreur mise à jour livreur:', error);
        return { driver: null, error: error.message };
      }

      return { driver, error: null };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du livreur:', error);
      return { driver: null, error: 'Erreur lors de la mise à jour du livreur' };
    }
  }

  // Supprimer un livreur
  static async deleteDriver(driverId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', driverId);

      if (error) {
        console.error('Erreur suppression livreur:', error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur lors de la suppression du livreur:', error);
      return { success: false, error: 'Erreur lors de la suppression du livreur' };
    }
  }
} 