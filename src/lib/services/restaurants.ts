import { supabase } from '@/lib/supabase'
import type { Tables, Inserts, Updates } from '@/lib/supabase'

export type Restaurant = Tables<'restaurants'>
export type MenuItem = Tables<'menu_items'>

export class RestaurantService {
  // Récupérer tous les restaurants actifs
  static async getAllRestaurants(): Promise<{ restaurants: Restaurant[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) {
        return { restaurants: [], error: error.message }
      }

      return { restaurants: data || [], error: null }
    } catch (error) {
      return { restaurants: [], error: 'Erreur lors de la récupération des restaurants' }
    }
  }

  // Récupérer un restaurant par ID
  static async getRestaurantById(id: number): Promise<{ restaurant: Restaurant | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single()

      if (error) {
        return { restaurant: null, error: error.message }
      }

      return { restaurant: data, error: null }
    } catch (error) {
      return { restaurant: null, error: 'Erreur lors de la récupération du restaurant' }
    }
  }

  // Récupérer les restaurants par type de cuisine
  static async getRestaurantsByCuisine(cuisineType: string): Promise<{ restaurants: Restaurant[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('cuisine_type', cuisineType)
        .eq('is_active', true)
        .order('name')

      if (error) {
        return { restaurants: [], error: error.message }
      }

      return { restaurants: data || [], error: null }
    } catch (error) {
      return { restaurants: [], error: 'Erreur lors de la récupération des restaurants' }
    }
  }

  // Rechercher des restaurants
  static async searchRestaurants(query: string): Promise<{ restaurants: Restaurant[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,cuisine_type.ilike.%${query}%`)
        .eq('is_active', true)
        .order('name')

      if (error) {
        return { restaurants: [], error: error.message }
      }

      return { restaurants: data || [], error: null }
    } catch (error) {
      return { restaurants: [], error: 'Erreur lors de la recherche des restaurants' }
    }
  }

  // Récupérer le menu d'un restaurant
  static async getRestaurantMenu(restaurantId: number): Promise<{ menuItems: MenuItem[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_available', true)
        .order('category_id')
        .order('name')

      if (error) {
        return { menuItems: [], error: error.message }
      }

      return { menuItems: data || [], error: null }
    } catch (error) {
      return { menuItems: [], error: 'Erreur lors de la récupération du menu' }
    }
  }

  // Récupérer les plats populaires d'un restaurant
  static async getPopularItems(restaurantId: number): Promise<{ menuItems: MenuItem[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_popular', true)
        .eq('is_available', true)
        .order('name')

      if (error) {
        return { menuItems: [], error: error.message }
      }

      return { menuItems: data || [], error: null }
    } catch (error) {
      return { menuItems: [], error: 'Erreur lors de la récupération des plats populaires' }
    }
  }

  // Créer un nouveau restaurant (pour les partenaires)
  static async createRestaurant(restaurantData: Inserts<'restaurants'>): Promise<{ restaurant: Restaurant | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .insert(restaurantData)
        .select()
        .single()

      if (error) {
        return { restaurant: null, error: error.message }
      }

      return { restaurant: data, error: null }
    } catch (error) {
      return { restaurant: null, error: 'Erreur lors de la création du restaurant' }
    }
  }

  // Mettre à jour un restaurant (pour les partenaires)
  static async updateRestaurant(id: number, updates: Updates<'restaurants'>): Promise<{ restaurant: Restaurant | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return { restaurant: null, error: error.message }
      }

      return { restaurant: data, error: null }
    } catch (error) {
      return { restaurant: null, error: 'Erreur lors de la mise à jour du restaurant' }
    }
  }

  // Ajouter un article au menu (pour les partenaires)
  static async addMenuItem(menuItemData: Inserts<'menu_items'>): Promise<{ menuItem: MenuItem | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .insert(menuItemData)
        .select()
        .single()

      if (error) {
        return { menuItem: null, error: error.message }
      }

      return { menuItem: data, error: null }
    } catch (error) {
      return { menuItem: null, error: 'Erreur lors de l\'ajout de l\'article au menu' }
    }
  }

  // Mettre à jour un article du menu (pour les partenaires)
  static async updateMenuItem(id: number, updates: Updates<'menu_items'>): Promise<{ menuItem: MenuItem | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return { menuItem: null, error: error.message }
      }

      return { menuItem: data, error: null }
    } catch (error) {
      return { menuItem: null, error: 'Erreur lors de la mise à jour de l\'article' }
    }
  }

  // Supprimer un article du menu (pour les partenaires)
  static async deleteMenuItem(id: number): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id)

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      return { error: 'Erreur lors de la suppression de l\'article' }
    }
  }

  // Récupérer les restaurants d'un partenaire
  static async getPartnerRestaurants(partnerId: string): Promise<{ restaurants: Restaurant[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false })

      if (error) {
        return { restaurants: [], error: error.message }
      }

      return { restaurants: data || [], error: null }
    } catch (error) {
      return { restaurants: [], error: 'Erreur lors de la récupération des restaurants du partenaire' }
    }
  }
} 