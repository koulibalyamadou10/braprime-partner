import { supabase } from '@/lib/supabase';

export interface PartnerMenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  is_popular: boolean;
  category_id: number;
  business_id: number;
  is_available: boolean;
  preparation_time: number;
  allergens: string[];
  nutritional_info: {
    calories?: number;
    proteines?: number;
    glucides?: number;
    lipides?: number;
    fibres?: number;
  };
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PartnerMenuCategory {
  id: number;
  name: string;
  business_id: number;
  sort_order: number;
  is_active: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface MenuItemCreate {
  name: string;
  description: string;
  price: number;
  image?: string;
  is_popular: boolean;
  category_id: number;
  business_id: number;
  is_available: boolean;
  preparation_time: number;
  allergens?: string[];
  nutritional_info?: {
    calories?: number;
    proteines?: number;
    glucides?: number;
    lipides?: number;
    fibres?: number;
  };
  sort_order?: number;
}

export interface MenuItemUpdate {
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  is_popular?: boolean;
  category_id?: number;
  is_available?: boolean;
  preparation_time?: number;
  allergens?: string[];
  nutritional_info?: {
    calories?: number;
    proteines?: number;
    glucides?: number;
    lipides?: number;
    fibres?: number;
  };
  sort_order?: number;
}

export interface MenuCategoryCreate {
  name: string;
  business_id: number;
  sort_order: number;
  is_active: boolean;
}

export interface MenuCategoryUpdate {
  name?: string;
  sort_order?: number;
  is_active?: boolean;
}

export const PartnerMenuService = {
  // Récupérer le menu complet d'un partenaire
  getMenuByBusinessId: async (businessId: number): Promise<{ 
    categories: PartnerMenuCategory[]; 
    items: PartnerMenuItem[]; 
    error: string | null 
  }> => {
    try {
      // Récupérer les catégories
      const { data: categories, error: categoriesError } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('business_id', businessId)
        .order('sort_order', { ascending: true });

      if (categoriesError) {
        console.error('Erreur lors de la récupération des catégories:', categoriesError);
      }

      // Récupérer les articles
      const { data: items, error: itemsError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('business_id', businessId)
        .order('name', { ascending: true });

      if (itemsError) {
        console.error('Erreur lors de la récupération des articles:', itemsError);
      }

      return { 
        categories: categories || [], 
        items: items || [], 
        error: null 
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du menu:', error);
      return { categories: [], items: [], error: 'Erreur de connexion' };
    }
  },

  // Créer un nouvel article
  createMenuItem: async (item: MenuItemCreate): Promise<{ data: PartnerMenuItem | null; error: string | null }> => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .insert(item)
        .select()
        .single();
      
      return { data, error: error?.message || null };
    } catch (error) {
      console.error('Erreur lors de la création de l\'article:', error);
      return { data: null, error: 'Erreur de connexion' };
    }
  },

  // Mettre à jour un article
  updateMenuItem: async (id: number, item: MenuItemUpdate): Promise<{ data: PartnerMenuItem | null; error: string | null }> => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .update({ ...item, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      return { data, error: error?.message || null };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'article:', error);
      return { data: null, error: 'Erreur de connexion' };
    }
  },

  // Supprimer un article
  deleteMenuItem: async (id: number): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);
      
      return { error: error?.message || null };
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'article:', error);
      return { error: 'Erreur de connexion' };
    }
  },

  // Basculer la disponibilité d'un article
  toggleMenuItemAvailability: async (id: number, isAvailable: boolean): Promise<{ data: PartnerMenuItem | null; error: string | null }> => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .update({ 
          is_available: isAvailable, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();
      
      return { data, error: error?.message || null };
    } catch (error) {
      console.error('Erreur lors du changement de disponibilité:', error);
      return { data: null, error: 'Erreur de connexion' };
    }
  },

  // Créer une nouvelle catégorie
  createMenuCategory: async (category: MenuCategoryCreate): Promise<{ data: PartnerMenuCategory | null; error: string | null }> => {
    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .insert(category)
        .select()
        .single();
      
      return { data, error: error?.message || null };
    } catch (error) {
      console.error('Erreur lors de la création de la catégorie:', error);
      return { data: null, error: 'Erreur de connexion' };
    }
  },

  // Mettre à jour une catégorie
  updateMenuCategory: async (id: number, category: MenuCategoryUpdate): Promise<{ data: PartnerMenuCategory | null; error: string | null }> => {
    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .update({ ...category, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      return { data, error: error?.message || null };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la catégorie:', error);
      return { data: null, error: 'Erreur de connexion' };
    }
  },

  // Supprimer une catégorie
  deleteMenuCategory: async (id: number): Promise<{ error: string | null }> => {
    try {
      // Vérifier s'il y a des articles dans cette catégorie
      const { data: items, error: itemsError } = await supabase
        .from('menu_items')
        .select('id')
        .eq('category_id', id);

      if (itemsError) {
        return { error: itemsError.message };
      }

      if (items && items.length > 0) {
        return { error: 'Impossible de supprimer une catégorie qui contient des articles' };
      }

      const { error } = await supabase
        .from('menu_categories')
        .delete()
        .eq('id', id);
      
      return { error: error?.message || null };
    } catch (error) {
      console.error('Erreur lors de la suppression de la catégorie:', error);
      return { error: 'Erreur de connexion' };
    }
  },

  // Réorganiser les catégories
  reorderCategories: async (businessId: number, categoryOrders: { id: number; sort_order: number }[]): Promise<{ error: string | null }> => {
    try {
      // Mettre à jour chaque catégorie avec son nouvel ordre
      for (const category of categoryOrders) {
        const { error } = await supabase
          .from('menu_categories')
          .update({ 
            sort_order: category.sort_order, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', category.id)
          .eq('business_id', businessId);

        if (error) {
          return { error: error.message };
        }
      }
      
      return { error: null };
    } catch (error) {
      console.error('Erreur lors de la réorganisation des catégories:', error);
      return { error: 'Erreur de connexion' };
    }
  }
}; 