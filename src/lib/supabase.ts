import { createClient } from '@supabase/supabase-js'
import { config } from '@/config/env'

export const supabase = createClient(config.supabase.url, config.supabase.anonKey)

// Types pour les tables Supabase
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'customer' | 'partner'
          phone_number?: string
          address?: string
          profile_image?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role: 'customer' | 'partner'
          phone_number?: string
          address?: string
          profile_image?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'customer' | 'partner'
          phone_number?: string
          address?: string
          profile_image?: string
          created_at?: string
          updated_at?: string
        }
      }
      restaurants: {
        Row: {
          id: number
          name: string
          description: string
          cuisine_type: string
          cover_image: string
          logo: string
          rating: number
          review_count: number
          delivery_time: string
          delivery_fee: number
          address: string
          phone: string
          opening_hours: string
          is_active: boolean
          partner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          description: string
          cuisine_type: string
          cover_image: string
          logo: string
          rating?: number
          review_count?: number
          delivery_time: string
          delivery_fee: number
          address: string
          phone: string
          opening_hours: string
          is_active?: boolean
          partner_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string
          cuisine_type?: string
          cover_image?: string
          logo?: string
          rating?: number
          review_count?: number
          delivery_time?: string
          delivery_fee?: number
          address?: string
          phone?: string
          opening_hours?: string
          is_active?: boolean
          partner_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      menu_items: {
        Row: {
          id: number
          restaurant_id: number
          name: string
          description: string
          price: number
          image?: string
          category_id: number
          is_popular: boolean
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          restaurant_id: number
          name: string
          description: string
          price: number
          image?: string
          category_id: number
          is_popular?: boolean
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          restaurant_id?: number
          name?: string
          description?: string
          price?: number
          image?: string
          category_id?: number
          is_popular?: boolean
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: number
          name: string
          icon: string
          color: string
          link: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          icon: string
          color: string
          link: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          icon?: string
          color?: string
          link?: string
          is_active?: boolean
          created_at?: string
        }
      }
      cart: {
        Row: {
          id: string
          user_id: string
          business_id?: number
          business_name?: string
          items: any[]
          delivery_method: 'delivery' | 'pickup'
          delivery_address?: string
          delivery_instructions?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_id?: number
          business_name?: string
          items?: any[]
          delivery_method?: 'delivery' | 'pickup'
          delivery_address?: string
          delivery_instructions?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_id?: number
          business_name?: string
          items?: any[]
          delivery_method?: 'delivery' | 'pickup'
          delivery_address?: string
          delivery_instructions?: string
          created_at?: string
          updated_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          cart_id: string
          menu_item_id?: number
          name: string
          price: number
          quantity: number
          image?: string
          special_instructions?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cart_id: string
          menu_item_id?: number
          name: string
          price: number
          quantity?: number
          image?: string
          special_instructions?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cart_id?: string
          menu_item_id?: number
          name?: string
          price?: number
          quantity?: number
          image?: string
          special_instructions?: string
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          restaurant_id: number
          restaurant_name: string
          items: any
          status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled'
          total: number
          delivery_fee: number
          tax: number
          grand_total: number
          delivery_address: string
          delivery_method: 'delivery' | 'pickup'
          driver_name?: string
          driver_phone?: string
          driver_location?: any
          estimated_delivery: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          restaurant_id: number
          restaurant_name: string
          items: any
          status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled'
          total: number
          delivery_fee: number
          tax: number
          grand_total: number
          delivery_address: string
          delivery_method: 'delivery' | 'pickup'
          driver_name?: string
          driver_phone?: string
          driver_location?: any
          estimated_delivery: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          restaurant_id?: number
          restaurant_name?: string
          items?: any
          status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled'
          total?: number
          delivery_fee?: number
          tax?: number
          grand_total?: number
          delivery_address?: string
          delivery_method?: 'delivery' | 'pickup'
          driver_name?: string
          driver_phone?: string
          driver_location?: any
          estimated_delivery?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_addresses: {
        Row: {
          id: number
          user_id: string
          name: string
          address: string
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          name: string
          address: string
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          name?: string
          address?: string
          is_default?: boolean
          created_at?: string
        }
      }
      reservations: {
        Row: {
          id: string
          user_id: string
          restaurant_id: number
          restaurant_name: string
          date: string
          time: string
          party_size: number
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          special_requests?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          restaurant_id: number
          restaurant_name: string
          date: string
          time: string
          party_size: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          special_requests?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          restaurant_id?: number
          restaurant_name?: string
          date?: string
          time?: string
          party_size?: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          special_requests?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      cart_details: {
        Row: {
          cart_id: string
          user_id: string
          business_id?: number
          business_name?: string
          delivery_method: 'delivery' | 'pickup'
          delivery_address?: string
          delivery_instructions?: string
          created_at: string
          updated_at: string
          total: number
          item_count: number
          items: any[]
        }
      }
    }
    Functions: {
      calculate_cart_total: {
        Args: { cart_uuid: string }
        Returns: number
      }
      get_cart_item_count: {
        Args: { cart_uuid: string }
        Returns: number
      }
      clear_user_cart: {
        Args: { user_uuid: string }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'] 