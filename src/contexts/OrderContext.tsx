import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { OrderService, type Order, CreateOrderData } from '@/lib/services/orders';
import { CartService, type Cart } from '@/lib/services/cart';

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
export type DeliveryMethod = 'delivery' | 'pickup';

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface LocalOrder {
  id: string;
  restaurantId: number;
  restaurantName: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  deliveryFee: number;
  tax: number;
  grandTotal: number;
  createdAt: string;
  estimatedDelivery: string;
  deliveryAddress: string;
  deliveryMethod: DeliveryMethod;
  driverName?: string;
  driverPhone?: string;
  driverLocation?: {
    lat: number;
    lng: number;
  };
}

interface OrderContextType {
  cart: Cart | null;
  orders: LocalOrder[];
  deliveryMethod: DeliveryMethod;
  setDeliveryMethod: (method: DeliveryMethod) => void;
  addToCart: (item: OrderItem, businessId: number, businessName: string) => void;
  removeFromCart: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  placeOrder: (deliveryAddress: string) => Promise<string>;
  getCartTotal: () => number;
  getCartCount: () => number;
  getOrderById: (orderId: string) => LocalOrder | undefined;
  cancelOrder: (orderId: string) => Promise<void>;
  loadUserOrders: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [orders, setOrders] = useState<LocalOrder[]>([]);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Load delivery method from localStorage on initial load
  useEffect(() => {
    const savedDeliveryMethod = localStorage.getItem('deliveryMethod');
    if (savedDeliveryMethod) {
      setDeliveryMethod(JSON.parse(savedDeliveryMethod) as DeliveryMethod);
    }
  }, []);

  // Save delivery method to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('deliveryMethod', JSON.stringify(deliveryMethod));
  }, [deliveryMethod]);

  // Load user orders when user is authenticated (OPTIMISÉ - lazy loading)
  useEffect(() => {
    // NE charger les commandes QUE pour les customers
    // Les partenaires et drivers ont leurs propres pages de commandes
    if (currentUser && currentUser.role === 'customer') {
      // Charger après un délai pour ne pas bloquer le rendu initial
      const timer = setTimeout(() => {
        loadUserOrders();
        refreshCart();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentUser]);

  const loadUserOrders = async () => {
    if (!currentUser) return;

    try {
      const { orders: userOrders, error } = await OrderService.getUserOrders(currentUser.id);
      
      if (error) {
        console.error('Erreur lors du chargement des commandes:', error);
        return;
      }

      // Convertir les commandes Supabase vers le format local
      const localOrders: LocalOrder[] = userOrders.map(order => ({
        id: order.id,
        restaurantId: order.business_id,
        restaurantName: order.business_name,
        items: order.items as OrderItem[],
        status: order.status,
        total: order.total,
        deliveryFee: order.delivery_fee,
        tax: order.tax,
        grandTotal: order.grand_total,
        createdAt: order.created_at,
        estimatedDelivery: order.estimated_delivery,
        deliveryAddress: order.delivery_address,
        deliveryMethod: order.delivery_method as DeliveryMethod,
        driverName: order.driver_name,
        driverPhone: order.driver_phone,
        driverLocation: order.driver_location as { lat: number; lng: number } | undefined
      }));

      setOrders(localOrders);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
    }
  };

  const refreshCart = async () => {
    if (!currentUser) return;

    try {
      const { cart: userCart, error } = await CartService.getCart(currentUser.id);
      
      if (error) {
        console.error('Erreur lors du chargement du panier:', error);
        return;
      }

      setCart(userCart);
    } catch (error) {
      console.error('Erreur lors du chargement du panier:', error);
    }
  };

  const addToCart = async (item: OrderItem, businessId: number, businessName: string) => {
    if (!currentUser || currentUser.role !== 'customer') {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter en tant que client pour ajouter des articles au panier.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { success, error } = await CartService.addToCart(
        currentUser.id,
        {
          menu_item_id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        },
        businessId,
        businessName
      );

      if (error) {
        toast({
          title: "Erreur",
          description: error,
          variant: "destructive",
        });
        return;
      }

      if (success) {
        await refreshCart();
        toast({
          title: "Ajouté au panier",
          description: `${item.name} a été ajouté à votre panier.`,
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout au panier.",
        variant: "destructive",
      });
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!currentUser) return;

    try {
      const { success, error } = await CartService.removeFromCart(itemId);
      
      if (error) {
        toast({
          title: "Erreur",
          description: error,
          variant: "destructive",
        });
        return;
      }

      if (success) {
        await refreshCart();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression.",
        variant: "destructive",
      });
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!currentUser) return;

    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    try {
      const { success, error } = await CartService.updateQuantity(itemId, quantity);
      
      if (error) {
        toast({
          title: "Erreur",
          description: error,
          variant: "destructive",
        });
        return;
      }

      if (success) {
        await refreshCart();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour.",
        variant: "destructive",
      });
    }
  };

  const clearCart = async () => {
    if (!currentUser) return;

    try {
      const { success, error } = await CartService.clearCart(currentUser.id);
      
      if (error) {
        toast({
          title: "Erreur",
          description: error,
          variant: "destructive",
        });
        return;
      }

      if (success) {
        await refreshCart();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du vidage du panier.",
        variant: "destructive",
      });
    }
  };

  const getCartTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((count, item) => count + item.quantity, 0);
  };

  const generateOrderId = () => {
    return crypto.randomUUID();
  };

  const placeOrder = async (deliveryAddress: string): Promise<string> => {
    if (!currentUser || currentUser.role !== 'customer') {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter en tant que client pour passer une commande.",
        variant: "destructive",
      });
      return "";
    }

    if (!cart || cart.items.length === 0) {
      toast({
        title: "Erreur",
        description: "Votre panier est vide.",
        variant: "destructive",
      });
      return "";
    }

    // Récupérer les informations du commerce depuis le panier
    const businessId = cart.business_id;
    const businessName = cart.business_name;

    if (!businessId || !businessName) {
      toast({
        title: "Erreur",
        description: "Informations du commerce manquantes.",
        variant: "destructive",
      });
      return "";
    }

    const subtotal = getCartTotal();
    const tax = subtotal * 0.18; // 18% VAT in Guinea
    const deliveryFee = deliveryMethod === 'delivery' ? 15000 : 0; // 15,000 GNF delivery fee
    const grandTotal = subtotal + tax + deliveryFee;

    // Calculate estimated delivery time (30-45 minutes from now)
    const now = new Date();
    const estimatedDelivery = new Date(now.getTime() + (30 + Math.random() * 15) * 60000);

    // Convertir les articles du panier vers le format de commande
    const orderItems = cart.items.map(item => ({
      id: item.menu_item_id || item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image
    }));

    const orderData: CreateOrderData = {
      id: generateOrderId(),
      user_id: currentUser.id,
      business_id: businessId,
      business_name: businessName,
      items: orderItems,
      status: 'pending',
      total: subtotal,
      delivery_fee: deliveryFee,
      tax: tax,
      grand_total: grandTotal,
      delivery_address: deliveryAddress,
      delivery_method: deliveryMethod,
      estimated_delivery: estimatedDelivery.toISOString(),
      payment_method: 'cash',
      payment_status: 'pending'
    };

    try {
      const { order, error } = await OrderService.createOrder(orderData);
      
      if (error) {
        toast({
          title: "Erreur",
          description: error,
          variant: "destructive",
        });
        return "";
      }

      if (order) {
        // Convertir la commande Supabase vers le format local
        const localOrder: LocalOrder = {
          id: order.id,
          restaurantId: order.business_id,
          restaurantName: order.business_name,
          items: order.items as OrderItem[],
          status: order.status,
          total: order.total,
          deliveryFee: order.delivery_fee,
          tax: order.tax,
          grandTotal: order.grand_total,
          createdAt: order.created_at,
          estimatedDelivery: order.estimated_delivery,
          deliveryAddress: order.delivery_address,
          deliveryMethod: order.delivery_method as DeliveryMethod,
          driverName: order.driver_name,
          driverPhone: order.driver_phone,
          driverLocation: order.driver_location as { lat: number; lng: number } | undefined
        };

        // Ajouter la nouvelle commande à la liste
        setOrders(prev => [localOrder, ...prev]);

        // Vider le panier
        await clearCart();

        toast({
          title: "Commande passée",
          description: `Votre commande #${order.id.substring(0, 8)} a été confirmée.`,
        });

        return order.id;
      }

      return "";
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de la commande.",
        variant: "destructive",
      });
      return "";
    }
  };

  const getOrderById = (orderId: string) => {
    return orders.find(order => order.id === orderId);
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const { error } = await OrderService.cancelOrder(orderId);
      
      if (error) {
        toast({
          title: "Erreur",
          description: error,
          variant: "destructive",
        });
        return;
      }

      // Mettre à jour la commande dans l'état local
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status: 'cancelled' as OrderStatus }
            : order
        )
      );

      toast({
        title: "Commande annulée",
        description: "Votre commande a été annulée avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'annulation de la commande.",
        variant: "destructive",
      });
    }
  };

  const value = {
    cart,
    orders,
    deliveryMethod,
    setDeliveryMethod,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    placeOrder,
    getCartTotal,
    getCartCount,
    getOrderById,
    cancelOrder,
    loadUserOrders,
    refreshCart
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

export function useOrder() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}
