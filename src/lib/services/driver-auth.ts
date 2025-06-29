import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface DriverAuthData {
  id: string;
  email: string;
  phone: string;
  name: string;
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
}

export interface DriverRegistrationData {
  email: string;
  phone: string;
  name: string;
  password: string;
  driver_type: 'independent' | 'service';
  business_id?: number;
  vehicle_type?: string;
  vehicle_plate?: string;
}

export interface DriverLoginData {
  email: string;
  password: string;
}

export interface DriverUpdateData {
  name?: string;
  phone?: string;
  vehicle_type?: string;
  vehicle_plate?: string;
  avatar_url?: string;
}

export class DriverAuthService {
  // Inscription d'un nouveau livreur
  static async register(driverData: DriverRegistrationData): Promise<{ driver?: DriverAuthData; error?: string }> {
    try {
      // 1. Créer l'utilisateur dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: driverData.email,
        password: driverData.password,
        options: {
          data: {
            role: 'driver',
            name: driverData.name,
            phone: driverData.phone
          }
        }
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Erreur lors de la création du compte');
      }

      // 2. Créer le profil livreur dans la table drivers
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

      // 3. Récupérer les données complètes du livreur
      const { data: completeDriver, error: fetchError } = await this.getDriverById(authData.user.id);

      if (fetchError) {
        throw new Error(fetchError);
      }

      toast.success('Compte livreur créé avec succès ! Vérifiez votre email pour confirmer votre compte.');
      return { driver: completeDriver };

    } catch (error) {
      console.error('Erreur lors de l\'inscription du livreur:', error);
      return { error: error instanceof Error ? error.message : 'Erreur lors de l\'inscription' };
    }
  }

  // Connexion d'un livreur
  static async login(loginData: DriverLoginData): Promise<{ driver?: DriverAuthData; error?: string }> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Identifiants invalides');
      }

      // Vérifier que l'utilisateur est bien un livreur
      const { data: driver, error: driverError } = await this.getDriverById(authData.user.id);

      if (driverError) {
        throw new Error('Profil livreur non trouvé');
      }

      if (!driver.is_active) {
        throw new Error('Votre compte est désactivé. Contactez l\'administrateur.');
      }

      toast.success(`Bienvenue ${driver.name} !`);
      return { driver };

    } catch (error) {
      console.error('Erreur lors de la connexion du livreur:', error);
      return { error: error instanceof Error ? error.message : 'Erreur lors de la connexion' };
    }
  }

  // Déconnexion
  static async logout(): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
      toast.success('Déconnexion réussie');
      return {};
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      return { error: error instanceof Error ? error.message : 'Erreur lors de la déconnexion' };
    }
  }

  // Récupérer le livreur connecté
  static async getCurrentDriver(): Promise<{ driver?: DriverAuthData; error?: string }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return { error: 'Utilisateur non connecté' };
      }

      return await this.getDriverById(user.id);
    } catch (error) {
      console.error('Erreur lors de la récupération du livreur connecté:', error);
      return { error: error instanceof Error ? error.message : 'Erreur lors de la récupération' };
    }
  }

  // Récupérer un livreur par ID
  static async getDriverById(driverId: string): Promise<{ driver?: DriverAuthData; error?: string }> {
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

      // Transformer les données
      const driverData: DriverAuthData = {
        id: driver.id,
        email: driver.email,
        phone: driver.phone,
        name: driver.name,
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
        created_at: driver.created_at
      };

      return { driver: driverData };
    } catch (error) {
      console.error('Erreur lors de la récupération du livreur:', error);
      return { error: error instanceof Error ? error.message : 'Erreur lors de la récupération' };
    }
  }

  // Mettre à jour le profil du livreur
  static async updateDriverProfile(driverId: string, updateData: DriverUpdateData): Promise<{ driver?: DriverAuthData; error?: string }> {
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
      console.error('Erreur lors de la mise à jour du profil:', error);
      return { error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour' };
    }
  }

  // Changer le mot de passe
  static async changePassword(currentPassword: string, newPassword: string): Promise<{ error?: string }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('Utilisateur non connecté');
      }

      // Vérifier l'ancien mot de passe
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword
      });

      if (signInError) {
        throw new Error('Mot de passe actuel incorrect');
      }

      // Changer le mot de passe
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        throw new Error(updateError.message);
      }

      toast.success('Mot de passe modifié avec succès');
      return {};
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      return { error: error instanceof Error ? error.message : 'Erreur lors du changement de mot de passe' };
    }
  }

  // Réinitialiser le mot de passe
  static async resetPassword(email: string): Promise<{ error?: string }> {
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
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      return { error: error instanceof Error ? error.message : 'Erreur lors de la réinitialisation' };
    }
  }

  // Vérifier si un email existe déjà
  static async checkEmailExists(email: string): Promise<{ exists: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('id')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(error.message);
      }

      return { exists: !!data };
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'email:', error);
      return { exists: false, error: error instanceof Error ? error.message : 'Erreur lors de la vérification' };
    }
  }

  // Récupérer les livreurs d'un service/commerce
  static async getServiceDrivers(businessId: number): Promise<{ drivers?: DriverAuthData[]; error?: string }> {
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
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw new Error(error.message);
      }

      const driversData: DriverAuthData[] = drivers.map(driver => ({
        id: driver.id,
        email: driver.email,
        phone: driver.phone,
        name: driver.name,
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
        created_at: driver.created_at
      }));

      return { drivers: driversData };
    } catch (error) {
      console.error('Erreur lors de la récupération des livreurs du service:', error);
      return { error: error instanceof Error ? error.message : 'Erreur lors de la récupération' };
    }
  }

  // Activer/Désactiver un livreur (admin)
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

  // Vérifier un livreur (admin)
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
} 