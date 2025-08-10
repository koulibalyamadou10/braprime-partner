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

export class DriverAuthPartnerService {
  // Créer un compte auth pour un livreur existant via l'API Supabase
  static async createDriverAuthAccount(
    request: CreateDriverAuthRequest
  ): Promise<DriverAuthResult> {
    try {
      // 1. Créer l'utilisateur via l'API Supabase avec createUser
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: request.email,
        phone: request.phone,
        password: request.password,
        user_metadata: {
          role: 'driver',
          driver_id: request.driver_id
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

  // Supprimer un compte auth (pour les partenaires, seulement leurs drivers)
  static async deleteDriverAuthAccount(userId: string, businessId: number): Promise<DriverAuthResult> {
    try {
      // Vérifier que le driver appartient au business du partenaire
      const { data: driverCheck, error: checkError } = await supabase
        .from('driver_profiles')
        .select(`
          driver_id,
          drivers!inner(
            business_id
          )
        `)
        .eq('user_profile_id', userId)
        .eq('drivers.business_id', businessId)
        .single();

      if (checkError || !driverCheck) {
        return {
          success: false,
          error: 'Driver non trouvé ou non autorisé'
        };
      }

      // Supprimer le profil driver
      const { error: driverProfileError } = await supabase
        .from('driver_profiles')
        .delete()
        .eq('user_profile_id', userId);

      if (driverProfileError) {
        console.error('Erreur suppression profil driver:', driverProfileError);
        return {
          success: false,
          error: driverProfileError.message
        };
      }

      // Supprimer le profil utilisateur
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error('Erreur suppression profil utilisateur:', profileError);
        return {
          success: false,
          error: profileError.message
        };
      }

      // Supprimer l'utilisateur auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);

      if (authError) {
        console.error('Erreur suppression utilisateur auth:', authError);
        return {
          success: false,
          error: authError.message
        };
      }

      return {
        success: true,
        message: 'Compte auth supprimé avec succès'
      };

    } catch (error) {
      console.error('Erreur lors de la suppression du compte auth:', error);
      return {
        success: false,
        error: 'Erreur lors de la suppression du compte auth'
      };
    }
  }

  // Récupérer les drivers sans compte auth pour un business spécifique
  static async getDriversWithoutAuth(businessId: number): Promise<{
    drivers: any[];
    error: string | null;
  }> {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select(`
          id,
          name,
          email,
          phone,
          vehicle_type,
          vehicle_plate,
          is_active,
          is_verified
        `)
        .eq('business_id', businessId)
        .eq('is_active', true)
        .not('id', 'in', `(
          SELECT driver_id 
          FROM driver_profiles 
          WHERE driver_id IS NOT NULL
        )`);

      if (error) {
        console.error('Erreur récupération drivers sans auth:', error);
        return {
          drivers: [],
          error: error.message
        };
      }

      return {
        drivers: data || [],
        error: null
      };

    } catch (error) {
      console.error('Erreur lors de la récupération des drivers sans auth:', error);
      return {
        drivers: [],
        error: 'Erreur lors de la récupération des drivers'
      };
    }
  }

  // Récupérer les comptes auth des drivers pour un business spécifique
  static async getDriverAuthAccounts(businessId: number): Promise<{
    accounts: any[];
    error: string | null;
  }> {
    try {
      const { data, error } = await supabase
        .from('driver_profiles')
        .select(`
          id,
          user_profile_id,
          driver_id,
          created_at,
          user_profiles (
            id,
            name,
            email,
            phone_number,
            user_roles (
              name
            )
          ),
          drivers (
            id,
            name,
            vehicle_type,
            vehicle_plate,
            business_id
          )
        `)
        .eq('drivers.business_id', businessId)
        .not('user_profile_id', 'is', null);

      if (error) {
        console.error('Erreur récupération comptes auth:', error);
        return {
          accounts: [],
          error: error.message
        };
      }

      return {
        accounts: data || [],
        error: null
      };

    } catch (error) {
      console.error('Erreur lors de la récupération des comptes auth:', error);
      return {
        accounts: [],
        error: 'Erreur lors de la récupération des comptes auth'
      };
    }
  }

  // Récupérer les statistiques des drivers pour un business
  static async getDriverStats(businessId: number): Promise<{
    totalDrivers: number;
    driversWithAuth: number;
    driversWithoutAuth: number;
    error: string | null;
  }> {
    try {
      // Total des drivers actifs
      const { data: totalData, error: totalError } = await supabase
        .from('drivers')
        .select('id', { count: 'exact' })
        .eq('business_id', businessId)
        .eq('is_active', true);

      if (totalError) {
        return {
          totalDrivers: 0,
          driversWithAuth: 0,
          driversWithoutAuth: 0,
          error: totalError.message
        };
      }

      // Drivers avec compte auth
      const { data: withAuthData, error: withAuthError } = await supabase
        .from('driver_profiles')
        .select(`
          driver_id,
          drivers!inner(
            business_id
          )
        `, { count: 'exact' })
        .eq('drivers.business_id', businessId)
        .not('user_profile_id', 'is', null);

      if (withAuthError) {
        return {
          totalDrivers: totalData?.length || 0,
          driversWithAuth: 0,
          driversWithoutAuth: 0,
          error: withAuthError.message
        };
      }

      const totalDrivers = totalData?.length || 0;
      const driversWithAuth = withAuthData?.length || 0;
      const driversWithoutAuth = totalDrivers - driversWithAuth;

      return {
        totalDrivers,
        driversWithAuth,
        driversWithoutAuth,
        error: null
      };

    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return {
        totalDrivers: 0,
        driversWithAuth: 0,
        driversWithoutAuth: 0,
        error: 'Erreur lors de la récupération des statistiques'
      };
    }
  }
} 