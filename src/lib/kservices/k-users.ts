import { supabase } from '@/lib/supabase';

export interface InternalUser {
  id: string;
  user_id: string;
  business_id: number;
  name: string;
  email: string;
  phone?: string;
  is_active: boolean;
  last_login?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  roles: string[];
}

export interface CreateInternalUserRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  business_id: number;
  roles: string[];
  created_by: string;
}

export interface UpdateInternalUserRequest {
  name?: string;
  phone?: string;
  is_active?: boolean;
  roles?: string[];
}

export interface InternalUserResult {
  success: boolean;
  user?: InternalUser | InternalUser[];
  error?: string;
}

export class KUserService {
  // Créer un nouvel utilisateur interne
  static async createInternalUser(request: CreateInternalUserRequest): Promise<InternalUserResult> {
    try {
      console.log('🚀 Début création utilisateur interne:', { email: request.email, business_id: request.business_id });

      // 1. Créer l'utilisateur dans Supabase Auth
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: request.email,
        password: request.password,
        email_confirm: true,
        user_metadata: {
          name: request.name,
          business_id: request.business_id,
          type: 'internal_user'
        }
      });

      if (authError || !authUser.user) {
        console.error('❌ Erreur création utilisateur Auth:', authError);
        return { success: false, error: authError?.message || 'Erreur lors de la création de l\'utilisateur' };
      }

      console.log('✅ Utilisateur Auth créé:', authUser.user.id);

      // etapes intermediaires l'inscrire dans la table internal_user avec user_profiles! 
            // 2. Créer l'entrée dans user_profiles
            const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              id: authUser.user.id,
              name: request.name,
              email: request.email,
              phone_number: request.phone,
              role_id: 11, // Rôle driver comme spécifié
              is_active: true,
              is_manual_creation: true
            });
    
          if (profileError) {
            console.error('Erreur création profil utilisateur:', profileError);
            
            // Rollback: Supprimer l'utilisateur Auth créé
            await supabase.auth.admin.deleteUser(authUser.user.id);
            
            return {
              success: false,
              error: `Erreur lors de la création du profil: ${profileError.message}`
            };
          }    

      // 2. Créer le profil dans profil_internal_user
      const { data: internalUser, error: internalUserError } = await supabase
        .from('profil_internal_user')
        .insert({
          id: authUser.user.id,
          user_id: authUser.user.id,
          business_id: request.business_id,
          name: request.name,
          email: request.email,
          phone: request.phone,
          is_active: true,
          roles: request.roles,
          created_by: request.created_by
        })
        .select()
        .single();

      if (internalUserError || !internalUser) {
        console.error('❌ Erreur création profil interne:', internalUserError);
        
        // Rollback: supprimer l'utilisateur Auth créé
        await supabase.auth.admin.deleteUser(authUser.user.id);
        
        return { success: false, error: internalUserError?.message || 'Erreur lors de la création du profil' };
      }

      console.log('✅ Profil interne créé:', internalUser.id);

      return { 
        success: true, 
        user: internalUser as InternalUser 
      };

    } catch (error) {
      console.error('❌ Erreur inattendue création utilisateur interne:', error);
      return { 
        success: false, 
        error: 'Erreur inattendue lors de la création de l\'utilisateur' 
      };
    }
  }

  // Récupérer tous les utilisateurs internes d'un business
  static async getInternalUsers(businessId: number): Promise<InternalUserResult> {
    try {
      const { data: users, error } = await supabase
        .from('profil_internal_user')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur récupération utilisateurs internes:', error);
        return { success: false, error: error.message };
      }

      return { 
        success: true, 
        user: users as InternalUser[] 
      };

    } catch (error) {
      console.error('❌ Erreur inattendue récupération utilisateurs:', error);
      return { 
        success: false, 
        error: 'Erreur inattendue lors de la récupération des utilisateurs' 
      };
    }
  }

  // Mettre à jour un utilisateur interne
  static async updateInternalUser(userId: string, updates: UpdateInternalUserRequest): Promise<InternalUserResult> {
    try {
      console.log('�� Mise à jour utilisateur interne:', userId, updates);

      const { data: updatedUser, error } = await supabase
        .from('profil_internal_user')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error || !updatedUser) {
        console.error('❌ Erreur mise à jour utilisateur:', error);
        return { success: false, error: error?.message || 'Erreur lors de la mise à jour' };
      }

      console.log('✅ Utilisateur mis à jour:', updatedUser.id);

      return { 
        success: true, 
        user: updatedUser as InternalUser 
      };

    } catch (error) {
      console.error('❌ Erreur inattendue mise à jour:', error);
      return { 
        success: false, 
        error: 'Erreur inattendue lors de la mise à jour' 
      };
    }
  }

  // Désactiver/Activer un utilisateur interne
  static async toggleUserStatus(userId: string, isActive: boolean): Promise<InternalUserResult> {
    try {
      console.log('🔄 Changement statut utilisateur:', userId, isActive);

      const { data: updatedUser, error } = await supabase
        .from('profil_internal_user')
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error || !updatedUser) {
        console.error('❌ Erreur changement statut:', error);
        return { success: false, error: error?.message || 'Erreur lors du changement de statut' };
      }

      console.log('✅ Statut utilisateur changé:', updatedUser.id, isActive);

      return { 
        success: true, 
        user: updatedUser as InternalUser 
      };

    } catch (error) {
      console.error('❌ Erreur inattendue changement statut:', error);
      return { 
        success: false, 
        error: 'Erreur inattendue lors du changement de statut' 
      };
    }
  }

  // Supprimer un utilisateur interne
  static async deleteInternalUser(userId: string): Promise<InternalUserResult> {
    try {
      console.log('🗑️ Suppression utilisateur interne:', userId);

      // 1. Supprimer le profil interne
      const { error: profileError } = await supabase
        .from('profil_internal_user')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error('❌ Erreur suppression profil:', profileError);
        return { success: false, error: profileError.message };
      }

      // 2. Supprimer l'utilisateur Auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);

      if (authError) {
        console.error('❌ Erreur suppression utilisateur Auth:', authError);
        // Note: Le profil est déjà supprimé, on ne peut pas rollback
        return { success: false, error: 'Profil supprimé mais erreur lors de la suppression du compte' };
      }

      console.log('✅ Utilisateur supprimé complètement:', userId);

      return { success: true };

    } catch (error) {
      console.error('❌ Erreur inattendue suppression:', error);
      return { 
        success: false, 
        error: 'Erreur inattendue lors de la suppression' 
      };
    }
  }

  // Récupérer un utilisateur interne par ID
  static async getInternalUserById(userId: string): Promise<InternalUserResult> {
    try {
      const { data: user, error } = await supabase
        .from('profil_internal_user')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !user) {
        console.error('❌ Erreur récupération utilisateur:', error);
        return { success: false, error: error?.message || 'Utilisateur non trouvé' };
      }

      return { 
        success: true, 
        user: user as InternalUser 
      };

    } catch (error) {
      console.error('❌ Erreur inattendue récupération utilisateur:', error);
      return { 
        success: false, 
        error: 'Erreur inattendue lors de la récupération' 
      };
    }
  }

  // Mettre à jour les rôles d'un utilisateur
  static async updateUserRoles(userId: string, roles: string[]): Promise<InternalUserResult> {
    try {
      console.log('🔄 Mise à jour rôles utilisateur:', userId, roles);

      const { data: updatedUser, error } = await supabase
        .from('profil_internal_user')
        .update({
          roles: roles,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error || !updatedUser) {
        console.error('❌ Erreur mise à jour rôles:', error);
        return { success: false, error: error?.message || 'Erreur lors de la mise à jour des rôles' };
      }

      console.log('✅ Rôles utilisateur mis à jour:', updatedUser.id);

      return { 
        success: true, 
        user: updatedUser as InternalUser 
      };

    } catch (error) {
      console.error('❌ Erreur inattendue mise à jour rôles:', error);
      return { 
        success: false, 
        error: 'Erreur inattendue lors de la mise à jour des rôles' 
      };
    }
  }

  // Vérifier si un email existe déjà
  static async checkEmailExists(email: string, businessId: number): Promise<boolean> {
    try {
      const { data: existingUser, error } = await supabase
        .from('profil_internal_user')
        .select('id')
        .eq('email', email)
        .eq('business_id', businessId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ Erreur vérification email:', error);
        return false;
      }

      return !!existingUser;

    } catch (error) {
      console.error('❌ Erreur vérification email:', error);
      return false;
    }
  }
}

export default KUserService;