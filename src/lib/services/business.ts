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

export const BusinessService = {
  // Fonction utilitaire pour organiser les articles par catégories
  organizeMenuByCategories: (
    categories: MenuCategory[], 
    items: MenuItem[]
  ): MenuDataByCategories => {
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
  },

  // Récupérer un commerce par ID avec ses catégories et articles organisés
  getByIdWithOrganizedMenu: async (id: string): Promise<{ 
    data: Business | null; 
    categories: MenuCategory[]; 
    items: MenuItem[]; 
    menuByCategories: MenuDataByCategories;
    error: string | null 
  }> => {
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
  },

  // Récupérer un commerce par ID avec ses catégories et articles
  getById: async (id: string): Promise<{ 
    data: Business | null; 
    categories: MenuCategory[]; 
    items: MenuItem[]; 
    error: string | null 
  }> => {
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
  },

  // Récupérer tous les commerces
  getAll: async (): Promise<{ data: Business[]; error: string | null }> => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('name', { ascending: true });
      
      return { data: data || [], error: error?.message || null };
    } catch (error) {
      return { data: [], error: 'Erreur de connexion' };
    }
  },

  // Récupérer les commerces populaires
  getPopular: async (limit: number = 10): Promise<{ data: Business[]; error: string | null }> => {
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
  },

  // Récupérer les restaurants pour les réservations
  getRestaurantsForReservations: async (): Promise<{ data: Business[]; error: string | null }> => {
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
  },

  // Récupérer le profil partenaire par user_id
  getPartnerProfile: async (userId: string): Promise<{ data: Business | null; error: string | null }> => {
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
  },

  // Mettre à jour le profil partenaire
  updatePartnerProfile: async (
    userId: string, 
    profileData: Partial<Business>
  ): Promise<{ data: Business | null; error: string | null }> => {
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
  },

  // Upload d'image de profil
  uploadProfileImage: async (
    userId: string, 
    file: File, 
    type: 'logo' | 'cover_image'
  ): Promise<{ url: string | null; error: string | null }> => {
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
  },
}; 