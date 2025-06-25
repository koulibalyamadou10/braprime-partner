import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { OrderService, type Order } from '@/lib/services/orders';
import { useToast } from '@/hooks/use-toast';

export interface DashboardOrder {
  id: string;
  customerName: string;
  customerPhone?: string;
  customerAddress: string;
  orderDate: string;
  deliveryTime: string;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    specialInstructions?: string;
  }[];
  total: number;
  status: Order['status'];
  paymentMethod: string;
  deliveryMethod: string;
  businessName: string;
  estimatedDelivery: string;
  driverName?: string;
  driverPhone?: string;
}

export const useDashboardOrders = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Récupérer les commandes d'un utilisateur (client)
  const fetchUserOrders = useCallback(async () => {
    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      const { orders: userOrders, error: fetchError } = await OrderService.getUserOrders(currentUser.id);
      
      if (fetchError) {
        setError(fetchError);
        toast({
          title: "Erreur",
          description: fetchError,
          variant: "destructive",
        });
        return;
      }

      // Convertir les commandes Supabase vers le format du dashboard
      const dashboardOrders: DashboardOrder[] = userOrders.map(order => ({
        id: order.id,
        customerName: 'Vous',
        customerPhone: currentUser.phoneNumber || undefined,
        customerAddress: order.delivery_address,
        orderDate: order.created_at,
        deliveryTime: order.estimated_delivery,
        items: Array.isArray(order.items) ? order.items.map((item: any, index: number) => ({
          id: item.id || `item-${index}`,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          specialInstructions: item.specialInstructions
        })) : [],
        total: order.grand_total,
        status: order.status,
        paymentMethod: order.payment_method,
        deliveryMethod: order.delivery_method,
        businessName: order.business_name,
        estimatedDelivery: order.estimated_delivery,
        driverName: order.driver_name,
        driverPhone: order.driver_phone
      }));

      setOrders(dashboardOrders);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des commandes';
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser, toast]);

  // Récupérer les commandes d'un commerce (partenaire)
  const fetchBusinessOrders = useCallback(async (businessId: number) => {
    setLoading(true);
    setError(null);

    try {
      const { orders: businessOrders, error: fetchError } = await OrderService.getBusinessOrders(businessId);
      
      if (fetchError) {
        setError(fetchError);
        toast({
          title: "Erreur",
          description: fetchError,
          variant: "destructive",
        });
        return;
      }

      // Convertir les commandes Supabase vers le format du dashboard
      const dashboardOrders: DashboardOrder[] = businessOrders.map(order => ({
        id: order.id,
        customerName: `Client ${order.id.slice(-4)}`, // Fallback si pas de nom client
        customerPhone: order.driver_phone, // Utiliser le téléphone du livreur comme fallback
        customerAddress: order.delivery_address,
        orderDate: order.created_at,
        deliveryTime: order.estimated_delivery,
        items: Array.isArray(order.items) ? order.items.map((item: any, index: number) => ({
          id: item.id || `item-${index}`,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          specialInstructions: item.specialInstructions
        })) : [],
        total: order.grand_total,
        status: order.status,
        paymentMethod: order.payment_method,
        deliveryMethod: order.delivery_method,
        businessName: order.business_name,
        estimatedDelivery: order.estimated_delivery,
        driverName: order.driver_name,
        driverPhone: order.driver_phone
      }));

      setOrders(dashboardOrders);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des commandes';
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Mettre à jour le statut d'une commande
  const updateOrderStatus = useCallback(async (orderId: string, newStatus: Order['status']) => {
    try {
      const { order, error: updateError } = await OrderService.updateOrderStatus(orderId, newStatus);
      
      if (updateError) {
        toast({
          title: "Erreur",
          description: updateError,
          variant: "destructive",
        });
        return false;
      }

      // Mettre à jour la commande dans l'état local
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );

      toast({
        title: "Succès",
        description: `Statut de la commande mis à jour vers ${newStatus}`,
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  // Annuler une commande
  const cancelOrder = useCallback(async (orderId: string) => {
    try {
      const { error: cancelError } = await OrderService.cancelOrder(orderId);
      
      if (cancelError) {
        toast({
          title: "Erreur",
          description: cancelError,
          variant: "destructive",
        });
        return false;
      }

      // Mettre à jour la commande dans l'état local
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: 'cancelled' }
            : order
        )
      );

      toast({
        title: "Succès",
        description: "Commande annulée avec succès",
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'annulation';
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  // Filtrer les commandes par statut
  const getOrdersByStatus = useCallback((status: Order['status'] | 'all') => {
    if (status === 'all') return orders;
    return orders.filter(order => order.status === status);
  }, [orders]);

  // Obtenir les statistiques des commandes
  const getOrderStats = useMemo(() => {
    const totalOrders = orders.length;
    const newOrders = orders.filter(order => order.status === 'pending').length;
    const preparingOrders = orders.filter(order => order.status === 'preparing').length;
    const readyOrders = orders.filter(order => order.status === 'ready').length;
    const deliveringOrders = orders.filter(order => order.status === 'picked_up').length;
    const completedOrders = orders.filter(order => order.status === 'delivered').length;
    const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;
    const totalRevenue = orders
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + order.total, 0);

    return {
      totalOrders,
      newOrders,
      preparingOrders,
      readyOrders,
      deliveringOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue
    };
  }, [orders]);

  return {
    orders,
    loading,
    error,
    fetchUserOrders,
    fetchBusinessOrders,
    updateOrderStatus,
    cancelOrder,
    getOrdersByStatus,
    getOrderStats
  };
}; 