import { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useOrder } from '@/contexts/OrderContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, Home, Clock, MapPin, 
  Truck, Receipt, ChevronRight
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const OrderConfirmationPage = () => {
  const { id } = useParams<{ id: string }>();
  const { getOrderById } = useOrder();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const order = getOrderById(id || '');
  
  useEffect(() => {
    if (!order) {
      toast({
        title: "Commande introuvable",
        description: "La commande que vous recherchez n'existe pas.",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [order, navigate, toast]);
  
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
                  #{order.id}
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
                    Placée le {formatDate(order.createdAt)} à {formatTime(order.createdAt)}
                  </p>
                </div>
                
                {/* Restaurant */}
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Restaurant</h3>
                    <p className="text-gray-600">{order.restaurantName}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    asChild
                  >
                    <Link to={`/services/${order.restaurantId}`}>
                      Voir le restaurant
                    </Link>
                  </Button>
                </div>
                
                <Separator />
                
                {/* Items */}
                <div>
                  <h3 className="font-medium mb-3">Articles commandés</h3>
                  <ul className="space-y-2">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex justify-between">
                        <span>
                          <span className="font-medium">{item.quantity}x</span> {item.name}
                        </span>
                        <span className="text-gray-600">
                          {(item.price * item.quantity).toLocaleString()} GNF
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
                      <span>{order.total.toLocaleString()} GNF</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">TVA (18%)</span>
                      <span>{order.tax.toLocaleString()} GNF</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Frais de livraison</span>
                      <span>{order.deliveryFee.toLocaleString()} GNF</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2">
                      <span>Total</span>
                      <span>{order.grandTotal.toLocaleString()} GNF</span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Delivery Info */}
                <div>
                  <h3 className="font-medium mb-3">Informations de livraison</h3>
                  <div className="space-y-3">
                    <div className="flex">
                      <MapPin className="h-5 w-5 text-guinea-red mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Adresse</p>
                        <p className="text-gray-600">{order.deliveryAddress}</p>
                      </div>
                    </div>
                    <div className="flex">
                      <Clock className="h-5 w-5 text-guinea-red mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Livraison estimée</p>
                        <p className="text-gray-600">{formatTime(order.estimatedDelivery)}</p>
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
