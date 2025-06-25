import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { OrderService, type Order, CreateOrderData } from '@/lib/services/orders';

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
  cart: OrderItem[];
  currentRestaurantId: number | null;
  currentRestaurantName: string | null;
  orders: LocalOrder[];
  deliveryMethod: DeliveryMethod;
  setDeliveryMethod: (method: DeliveryMethod) => void;
  addToCart: (item: OrderItem, restaurantId: number, restaurantName: string) => void;
  removeFromCart: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  placeOrder: (deliveryAddress: string) => Promise<string>;
  getCartTotal: () => number;
  getCartCount: () => number;
  getOrderById: (orderId: string) => LocalOrder | undefined;
  cancelOrder: (orderId: string) => Promise<void>;
  loadUserOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [orders, setOrders] = useState<LocalOrder[]>([]);
  const [currentRestaurantId, setCurrentRestaurantId] = useState<number | null>(null);
  const [currentRestaurantName, setCurrentRestaurantName] = useState<string | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Load cart from localStorage on initial load
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedRestaurantId = localStorage.getItem('restaurantId');
    const savedRestaurantName = localStorage.getItem('restaurantName');
    const savedDeliveryMethod = localStorage.getItem('deliveryMethod');
    
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    if (savedRestaurantId) {
      setCurrentRestaurantId(JSON.parse(savedRestaurantId));
    }
    if (savedRestaurantName) {
      setCurrentRestaurantName(JSON.parse(savedRestaurantName));
    }
    if (savedDeliveryMethod) {
      setDeliveryMethod(JSON.parse(savedDeliveryMethod) as DeliveryMethod);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('restaurantId', JSON.stringify(currentRestaurantId));
    localStorage.setItem('restaurantName', JSON.stringify(currentRestaurantName));
    localStorage.setItem('deliveryMethod', JSON.stringify(deliveryMethod));
  }, [cart, currentRestaurantId, currentRestaurantName, deliveryMethod]);

  // Load user orders when user is authenticated
  useEffect(() => {
    if (currentUser) {
      loadUserOrders();
    }
  }, [currentUser]);

  const loadUserOrders = async () => {
    if (!currentUser) return;

    try {
      const { orders: userOrders, error } = await OrderService.getUserOrders(currentUser.id);
      
      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger vos commandes",
          variant: "destructive",
        });
        return;
      }

      // Convertir les commandes Supabase vers le format local
      const convertedOrders: LocalOrder[] = userOrders.map(order => ({
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

      setOrders(convertedOrders);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
    }
  };

  const addToCart = (item: OrderItem, restaurantId: number, restaurantName: string) => {
    // Only allow adding to cart if user is logged in as customer
    if (!currentUser || currentUser.role !== 'customer') {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter en tant que client pour ajouter des articles au panier.",
        variant: "destructive",
      });
      return;
    }

    // If adding from a different restaurant, clear cart first
    if (currentRestaurantId !== null && currentRestaurantId !== restaurantId) {
      toast({
        title: "Panier vidé",
        description: "Vous ne pouvez commander que d'un restaurant à la fois.",
      });
      setCart([item]);
      setCurrentRestaurantId(restaurantId);
      setCurrentRestaurantName(restaurantName);
      return;
    }

    setCart(prev => {
      const existingItemIndex = prev.findIndex(i => i.id === item.id);
      if (existingItemIndex >= 0) {
        const updatedCart = [...prev];
        updatedCart[existingItemIndex].quantity += item.quantity;
        return updatedCart;
      } else {
        return [...prev, item];
      }
    });

    if (currentRestaurantId === null) {
      setCurrentRestaurantId(restaurantId);
      setCurrentRestaurantName(restaurantName);
    }

    toast({
      title: "Ajouté au panier",
      description: `${item.name} a été ajouté à votre panier.`,
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
    if (cart.length === 1) {
      setCurrentRestaurantId(null);
      setCurrentRestaurantName(null);
    }
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setCurrentRestaurantId(null);
    setCurrentRestaurantName(null);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const generateOrderId = () => {
    // Générer un UUID valide
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

    if (cart.length === 0 || !currentRestaurantId || !currentRestaurantName) {
      toast({
        title: "Erreur",
        description: "Votre panier est vide ou le restaurant n'est pas spécifié.",
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

    const orderData: CreateOrderData = {
      id: generateOrderId(),
      user_id: currentUser.id,
      business_id: currentRestaurantId,
      business_name: currentRestaurantName,
      items: cart,
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
        clearCart();

        toast({
          title: "Commande passée",
          description: `Votre commande #${order.id} a été confirmée.`,
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
    currentRestaurantId,
    currentRestaurantName,
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
    loadUserOrders
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
