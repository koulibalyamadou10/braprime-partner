import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { OrderService, type Order } from '@/lib/services/orders';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import DeliveryMap from '@/components/DeliveryMap';
import { 
  ChevronLeft, MapPin, Store, Utensils, 
  Package, Truck, CheckCircle, PhoneCall, Clock, 
  List, Receipt, Home, Loader2
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

const OrderTrackingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Fonction pour récupérer la commande
  const fetchOrder = async () => {
    if (!id) {
      toast({
        title: "Erreur",
        description: "ID de commande manquant.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    try {
      const { order, error } = await OrderService.getOrderById(id);
      
      if (error) {
        toast({
          title: "Erreur",
          description: error,
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      if (!order) {
        toast({
          title: "Commande introuvable",
          description: "La commande que vous recherchez n'existe pas.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setCurrentOrder(order);
    } catch (error) {
      console.error('Erreur lors de la récupération de la commande:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la récupération de la commande.",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  // Charger la commande au montage
  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Subscription en temps réel pour les mises à jour de commande
  useEffect(() => {
    if (!id) return;

    // Subscription aux changements de la commande spécifique
    const subscription = supabase
      .channel(`order-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${id}`
        },
        (payload) => {
          console.log('Mise à jour de commande reçue:', payload);
          setCurrentOrder(payload.new as Order);
          
          // Notification de mise à jour
          const newStatus = payload.new.status;
          const statusMessages = {
            'confirmed': 'Votre commande a été confirmée !',
            'preparing': 'Votre commande est en cours de préparation',
            'ready': 'Votre commande est prête !',
            'picked_up': 'Le livreur est en route vers vous',
            'delivered': 'Votre commande a été livrée !'
          };
          
          if (statusMessages[newStatus as keyof typeof statusMessages]) {
            toast({
              title: "Mise à jour de commande",
              description: statusMessages[newStatus as keyof typeof statusMessages],
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [id, toast]);

  // Fonction pour annuler la commande
  const handleCancelOrder = async () => {
    if (!currentOrder) return;

    setUpdating(true);
    try {
      const { error } = await OrderService.cancelOrder(currentOrder.id);
      
      if (error) {
        toast({
          title: "Erreur",
          description: error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Commande annulée",
          description: "Votre commande a été annulée avec succès.",
        });
        // La mise à jour sera automatiquement reçue via la subscription
      }
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'annulation.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-guinea-red mx-auto mb-4" />
              <p className="text-gray-600">Chargement du suivi de commande...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!currentOrder) {
    return null; // Will redirect in useEffect
  }
  
  // Calculate estimated remaining time
  const calculateRemainingTime = () => {
    const orderDate = new Date(currentOrder.created_at);
    const estimatedDelivery = new Date(currentOrder.estimated_delivery);
    const now = new Date();
    
    if (now > estimatedDelivery) {
      return currentOrder.delivery_method === 'delivery' 
        ? "Livraison imminente"
        : "Prête à être récupérée";
    }
    
    const remainingMs = estimatedDelivery.getTime() - now.getTime();
    const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));
    
    return `Environ ${remainingMinutes} minutes`;
  };
  
  // Helper function to determine if step is completed
  const isStepCompleted = (stepStatus: string) => {
    const statusOrder = [
      'pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered'
    ];
    const currentStatusIndex = statusOrder.indexOf(currentOrder.status);
    const stepStatusIndex = statusOrder.indexOf(stepStatus);
    
    return currentStatusIndex >= stepStatusIndex;
  };
  
  // Helper function to determine if step is current
  const isCurrentStep = (stepStatus: string) => {
    return currentOrder.status === stepStatus;
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2"
            asChild
          >
            <Link to="/orders">
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Retour aux commandes</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Suivi de commande</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Order Status Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg">Statut de la commande</h2>
                <span className="text-sm bg-gray-100 px-3 py-1 rounded">
                  #{currentOrder.id}
                </span>
              </div>
              
              {currentOrder.status === 'cancelled' ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 font-medium">
                    Cette commande a été annulée.
                  </p>
                </div>
              ) : (
                <>
                  {/* Status Progress */}
                  <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute top-5 left-5 w-[2px] h-[calc(100%-40px)] bg-gray-200 z-0"></div>
                    
                    {/* Progress Steps */}
                    <div className="space-y-8 relative z-10">
                      {/* Step 1: Confirmed */}
                      <div className="flex items-start">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 mr-4 ${
                          isStepCompleted('confirmed') 
                            ? 'bg-guinea-green text-white' 
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          <Store className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium flex items-center">
                            Commande confirmée
                            {isCurrentStep('confirmed') && (
                              <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                                En cours
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Le restaurant a confirmé votre commande
                          </p>
                        </div>
                      </div>
                      
                      {/* Step 2: Preparing */}
                      <div className="flex items-start">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 mr-4 ${
                          isStepCompleted('preparing') 
                            ? 'bg-guinea-green text-white' 
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          <Utensils className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium flex items-center">
                            Préparation
                            {isCurrentStep('preparing') && (
                              <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                                En cours
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Votre commande est en cours de préparation
                          </p>
                        </div>
                      </div>
                      
                      {/* Step 3: Ready */}
                      <div className="flex items-start">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 mr-4 ${
                          isStepCompleted('ready') 
                            ? 'bg-guinea-green text-white' 
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium flex items-center">
                            Commande prête
                            {isCurrentStep('ready') && (
                              <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                                En cours
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {currentOrder.delivery_method === 'delivery' 
                              ? 'Votre commande est prête pour la livraison'
                              : 'Votre commande est prête à être récupérée'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Step 4: On the way - Only for delivery */}
                      {currentOrder.delivery_method === 'delivery' && (
                        <div className="flex items-start">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 mr-4 ${
                            isStepCompleted('picked_up') 
                              ? 'bg-guinea-green text-white' 
                              : 'bg-gray-200 text-gray-500'
                          }`}>
                            <Truck className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-medium flex items-center">
                              En route
                              {isCurrentStep('picked_up') && (
                                <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                                  En cours
                                </span>
                              )}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Le livreur est en route vers votre adresse
                            </p>
                            
                            {isStepCompleted('picked_up') && currentOrder.driver_name && (
                              <div className="mt-3 bg-gray-50 p-3 rounded-lg text-sm">
                                <p className="font-medium">Livreur: {currentOrder.driver_name}</p>
                                {currentOrder.driver_phone && (
                                  <div className="flex items-center mt-2">
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="flex items-center text-guinea-green"
                                      asChild
                                    >
                                      <a href={`tel:${currentOrder.driver_phone}`}>
                                        <PhoneCall className="h-3.5 w-3.5 mr-2" />
                                        Appeler le livreur
                                      </a>
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Step 5: Delivered */}
                      <div className="flex items-start">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 mr-4 ${
                          isStepCompleted('delivered') 
                            ? 'bg-guinea-green text-white' 
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium flex items-center">
                            {currentOrder.delivery_method === 'delivery' ? 'Livrée' : 'Récupérée'}
                            {isCurrentStep('delivered') && (
                              <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                                Terminée
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {currentOrder.delivery_method === 'delivery'
                              ? 'Votre commande a été livrée avec succès'
                              : 'Vous avez récupéré votre commande'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Map - only show for delivery orders in transit */}
                  {currentOrder.delivery_method === 'delivery' && 
                   currentOrder.status === 'picked_up' && 
                   currentOrder.driver_location && (
                    <div className="mt-6">
                      <h3 className="font-medium mb-3">Suivi de livraison en direct</h3>
                      <div className="h-[250px] rounded-lg overflow-hidden">
                        <DeliveryMap 
                          driverLocation={currentOrder.driver_location} 
                          deliveryAddress={currentOrder.delivery_address}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {/* Order Actions */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="text-sm text-gray-500 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>
                    {currentOrder.status === 'delivered' ? 
                      (currentOrder.delivery_method === 'delivery' ? 'Livrée le' : 'Récupérée le') : 
                      (currentOrder.delivery_method === 'delivery' ? 'Livraison estimée' : 'Prête à')}
                    : {" "}
                    {currentOrder.status === 'delivered' ? 
                      new Date(currentOrder.estimated_delivery).toLocaleString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit'
                      }) : 
                      calculateRemainingTime()}
                  </span>
                </div>
                
                {['pending', 'confirmed'].includes(currentOrder.status) && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-500 hover:text-red-700 border-red-200 hover:border-red-300"
                    onClick={handleCancelOrder}
                    disabled={updating}
                  >
                    {updating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Annulation...
                      </>
                    ) : (
                      'Annuler la commande'
                    )}
                  </Button>
                )}
              </div>
            </div>
            
            {/* Order Details */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-bold">Détails de la commande</h2>
              </div>
              
              <div className="p-4">
                <div className="flex items-center text-sm mb-4">
                  <Store className="h-4 w-4 text-guinea-green mr-2" />
                  <span>{currentOrder.business_name}</span>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Articles</h3>
                  <ul className="space-y-2">
                    {currentOrder.items.map((item: any) => (
                      <li key={item.id} className="flex justify-between text-sm">
                        <span>
                          <span className="font-medium">{item.quantity}x</span> {item.name}
                        </span>
                        <span>{formatCurrency(item.price * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Separator className="my-4" />
                
                {/* Pricing Summary */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Sous-total</span>
                    <span>{formatCurrency(currentOrder.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">TVA (15%)</span>
                    <span>{formatCurrency(currentOrder.tax)}</span>
                  </div>
                  {currentOrder.delivery_fee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Frais de livraison</span>
                      <span>{formatCurrency(currentOrder.delivery_fee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>{formatCurrency(currentOrder.grand_total)}</span>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                {/* Delivery Info */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    {currentOrder.delivery_method === 'delivery' ? 'Informations de livraison' : 'Informations de retrait'}
                  </h3>
                  
                  <div className="text-sm mb-1 flex items-start">
                    <MapPin className="h-4 w-4 text-guinea-red mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      {currentOrder.delivery_method === 'delivery' ? (
                        <>
                          <p className="font-medium">Adresse de livraison</p>
                          <p className="text-gray-500">{currentOrder.delivery_address}</p>
                        </>
                      ) : (
                        <>
                          <p className="font-medium">Adresse de retrait</p>
                          <p className="text-gray-500">{currentOrder.business_name}</p>
                          <p className="text-gray-500 text-xs mt-1">Veuillez présenter l'identifiant de votre commande lors du retrait</p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm mt-3 flex items-start">
                    <Clock className="h-4 w-4 text-guinea-red mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Commande passée le</p>
                      <p className="text-gray-500">
                        {new Date(currentOrder.created_at).toLocaleString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="font-bold text-lg mb-4">Résumé</h2>
              
              <div className="space-y-4">
                <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                  <Receipt className="h-5 w-5 text-guinea-red mr-3" />
                  <div>
                    <p className="font-medium">Total de la commande</p>
                    <p className="text-lg font-bold">{formatCurrency(currentOrder.grand_total)}</p>
                  </div>
                </div>
                
                <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                  {currentOrder.delivery_method === 'delivery' ? (
                    <>
                      <Truck className="h-5 w-5 text-guinea-red mr-3" />
                      <div>
                        <p className="font-medium">Mode de livraison</p>
                        <p className="text-gray-600">Livraison à domicile</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Store className="h-5 w-5 text-guinea-red mr-3" />
                      <div>
                        <p className="font-medium">Mode de livraison</p>
                        <p className="text-gray-600">À emporter</p>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                  <List className="h-5 w-5 text-guinea-red mr-3" />
                  <div>
                    <p className="font-medium">Articles</p>
                    <p className="text-gray-600">{currentOrder.items.length} article(s)</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    asChild
                  >
                    <Link to="/">
                      <Home className="mr-2 h-4 w-4" />
                      Retour à l'accueil
                    </Link>
                  </Button>
                  
                  {currentOrder.status === 'delivered' && (
                    <Button 
                      className="w-full bg-guinea-red hover:bg-guinea-red/90"
                      asChild
                    >
                      <Link to="/orders">
                        <List className="mr-2 h-4 w-4" />
                        Voir toutes mes commandes
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderTrackingPage;
