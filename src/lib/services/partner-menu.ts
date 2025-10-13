import { supabase } from '@/lib/supabase';

export interface MenuItemVariant {
  id?: number;
  menu_item_id?: number;
  variant_type: string;
  variant_value: string;
  price_adjustment: number;
  stock_quantity?: number;
  is_available: boolean;
  sku?: string;
  sort_order: number;
}

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
  // Nouveaux champs pour stock et variantes
  track_stock?: boolean;
  stock_quantity?: number | null;
  low_stock_alert?: number;
  sku?: string;
  variants?: MenuItemVariant[];
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

      // Récupérer les articles avec leurs variantes
      const { data: items, error: itemsError } = await supabase
        .from('menu_items')
        .select(`
          *,
          variants:menu_item_variants(*)
        `)
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
      // Extraire les variantes des données
      const { variants, ...itemData } = item as any;
      
      console.log('📝 Création article - Données reçues:', {
        hasVariants: !!variants,
        variantsCount: variants?.length || 0,
        variants: variants
      });
      
      // Créer l'article
      const { data: menuItem, error: itemError } = await supabase
        .from('menu_items')
        .insert(itemData)
        .select()
        .single();
      
      if (itemError || !menuItem) {
        console.error('❌ Erreur création article:', itemError);
        return { data: null, error: itemError?.message || 'Erreur lors de la création' };
      }

      console.log('✅ Article créé avec ID:', menuItem.id);

      // Si des variantes sont fournies, les créer
      if (variants && Array.isArray(variants) && variants.length > 0) {
        const variantsToInsert = variants.map((v: MenuItemVariant) => ({
          menu_item_id: menuItem.id,
          variant_type: v.variant_type,
          variant_value: v.variant_value,
          price_adjustment: v.price_adjustment,
          stock_quantity: v.stock_quantity || 0,
          is_available: v.is_available,
          sku: v.sku || null,
          sort_order: v.sort_order
        }));

        console.log('📦 Insertion de', variantsToInsert.length, 'variantes:', variantsToInsert);

        const { data: insertedVariants, error: variantsError } = await supabase
          .from('menu_item_variants')
          .insert(variantsToInsert)
          .select();

        if (variantsError) {
          console.error('❌ Erreur lors de la création des variantes:', variantsError);
          // On ne retourne pas d'erreur car l'article est créé
        } else {
          console.log('✅ Variantes créées:', insertedVariants?.length || 0);
        }
      } else {
        console.log('ℹ️ Aucune variante à créer');
      }

      // Récupérer l'article avec ses variantes
      const { data: fullItem } = await supabase
        .from('menu_items')
        .select(`
          *,
          variants:menu_item_variants(*)
        `)
        .eq('id', menuItem.id)
        .single();
      
      return { data: fullItem || menuItem, error: null };
    } catch (error) {
      console.error('Erreur lors de la création de l\'article:', error);
      return { data: null, error: 'Erreur de connexion' };
    }
  },

  // Mettre à jour un article
  updateMenuItem: async (id: number, item: MenuItemUpdate): Promise<{ data: PartnerMenuItem | null; error: string | null }> => {
    try {
      // Extraire les variantes des données
      const { variants, ...itemData } = item as any;
      
      console.log('🔄 Mise à jour article ID:', id, {
        hasVariants: variants !== undefined,
        variantsCount: variants?.length || 0,
        variants: variants
      });
      
      // Mettre à jour l'article
      const { data: menuItem, error: itemError } = await supabase
        .from('menu_items')
        .update({ ...itemData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (itemError || !menuItem) {
        return { data: null, error: itemError?.message || 'Erreur lors de la mise à jour' };
      }

      // Gérer les variantes si elles sont fournies
      if (variants !== undefined) {
        console.log('🗑️ Suppression des anciennes variantes...');
        
        // Supprimer les anciennes variantes
        const { error: deleteError } = await supabase
          .from('menu_item_variants')
          .delete()
          .eq('menu_item_id', id);

        if (deleteError) {
          console.error('❌ Erreur suppression variantes:', deleteError);
        } else {
          console.log('✅ Anciennes variantes supprimées');
        }

        // Créer les nouvelles variantes si présentes
        if (Array.isArray(variants) && variants.length > 0) {
          console.log('📦 Insertion de', variants.length, 'nouvelles variantes');
          
          const variantsToInsert = variants.map((v: MenuItemVariant) => ({
            menu_item_id: id,
            variant_type: v.variant_type,
            variant_value: v.variant_value,
            price_adjustment: v.price_adjustment,
            stock_quantity: v.stock_quantity || 0,
            is_available: v.is_available,
            sku: v.sku || null,
            sort_order: v.sort_order
          }));

          const { data: insertedVariants, error: variantsError } = await supabase
            .from('menu_item_variants')
            .insert(variantsToInsert)
            .select();

          if (variantsError) {
            console.error('❌ Erreur lors de la mise à jour des variantes:', variantsError);
            // On ne retourne pas d'erreur car l'article est mis à jour
          } else {
            console.log('✅ Variantes mises à jour:', insertedVariants?.length || 0);
          }
        } else {
          console.log('ℹ️ Aucune nouvelle variante à créer');
        }
      } else {
        console.log('ℹ️ Variantes non modifiées');
      }

      // Récupérer l'article avec ses variantes
      const { data: fullItem } = await supabase
        .from('menu_items')
        .select(`
          *,
          variants:menu_item_variants(*)
        `)
        .eq('id', id)
        .single();
      
      return { data: fullItem || menuItem, error: null };
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