import { supabase } from '../supabase';

export interface DriverAuthProfile {
  id: string;
  user_id: string;
  driver_id: string;
  phone: string;
  email?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DriverAuthData {
  driver_id: string;
  driver_name: string;
  phone: string;
  email?: string;
  vehicle_type?: string;
  vehicle_plate?: string;
  business_id: number;
  business_name: string;
}

export class DriverAuthService {
  // Récupérer le profil d'authentification du livreur connecté
  static async getCurrentDriverProfile(): Promise<{ profile: DriverAuthProfile | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { profile: null, error: 'Utilisateur non connecté' };
      }

      const { data: profile, error } = await supabase
        .from('driver_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Erreur récupération profil livreur:', error);
        return { profile: null, error: error.message };
      }

      return { profile, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération du profil livreur:', error);
      return { profile: null, error: 'Erreur lors de la récupération du profil livreur' };
    }
  }

  // Récupérer les données complètes du livreur connecté
  static async getCurrentDriverData(): Promise<{ driver: DriverAuthData | null; error: string | null }> {
    try {
      const { profile, error: profileError } = await this.getCurrentDriverProfile();
      
      if (profileError || !profile) {
        return { driver: null, error: profileError || 'Profil livreur non trouvé' };
      }

      const { data: driver, error } = await supabase
        .from('drivers')
        .select(`
          id,
          name,
          phone,
          email,
          vehicle_type,
          vehicle_plate,
          business_id,
          businesses!inner(name)
        `)
        .eq('id', profile.driver_id)
        .single();

      if (error) {
        console.error('Erreur récupération données livreur:', error);
        return { driver: null, error: error.message };
      }

      const driverData: DriverAuthData = {
        driver_id: driver.id,
        driver_name: driver.name,
        phone: driver.phone,
        email: driver.email,
        vehicle_type: driver.vehicle_type,
        vehicle_plate: driver.vehicle_plate,
        business_id: driver.business_id,
        business_name: driver.businesses.name
      };

      return { driver: driverData, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des données livreur:', error);
      return { driver: null, error: 'Erreur lors de la récupération des données livreur' };
    }
  }

  // Vérifier si l'utilisateur connecté est un livreur
  static async isDriver(): Promise<{ isDriver: boolean; error: string | null }> {
    try {
      const { profile, error } = await this.getCurrentDriverProfile();
      
      if (error) {
        return { isDriver: false, error };
      }

      return { isDriver: !!profile, error: null };
    } catch (error) {
      console.error('Erreur lors de la vérification du rôle livreur:', error);
      return { isDriver: false, error: 'Erreur lors de la vérification du rôle livreur' };
    }
  }

  // Connexion d'un livreur avec email/téléphone
  static async signInDriver(email: string, password: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Erreur connexion livreur:', error);
        return { success: false, error: error.message };
      }

      // Vérifier que l'utilisateur est bien un livreur
      const { isDriver, error: roleError } = await this.isDriver();
      
      if (roleError || !isDriver) {
        // Déconnecter l'utilisateur s'il n'est pas un livreur
        await supabase.auth.signOut();
        return { success: false, error: 'Accès réservé aux livreurs' };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur lors de la connexion livreur:', error);
      return { success: false, error: 'Erreur lors de la connexion' };
    }
  }

  // Connexion d'un livreur avec téléphone (OTP)
  static async signInDriverWithPhone(phone: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone
      });

      if (error) {
        console.error('Erreur connexion livreur par téléphone:', error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur lors de la connexion livreur par téléphone:', error);
      return { success: false, error: 'Erreur lors de la connexion par téléphone' };
    }
  }

  // Vérifier l'OTP et connecter le livreur
  static async verifyOTPAndSignIn(phone: string, token: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms'
      });

      if (error) {
        console.error('Erreur vérification OTP:', error);
        return { success: false, error: error.message };
      }

      // Vérifier que l'utilisateur est bien un livreur
      const { isDriver, error: roleError } = await this.isDriver();
      
      if (roleError || !isDriver) {
        // Déconnecter l'utilisateur s'il n'est pas un livreur
        await supabase.auth.signOut();
        return { success: false, error: 'Accès réservé aux livreurs' };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur lors de la vérification OTP:', error);
      return { success: false, error: 'Erreur lors de la vérification OTP' };
    }
  }

  // Déconnexion du livreur
  static async signOutDriver(): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Erreur déconnexion livreur:', error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur lors de la déconnexion livreur:', error);
      return { success: false, error: 'Erreur lors de la déconnexion' };
    }
  }

  // Mettre à jour le profil du livreur
  static async updateDriverProfile(updates: Partial<DriverAuthProfile>): Promise<{ success: boolean; error: string | null }> {
    try {
      const { profile, error: profileError } = await this.getCurrentDriverProfile();
      
      if (profileError || !profile) {
        return { success: false, error: profileError || 'Profil livreur non trouvé' };
      }

      const { error } = await supabase
        .from('driver_profiles')
        .update(updates)
        .eq('id', profile.id);

      if (error) {
        console.error('Erreur mise à jour profil livreur:', error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil livreur:', error);
      return { success: false, error: 'Erreur lors de la mise à jour du profil' };
    }
  }

  // Récupérer les commandes du livreur connecté
  static async getDriverOrders(): Promise<{ orders: any[] | null; error: string | null }> {
    try {
      const { profile, error: profileError } = await this.getCurrentDriverProfile();
      
      if (profileError || !profile) {
        return { orders: null, error: profileError || 'Profil livreur non trouvé' };
      }

      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id,
          customer_name,
          customer_phone,
          delivery_address,
          status,
          total,
          grand_total,
          created_at,
          delivered_at,
          driver_rating,
          driver_comment
        `)
        .eq('driver_id', profile.driver_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur récupération commandes livreur:', error);
        return { orders: null, error: error.message };
      }

      return { orders: orders || [], error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes livreur:', error);
      return { orders: null, error: 'Erreur lors de la récupération des commandes' };
    }
  }

  // Mettre à jour le statut d'une commande
  static async updateOrderStatus(orderId: string, status: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { profile, error: profileError } = await this.getCurrentDriverProfile();
      
      if (profileError || !profile) {
        return { success: false, error: profileError || 'Profil livreur non trouvé' };
      }

      const { error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('driver_id', profile.driver_id);

      if (error) {
        console.error('Erreur mise à jour statut commande:', error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      return { success: false, error: 'Erreur lors de la mise à jour du statut' };
    }
  }

  // Marquer une commande comme livrée
  static async markOrderAsDelivered(orderId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { profile, error: profileError } = await this.getCurrentDriverProfile();
      
      if (profileError || !profile) {
        return { success: false, error: profileError || 'Profil livreur non trouvé' };
      }

      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'delivered',
          delivered_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('driver_id', profile.driver_id);

      if (error) {
        console.error('Erreur marquage commande livrée:', error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur lors du marquage comme livrée:', error);
      return { success: false, error: 'Erreur lors du marquage comme livrée' };
    }
  }
} 