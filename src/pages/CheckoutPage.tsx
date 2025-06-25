import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useOrder } from '@/contexts/OrderContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  MapPin, 
  CreditCard, 
  Truck, 
  Clock, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, currentRestaurantName, getCartTotal, placeOrder, clearCart } = useOrder();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser?.address || '');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [contactPhone, setContactPhone] = useState(currentUser?.phoneNumber || '');

  const subtotal = getCartTotal();
  const tax = subtotal * 0.18; // 18% TVA
  const deliveryFee = 15000; // 15,000 GNF
  const grandTotal = subtotal + tax + deliveryFee;

  // Rediriger si le panier est vide
  if (cart.length === 0) {
    navigate('/');
    return null;
  }

  const handlePlaceOrder = async () => {
    if (!currentUser) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour passer une commande.",
        variant: "destructive",
      });
      return;
    }

    if (!deliveryAddress.trim()) {
      toast({
        title: "Adresse requise",
        description: "Veuillez saisir votre adresse de livraison.",
        variant: "destructive",
      });
      return;
    }

    if (!contactPhone.trim()) {
      toast({
        title: "Téléphone requis",
        description: "Veuillez saisir votre numéro de téléphone.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const orderId = await placeOrder(deliveryAddress);
      
      if (orderId) {
        toast({
          title: "Commande confirmée !",
          description: `Votre commande #${orderId} a été passée avec succès.`,
        });
        
        // Rediriger vers la page de confirmation
        navigate(`/order-confirmation/${orderId}`);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de la commande.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2"
            onClick={() => navigate('/cart')}
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Retour au panier</span>
          </Button>
          <h1 className="text-2xl font-bold">Finaliser la commande</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire de commande */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations de livraison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-guinea-green" />
                  Adresse de livraison
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address">Adresse complète *</Label>
                  <Textarea
                    id="address"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Ex: 123 Rue de la Paix, Kaloum, Conakry"
                    className="mt-1"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Numéro de téléphone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+224 621 000 000"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="instructions">Instructions de livraison (optionnel)</Label>
                  <Textarea
                    id="instructions"
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    placeholder="Ex: Appelez-moi à l'arrivée, code d'accès 1234..."
                    className="mt-1"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Méthode de paiement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-guinea-green" />
                  Méthode de paiement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 mb-3">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex items-center gap-2">
                      <span>Paiement à la livraison</span>
                      <span className="text-sm text-gray-500">(Espèces)</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mobile_money" id="mobile_money" />
                    <Label htmlFor="mobile_money" className="flex items-center gap-2">
                      <span>Mobile Money</span>
                      <span className="text-sm text-gray-500">(Orange Money, MTN Money)</span>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Résumé de la commande */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-guinea-green" />
                  Résumé de votre commande
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-12 h-12 rounded-md object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">Quantité: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium">{(item.price * item.quantity).toLocaleString()} GNF</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Résumé et paiement */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Résumé de la commande</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Restaurant */}
                {currentRestaurantName && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Truck className="h-4 w-4 text-guinea-green" />
                    <div>
                      <p className="font-medium">{currentRestaurantName}</p>
                      <p className="text-sm text-gray-500">Livraison estimée: 30-45 min</p>
                    </div>
                  </div>
                )}

                {/* Calculs */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sous-total</span>
                    <span>{subtotal.toLocaleString()} GNF</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">TVA (18%)</span>
                    <span>{tax.toLocaleString()} GNF</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frais de livraison</span>
                    <span>{deliveryFee.toLocaleString()} GNF</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-guinea-red">{grandTotal.toLocaleString()} GNF</span>
                  </div>
                </div>

                {/* Informations importantes */}
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Informations importantes:</p>
                      <ul className="mt-1 space-y-1">
                        <li>• Livraison estimée: 30-45 minutes</li>
                        <li>• Paiement à la livraison</li>
                        <li>• Vérifiez votre adresse avant confirmation</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Bouton de commande */}
                <Button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || !deliveryAddress.trim() || !contactPhone.trim()}
                  className="w-full bg-guinea-red hover:bg-guinea-red/90 text-white py-3"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Traitement en cours...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Confirmer la commande
                    </div>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  En confirmant votre commande, vous acceptez nos conditions générales de vente.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
