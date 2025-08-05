import { supabase } from '@/lib/supabase'
import { Cart } from '@/lib/types'

export interface AddToCartItem {
  menu_item_id: number
  name: string
  price: number
  quantity: number
  image?: string
  special_instructions?: string
}

// Type pour les items stockés en JSONB dans le panier
export interface CartItemJSON {
  id: string
  menu_item_id: number
  name: string
  price: number
  quantity: number
  image?: string
  special_instructions?: string
}

export interface LocalCartItem {
  id: number
  name: string
  price: number
  quantity: number
  image?: string
}

export interface CreateCartItemData {
  menu_item_id?: number
  name: string
  price: number
  quantity: number
  image?: string
  special_instructions?: string
}

export interface UpdateCartItemData {
  quantity?: number
  special_instructions?: string
}

export class CartService {
  /**
   * Récupérer le panier d'un utilisateur
   */
  static async getCart(userId: string): Promise<{ cart: Cart | null; error: string | null }> {
    try {
      // Récupérer le panier principal
      const { data: cartData, error: cartError } = await supabase
        .from('cart')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (cartError) {
        if (cartError.code === 'PGRST116') {
          // Aucun panier trouvé, c'est normal
          return { cart: null, error: null }
        }
        return { cart: null, error: cartError.message }
      }

      if (!cartData) {
        return { cart: null, error: null }
      }

      // Calculer le total et le nombre d'items
      const items = cartData.items || []
      const total = items.reduce((sum: number, item: any) => {
        return sum + (item.price * item.quantity)
      }, 0)
      
      const itemCount = items.reduce((sum: number, item: any) => {
        return sum + item.quantity
      }, 0)

      // Construire l'objet cart complet
      const cart: Cart = {
        id: cartData.id,
        user_id: cartData.user_id,
        business_id: cartData.business_id,
        business_name: cartData.business_name,
        delivery_method: cartData.delivery_method,
        delivery_address: cartData.delivery_address,
        delivery_instructions: cartData.delivery_instructions,
        created_at: cartData.created_at,
        updated_at: cartData.updated_at,
        items: items,
        total: total,
        item_count: itemCount
      }

      return { cart, error: null }
    } catch (error) {
      console.error('Erreur lors de la récupération du panier:', error)
      return { cart: null, error: 'Erreur lors de la récupération du panier' }
    }
  }

  /**
   * Créer un nouveau panier pour un utilisateur
   */
  static async createCart(userId: string, businessId: number, businessName: string): Promise<{ cartId: string | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('cart')
        .insert({
          user_id: userId,
          business_id: businessId,
          business_name: businessName
        })
        .select('id')
        .single()

      if (error) {
        return { cartId: null, error: error.message }
      }

      return { cartId: data.id, error: null }
    } catch (error) {
      console.error('Erreur lors de la création du panier:', error)
      return { cartId: null, error: 'Erreur lors de la création du panier' }
    }
  }

  /**
   * Ajouter un article au panier
   */
  static async addToCart(
    userId: string, 
    item: AddToCartItem, 
    businessId: number, 
    businessName: string
  ): Promise<{ success: boolean; error: string | null; cart: Cart | null }> {
    try {
      // Vérifier si l'utilisateur a déjà un panier
      let { cart } = await this.getCart(userId)
      
      // Si pas de panier, en créer un nouveau
      if (!cart) {
        const { cartId, error: createError } = await this.createCart(userId, businessId, businessName)
        if (createError) {
          return { success: false, error: createError, cart: null }
        }
        
        // Récupérer le nouveau panier
        const result = await this.getCart(userId)
        cart = result.cart
        if (!cart) {
          return { success: false, error: 'Erreur lors de la création du panier', cart: null }
        }
      } else {
        // Vérifier si le panier existant appartient au même commerce
        if (cart.business_id !== businessId) {
          console.log(`Panier existant pour le commerce ${cart.business_id}, nouvel article pour le commerce ${businessId}. Vidage du panier existant.`)
          
          // Vider le panier existant
          await this.clearCart(userId)
          
          // Créer un nouveau panier pour le nouveau commerce
          const { cartId, error: createError } = await this.createCart(userId, businessId, businessName)
          if (createError) {
            return { success: false, error: createError, cart: null }
          }
          
          // Récupérer le nouveau panier
          const result = await this.getCart(userId)
          cart = result.cart
          if (!cart) {
            return { success: false, error: 'Erreur lors de la création du panier', cart: null }
          }
        }
      }

      // Vérifier si l'article existe déjà dans le panier
      const existingItemIndex = cart.items.findIndex(cartItem => 
        cartItem.menu_item_id === item.menu_item_id && 
        cartItem.name === item.name
      )

      let updatedItems: CartItemJSON[] = [...cart.items]

      if (existingItemIndex !== -1) {
        // Mettre à jour la quantité de l'article existant
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + item.quantity
        }
      } else {
        // Ajouter le nouvel article avec un ID unique
        const newItem: CartItemJSON = {
          id: crypto.randomUUID(), // Générer un ID unique
          menu_item_id: item.menu_item_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          special_instructions: item.special_instructions
        }
        updatedItems.push(newItem)
      }

      // Mettre à jour le panier avec les nouveaux items
      const { error } = await supabase
        .from('cart')
        .update({ 
          items: updatedItems,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (error) {
        return { success: false, error: error.message, cart: null }
      }

      // Récupérer le panier mis à jour
      const { cart: updatedCart } = await this.getCart(userId)
      return { success: true, error: null, cart: updatedCart }
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error)
      return { success: false, error: 'Erreur lors de l\'ajout au panier', cart: null }
    }
  }

  /**
   * Mettre à jour la quantité d'un article
   */
  static async updateQuantity(itemId: string, quantity: number): Promise<{ success: boolean; error: string | null; cart: Cart | null }> {
    try {
      // Récupérer l'utilisateur à partir de l'item
      const userId = await this.getUserIdFromCartItem(itemId)
      if (!userId) {
        return { success: false, error: 'Utilisateur non trouvé', cart: null }
      }

      // Récupérer le panier actuel
      const { cart } = await this.getCart(userId)
      if (!cart) {
        return { success: false, error: 'Panier non trouvé', cart: null }
      }

      // Trouver l'item dans le panier
      const itemIndex = cart.items.findIndex(item => item.id === itemId)
      if (itemIndex === -1) {
        return { success: false, error: 'Article non trouvé dans le panier', cart: null }
      }

      if (quantity <= 0) {
        // Supprimer l'article
        const updatedItems = cart.items.filter(item => item.id !== itemId)
        
        const { error } = await supabase
          .from('cart')
          .update({ 
            items: updatedItems,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)

        if (error) {
          return { success: false, error: error.message, cart: null }
        }
      } else {
        // Mettre à jour la quantité
        const updatedItems = [...cart.items]
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          quantity: quantity
        }

        const { error } = await supabase
          .from('cart')
          .update({ 
            items: updatedItems,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)

        if (error) {
          return { success: false, error: error.message, cart: null }
        }
      }

      // Récupérer le panier mis à jour
      const { cart: updatedCart } = await this.getCart(userId)
      return { success: true, error: null, cart: updatedCart }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la quantité:', error)
      return { success: false, error: 'Erreur lors de la mise à jour de la quantité', cart: null }
    }
  }

  /**
   * Récupérer l'ID de l'utilisateur à partir d'un article du panier
   */
  static async getUserIdFromCartItem(itemId: string): Promise<string | null> {
    try {
      // Chercher dans tous les paniers pour trouver l'item
      const { data: carts, error } = await supabase
        .from('cart')
        .select('user_id, items')
        .not('items', 'is', null)

      if (error || !carts) {
        return null
      }

      // Chercher l'item dans les paniers
      for (const cart of carts) {
        const items = cart.items || []
        const foundItem = items.find((item: any) => item.id === itemId)
        if (foundItem) {
          return cart.user_id
        }
      }

      return null
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error)
      return null
    }
  }

  /**
   * Supprimer un article du panier
   */
  static async removeFromCart(itemId: string): Promise<{ success: boolean; error: string | null; cart: Cart | null }> {
    try {
      // Récupérer l'ID de l'utilisateur avant de supprimer
      const userId = await this.getUserIdFromCartItem(itemId)
      if (!userId) {
        return { success: false, error: 'Utilisateur non trouvé', cart: null }
      }

      // Récupérer le panier actuel
      const { cart } = await this.getCart(userId)
      if (!cart) {
        return { success: false, error: 'Panier non trouvé', cart: null }
      }

      // Filtrer l'article à supprimer
      const updatedItems = cart.items.filter(item => item.id !== itemId)

      // Mettre à jour le panier
      const { error } = await supabase
        .from('cart')
        .update({ 
          items: updatedItems,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (error) {
        return { success: false, error: error.message, cart: null }
      }

      // Récupérer le panier mis à jour
      const { cart: updatedCart } = await this.getCart(userId)
      return { success: true, error: null, cart: updatedCart }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'article:', error)
      return { success: false, error: 'Erreur lors de la suppression de l\'article', cart: null }
    }
  }

  /**
   * Vider le panier d'un utilisateur
   */
  static async clearCart(userId: string): Promise<{ success: boolean; error: string | null; cart: Cart | null }> {
    try {
      const { error } = await supabase
        .from('cart')
        .update({ 
          items: [],
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (error) {
        return { success: false, error: error.message, cart: null }
      }

      // Retourner un panier vide
      const emptyCart: Cart = {
        id: '',
        user_id: userId,
        business_id: 0,
        business_name: '',
        items: [],
        total: 0,
        item_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      return { success: true, error: null, cart: emptyCart }
    } catch (error) {
      console.error('Erreur lors du vidage du panier:', error)
      return { success: false, error: 'Erreur lors du vidage du panier', cart: null }
    }
  }

  /**
   * Synchroniser les articles du localStorage vers la base de données
   */
  static async syncFromLocal(
    userId: string, 
    localItems: LocalCartItem[], 
    businessId: number, 
    businessName: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      if (localItems.length === 0) {
        return { success: true, error: null }
      }

      // Créer ou récupérer le panier
      let { cart } = await this.getCart(userId)
      if (!cart) {
        const { cartId, error: createError } = await this.createCart(userId, businessId, businessName)
        if (createError) {
          return { success: false, error: createError }
        }
        
        const result = await this.getCart(userId)
        cart = result.cart
        if (!cart) {
          return { success: false, error: 'Erreur lors de la création du panier' }
        }
      }

      // Ajouter chaque article du localStorage
      for (const localItem of localItems) {
        const existingItem = cart.items.find(cartItem => 
          cartItem.menu_item_id === localItem.id && 
          cartItem.name === localItem.name
        )

        if (existingItem) {
          // Mettre à jour la quantité
          await this.updateQuantity(existingItem.id, existingItem.quantity + localItem.quantity)
        } else {
          // Ajouter le nouvel article
          await supabase
            .from('cart_items')
            .insert({
              cart_id: cart.id,
              menu_item_id: localItem.id,
              name: localItem.name,
              price: localItem.price,
              quantity: localItem.quantity,
              image: localItem.image
            })
        }
      }

      return { success: true, error: null }
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error)
      return { success: false, error: 'Erreur lors de la synchronisation' }
    }
  }

  // Mettre à jour les informations de livraison
  static async updateDeliveryInfo(userId: string, deliveryMethod: 'delivery' | 'pickup', deliveryAddress?: string, deliveryInstructions?: string): Promise<{ cart: Cart | null; error: string | null }> {
    try {
      const { cart: existingCart } = await this.getCart(userId)
      
      if (!existingCart) {
        return { cart: null, error: 'Aucun panier trouvé' }
      }

      const { error } = await supabase
        .from('cart')
        .update({
          delivery_method: deliveryMethod,
          delivery_address: deliveryAddress,
          delivery_instructions: deliveryInstructions,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingCart.id)

      if (error) {
        return { cart: null, error: error.message }
      }

      // Retourner le panier mis à jour
      return this.getCart(userId)
    } catch (error) {
      console.error('Erreur lors de la mise à jour des informations de livraison:', error)
      return { cart: null, error: 'Erreur lors de la mise à jour des informations de livraison' }
    }
  }

  // Convertir le panier en commande (vider le panier après)
  static async convertCartToOrder(userId: string, orderData: any): Promise<{ orderId: string | null; error: string | null }> {
    try {
      // Récupérer le panier actuel
      const { cart: currentCart } = await this.getCart(userId)
      
      if (!currentCart || currentCart.items.length === 0) {
        return { orderId: null, error: 'Le panier est vide' }
      }

      // Ici, vous pouvez appeler le service de commande pour créer la commande
      // const { order, error } = await OrderService.createOrder({
      //   ...orderData,
      //   items: currentCart.items,
      //   total: currentCart.total
      // })

      // Si la commande est créée avec succès, vider le panier
      // if (order) {
      //   await this.clearCart(userId)
      //   return { orderId: order.id, error: null }
      // }

      // Pour l'instant, retourner un ID fictif
      const orderId = crypto.randomUUID()
      
      // Vider le panier
      await this.clearCart(userId)
      
      return { orderId, error: null }
    } catch (error) {
      console.error('Erreur lors de la conversion du panier en commande:', error)
      return { orderId: null, error: 'Erreur lors de la conversion du panier en commande' }
    }
  }

  // S'abonner aux changements du panier (temps réel)
  static subscribeToCartChanges(userId: string, callback: (cart: Cart | null) => void) {
    return supabase
      .channel(`cart:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart',
          filter: `user_id=eq.${userId}`
        },
        async (payload) => {
          // Récupérer le panier mis à jour
          const { cart } = await this.getCart(userId)
          callback(cart)
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items',
          filter: `cart_id=eq.${userId}`
        },
        async (payload) => {
          // Récupérer le panier mis à jour
          const { cart } = await this.getCart(userId)
          callback(cart)
        }
      )
      .subscribe()
  }
} 