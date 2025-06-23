import { useState, useEffect } from 'react'
import { AuthService, type AuthUser } from '@/lib/services/auth'
import { RestaurantService, type Restaurant, type MenuItem } from '@/lib/services/restaurants'
import { OrderService, type Order } from '@/lib/services/orders'
import { useToast } from '@/hooks/use-toast'

// Hook pour l'authentification
export const useSupabaseAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { user, error } = await AuthService.getCurrentUser()
        if (error) {
          console.warn('Erreur d\'authentification:', error)
        } else {
          setUser(user)
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'auth:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Écouter les changements d'authentification
    const { data: { subscription } } = AuthService.onAuthStateChange((user) => {
      setUser(user)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { user, error } = await AuthService.login(email, password)
      if (error) {
        toast({
          title: "Erreur de connexion",
          description: error,
          variant: "destructive",
        })
        return false
      }
      setUser(user)
      return true
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la connexion",
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const signup = async (userData: {
    email: string
    password: string
    name: string
    role: 'customer' | 'partner'
    phone_number?: string
    address?: string
  }) => {
    setLoading(true)
    try {
      const { user, error } = await AuthService.signup(userData)
      if (error) {
        toast({
          title: "Erreur d'inscription",
          description: error,
          variant: "destructive",
        })
        return false
      }
      setUser(user)
      return true
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'inscription",
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await AuthService.logout()
      setUser(null)
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  return {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user
  }
}

// Hook pour les restaurants
export const useRestaurants = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchRestaurants = async () => {
    setLoading(true)
    try {
      const { restaurants, error } = await RestaurantService.getAllRestaurants()
      if (error) {
        toast({
          title: "Erreur",
          description: error,
          variant: "destructive",
        })
        return
      }
      setRestaurants(restaurants)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les restaurants",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const searchRestaurants = async (query: string) => {
    setLoading(true)
    try {
      const { restaurants, error } = await RestaurantService.searchRestaurants(query)
      if (error) {
        toast({
          title: "Erreur de recherche",
          description: error,
          variant: "destructive",
        })
        return
      }
      setRestaurants(restaurants)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la recherche",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getRestaurantById = async (id: number) => {
    try {
      const { restaurant, error } = await RestaurantService.getRestaurantById(id)
      if (error) {
        toast({
          title: "Erreur",
          description: error,
          variant: "destructive",
        })
        return null
      }
      return restaurant
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger le restaurant",
        variant: "destructive",
      })
      return null
    }
  }

  const getRestaurantMenu = async (restaurantId: number) => {
    try {
      const { menuItems, error } = await RestaurantService.getRestaurantMenu(restaurantId)
      if (error) {
        toast({
          title: "Erreur",
          description: error,
          variant: "destructive",
        })
        return []
      }
      return menuItems
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger le menu",
        variant: "destructive",
      })
      return []
    }
  }

  return {
    restaurants,
    loading,
    fetchRestaurants,
    searchRestaurants,
    getRestaurantById,
    getRestaurantMenu
  }
}

// Hook pour les commandes
export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchUserOrders = async (userId: string) => {
    setLoading(true)
    try {
      const { orders, error } = await OrderService.getUserOrders(userId)
      if (error) {
        toast({
          title: "Erreur",
          description: error,
          variant: "destructive",
        })
        return
      }
      setOrders(orders)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les commandes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createOrder = async (orderData: any) => {
    try {
      const { order, error } = await OrderService.createOrder(orderData)
      if (error) {
        toast({
          title: "Erreur",
          description: error,
          variant: "destructive",
        })
        return null
      }
      return order
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la création de la commande",
        variant: "destructive",
      })
      return null
    }
  }

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const { order, error } = await OrderService.updateOrderStatus(orderId, status)
      if (error) {
        toast({
          title: "Erreur",
          description: error,
          variant: "destructive",
        })
        return false
      }
      return true
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour du statut",
        variant: "destructive",
      })
      return false
    }
  }

  const cancelOrder = async (orderId: string) => {
    try {
      const { error } = await OrderService.cancelOrder(orderId)
      if (error) {
        toast({
          title: "Erreur",
          description: error,
          variant: "destructive",
        })
        return false
      }
      return true
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'annulation",
        variant: "destructive",
      })
      return false
    }
  }

  return {
    orders,
    loading,
    fetchUserOrders,
    createOrder,
    updateOrderStatus,
    cancelOrder
  }
} 