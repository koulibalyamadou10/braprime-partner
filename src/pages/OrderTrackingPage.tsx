import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { OrderService } from '@/lib/services/orders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Truck, 
  CheckCircle, 
  Package, 
  Phone, 
  Store,
  User,
  Calendar,
  Navigation,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Layout from '@/components/Layout';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface OrderTrackingData {
  id: string;
  status: string;
  business_name: string;
  business_address?: string;
  business_phone?: string;
  driver_name?: string;
  driver_phone?: string;
  driver_location?: { lat: number; lng: number };
  delivery_address: string;
  landmark?: string; // Point de repère
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  delivery_fee: number;
  grand_total: number;
  created_at: string;
  estimated_delivery: string;
  actual_delivery?: string;
  delivery_method: 'delivery' | 'pickup';
  payment_method: string;
  delivery_instructions?: string;
  order_number?: string;
}

// Étapes du suivi de commande - déplacé en dehors du composant pour éviter les re-renders
const TRACKING_STEPS = [
  {
    id: 'pending',
    title: 'Commande reçue',
    description: 'Votre commande a été reçue et est en cours de traitement',
    icon: Package,
    color: 'bg-blue-500'
  },
  {
    id: 'confirmed',
    title: 'Commande confirmée',
    description: 'Le restaurant a confirmé votre commande',
    icon: CheckCircle,
    color: 'bg-green-500'
  },
  {
    id: 'preparing',
    title: 'En préparation',
    description: 'Votre commande est en cours de préparation',
    icon: Clock,
    color: 'bg-yellow-500'
  },
  {
    id: 'ready',
    title: 'Prête',
    description: 'Votre commande est prête',
    icon: CheckCircle,
    color: 'bg-green-500'
  },
  {
    id: 'picked_up',
    title: 'En livraison',
    description: 'Votre commande est en route',
    icon: Truck,
    color: 'bg-purple-500'
  },
  {
    id: 'delivered',
    title: 'Livrée',
    description: 'Votre commande a été livrée',
    icon: CheckCircle,
    color: 'bg-green-500'
  }
];

const OrderTrackingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [order, setOrder] = useState<OrderTrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  // Ref pour stabiliser la fonction de mise à jour
  const handleOrderUpdateRef = useRef<((updatedOrder: OrderTrackingData) => void) | null>(null);

  // Fonction pour mettre à jour l'étape actuelle
  const updateCurrentStep = useCallback((status: string) => {
    const stepIndex = TRACKING_STEPS.findIndex(step => step.id === status);
    setCurrentStep(stepIndex >= 0 ? stepIndex : 0);
  }, []); // TRACKING_STEPS est maintenant statique

  // Fonction pour obtenir le label du statut
  const getStatusLabel = useCallback((status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'en attente',
      confirmed: 'confirmée',
      preparing: 'en préparation',
      ready: 'prête',
      picked_up: 'en livraison',
      delivered: 'livrée',
      cancelled: 'annulée'
    };
    return statusMap[status] || status;
  }, []);

  // Fonction pour gérer les mises à jour de commande
  const handleOrderUpdate = useCallback((updatedOrder: OrderTrackingData) => {
    setOrder(prevOrder => {
      const previousStatus = prevOrder?.status;
      
      // Afficher une notification seulement si le statut a changé
      if (previousStatus && previousStatus !== updatedOrder.status) {
      toast({
          title: "Statut mis à jour",
          description: `Votre commande est maintenant ${getStatusLabel(updatedOrder.status)}`,
        });
      }
      
      return updatedOrder;
    });
    
    updateCurrentStep(updatedOrder.status);
  }, [updateCurrentStep, getStatusLabel, toast]);

  // Mettre à jour la ref à chaque changement de handleOrderUpdate
  useEffect(() => {
    handleOrderUpdateRef.current = handleOrderUpdate;
  }, [handleOrderUpdate]);

  // Fonction pour rafraîchir manuellement les données
  const refreshOrder = useCallback(async () => {
    if (!id || !currentUser) return;

    setRefreshing(true);
    try {
      console.log('🔄 Rafraîchissement manuel de la commande:', id);
      const { order: orderData, error: fetchError } = await OrderService.getOrderById(id);
      
      if (fetchError) {
        console.error('❌ Erreur lors du rafraîchissement:', fetchError);
        toast({
          title: "Erreur",
          description: fetchError,
          variant: "destructive",
        });
        return;
      }
      
      if (orderData) {
        console.log('✅ Données mises à jour:', orderData);
        setOrder(orderData as OrderTrackingData);
        updateCurrentStep(orderData.status);
        toast({
          title: "Données mises à jour",
          description: "Les informations de votre commande ont été actualisées.",
        });
      }
    } catch (err) {
      console.error('❌ Erreur lors du rafraîchissement:', err);
      toast({
        title: "Erreur",
        description: "Erreur lors du rafraîchissement",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  }, [id, currentUser?.id, updateCurrentStep, toast]);

  // Charger les détails de la commande
  useEffect(() => {
    const loadOrder = async () => {
      if (!id || !currentUser?.id) {
        setError('Commande non trouvée');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Utiliser getOrderById au lieu de getUserOrders pour plus d'efficacité
        const { order: orderData, error: fetchError } = await OrderService.getOrderById(id);
        
        if (fetchError) {
          setError(fetchError);
          return;
        }

        if (!orderData) {
          setError('Commande non trouvée');
          return;
        }

        // Vérifier que la commande appartient à l'utilisateur actuel
        if (orderData.user_id !== currentUser.id) {
          setError('Accès non autorisé');
        return;
      }

        setOrder(orderData as OrderTrackingData);
        updateCurrentStep(orderData.status);

      } catch (err) {
        setError('Erreur lors du chargement de la commande');
        console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

    loadOrder();
  }, [id, currentUser?.id]); // Retirer updateCurrentStep de la dépendance

  // Subscription en temps réel pour les mises à jour
  useEffect(() => {
    if (!id || !currentUser?.id) return;

    console.log('🔄 Initialisation de la subscription temps réel pour la commande:', id);

    // S'abonner aux changements de la commande spécifique
    const unsubscribe = OrderService.subscribeToOrderChanges(id, (updatedOrder) => {
      console.log('📡 Mise à jour temps réel reçue:', updatedOrder);
      
      if (handleOrderUpdateRef.current) {
        handleOrderUpdateRef.current(updatedOrder as OrderTrackingData);
      }
    });

    // Vérifier l'état de la subscription après un délai
    setTimeout(() => {
      if (!isSubscribed) {
        console.log('⚠️ Subscription non établie après 3 secondes');
        setConnectionStatus('error');
      }
    }, 3000);

    setIsSubscribed(true);
    setConnectionStatus('connected');

    return () => {
      console.log('🔌 Déconnexion de la subscription temps réel');
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
      setIsSubscribed(false);
      setConnectionStatus('connecting');
    };
  }, [id, currentUser?.id]); // Suppression des dépendances order?.id et isSubscribed

  // Vérification de sécurité périodique (fallback uniquement)
  useEffect(() => {
    if (!id || !currentUser?.id || isSubscribed) return;

    console.log('⏰ Activation du fallback périodique');

    const interval = setInterval(async () => {
        try {
        console.log('🔄 Vérification périodique de la commande:', id);
          const { order: updatedOrder, error: fetchError } = await OrderService.getOrderById(id);
          
        if (fetchError) {
          console.error('❌ Erreur lors de la vérification périodique:', fetchError);
          return;
        }
        
        if (updatedOrder && order && updatedOrder.status !== order.status) {
          console.log('📡 Changement détecté via fallback:', updatedOrder.status);
            if (handleOrderUpdateRef.current) {
              handleOrderUpdateRef.current(updatedOrder as OrderTrackingData);
            }
          }
        } catch (err) {
        console.error('❌ Erreur lors de la vérification périodique:', err);
      }
    }, 30000); // 30 secondes pour le fallback

    return () => {
      console.log('⏰ Arrêt du fallback périodique');
      clearInterval(interval);
    };
  }, [id, currentUser?.id, order?.status, isSubscribed]);



  const getStatusColor = useCallback((status: string) => {
    const colorMap: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-orange-100 text-orange-800',
      ready: 'bg-green-100 text-green-800',
      picked_up: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="space-y-6">
              <Skeleton className="h-8 w-64" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  <Skeleton className="h-32" />
                  <Skeleton className="h-64" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-48" />
                  <Skeleton className="h-32" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center justify-center py-16">
              <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Erreur</h2>
              <p className="text-muted-foreground text-center mb-6">
                {error || 'Commande non trouvée'}
              </p>
              <Button onClick={() => navigate('/dashboard/orders')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux commandes
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
                        <div>
              <h1 className="text-3xl font-bold">Suivi de commande</h1>
              <p className="text-muted-foreground">
                Commande #{order.order_number || order.id.slice(0, 8)} - {order.business_name}
                          </p>
                        </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={refreshOrder}
                disabled={refreshing}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  console.log('🔍 État actuel de la subscription:', { isSubscribed, connectionStatus });
                  console.log('🔍 État actuel de la commande:', order);
                }}
                className="gap-2"
                title="Debug - Voir les logs dans la console"
              >
                <AlertCircle className="h-4 w-4" />
                Debug
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard/orders')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour aux commandes
              </Button>
                        </div>
                      </div>
                      
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Timeline de suivi */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="h-5 w-5" />
                    Statut de votre commande
                  </CardTitle>
                  <CardDescription>
                    Suivez l'avancement de votre commande en temps réel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {TRACKING_STEPS.map((step, index) => {
                      const isCompleted = index <= currentStep;
                      const isCurrent = index === currentStep;
                      const Icon = step.icon;

                      return (
                        <div key={step.id} className="flex items-start gap-4">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                            isCompleted ? step.color : 'bg-gray-200'
                          } text-white`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`font-medium ${
                                isCompleted ? 'text-gray-900' : 'text-gray-500'
                              }`}>
                                {step.title}
                              </h3>
                              {isCurrent && (
                                <Badge variant="secondary" className="animate-pulse">
                                  En cours
                                </Badge>
                              )}
                            </div>
                            <p className={`text-sm ${
                              isCompleted ? 'text-gray-600' : 'text-gray-400'
                            }`}>
                              {step.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Détails de la commande */}
              <Card>
                <CardHeader>
                  <CardTitle>Détails de la commande</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">Quantité: {item.quantity}</p>
                        </div>
                        <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    ))}
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Sous-total</span>
                        <span>{formatCurrency(order.total)}</span>
                    </div>
                      <div className="flex justify-between">
                        <span>Frais de livraison</span>
                        <span>{formatCurrency(order.delivery_fee)}</span>
                  </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>{formatCurrency(order.grand_total)}</span>
                      </div>
                    </div>
                </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Informations de contact et livraison */}
            <div className="space-y-6">
              {/* Statut actuel */}
              <Card>
                <CardHeader>
                  <CardTitle>Statut actuel</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <Badge className={`${getStatusColor(order.status)} text-lg px-4 py-2`}>
                      {getStatusLabel(order.status)}
                    </Badge>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <div className={`w-2 h-2 rounded-full ${
                        connectionStatus === 'connected' 
                          ? 'bg-green-500 animate-pulse' 
                          : connectionStatus === 'error'
                          ? 'bg-red-500 animate-pulse'
                          : 'bg-yellow-500 animate-pulse'
                      }`}></div>
                      <p className="text-sm text-gray-500">
                        {connectionStatus === 'connected' 
                          ? 'Synchronisation temps réel active' 
                          : connectionStatus === 'error'
                          ? 'Erreur de connexion - Reconnexion...'
                          : 'Connexion en cours...'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Informations du restaurant */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Restaurant
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">{order.business_name}</p>
                      {order.business_address && (
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {order.business_address}
                        </p>
                      )}
                    </div>
                    {order.business_phone && (
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        <Phone className="h-4 w-4" />
                        Appeler le restaurant
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Informations du livreur */}
              {order.driver_name && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Livreur
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{order.driver_name}</span>
                      </div>
                      {order.driver_phone && (
                        <Button variant="outline" size="sm" className="w-full gap-2">
                          <Phone className="h-4 w-4" />
                          Appeler le livreur
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Informations de livraison */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Livraison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Adresse de livraison</p>
                      <p className="font-medium">{order.delivery_address}</p>
                    </div>
                    {order.landmark && (
                      <div>
                        <p className="text-sm text-gray-500">Point de repère</p>
                        <p className="font-medium text-blue-600">{order.landmark}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Méthode</p>
                      <p className="font-medium">
                        {order.delivery_method === 'delivery' ? 'Livraison' : 'Retrait'}
                      </p>
                    </div>
                  <div>
                      <p className="text-sm text-gray-500">Livraison estimée</p>
                      <p className="font-medium flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(order.estimated_delivery), 'dd/MM/yyyy HH:mm', { locale: fr })}
                      </p>
                  </div>
                    {order.delivery_instructions && (
                      <div>
                        <p className="text-sm text-gray-500">Instructions</p>
                        <p className="text-sm">{order.delivery_instructions}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Informations de paiement */}
              <Card>
                <CardHeader>
                  <CardTitle>Paiement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Méthode</span>
                      <span className="font-medium">{order.payment_method}</span>
                </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Total</span>
                      <span className="font-bold">{formatCurrency(order.grand_total)}</span>
                </div>
              </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderTrackingPage;
