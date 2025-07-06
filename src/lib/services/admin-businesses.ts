import { supabase } from '@/lib/supabase';

export interface BusinessType {
  id: number;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface Partner {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  profile_image?: string;
  is_active: boolean;
}

export interface NewBusiness {
  name: string;
  description: string;
  business_type_id: number;
  category_id: number;
  address: string;
  phone?: string;
  email?: string;
  opening_hours?: string;
  cuisine_type?: string;
  delivery_time: string;
  delivery_fee: number;
  is_active: boolean;
  is_open: boolean;
  owner_id: string;
}

export const adminBusinessesService = {
  // Récupérer les types de commerce
  async getBusinessTypes(): Promise<BusinessType[]> {
    const { data, error } = await supabase
      .from('business_types')
      .select('*')
      .order('name');

    if (error) {
      console.error('Erreur lors de la récupération des types de commerce:', error);
      throw new Error('Impossible de récupérer les types de commerce');
    }

    return data || [];
  },

  // Récupérer les catégories
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
      throw new Error('Impossible de récupérer les catégories');
    }

    return data || [];
  },

  // Rechercher des partenaires
  async searchPartners(searchTerm: string): Promise<Partner[]> {
    if (!searchTerm.trim()) {
      return [];
    }

    try {
      // D'abord, récupérer l'ID du rôle partenaire
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('name', 'partner')
        .single();

      if (roleError) {
        console.error('Erreur lors de la récupération du rôle partenaire:', roleError);
        throw new Error('Impossible de récupérer le rôle partenaire');
      }

      // Ensuite, rechercher les partenaires
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          name,
          email,
          phone_number,
          profile_image,
          is_active
        `)
        .eq('role_id', roleData.id)
        .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) {
        console.error('Erreur lors de la recherche de partenaires:', error);
        throw new Error('Impossible de rechercher les partenaires');
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la recherche de partenaires:', error);
      throw error;
    }
  },

  // Ajouter un nouveau commerce
  async addBusiness(businessData: NewBusiness) {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .insert({
          ...businessData,
          rating: 0,
          review_count: 0,
          total_orders: 0,
          total_revenue: 0,
          logo: null // Le logo sera ajouté plus tard via l'interface de gestion
        })
        .select(`
          *,
          business_types(name),
          categories(name),
          user_profiles!owner_id(name, email)
        `)
        .single();

      if (error) {
        console.error('Erreur lors de l\'ajout du commerce:', error);
        throw new Error(`Impossible d'ajouter le commerce: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commerce:', error);
      throw error;
    }
  },

  // Vérifier si un partenaire existe
  async verifyPartner(partnerId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, role_id')
        .eq('id', partnerId)
        .single();

      if (error) {
        console.error('Erreur lors de la vérification du partenaire:', error);
        return false;
      }

      // Vérifier que l'utilisateur a bien le rôle partenaire
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('name')
        .eq('id', data.role_id)
        .single();

      return roleData?.name === 'partner';
    } catch (error) {
      console.error('Erreur lors de la vérification du partenaire:', error);
      return false;
    }
  },

  // Récupérer les statistiques des commerces
  async getBusinessStats() {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          id,
          is_active,
          is_open,
          total_orders,
          total_revenue
        `);

      if (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        throw new Error('Impossible de récupérer les statistiques');
      }

      const stats = {
        total: data?.length || 0,
        active: data?.filter(b => b.is_active).length || 0,
        open: data?.filter(b => b.is_open).length || 0,
        averageOrders: data?.length ? Math.round(data.reduce((sum, b) => sum + (b.total_orders || 0), 0) / data.length) : 0,
        averageRevenue: data?.length ? Math.round(data.reduce((sum, b) => sum + (b.total_revenue || 0), 0) / data.length) : 0
      };

      return stats;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }
}; 