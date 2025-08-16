import { supabase } from '@/lib/supabase';

export interface InternalUser {
  id: string;
  user_id: string;
  business_id: number;
  name: string;
  email: string;
  phone?: string;
  roles: ('commandes' | 'menu' | 'reservations' | 'livreurs' | 'revenu' | 'user' | 'facturation' | 'admin')[];
  is_active: boolean;
  permissions: Record<string, any>;
  last_login?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInternalUserData {
  name: string;
  email: string;
  phone?: string;
  roles: InternalUser['roles'];
  password?: string; // Optionnel pour l'instant
  business_id: number;
  created_by: string;
}

export interface UpdateInternalUserData {
  name?: string;
  phone?: string;
  roles?: InternalUser['roles'];
  is_active?: boolean;
  permissions?: Record<string, any>;
}

export class InternalUsersService {
  // Récupérer tous les utilisateurs internes d'un business
  static async getBusinessInternalUsers(businessId: number): Promise<{
    data: InternalUser[] | null;
    error: string | null;
  }> {
    try {
      const { data, error } = await supabase
        .from('profil_internal_user')
        .select(`
          *,
          user_profiles!profil_internal_user_user_id_fkey (
            id,
            name,
            email,
            phone_number
          ),
          created_by_user:user_profiles!profil_internal_user_created_by_fkey (
            id,
            name
          )
        `)
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching internal users:', error);
        return { data: null, error: error.message };
      }

      // Transformer les données pour correspondre à l'interface
      const transformedData = data?.map(user => ({
        id: user.id,
        user_id: user.user_id,
        business_id: user.business_id,
        name: user.user_profiles?.name || user.name,
        email: user.user_profiles?.email || user.email,
        phone: user.user_profiles?.phone_number || user.phone,
        roles: user.roles || [user.role], // Fallback pour la compatibilité
        is_active: user.is_active,
        permissions: user.permissions || {},
        last_login: user.last_login,
        created_by: user.created_by_user?.name || user.created_by,
        created_at: user.created_at,
        updated_at: user.updated_at
      })) || [];

      return { data: transformedData, error: null };
    } catch (error) {
      console.error('Error in getBusinessInternalUsers:', error);
      return { data: null, error: 'Erreur lors de la récupération des utilisateurs internes' };
    }
  }

  // Créer un nouvel utilisateur interne
  static async createInternalUser(userData: CreateInternalUserData): Promise<{
    data: InternalUser | null;
    error: string | null;
  }> {
    try {
      // Pour l'instant, on va créer directement dans la table profil_internal_user
      // sans créer de compte auth (à implémenter plus tard avec une fonction Supabase)
      
      // 1. Créer l'utilisateur interne directement
      const { data: internalUser, error: internalError } = await supabase
        .from('profil_internal_user')
        .insert({
          user_id: userData.created_by, // Utiliser temporairement l'ID du créateur
          business_id: userData.business_id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          roles: userData.roles,
          created_by: userData.created_by,
          permissions: this.getDefaultPermissions(userData.roles)
        })
        .select()
        .single();

      if (internalError) {
        console.error('Error creating internal user:', internalError);
        return { data: null, error: 'Erreur lors de la création de l\'utilisateur interne' };
      }

      return { data: internalUser, error: null };
    } catch (error) {
      console.error('Error in createInternalUser:', error);
      return { data: null, error: 'Erreur lors de la création de l\'utilisateur interne' };
    }
  }

  // Mettre à jour un utilisateur interne
  static async updateInternalUser(
    userId: string,
    updateData: UpdateInternalUserData
  ): Promise<{
    data: InternalUser | null;
    error: string | null;
  }> {
    try {
      const { data, error } = await supabase
        .from('profil_internal_user')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating internal user:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in updateInternalUser:', error);
      return { data: null, error: 'Erreur lors de la mise à jour de l\'utilisateur interne' };
    }
  }

  // Supprimer un utilisateur interne
  static async deleteInternalUser(userId: string): Promise<{
    success: boolean;
    error: string | null;
  }> {
    try {
      // Récupérer d'abord les informations de l'utilisateur
      const { data: user, error: fetchError } = await supabase
        .from('profil_internal_user')
        .select('user_id')
        .eq('id', userId)
        .single();

      if (fetchError || !user) {
        return { success: false, error: 'Utilisateur non trouvé' };
      }

      // Supprimer l'utilisateur interne
      const { error: deleteError } = await supabase
        .from('profil_internal_user')
        .delete()
        .eq('id', userId);

      if (deleteError) {
        console.error('Error deleting internal user:', deleteError);
        return { success: false, error: deleteError.message };
      }

      // Supprimer le profil utilisateur
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', user.user_id);

      if (profileError) {
        console.error('Error deleting user profile:', profileError);
      }

      // Supprimer l'utilisateur auth
      const { error: authError } = await supabase.auth.admin.deleteUser(user.user_id);
      if (authError) {
        console.error('Error deleting auth user:', authError);
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Error in deleteInternalUser:', error);
      return { success: false, error: 'Erreur lors de la suppression de l\'utilisateur interne' };
    }
  }

  // Obtenir les permissions par défaut selon les rôles
  private static getDefaultPermissions(roles: InternalUser['roles']): Record<string, any> {
    const permissions: Record<string, any> = {};
    
    roles.forEach(role => {
      switch (role) {
        case 'admin':
          Object.assign(permissions, { full_access: true });
          break;
        case 'commandes':
          Object.assign(permissions, { orders_management: true, order_tracking: true, order_status_update: true });
          break;
        case 'menu':
          Object.assign(permissions, { menu_management: true, item_editing: true, category_management: true });
          break;
        case 'reservations':
          Object.assign(permissions, { reservations_management: true, table_management: true });
          break;
        case 'livreurs':
          Object.assign(permissions, { drivers_management: true, driver_assignment: true, driver_tracking: true });
          break;
        case 'revenu':
          Object.assign(permissions, { revenue_view: true, analytics_view: true, reports_view: true });
          break;
        case 'user':
          Object.assign(permissions, { customer_management: true, customer_view: true });
          break;
        case 'facturation':
          Object.assign(permissions, { billing_view: true, subscription_management: true, invoice_view: true });
          break;
      }
    });
    
    return permissions;
  }

  // Vérifier si un email existe déjà pour un business
  static async checkEmailExists(email: string, businessId: number): Promise<{
    exists: boolean;
    error: string | null;
  }> {
    try {
      const { data, error } = await supabase
        .from('profil_internal_user')
        .select('id')
        .eq('business_id', businessId)
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') {
        return { exists: false, error: error.message };
      }

      return { exists: !!data, error: null };
    } catch (error) {
      console.error('Error in checkEmailExists:', error);
      return { exists: false, error: 'Erreur lors de la vérification de l\'email' };
    }
  }
}
