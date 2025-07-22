import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";
import { OrderService, type Order } from '@/lib/services/orders';
import { formatCurrency } from '@/lib/utils';
import {
    CheckCircle,
    ChevronRight,
    Clock,
    Home,
    Loader2,
    MapPin,
    Receipt,
    Truck
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

const OrderConfirmationPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
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
        const { order: fetchedOrder, error } = await OrderService.getOrderById(id);
        
        if (error) {
          toast({
            title: "Erreur",
            description: error,
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        if (!fetchedOrder) {
          toast({
            title: "Commande introuvable",
            description: "La commande que vous recherchez n'existe pas.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        setOrder(fetchedOrder);
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

    fetchOrder();
  }, [id, navigate, toast]);
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-guinea-red" />
                <span className="ml-2">Chargement de la commande...</span>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!order) {
    return null; // Will redirect in useEffect
  }
  
  // Format the time string
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };
  
  // Format the date string
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Format delivery window for scheduled deliveries
  const formatDeliveryWindow = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')} - ${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Order Success Header */}
            <div className="bg-guinea-green/10 p-6 text-center">
              <div className="mx-auto w-16 h-16 bg-guinea-green/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-guinea-green" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Commande confirmée!</h1>
              <p className="text-gray-600">
                Votre commande a été confirmée et est en cours de préparation.
              </p>
            </div>
            
            {/* Order Details */}
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg">Détails de la commande</h2>
                <span className="text-sm bg-gray-100 px-3 py-1 rounded">
                  #{order.order_number || order.id.slice(0, 8)}
                </span>
              </div>
              
              <div className="space-y-4">
                {/* Order Status */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Statut de la commande</h3>
                    <span className="text-sm bg-guinea-yellow/20 px-3 py-1 rounded text-guinea-yellow font-medium capitalize">
                      {order.status === 'pending' ? 'En attente' : 
                       order.status === 'confirmed' ? 'Confirmée' :
                       order.status === 'preparing' ? 'En préparation' :
                       order.status === 'ready' ? 'Prête' :
                       order.status === 'picked_up' ? 'En route' :
                       order.status === 'delivered' ? 'Livrée' :
                       order.status === 'cancelled' ? 'Annulée' : order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Placée le {formatDate(order.created_at)} à {formatTime(order.created_at)}
                  </p>
                </div>
                
                {/* Restaurant */}
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Restaurant</h3>
                    <p className="text-gray-600">{order.business_name}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    asChild
                  >
                    <Link to={`/services/${order.business_id}`}>
                      Voir le restaurant
                    </Link>
                  </Button>
                </div>
                
                <Separator />
                
                {/* Items */}
                <div>
                  <h3 className="font-medium mb-3">Articles commandés</h3>
                  <ul className="space-y-2">
                    {order.items.map((item: any) => (
                      <li key={item.id} className="flex justify-between">
                        <span>
                          <span className="font-medium">{item.quantity}x</span> {item.name}
                        </span>
                        <span className="text-gray-600">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Separator />
                
                {/* Order Summary */}
                <div>
                  <h3 className="font-medium mb-3">Résumé du paiement</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sous-total</span>
                      <span>{formatCurrency(order.total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">TVA (15%)</span>
                      <span>{formatCurrency(order.tax)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Frais de livraison</span>
                      <span>{formatCurrency(order.delivery_fee)}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2">
                      <span>Total</span>
                      <span>{formatCurrency(order.grand_total)}</span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Delivery Info */}
                <div>
                  <h3 className="font-medium mb-3">Informations de livraison</h3>
                  <div className="space-y-3">
                    {/* Type de livraison */}
                    <div className="flex">
                      <Truck className="h-5 w-5 text-guinea-red mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Type de livraison</p>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">
                            {order.delivery_type === 'asap' ? 'Livraison rapide (ASAP)' : 'Livraison programmée'}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            order.delivery_type === 'asap' 
                              ? 'bg-orange-100 text-orange-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {order.delivery_type === 'asap' ? 'ASAP' : 'Programmée'}
                          </span>
                        </div>
                        {order.delivery_type === 'scheduled' && order.preferred_delivery_time && (
                          <div className="text-sm text-gray-500 mt-1 space-y-1">
                            <p>
                              Livraison prévue le {formatDate(order.preferred_delivery_time)} à {formatTime(order.preferred_delivery_time)}
                            </p>
                            {order.scheduled_delivery_window_start && order.scheduled_delivery_window_end && (
                              <p className="text-blue-600">
                                Fenêtre de livraison : {formatDeliveryWindow(order.scheduled_delivery_window_start, order.scheduled_delivery_window_end)}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex">
                      <MapPin className="h-5 w-5 text-guinea-red mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Adresse</p>
                        <p className="text-gray-600">{order.delivery_address}</p>
                      </div>
                    </div>
                    <div className="flex">
                      <Clock className="h-5 w-5 text-guinea-red mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Livraison estimée</p>
                        <p className="text-gray-600">{formatTime(order.estimated_delivery)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="p-6 bg-gray-50 border-t">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  asChild
                  className="flex-1 bg-guinea-red hover:bg-guinea-red/90"
                >
                  <Link to={`/order-tracking/${order.id}`} className="flex items-center justify-center">
                    <Truck className="mr-2 h-4 w-4" />
                    Suivre la commande
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                
                <Button 
                  variant="outline"
                  asChild
                  className="flex-1"
                >
                  <Link to="/orders" className="flex items-center justify-center">
                    <Receipt className="mr-2 h-4 w-4" />
                    Voir mes commandes
                  </Link>
                </Button>
                
                <Button 
                  variant="ghost"
                  asChild
                  className="flex-1"
                >
                  <Link to="/" className="flex items-center justify-center">
                    <Home className="mr-2 h-4 w-4" />
                    Retour à l'accueil
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderConfirmationPage;
