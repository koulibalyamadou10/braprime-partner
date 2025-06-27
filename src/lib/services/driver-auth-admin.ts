import { supabase } from '../supabase';

export interface CreateDriverAuthRequest {
  driver_id: string;
  email: string;
  phone: string;
  password: string;
}

export interface DriverAuthResult {
  success: boolean;
  user_id?: string;
  driver_id?: string;
  error?: string;
  message?: string;
}

export class DriverAuthAdminService {
  // Créer un compte auth pour un livreur existant via l'API Supabase
  static async createDriverAuthAccount(
    request: CreateDriverAuthRequest
  ): Promise<DriverAuthResult> {
    try {
      // 1. Créer l'utilisateur via l'API Supabase Auth (signup)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: request.email,
        phone: request.phone,
        password: request.password,
        options: {
          data: {
            role: 'driver',
            driver_id: request.driver_id
          }
        }
      });

      if (authError) {
        console.error('Erreur création utilisateur auth:', authError);
        return {
          success: false,
          error: authError.message
        };
      }

      if (!authData.user) {
        return {
          success: false,
          error: 'Utilisateur non créé'
        };
      }

      // 2. Créer le profil utilisateur dans user_profiles
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          name: 'Livreur', // Sera mis à jour avec les données du driver
          email: request.email,
          phone_number: request.phone,
          role_id: null // Sera mis à jour avec le rôle driver
        })
        .select()
        .single();

      if (profileError) {
        console.error('Erreur création profil utilisateur:', profileError);
        // Nettoyer l'utilisateur auth créé
        await supabase.auth.admin.deleteUser(authData.user.id);
        return {
          success: false,
          error: profileError.message
        };
      }

      // 3. Récupérer le rôle driver
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('name', 'driver')
        .single();

      if (roleError || !roleData) {
        console.error('Erreur récupération rôle driver:', roleError);
        // Nettoyer
        await supabase.auth.admin.deleteUser(authData.user.id);
        await supabase.from('user_profiles').delete().eq('id', authData.user.id);
        return {
          success: false,
          error: 'Rôle driver non trouvé'
        };
      }

      // 4. Mettre à jour le profil avec le rôle driver
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          role_id: roleData.id
        })
        .eq('id', authData.user.id);

      if (updateError) {
        console.error('Erreur mise à jour rôle:', updateError);
        // Nettoyer
        await supabase.auth.admin.deleteUser(authData.user.id);
        await supabase.from('user_profiles').delete().eq('id', authData.user.id);
        return {
          success: false,
          error: updateError.message
        };
      }

      // 5. Créer le lien driver_profiles
      const { data: driverProfileData, error: driverProfileError } = await supabase
        .from('driver_profiles')
        .insert({
          user_profile_id: authData.user.id,
          driver_id: request.driver_id
        })
        .select()
        .single();

      if (driverProfileError) {
        console.error('Erreur création profil driver:', driverProfileError);
        // Nettoyer
        await supabase.auth.admin.deleteUser(authData.user.id);
        await supabase.from('user_profiles').delete().eq('id', authData.user.id);
        return {
          success: false,
          error: driverProfileError.message
        };
      }

      // 6. Mettre à jour le nom du profil avec les données du driver
      const { data: driverData, error: driverError } = await supabase
        .from('drivers')
        .select('name')
        .eq('id', request.driver_id)
        .single();

      if (!driverError && driverData) {
        await supabase
          .from('user_profiles')
          .update({
            name: driverData.name
          })
          .eq('id', authData.user.id);
      }

      return {
        success: true,
        user_id: authData.user.id,
        driver_id: request.driver_id,
        message: 'Compte auth créé avec succès'
      };

    } catch (error) {
      console.error('Erreur lors de la création du compte auth:', error);
      return {
        success: false,
        error: 'Erreur lors de la création du compte auth'
      };
    }
  }

  // Méthode alternative utilisant une fonction SQL
  static async createDriverAuthViaSQL(
    request: CreateDriverAuthRequest
  ): Promise<DriverAuthResult> {
    try {
      const { data, error } = await supabase.rpc('create_driver_auth_account', {
        p_driver_id: request.driver_id,
        p_email: request.email,
        p_phone: request.phone,
        p_password: request.password
      });

      if (error) {
        console.error('Erreur création via SQL:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        user_id: data?.user_id,
        driver_id: request.driver_id,
        message: 'Compte auth créé avec succès via SQL'
      };

    } catch (error) {
      console.error('Erreur lors de la création via SQL:', error);
      return {
        success: false,
        error: 'Erreur lors de la création du compte auth via SQL'
      };
    }
  }

  // Réinitialiser le mot de passe d'un livreur
  static async resetDriverPassword(
    email: string,
    newPassword: string
  ): Promise<DriverAuthResult> {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        console.error('Erreur réinitialisation mot de passe:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        message: 'Email de réinitialisation envoyé'
      };

    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      return {
        success: false,
        error: 'Erreur lors de la réinitialisation du mot de passe'
      };
    }
  }

  // Supprimer un compte auth de livreur
  static async deleteDriverAuthAccount(userId: string): Promise<DriverAuthResult> {
    try {
      // Supprimer d'abord les liens
      await supabase.from('driver_profiles').delete().eq('user_profile_id', userId);
      await supabase.from('user_profiles').delete().eq('id', userId);
      
      // Note: La suppression de auth.users nécessite des permissions admin
      // qui ne sont pas disponibles côté client

      return {
        success: true,
        message: 'Compte auth supprimé avec succès (profil uniquement)'
      };

    } catch (error) {
      console.error('Erreur lors de la suppression du compte auth:', error);
      return {
        success: false,
        error: 'Erreur lors de la suppression du compte auth'
      };
    }
  }

  // Lister les livreurs sans compte auth
  static async getDriversWithoutAuth(): Promise<{
    drivers: any[];
    error: string | null;
  }> {
    try {
      const { data: drivers, error } = await supabase
        .from('drivers')
        .select(`
          id,
          name,
          email,
          phone,
          business_id,
          businesses!inner(name)
        `)
        .not('email', 'is', null)
        .not('email', 'eq', '');

      if (error) {
        console.error('Erreur récupération livreurs:', error);
        return { drivers: [], error: error.message };
      }

      // Filtrer les livreurs qui n'ont pas de compte auth
      const driversWithoutAuth = [];
      for (const driver of drivers || []) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('email', driver.email)
          .single();

        if (!profile) {
          driversWithoutAuth.push(driver);
        }
      }

      return { drivers: driversWithoutAuth, error: null };

    } catch (error) {
      console.error('Erreur lors de la récupération des livreurs sans auth:', error);
      return { drivers: [], error: 'Erreur lors de la récupération des livreurs' };
    }
  }

  // Lister les comptes auth des livreurs
  static async getDriverAuthAccounts(): Promise<{
    accounts: any[];
    error: string | null;
  }> {
    try {
      const { data: accounts, error } = await supabase
        .from('driver_profiles')
        .select(`
          id,
          user_profile_id,
          driver_id,
          created_at,
          user_profiles!inner(
            id,
            name,
            email,
            phone_number,
            role_id,
            user_roles!inner(name)
          ),
          drivers!inner(
            id,
            name,
            email,
            phone,
            vehicle_type,
            vehicle_plate,
            businesses!inner(name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur récupération comptes auth livreurs:', error);
        return { accounts: [], error: error.message };
      }

      return { accounts: accounts || [], error: null };

    } catch (error) {
      console.error('Erreur lors de la récupération des comptes auth:', error);
      return { accounts: [], error: 'Erreur lors de la récupération des comptes auth' };
    }
  }
} 