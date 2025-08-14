import { supabase } from '@/lib/supabase';

export interface InternalUser {
  id: string;
  user_id: string;
  business_id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'commandes' | 'menu' | 'reservations' | 'livreurs' | 'revenu' | 'user' | 'facturation' | 'admin';
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
  role: InternalUser['role'];
  password: string;
  business_id: number;
  created_by: string;
}

export interface UpdateInternalUserData {
  name?: string;
  phone?: string;
  role?: InternalUser['role'];
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
        role: user.role,
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
      // 1. Créer d'abord l'utilisateur dans auth.users
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          name: userData.name,
          phone: userData.phone,
          role: 'internal_user'
        }
      });

      if (authError || !authData.user) {
        console.error('Error creating auth user:', authError);
        return { data: null, error: authError?.message || 'Erreur lors de la création du compte utilisateur' };
      }

      // 2. Créer le profil utilisateur
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          name: userData.name,
          email: userData.email,
          phone_number: userData.phone,
          role_id: 1, // Rôle par défaut pour les utilisateurs internes
          is_manual_creation: true
        });

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        // Supprimer l'utilisateur auth créé en cas d'erreur
        await supabase.auth.admin.deleteUser(authData.user.id);
        return { data: null, error: 'Erreur lors de la création du profil utilisateur' };
      }

      // 3. Créer l'utilisateur interne
      const { data: internalUser, error: internalError } = await supabase
        .from('profil_internal_user')
        .insert({
          user_id: authData.user.id,
          business_id: userData.business_id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          role: userData.role,
          created_by: userData.created_by,
          permissions: this.getDefaultPermissions(userData.role)
        })
        .select()
        .single();

      if (internalError) {
        console.error('Error creating internal user:', internalError);
        // Nettoyer en cas d'erreur
        await supabase.auth.admin.deleteUser(authData.user.id);
        await supabase.from('user_profiles').delete().eq('id', authData.user.id);
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

  // Obtenir les permissions par défaut selon le rôle
  private static getDefaultPermissions(role: InternalUser['role']): Record<string, any> {
    switch (role) {
      case 'admin':
        return { full_access: true };
      case 'commandes':
        return { orders_management: true, order_tracking: true, order_status_update: true };
      case 'menu':
        return { menu_management: true, item_editing: true, category_management: true };
      case 'reservations':
        return { reservations_management: true, table_management: true };
      case 'livreurs':
        return { drivers_management: true, driver_assignment: true, driver_tracking: true };
      case 'revenu':
        return { revenue_view: true, analytics_view: true, reports_view: true };
      case 'user':
        return { customer_management: true, customer_view: true };
      case 'facturation':
        return { billing_view: true, subscription_management: true, invoice_view: true };
      default:
        return {};
    }
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
