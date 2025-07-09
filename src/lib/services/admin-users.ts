import { supabase } from '@/lib/supabase';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  profile_image?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  bio?: string;
  website?: string;
  social_media?: string;
  is_active: boolean;
  is_verified: boolean;
  role_id: number;
  role_name: string;
  created_at: string;
  updated_at: string;
}

export interface PartnerData {
  name: string;
  email: string;
  phone_number: string;
  date_of_birth?: string;
  gender?: string;
  business_name: string;
  business_description: string;
  business_type_id: number;
  business_address: string;
  business_phone: string;
  business_email: string;
  address: string;
  city: string;
  postal_code?: string;
  country?: string;
  bio?: string;
  website?: string;
  social_media?: string;
  is_active?: boolean;
  is_verified?: boolean;
  profile_image?: File | null;
  password: string;
}

export const adminUsersService = {
  // Récupérer tous les utilisateurs avec pagination et filtres
  async getUsers(page: number = 1, search: string = '', role: string = '') {
    try {
      let query = supabase
        .from('user_profiles')
        .select(`
          *,
          user_roles(name)
        `)
        .order('created_at', { ascending: false });

      // Appliquer les filtres
      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      if (role) {
        query = query.eq('user_roles.name', role);
      }

      // Pagination
      const from = (page - 1) * 10;
      const to = from + 9;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        throw new Error('Impossible de récupérer les utilisateurs');
      }

      return {
        users: data || [],
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / 10)
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  },

  // Récupérer les statistiques des utilisateurs
  async getUserStats() {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          is_active,
          is_verified,
          user_roles(name)
        `);

      if (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        throw new Error('Impossible de récupérer les statistiques');
      }

      const stats = {
        total: data?.length || 0,
        active: data?.filter(u => u.is_active).length || 0,
        verified: data?.filter(u => u.is_verified).length || 0,
        customers: data?.filter(u => u.user_roles?.name === 'customer').length || 0,
        partners: data?.filter(u => u.user_roles?.name === 'partner').length || 0,
        drivers: data?.filter(u => u.user_roles?.name === 'driver').length || 0,
        admins: data?.filter(u => u.user_roles?.name === 'admin').length || 0
      };

      return stats;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  },

  // Récupérer tous les utilisateurs
  async getAllUsers() {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        user_roles!inner (
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Récupérer tous les partenaires
  async getAllPartners() {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        user_roles!inner (
          name
        ),
        businesses (*)
      `)
      .eq('user_roles.name', 'partner')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Créer un nouveau partenaire
  async createPartner(partnerData: PartnerData) {
    try {
      console.log('Début de création du partenaire:', partnerData.email);

      // 1. Récupérer le rôle partner
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('name', 'partner')
        .single();

      if (roleError) {
        console.error('Erreur récupération rôle partner:', roleError);
        throw roleError;
      }

      if (!roleData) {
        throw new Error('Rôle partner non trouvé');
      }

      console.log('Rôle partner trouvé avec ID:', roleData.id);

      // 2. Créer l'utilisateur dans auth.users via l'inscription normale
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: partnerData.email,
        password: partnerData.password,
        options: {
          data: {
            name: partnerData.name,
            role: 'partner'
          }
        }
      });

      if (authError) {
        console.error('Erreur création auth user:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Utilisateur auth non créé');
      }

      const userId = authData.user.id;
      console.log('Utilisateur auth créé avec ID:', userId);

      // 3. Créer le profil utilisateur
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          name: partnerData.name,
          email: partnerData.email,
          phone_number: partnerData.phone_number,
          address: partnerData.address,
          profile_image: null, // Pas d'image pour l'instant
          is_active: partnerData.is_active ?? true,
          role_id: roleData.id
        })
        .select()
        .single();

      if (profileError) {
        console.error('Erreur création profil:', profileError);
        throw profileError;
      }

      console.log('Profil utilisateur créé:', profileData);

      // 4. Créer le commerce associé
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .insert({
          name: partnerData.business_name,
          description: partnerData.business_description,
          business_type_id: partnerData.business_type_id,
          address: partnerData.business_address,
          phone: partnerData.business_phone,
          email: partnerData.business_email,
          owner_id: userId,
          is_active: true,
          is_open: true
        })
        .select()
        .single();

      if (businessError) {
        console.error('Erreur création commerce:', businessError);
        throw businessError;
      }

      console.log('Commerce créé:', businessData);

      // 5. Créer les catégories de menu basées sur le type de business
      await this.createMenuCategoriesFromTemplate(businessData.id, partnerData.business_type_id);

      return {
        user: profileData,
        business: businessData,
        authUser: authData.user,
        note: 'L\'utilisateur doit confirmer son email pour activer son compte'
      };

    } catch (error) {
      console.error('Erreur complète création partenaire:', error);
      throw error;
    }
  },

  // Créer les catégories de menu basées sur le template du type de business
  async createMenuCategoriesFromTemplate(businessId: number, businessTypeId: number) {
    try {
      // Récupérer les templates de catégories pour ce type de business
      const { data: templates, error: templateError } = await supabase
        .from('business_type_menu_templates')
        .select('category_name, category_description, sort_order')
        .eq('business_type_id', businessTypeId)
        .order('sort_order');

      if (templateError) {
        console.error('Erreur récupération templates catégories:', templateError);
        return;
      }

      if (!templates || templates.length === 0) {
        console.log('Aucun template trouvé pour le type de business:', businessTypeId);
        return;
      }

      // Créer les catégories basées sur les templates
      for (const template of templates) {
        await supabase
          .from('menu_categories')
          .insert({
            name: template.category_name,
            description: template.category_description,
            business_id: businessId,
            is_active: true,
            sort_order: template.sort_order
          });
      }

      console.log(`Catégories créées pour le business ${businessId} avec ${templates.length} templates`);
    } catch (error) {
      console.error('Erreur création catégories par template:', error);
    }
  },

  // Mettre à jour un utilisateur
  async updateUser(userId: string, updates: Partial<PartnerData>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Désactiver/Activer un utilisateur
  async toggleUserStatus(userId: string, isActive: boolean) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ is_active: isActive })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors du changement de statut:', error);
        throw new Error(`Impossible de changer le statut: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      throw error;
    }
  },

  // Supprimer un utilisateur
  async deleteUser(userId: string) {
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId);

    if (error) throw error;
  },

  // Récupérer les rôles disponibles
  async getRoles() {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('name');

      if (error) {
        console.error('Erreur lors de la récupération des rôles:', error);
        throw new Error('Impossible de récupérer les rôles');
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des rôles:', error);
      throw error;
    }
  },

  // Rechercher des utilisateurs
  async searchUsers(searchTerm: string, role?: string) {
    try {
      let query = supabase
        .from('user_profiles')
        .select(`
          *,
          user_roles(name)
        `)
        .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .limit(10);

      if (role) {
        query = query.eq('user_roles.name', role);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erreur lors de la recherche d\'utilisateurs:', error);
        throw new Error('Impossible de rechercher les utilisateurs');
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la recherche d\'utilisateurs:', error);
      throw error;
    }
  }
}; 