import { supabase } from '@/lib/supabase';

export interface Business {
  id: number;
  name: string;
  description: string;
  cover_image: string;
  logo: string;
  cuisine_type: string;
  rating: number;
  review_count: number;
  delivery_time: string;
  delivery_fee: number;
  address: string;
  phone: string;
  opening_hours: string;
  is_popular: boolean;
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
  }
}; 