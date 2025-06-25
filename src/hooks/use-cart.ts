import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { CartService, AddToCartItem, LocalCartItem } from '@/lib/services/cart'
import { Cart } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

export interface UseCartReturn {
  cart: Cart | null
  loading: boolean
  error: string | null
  addToCart: (item: AddToCartItem, businessId: number, businessName: string) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  syncFromLocal: (localItems: LocalCartItem[], businessId: number, businessName: string) => Promise<void>
  refreshCart: () => Promise<void>
}

export function useCart(): UseCartReturn {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Charger le panier au montage et quand l'utilisateur change
  useEffect(() => {
    if (currentUser) {
      loadCart()
    } else {
      setCart(null)
      setError(null)
    }
  }, [currentUser])

  // Charger le panier depuis la base de données
  const loadCart = useCallback(async () => {
    if (!currentUser) return

    setLoading(true)
    setError(null)

    try {
      const { cart: cartData, error: cartError } = await CartService.getCart(currentUser.id)
      
      if (cartError) {
        setError(cartError)
        toast({
          title: "Erreur",
          description: cartError,
          variant: "destructive",
        })
      } else {
        setCart(cartData)
      }
    } catch (err) {
      const errorMessage = 'Erreur lors du chargement du panier'
      setError(errorMessage)
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [currentUser, toast])

  // Ajouter un article au panier
  const addToCart = useCallback(async (item: AddToCartItem, businessId: number, businessName: string) => {
    if (!currentUser) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour ajouter des articles au panier.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { success, error: addError } = await CartService.addToCart(
        currentUser.id,
        item,
        businessId,
        businessName
      )

      if (addError) {
        setError(addError)
        toast({
          title: "Erreur",
          description: addError,
          variant: "destructive",
        })
      } else if (success) {
        // Recharger le panier pour avoir les données à jour
        await loadCart()
        toast({
          title: "Ajouté au panier",
          description: `${item.name} a été ajouté à votre panier.`,
        })
      }
    } catch (err) {
      const errorMessage = 'Erreur lors de l\'ajout au panier'
      setError(errorMessage)
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [currentUser, loadCart, toast])

  // Mettre à jour la quantité d'un article
  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (!currentUser) return

    setLoading(true)
    setError(null)

    try {
      const { success, error: updateError } = await CartService.updateQuantity(itemId, quantity)

      if (updateError) {
        setError(updateError)
        toast({
          title: "Erreur",
          description: updateError,
          variant: "destructive",
        })
      } else if (success) {
        // Recharger le panier pour avoir les données à jour
        await loadCart()
        toast({
          title: "Quantité mise à jour",
          description: "La quantité a été mise à jour dans votre panier.",
        })
      }
    } catch (err) {
      const errorMessage = 'Erreur lors de la mise à jour de la quantité'
      setError(errorMessage)
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [currentUser, loadCart, toast])

  // Supprimer un article du panier
  const removeFromCart = useCallback(async (itemId: string) => {
    if (!currentUser) return

    setLoading(true)
    setError(null)

    try {
      const { success, error: removeError } = await CartService.removeFromCart(itemId)

      if (removeError) {
        setError(removeError)
        toast({
          title: "Erreur",
          description: removeError,
          variant: "destructive",
        })
      } else if (success) {
        // Recharger le panier pour avoir les données à jour
        await loadCart()
        toast({
          title: "Article supprimé",
          description: "L'article a été retiré de votre panier.",
        })
      }
    } catch (err) {
      const errorMessage = 'Erreur lors de la suppression'
      setError(errorMessage)
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [currentUser, loadCart, toast])

  // Vider le panier
  const clearCart = useCallback(async () => {
    if (!currentUser) return

    setLoading(true)
    setError(null)

    try {
      const { success, error: clearError } = await CartService.clearCart(currentUser.id)

      if (clearError) {
        setError(clearError)
        toast({
          title: "Erreur",
          description: clearError,
          variant: "destructive",
        })
      } else if (success) {
        setCart(null)
        toast({
          title: "Panier vidé",
          description: "Votre panier a été vidé avec succès.",
        })
      }
    } catch (err) {
      const errorMessage = 'Erreur lors du vidage du panier'
      setError(errorMessage)
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [currentUser, toast])

  // Synchroniser depuis le localStorage
  const syncFromLocal = useCallback(async (
    localItems: LocalCartItem[], 
    businessId: number, 
    businessName: string
  ) => {
    if (!currentUser) return

    setLoading(true)
    setError(null)

    try {
      const { success, error: syncError } = await CartService.syncFromLocal(
        currentUser.id, 
        localItems, 
        businessId, 
        businessName
      )

      if (syncError) {
        setError(syncError)
        toast({
          title: "Erreur de synchronisation",
          description: syncError,
          variant: "destructive",
        })
      } else if (success) {
        // Recharger le panier pour avoir les données à jour
        await loadCart()
        toast({
          title: "Synchronisation réussie",
          description: "Votre panier local a été synchronisé avec votre compte.",
        })
      }
    } catch (err) {
      const errorMessage = 'Erreur lors de la synchronisation'
      setError(errorMessage)
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [currentUser, loadCart, toast])

  // Recharger le panier
  const refreshCart = useCallback(async () => {
    await loadCart();
  }, [loadCart]);

  return {
    cart,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    syncFromLocal,
    refreshCart,
  }
} 