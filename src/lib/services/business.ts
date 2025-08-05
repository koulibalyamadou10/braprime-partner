import { supabase } from '@/lib/supabase';

export interface Business {
  id: number;
  name: string;
  description: string;
  business_type_id?: number;
  category_id?: number;
  cover_image: string;
  logo: string;
  rating: number;
  review_count: number;
  delivery_time: string;
  delivery_fee: number;
  address: string;
  phone: string;
  email: string;
  opening_hours: string;
  cuisine_type: string;
  latitude?: number;
  longitude?: number;
  is_active: boolean;
  is_open: boolean;
  owner_id?: string;
  created_at: string;
  updated_at: string;
}

export interface MenuCategory {
  id: number;
  name: string;
  business_id: number;
  sort_order: number;
  is_active: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  is_popular: boolean;
  category_id: number;
  business_id: number;
  is_available: boolean;
  preparation_time?: number;
  allergens?: string[];
  nutritional_info?: {
    calories?: number;
    proteines?: number;
    glucides?: number;
  };
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

// Interface pour les catégories avec leurs articles
export interface MenuCategoryWithItems extends MenuCategory {
  items: MenuItem[];
  itemCount: number;
}

// Interface pour les données organisées par catégories
export interface MenuDataByCategories {
  categories: MenuCategoryWithItems[];
  totalItems: number;
  totalCategories: number;
}

export interface BusinessData {
  name: string;
  description: string;
  business_type_id: number;
  category_id?: number;
  cover_image?: string;
  logo?: string;
  delivery_time: string;
  delivery_fee: number;
  address: string;
  phone: string;
  email?: string;
  opening_hours: string;
  cuisine_type?: string;
  latitude?: number;
  longitude?: number;
  owner_id: string;
}

export interface BusinessType {
  id: number;
  name: string;
  icon: string;
  color: string;
  description: string;
  features: string[];
  image_url?: string;
}

export class BusinessService {
  // Fonction utilitaire pour organiser les articles par catégories
  static organizeMenuByCategories(
    categories: MenuCategory[], 
    items: MenuItem[]
  ): MenuDataByCategories {
    const categoriesWithItems: MenuCategoryWithItems[] = categories.map(category => {
      const categoryItems = items.filter(item => item.category_id === category.id);
      return {
        ...category,
        items: categoryItems,
        itemCount: categoryItems.length
      };
    });

    // Filtrer les catégories qui ont des articles
    const categoriesWithItemsFiltered = categoriesWithItems.filter(category => category.itemCount > 0);

    return {
      categories: categoriesWithItemsFiltered,
      totalItems: items.length,
      totalCategories: categoriesWithItemsFiltered.length
    };
  }

  // Récupérer un commerce par ID avec ses catégories et articles organisés
  static async getByIdWithOrganizedMenu(id: string): Promise<{ 
    data: Business | null; 
    categories: MenuCategory[]; 
    items: MenuItem[]; 
    menuByCategories: MenuDataByCategories;
    error: string | null 
  }> {
    try {
      // Récupérer le commerce
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .single();

      if (businessError) {
        return { 
          data: null, 
          categories: [], 
          items: [], 
          menuByCategories: { categories: [], totalItems: 0, totalCategories: 0 },
          error: businessError.message 
        };
      }

      if (!business) {
        return { 
          data: null, 
          categories: [], 
          items: [], 
          menuByCategories: { categories: [], totalItems: 0, totalCategories: 0 },
          error: 'Commerce non trouvé' 
        };
      }

      // Récupérer les catégories du menu (avec filtre is_active)
      const { data: categories, error: categoriesError } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('business_id', id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (categoriesError) {
        console.error('Erreur lors de la récupération des catégories:', categoriesError);
      }

      // Récupérer les articles du menu
      const { data: items, error: itemsError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('business_id', id)
        .order('name', { ascending: true });

      if (itemsError) {
        console.error('Erreur lors de la récupération des articles:', itemsError);
      }

      // Organiser les articles par catégories
      const menuByCategories = BusinessService.organizeMenuByCategories(
        categories || [], 
        items || []
      );

      return { 
        data: business, 
        categories: categories || [], 
        items: items || [], 
        menuByCategories,
        error: null 
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du commerce:', error);
      return { 
        data: null, 
        categories: [], 
        items: [], 
        menuByCategories: { categories: [], totalItems: 0, totalCategories: 0 },
        error: 'Erreur de connexion' 
      };
    }
  }

  // Récupérer un commerce par ID avec ses catégories et articles
  static async getById(id: string): Promise<{ 
    data: Business | null; 
    categories: MenuCategory[]; 
    items: MenuItem[]; 
    error: string | null 
  }> {
    try {
      // Récupérer le commerce
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .single();

      if (businessError) {
        return { data: null, categories: [], items: [], error: businessError.message };
      }

      if (!business) {
        return { data: null, categories: [], items: [], error: 'Commerce non trouvé' };
      }

      // Récupérer les catégories du menu (avec filtre is_active)
      const { data: categories, error: categoriesError } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('business_id', id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (categoriesError) {
        console.error('Erreur lors de la récupération des catégories:', categoriesError);
      }

      // Récupérer les articles du menu
      const { data: items, error: itemsError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('business_id', id)
        .order('name', { ascending: true });

      if (itemsError) {
        console.error('Erreur lors de la récupération des articles:', itemsError);
      }

      return { 
        data: business, 
        categories: categories || [], 
        items: items || [], 
        error: null 
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du commerce:', error);
      return { data: null, categories: [], items: [], error: 'Erreur de connexion' };
    }
  }

  // Récupérer tous les commerces
  static async getAll(): Promise<{ data: Business[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('name', { ascending: true });
      
      return { data: data || [], error: error?.message || null };
    } catch (error) {
      return { data: [], error: 'Erreur de connexion' };
    }
  }

  // Récupérer les commerces populaires
  static async getPopular(limit: number = 10): Promise<{ data: Business[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('is_popular', true)
        .order('rating', { ascending: false })
        .limit(limit);
      
      return { data: data || [], error: error?.message || null };
    } catch (error) {
      return { data: [], error: 'Erreur de connexion' };
    }
  }

  // Récupérer les restaurants pour les réservations
  static async getRestaurantsForReservations(): Promise<{ data: Business[]; error: string | null }> {
    try {
      // D'abord, récupérer l'ID du type 'restaurant'
      const { data: businessType, error: typeError } = await supabase
        .from('business_types')
        .select('id')
        .eq('name', 'restaurant')
        .single();


      console.log('businessType', businessType);

      if (typeError || !businessType) {
        console.error('Erreur lors de la récupération du type restaurant:', typeError);
        return { data: [], error: 'Type de commerce restaurant non trouvé' };
      }

      // Ensuite, récupérer tous les restaurants avec ce type
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('business_type_id', businessType.id)
        .eq('is_active', true)
        .eq('is_open', true)
        .order('name', { ascending: true });

      console.log('restaurants', data);
      
      if (error) {
        console.error('Erreur lors de la récupération des restaurants:', error);
        return { data: [], error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des restaurants:', error);
      return { data: [], error: 'Erreur de connexion' };
    }
  }

  // Récupérer le profil partenaire par user_id
  static async getPartnerProfile(userId: string): Promise<{ data: Business | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', userId)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération du profil partenaire:', error);
      return { data: null, error: 'Erreur de connexion' };
    }
  }

  // Mettre à jour le profil partenaire
  static async updatePartnerProfile(
    userId: string, 
    profileData: Partial<Business>
  ): Promise<{ data: Business | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('owner_id', userId)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil partenaire:', error);
      return { data: null, error: 'Erreur de connexion' };
    }
  }

  // Upload d'image de profil
  static async uploadProfileImage(
    userId: string, 
    file: File, 
    type: 'logo' | 'cover_image'
  ): Promise<{ url: string | null; error: string | null }> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${type}_${Date.now()}.${fileExt}`;
      const filePath = `business-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('business-images')
        .upload(filePath, file);

      if (uploadError) {
        return { url: null, error: uploadError.message };
      }

      const { data: { publicUrl } } = supabase.storage
        .from('business-images')
        .getPublicUrl(filePath);

      return { url: publicUrl, error: null };
    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'image:', error);
      return { url: null, error: 'Erreur lors de l\'upload' };
    }
  }

  // Récupérer tous les types de business disponibles
  static async getBusinessTypes(): Promise<{ data: BusinessType[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('business_types')
        .select('*')
        .order('name')

      if (error) {
        console.error('❌ [BusinessService] Erreur lors de la récupération des types de business:', error)
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error) {
      console.error('❌ [BusinessService] Erreur lors de la récupération des types de business:', error)
      return { data: null, error: 'Erreur de connexion' }
    }
  }

  // Récupérer toutes les catégories disponibles
  static async getCategories(): Promise<{ data: any[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) {
        console.error('❌ [BusinessService] Erreur lors de la récupération des catégories:', error)
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error) {
      console.error('❌ [BusinessService] Erreur lors de la récupération des catégories:', error)
      return { data: null, error: 'Erreur de connexion' }
    }
  }

  // Créer un nouveau business
  static async createBusiness(businessData: BusinessData): Promise<{ data: any | null; error: string | null }> {
    try {
      console.log('🚀 [BusinessService] Création du business:', businessData.name)

      // Vérifier que l'utilisateur est authentifié
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        console.error('❌ [BusinessService] Utilisateur non authentifié')
        return { data: null, error: 'Utilisateur non authentifié' }
      }

      // Vérifier que l'utilisateur est un partenaire
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role_id, user_roles(name)')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('❌ [BusinessService] Erreur lors de la vérification du profil:', profileError)
        return { data: null, error: 'Erreur lors de la vérification du profil' }
      }

      if (profile.user_roles?.name !== 'partner' && profile.role_id !== 2) {
        console.error('❌ [BusinessService] Utilisateur non autorisé à créer un business')
        return { data: null, error: 'Seuls les partenaires peuvent créer des businesses' }
      }

      // Créer le business
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .insert({
          name: businessData.name,
          description: businessData.description,
          business_type_id: businessData.business_type_id,
          category_id: businessData.category_id,
          cover_image: businessData.cover_image || 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
          logo: businessData.logo,
          delivery_time: businessData.delivery_time,
          delivery_fee: businessData.delivery_fee,
          address: businessData.address,
          phone: businessData.phone,
          email: businessData.email,
          opening_hours: businessData.opening_hours,
          cuisine_type: businessData.cuisine_type,
          latitude: businessData.latitude,
          longitude: businessData.longitude,
          owner_id: user.id,
          is_active: true,
          is_open: true
        })
        .select(`
          *,
          business_types(name, icon, color),
          categories(name, icon, color)
        `)
        .single()

      if (businessError) {
        console.error('❌ [BusinessService] Erreur lors de la création du business:', businessError)
        return { data: null, error: businessError.message }
      }

      console.log('✅ [BusinessService] Business créé avec succès:', business.id)

      // Créer les catégories de menu basées sur le type de business
      await this.createMenuCategoriesFromTemplate(business.id, businessData.business_type_id)

      return { data: business, error: null }
    } catch (error) {
      console.error('❌ [BusinessService] Erreur lors de la création du business:', error)
      return { data: null, error: 'Erreur lors de la création du business' }
    }
  }

  // Récupérer les businesses d'un partenaire
  static async getPartnerBusinesses(partnerId: string): Promise<{ data: any[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          business_types(name, icon, color),
          categories(name, icon, color)
        `)
        .eq('owner_id', partnerId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [BusinessService] Erreur lors de la récupération des businesses:', error)
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error) {
      console.error('❌ [BusinessService] Erreur lors de la récupération des businesses:', error)
      return { data: null, error: 'Erreur de connexion' }
    }
  }

  // Mettre à jour un business
  static async updateBusiness(businessId: number, updates: Partial<BusinessData>): Promise<{ data: any | null; error: string | null }> {
    try {
      // Vérifier que l'utilisateur est le propriétaire du business
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return { data: null, error: 'Utilisateur non authentifié' }
      }

      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .update(updates)
        .eq('id', businessId)
        .eq('owner_id', user.id)
        .select(`
          *,
          business_types(name, icon, color),
          categories(name, icon, color)
        `)
        .single()

      if (businessError) {
        console.error('❌ [BusinessService] Erreur lors de la mise à jour du business:', businessError)
        return { data: null, error: businessError.message }
      }

      return { data: business, error: null }
    } catch (error) {
      console.error('❌ [BusinessService] Erreur lors de la mise à jour du business:', error)
      return { data: null, error: 'Erreur lors de la mise à jour du business' }
    }
  }

  // Supprimer un business
  static async deleteBusiness(businessId: number): Promise<{ success: boolean; error: string | null }> {
    try {
      // Vérifier que l'utilisateur est le propriétaire du business
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return { success: false, error: 'Utilisateur non authentifié' }
      }

      const { error: deleteError } = await supabase
        .from('businesses')
        .delete()
        .eq('id', businessId)
        .eq('owner_id', user.id)

      if (deleteError) {
        console.error('❌ [BusinessService] Erreur lors de la suppression du business:', deleteError)
        return { success: false, error: deleteError.message }
      }

      return { success: true, error: null }
    } catch (error) {
      console.error('❌ [BusinessService] Erreur lors de la suppression du business:', error)
      return { success: false, error: 'Erreur lors de la suppression du business' }
    }
  }

  // Rechercher des businesses avec filtres et pagination
  static async searchBusinesses(filters: any, pagination: any): Promise<{ 
    businesses: Business[]; 
    total: number; 
    hasMore: boolean; 
    error: string | null 
  }> {
    try {
      let query = supabase
        .from('businesses')
        .select('*', { count: 'exact' })

      // Appliquer les filtres
      if (filters.businessType) {
        query = query.eq('business_type_id', filters.businessType)
      }
      if (filters.isOpen !== undefined) {
        query = query.eq('is_open', filters.isOpen)
      }
      if (filters.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive)
      }
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`)
      }

      // Appliquer la pagination
      const from = (pagination.page - 1) * pagination.limit
      const to = from + pagination.limit - 1
      query = query.range(from, to).order('name', { ascending: true })

      const { data, error, count } = await query

      if (error) {
        console.error('❌ [BusinessService] Erreur lors de la recherche:', error)
        return { businesses: [], total: 0, hasMore: false, error: error.message }
      }

      const total = count || 0
      const hasMore = from + pagination.limit < total

      return { 
        businesses: data || [], 
        total, 
        hasMore, 
        error: null 
      }
    } catch (error) {
      console.error('❌ [BusinessService] Erreur lors de la recherche:', error)
      return { businesses: [], total: 0, hasMore: false, error: 'Erreur de connexion' }
    }
  }

  // Créer les catégories de menu basées sur le template du type de business
  private static async createMenuCategoriesFromTemplate(businessId: number, businessTypeId: number) {
    try {
      // Récupérer les templates de catégories pour ce type de business
      const { data: templates, error: templateError } = await supabase
        .from('business_type_menu_templates')
        .select('category_name, category_description, sort_order')
        .eq('business_type_id', businessTypeId)
        .order('sort_order');

      if (templateError) {
        console.error('❌ [BusinessService] Erreur récupération templates catégories:', templateError);
        return;
      }

      if (!templates || templates.length === 0) {
        console.log('ℹ️ [BusinessService] Aucun template trouvé pour le type de business:', businessTypeId);
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

      console.log(`✅ [BusinessService] Catégories créées pour le business ${businessId} avec ${templates.length} templates`);
    } catch (error) {
      console.error('❌ [BusinessService] Erreur création catégories par template:', error);
    }
  }

  // Récupérer un business par ID
  static async getBusinessById(id: number): Promise<{ data: Business | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('❌ [BusinessService] Erreur lors de la récupération du business:', error)
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error) {
      console.error('❌ [BusinessService] Erreur lors de la récupération du business:', error)
      return { data: null, error: 'Erreur de connexion' }
    }
  }

  // Récupérer les businesses populaires par type
  static async getPopularBusinesses(businessType: number, limit: number = 6): Promise<{ 
    data: Business[]; 
    error: string | null 
  }> {
    try {
      let query = supabase
        .from('businesses')
        .select('*')
        .eq('is_popular', true)
        .eq('is_active', true)

      if (businessType) {
        query = query.eq('business_type_id', businessType)
      }

      const { data, error } = await query
        .order('rating', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('❌ [BusinessService] Erreur lors de la récupération des businesses populaires:', error)
        return { data: [], error: error.message }
      }

      return { data: data || [], error: null }
    } catch (error) {
      console.error('❌ [BusinessService] Erreur lors de la récupération des businesses populaires:', error)
      return { data: [], error: 'Erreur de connexion' }
    }
  }

  // Récupérer les businesses à proximité
  static async getNearbyBusinesses(
    businessType: number, 
    latitude: number, 
    longitude: number, 
    radius: number = 10
  ): Promise<{ data: Business[]; error: string | null }> {
    try {
      // Calculer les limites de la zone
      const latMin = latitude - (radius / 111.32) // 1 degré ≈ 111.32 km
      const latMax = latitude + (radius / 111.32)
      const lngMin = longitude - (radius / (111.32 * Math.cos(latitude * Math.PI / 180)))
      const lngMax = longitude + (radius / (111.32 * Math.cos(latitude * Math.PI / 180)))

      let query = supabase
        .from('businesses')
        .select('*')
        .eq('is_active', true)
        .gte('latitude', latMin)
        .lte('latitude', latMax)
        .gte('longitude', lngMin)
        .lte('longitude', lngMax)

      if (businessType) {
        query = query.eq('business_type_id', businessType)
      }

      const { data, error } = await query
        .order('name', { ascending: true })

      if (error) {
        console.error('❌ [BusinessService] Erreur lors de la récupération des businesses à proximité:', error)
        return { data: [], error: error.message }
      }

      return { data: data || [], error: null }
    } catch (error) {
      console.error('❌ [BusinessService] Erreur lors de la récupération des businesses à proximité:', error)
      return { data: [], error: 'Erreur de connexion' }
    }
  }

  // Récupérer les businesses ouverts
  static async getOpenBusinesses(businessType: number): Promise<{ data: Business[]; error: string | null }> {
    try {
      let query = supabase
        .from('businesses')
        .select('*')
        .eq('is_open', true)
        .eq('is_active', true)

      if (businessType) {
        query = query.eq('business_type_id', businessType)
      }

      const { data, error } = await query
        .order('name', { ascending: true })

      if (error) {
        console.error('❌ [BusinessService] Erreur lors de la récupération des businesses ouverts:', error)
        return { data: [], error: error.message }
      }

      return { data: data || [], error: null }
    } catch (error) {
      console.error('❌ [BusinessService] Erreur lors de la récupération des businesses ouverts:', error)
      return { data: [], error: 'Erreur de connexion' }
    }
  }

  // Récupérer tous les commerces actifs
  static async getAllBusinesses(): Promise<Business[]> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          business_types (
            id,
            name,
            icon,
            color
          ),
          categories (
            id,
            name,
            icon,
            color
          )
        `)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des commerces:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des commerces:', error);
      return [];
    }
  }

  // Récupérer les commerces par catégorie
  static async getBusinessesByCategory(categoryId: string): Promise<Business[]> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          business_types (
            id,
            name,
            icon,
            color
          ),
          categories (
            id,
            name,
            icon,
            color
          )
        `)
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des commerces par catégorie:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des commerces par catégorie:', error);
      return [];
    }
  }



  // Récupérer les commerces par type de commerce
  static async getBusinessesByType(businessTypeId: string): Promise<Business[]> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          business_types (
            id,
            name,
            icon,
            color
          ),
          categories (
            id,
            name,
            icon,
            color
          )
        `)
        .eq('business_type_id', businessTypeId)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des commerces par type:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des commerces par type:', error);
      return [];
    }
  }
} 