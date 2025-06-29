import { supabase } from '@/lib/supabase';

export interface FavoriteBusiness {
  id: string;
  business_id: number;
  created_at: string;
  business: {
    id: number;
    name: string;
    description: string;
    cover_image: string;
    logo: string;
    rating: number;
    review_count: number;
    delivery_time: string;
    delivery_fee: number;
    address: string;
    phone: string;
    email: string;
    is_active: boolean;
    is_open: boolean;
  };
}

export interface FavoriteMenuItem {
  id: string;
  menu_item_id: number;
  created_at: string;
  menu_item: {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    is_available: boolean;
    business_id: number;
    business_name: string;
  };
}

export interface BusinessWithFavorite {
  id: number;
  name: string;
  description: string;
  cover_image: string;
  logo: string;
  rating: number;
  review_count: number;
  delivery_time: string;
  delivery_fee: number;
  address: string;
  phone: string;
  email: string;
  is_active: boolean;
  is_open: boolean;
  is_favorite: boolean;
  favorited_at?: string;
}

export interface MenuItemWithFavorite {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  is_available: boolean;
  category_id: number;
  business_id: number;
  is_popular: boolean;
  is_favorite: boolean;
  favorited_at?: string;
}

class FavoritesService {
  // ============================================================================
  // FAVORIS BUSINESSES
  // ============================================================================

  /**
   * Ajouter un business aux favoris
   */
  async addBusinessToFavorites(businessId: number): Promise<{ success: boolean; message: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      const { data, error } = await supabase
        .from('favorite_businesses')
        .insert({
          user_id: user.id,
          business_id: businessId
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Violation de contrainte unique
          return { success: true, message: 'Business déjà dans les favoris' };
        }
        throw error;
      }

      return { success: true, message: 'Business ajouté aux favoris' };
    } catch (error) {
      console.error('Erreur lors de l\'ajout aux favoris:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erreur lors de l\'ajout aux favoris' 
      };
    }
  }

  /**
   * Retirer un business des favoris
   */
  async removeBusinessFromFavorites(businessId: number): Promise<{ success: boolean; message: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      const { error } = await supabase
        .from('favorite_businesses')
        .delete()
        .eq('user_id', user.id)
        .eq('business_id', businessId);

      if (error) throw error;

      return { success: true, message: 'Business retiré des favoris' };
    } catch (error) {
      console.error('Erreur lors de la suppression des favoris:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erreur lors de la suppression des favoris' 
      };
    }
  }

  /**
   * Vérifier si un business est en favoris
   */
  async isBusinessFavorite(businessId: number): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('favorite_businesses')
        .select('id')
        .eq('user_id', user.id)
        .eq('business_id', businessId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Erreur lors de la vérification des favoris:', error);
      return false;
    }
  }

  /**
   * Récupérer tous les businesses favoris de l'utilisateur
   */
  async getFavoriteBusinesses(): Promise<FavoriteBusiness[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('favorite_businesses')
        .select(`
          id,
          business_id,
          created_at,
          business:businesses (
            id,
            name,
            description,
            cover_image,
            logo,
            rating,
            review_count,
            delivery_time,
            delivery_fee,
            address,
            phone,
            email,
            is_active,
            is_open
          )
        `)
        .eq('user_id', user.id)
        .eq('business.is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des favoris:', error);
      return [];
    }
  }

  /**
   * Récupérer les businesses avec statut favori
   */
  async getBusinessesWithFavorites(): Promise<BusinessWithFavorite[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Si pas connecté, retourner les businesses sans statut favori
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (error) throw error;

        return (data || []).map(business => ({
          ...business,
          is_favorite: false
        }));
      }

      const { data, error } = await supabase
        .from('businesses_with_favorites')
        .select('*')
        .order('name');

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des businesses:', error);
      return [];
    }
  }

  // ============================================================================
  // FAVORIS MENU ITEMS
  // ============================================================================

  /**
   * Ajouter un menu item aux favoris
   */
  async addMenuItemToFavorites(menuItemId: number): Promise<{ success: boolean; message: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      const { data, error } = await supabase
        .from('favorite_menu_items')
        .insert({
          user_id: user.id,
          menu_item_id: menuItemId
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Violation de contrainte unique
          return { success: true, message: 'Article déjà dans les favoris' };
        }
        throw error;
      }

      return { success: true, message: 'Article ajouté aux favoris' };
    } catch (error) {
      console.error('Erreur lors de l\'ajout aux favoris:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erreur lors de l\'ajout aux favoris' 
      };
    }
  }

  /**
   * Retirer un menu item des favoris
   */
  async removeMenuItemFromFavorites(menuItemId: number): Promise<{ success: boolean; message: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      const { error } = await supabase
        .from('favorite_menu_items')
        .delete()
        .eq('user_id', user.id)
        .eq('menu_item_id', menuItemId);

      if (error) throw error;

      return { success: true, message: 'Article retiré des favoris' };
    } catch (error) {
      console.error('Erreur lors de la suppression des favoris:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erreur lors de la suppression des favoris' 
      };
    }
  }

  /**
   * Vérifier si un menu item est en favoris
   */
  async isMenuItemFavorite(menuItemId: number): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('favorite_menu_items')
        .select('id')
        .eq('user_id', user.id)
        .eq('menu_item_id', menuItemId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Erreur lors de la vérification des favoris:', error);
      return false;
    }
  }

  /**
   * Récupérer tous les menu items favoris de l'utilisateur
   */
  async getFavoriteMenuItems(): Promise<FavoriteMenuItem[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('favorite_menu_items')
        .select(`
          id,
          menu_item_id,
          created_at,
          menu_item:menu_items (
            id,
            name,
            description,
            price,
            image,
            is_available,
            business_id
          ),
          business:menu_items!inner(businesses (
            name
          ))
        `)
        .eq('user_id', user.id)
        .eq('menu_item.is_available', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(item => ({
        ...item,
        menu_item: {
          ...item.menu_item,
          business_name: item.business?.name || ''
        }
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des favoris:', error);
      return [];
    }
  }

  /**
   * Récupérer les menu items avec statut favori
   */
  async getMenuItemsWithFavorites(businessId?: number): Promise<MenuItemWithFavorite[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Si pas connecté, retourner les menu items sans statut favori
        let query = supabase
          .from('menu_items')
          .select('*')
          .eq('is_available', true);

        if (businessId) {
          query = query.eq('business_id', businessId);
        }

        const { data, error } = await query.order('name');

        if (error) throw error;

        return (data || []).map(item => ({
          ...item,
          is_favorite: false
        }));
      }

      let query = supabase
        .from('menu_items_with_favorites')
        .select('*')
        .eq('is_available', true);

      if (businessId) {
        query = query.eq('business_id', businessId);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des menu items:', error);
      return [];
    }
  }

  // ============================================================================
  // FONCTIONS UTILITAIRES
  // ============================================================================

  /**
   * Basculer le statut favori d'un business
   */
  async toggleBusinessFavorite(businessId: number): Promise<{ success: boolean; message: string; isFavorite: boolean }> {
    const isFavorite = await this.isBusinessFavorite(businessId);
    
    if (isFavorite) {
      const result = await this.removeBusinessFromFavorites(businessId);
      return { ...result, isFavorite: false };
    } else {
      const result = await this.addBusinessToFavorites(businessId);
      return { ...result, isFavorite: true };
    }
  }

  /**
   * Basculer le statut favori d'un menu item
   */
  async toggleMenuItemFavorite(menuItemId: number): Promise<{ success: boolean; message: string; isFavorite: boolean }> {
    const isFavorite = await this.isMenuItemFavorite(menuItemId);
    
    if (isFavorite) {
      const result = await this.removeMenuItemFromFavorites(menuItemId);
      return { ...result, isFavorite: false };
    } else {
      const result = await this.addMenuItemToFavorites(menuItemId);
      return { ...result, isFavorite: true };
    }
  }

  /**
   * Récupérer le nombre de favoris de l'utilisateur
   */
  async getFavoritesCount(): Promise<{ businesses: number; menuItems: number }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { businesses: 0, menuItems: 0 };

      const [businessesResult, menuItemsResult] = await Promise.all([
        supabase
          .from('favorite_businesses')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id),
        supabase
          .from('favorite_menu_items')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
      ]);

      return {
        businesses: businessesResult.count || 0,
        menuItems: menuItemsResult.count || 0
      };
    } catch (error) {
      console.error('Erreur lors du comptage des favoris:', error);
      return { businesses: 0, menuItems: 0 };
    }
  }
}

export const favoritesService = new FavoritesService(); 