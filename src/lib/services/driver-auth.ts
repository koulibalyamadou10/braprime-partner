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
        .from('driver_profiles')
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
      const { driver: driverData, error: driverError } = await this.getDriverById(authData.user.id);

      if (driverError) {
        throw new Error('Profil livreur non trouvé');
      }

      if (!driverData) {
        throw new Error('Profil livreur non trouvé');
      }

      console.log('🔍 Driver récupéré pour connexion:', driverData);

      if (driverData.is_active === false) {
        throw new Error('Votre compte est désactivé. Contactez l\'administrateur.');
      }

      toast.success(`Bienvenue ${driverData.name} !`);
      return { driver: driverData };

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

  // Récupérer un livreur par ID (auth.users ID)
  static async getDriverById(authUserId: string): Promise<{ driver?: DriverAuthData; error?: string }> {
    try {
      console.log('🔍 Recherche du driver avec auth user ID:', authUserId);
      
      // D'abord, vérifier si l'ID est valide
      if (!authUserId || typeof authUserId !== 'string') {
        throw new Error('ID de driver invalide');
      }

      // Vérifier si l'ID est un UUID valide
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(authUserId)) {
        throw new Error('Format d\'ID invalide (UUID attendu)');
      }

      // Récupérer le profil utilisateur pour obtenir l'email
      const { data: userProfile, error: userError } = await supabase
        .from('user_profiles')
        .select(`
          id,
          name,
          email,
          phone_number,
          role_id,
          user_roles (
            name
          )
        `)
        .eq('id', authUserId)
        .single();

      if (userError || !userProfile) {
        console.error('❌ Erreur user_profiles:', userError);
        throw new Error('Profil utilisateur non trouvé');
      }

      console.log('✅ Profil utilisateur trouvé:', userProfile.name, userProfile.email);
      console.log('📋 Rôle utilisateur:', userProfile.user_roles?.name);

      // Vérifier que c'est bien un driver OU qu'il existe dans la table drivers
      const isDriverRole = userProfile.user_roles?.name === 'driver';
      
      if (!isDriverRole) {
        console.log('⚠️ Rôle non-driver détecté, vérification dans la table drivers...');
      }

      // Récupérer le driver directement par email
      const { data: driver, error: driverError } = await supabase
        .from('driver_profiles')
        .select(`
          id,
          name,
          email,
          phone,
          driver_type,
          business_id,
          is_active,
          is_verified,
          vehicle_type,
          vehicle_plate,
          rating,
          total_deliveries,
          total_earnings,
          documents_count,
          active_sessions,
          avatar_url,
          created_at,
          businesses!driver_profiles_business_id_fkey (
            name
          )
        `)
        .eq('email', userProfile.email)
        .single();

      if (driverError || !driver) {
        console.error('❌ Aucun driver trouvé par email:', userProfile.email);
        if (!isDriverRole) {
          throw new Error('Utilisateur non autorisé (rôle driver requis et non trouvé dans la table drivers)');
        } else {
          throw new Error('Profil livreur non trouvé');
        }
      }

      console.log('✅ Driver trouvé par email:', driver.name, driver.email);

      // Si le rôle n'était pas correct, on peut le corriger automatiquement
      if (!isDriverRole) {
        console.log('🔄 Correction automatique du rôle utilisateur...');
        try {
          // Trouver l'ID du rôle driver
          const { data: driverRole, error: roleError } = await supabase
            .from('user_roles')
            .select('id')
            .eq('name', 'driver')
            .single();

          if (!roleError && driverRole) {
            // Mettre à jour le rôle de l'utilisateur
            const { error: updateError } = await supabase
              .from('user_profiles')
              .update({ role_id: driverRole.id })
              .eq('id', authUserId);

            if (!updateError) {
              console.log('✅ Rôle utilisateur corrigé automatiquement');
            } else {
              console.warn('⚠️ Impossible de corriger le rôle:', updateError);
            }
          }
        } catch (roleUpdateError) {
          console.warn('⚠️ Erreur lors de la correction du rôle:', roleUpdateError);
        }
      }

      // Transformer les données
      const driverData: DriverAuthData = {
        id: driver.id,
        email: driver.email,
        phone: driver.phone,
        name: driver.name,
        driver_type: driver.driver_type || 'independent',
        business_id: driver.business_id,
        business_name: driver.businesses?.name,
        is_verified: driver.is_verified || false,
        is_active: driver.is_active !== false,
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
      console.error('❌ Erreur lors de la récupération du livreur:', error);
      return { error: error instanceof Error ? error.message : 'Erreur lors de la récupération' };
    }
  }

  // Mettre à jour le profil du livreur
  static async updateDriverProfile(driverId: string, updateData: DriverUpdateData): Promise<{ driver?: DriverAuthData; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('driver_profiles')
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
        .from('driver_profiles')
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
        .from('driver_profiles')
        .select(`
          *,
          businesses!driver_profiles_business_id_fkey (
            name
          )
        `)
        .eq('business_id', businessId)
        .eq('is_active', true);

      if (error) {
        throw new Error(error.message);
      }

      const driverData: DriverAuthData[] = (drivers || []).map(driver => ({
        id: driver.id,
        email: driver.email,
        phone: driver.phone,
        name: driver.name,
        driver_type: driver.driver_type || 'service',
        business_id: driver.business_id,
        business_name: driver.businesses?.name,
        is_verified: driver.is_verified || false,
        is_active: driver.is_active !== false,
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

      return { drivers: driverData };
    } catch (error) {
      console.error('Erreur lors de la récupération des livreurs du service:', error);
      return { error: error instanceof Error ? error.message : 'Erreur lors de la récupération' };
    }
  }

  // Récupérer tous les livreurs (pour l'admin)
  static async getAllDrivers(): Promise<{ drivers?: DriverAuthData[]; error?: string }> {
    try {
      const { data: drivers, error } = await supabase
        .from('driver_profiles')
        .select(`
          *,
          businesses!driver_profiles_business_id_fkey (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      const driverData: DriverAuthData[] = (drivers || []).map(driver => ({
        id: driver.id,
        email: driver.email,
        phone: driver.phone,
        name: driver.name,
        driver_type: driver.driver_type || 'independent',
        business_id: driver.business_id,
        business_name: driver.businesses?.name,
        is_verified: driver.is_verified || false,
        is_active: driver.is_active !== false,
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

      return { drivers: driverData };
    } catch (error) {
      console.error('Erreur lors de la récupération de tous les livreurs:', error);
      return { error: error instanceof Error ? error.message : 'Erreur lors de la récupération' };
    }
  }

  // Activer/Désactiver un livreur
  static async toggleDriverStatus(driverId: string, isActive: boolean): Promise<{ error?: string }> {
    try {
      const { error } = await supabase
        .from('driver_profiles')
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
        .from('driver_profiles')
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