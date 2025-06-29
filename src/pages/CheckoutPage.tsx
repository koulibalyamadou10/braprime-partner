import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/contexts/AuthContext';
import { OrderService, type CreateOrderData } from '@/lib/services/orders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  ShoppingCart, 
  MapPin, 
  Clock, 
  CreditCard, 
  Truck,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Store,
  User,
  Phone,
  Mail,
  MessageSquare
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Label } from '@/components/ui/label';
import { Loader2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';

const CheckoutPage = () => {
  const { cart, loading, error, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile_money'>('cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: ''
  });
  const [deliveryTimeMode, setDeliveryTimeMode] = useState<'now' | 'scheduled'>('now');
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [scheduledTime, setScheduledTime] = useState<string>('12:00');

  // Charger les données utilisateur et du panier
  useEffect(() => {
    if (currentUser) {
      setCustomerName(currentUser.name || '');
      setCustomerEmail(currentUser.email || '');
      setCustomerPhone(currentUser.phoneNumber || '');
    }

    if (cart) {
      setDeliveryAddress(cart.delivery_address || '');
      setDeliveryInstructions(cart.delivery_instructions || '');
      setDeliveryMethod((cart.delivery_method as 'delivery' | 'pickup') || 'delivery');
    }
  }, [currentUser, cart]);

  // Calculer les totaux
  const cartTotal = cart?.total || 0;
  const deliveryFee = deliveryMethod === 'delivery' ? 2000 : 0; // 2000 GNF pour la livraison
  const tax = Math.round(cartTotal * 0.15); // 15% de taxe
  const grandTotal = cartTotal + deliveryFee + tax;

  // Créneaux horaires disponibles (toutes les 30 min de 08:00 à 22:00)
  const timeSlots = Array.from({ length: 28 }, (_, i) => {
    const hour = 8 + Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  });

  // Validation du formulaire
  const isFormValid = () => {
    if (!cart || cart.items.length === 0) return false;
    
    // Vérifier les champs requis du formulaire
    const requiredFields = [
      formData.firstName,
      formData.lastName,
      formData.phone,
      formData.address,
      formData.city
    ];
    
    // Si c'est une livraison, vérifier que l'adresse est complète
    if (deliveryMethod === 'delivery') {
      if (!formData.address.trim()) return false;
    }
    
    return requiredFields.every(field => field.trim() !== '');
  };

  // Gérer la soumission de la commande
  const handleSubmitOrder = async () => {
    if (!isFormValid()) {
      console.log('Formulaire invalide:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        deliveryMethod,
        paymentMethod
      });
      return;
    }

    if (!currentUser) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour passer une commande.",
        variant: "destructive",
      });
      return;
    }

    if (!cart || cart.items.length === 0) {
      toast({
        title: "Erreur",
        description: "Votre panier est vide.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Calculer les totaux
      const cartTotal = cart.total || 0;
      const deliveryFee = deliveryMethod === 'delivery' ? 2000 : 0;
      const tax = Math.round(cartTotal * 0.15); // 15% de taxe
      const grandTotal = cartTotal + deliveryFee + tax;

      let estimatedDelivery: Date;
      if (deliveryTimeMode === 'now') {
        // Livraison immédiate (30-45 min après maintenant)
        const now = new Date();
        estimatedDelivery = new Date(now.getTime() + (30 + Math.random() * 15) * 60000);
      } else {
        // Livraison programmée
        if (!scheduledDate || !scheduledTime) {
          toast({
            title: "Erreur",
            description: "Veuillez choisir une date et une heure de livraison.",
            variant: "destructive",
          });
          setIsProcessing(false);
          return;
        }
        const [hour, minute] = scheduledTime.split(':');
        estimatedDelivery = new Date(scheduledDate);
        estimatedDelivery.setHours(Number(hour), Number(minute), 0, 0);
        if (estimatedDelivery < new Date()) {
          toast({
            title: "Erreur",
            description: "La date/heure de livraison doit être dans le futur.",
            variant: "destructive",
          });
          setIsProcessing(false);
          return;
        }
      }

      // Préparer les données de la commande
      const orderData: CreateOrderData = {
        id: crypto.randomUUID(), // Générer un UUID unique
        user_id: currentUser.id,
        business_id: cart.business_id || 1, // Utiliser l'ID du commerce du panier
        business_name: cart.business_name || 'Commerce',
        items: cart.items,
        status: 'pending',
        total: cartTotal,
        delivery_fee: deliveryFee,
        tax: tax,
        grand_total: grandTotal,
        delivery_address: `${formData.address}, ${formData.city}`,
        delivery_method: deliveryMethod,
        estimated_delivery: estimatedDelivery.toISOString(),
        payment_method: paymentMethod,
        payment_status: 'pending'
      };

      // Créer la commande via le service
      const { order, error } = await OrderService.createOrder(orderData);
      
      if (error) {
        toast({
          title: "Erreur",
          description: error,
          variant: "destructive",
        });
        return;
      }

      if (order) {
        // Vider le panier après création réussie
        clearCart();
        
        toast({
          title: "Commande confirmée",
          description: `Votre commande #${order.id.substring(0, 8)} a été créée avec succès.`,
        });

        // Rediriger vers la page de confirmation existante
        navigate(`/order-confirmation/${order.id}`);
      }
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de la commande.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Rediriger vers le panier si pas d'articles
  if (!loading && (!cart || cart.items.length === 0)) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">Votre panier est vide</h2>
                <p className="text-muted-foreground text-center mb-6">
                  Ajoutez des articles à votre panier avant de passer à la caisse.
                </p>
                <Button onClick={() => navigate('/cart')} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Retour au panier
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded"></div>
                  ))}
                </div>
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-24 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
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
              <h1 className="text-3xl font-bold">Finaliser la commande</h1>
              <p className="text-muted-foreground">
                Complétez vos informations pour finaliser votre commande
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/cart')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour au panier
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Formulaire de commande */}
            <div className="space-y-6">
              {/* Informations de livraison */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Adresse de livraison
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+224 XXX XXX XXX"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Adresse complète *</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Rue, quartier, ville..."
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">Ville *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Code postal</Label>
                      <Input
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Options de livraison */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Options de livraison
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup value={deliveryMethod} onValueChange={(value: 'delivery' | 'pickup') => setDeliveryMethod(value)}>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="delivery" id="delivery" />
                        <Label htmlFor="delivery" className="flex-1 cursor-pointer">
                          <div className="flex justify-between items-center">
                            <span>Livraison à domicile</span>
                            <span className="font-medium">+2 000 GNF</span>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pickup" id="pickup" />
                        <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                          <div className="flex justify-between items-center">
                            <span>Retrait sur place</span>
                            <span className="font-medium">Gratuit</span>
                          </div>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Méthode de paiement */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Méthode de paiement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup value={paymentMethod} onValueChange={(value: 'cash' | 'card' | 'mobile_money') => setPaymentMethod(value)}>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cash" id="cash" />
                        <Label htmlFor="cash" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span>Paiement en espèces</span>
                            <Badge variant="secondary">Recommandé</Badge>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="mobile_money" id="mobile_money" />
                        <Label htmlFor="mobile_money" className="flex-1 cursor-pointer">
                          <span>Mobile Money (Orange Money, MTN Money)</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex-1 cursor-pointer">
                          <span>Carte bancaire</span>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Notes spéciales */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Notes spéciales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Instructions spéciales pour la livraison, allergies, etc."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Livraison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Label className="mb-2 block">Date de livraison</Label>
                    <RadioGroup
                      value={deliveryTimeMode}
                      onValueChange={val => setDeliveryTimeMode(val as 'now' | 'scheduled')}
                      className="flex flex-col gap-2"
                    >
                      <RadioGroupItem value="now" id="now" />
                      <Label htmlFor="now" className="ml-2 cursor-pointer">Livrer maintenant</Label>
                      <RadioGroupItem value="scheduled" id="scheduled" className="mt-2" />
                      <Label htmlFor="scheduled" className="ml-2 cursor-pointer">Programmer la livraison</Label>
                    </RadioGroup>
                    {deliveryTimeMode === 'scheduled' && (
                      <div className="mt-4 flex flex-col md:flex-row gap-4 items-center">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full md:w-auto justify-start text-left font-normal">
                              <Clock className="mr-2 h-4 w-4" />
                              {scheduledDate ? format(scheduledDate, 'dd MMMM yyyy') : 'Sélectionner une date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={scheduledDate}
                              onSelect={setScheduledDate}
                              initialFocus
                              disabled={date => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            />
                          </PopoverContent>
                        </Popover>
                        <div className="w-full md:w-auto">
                          <Select value={scheduledTime} onValueChange={setScheduledTime}>
                            <SelectTrigger className="w-full md:w-32">
                              <SelectValue placeholder="Heure" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map(time => (
                                <SelectItem key={time} value={time}>{time}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Résumé de la commande */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Résumé de la commande
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Articles */}
                  <div className="space-y-3">
                    {cart?.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} × {formatCurrency(item.price)}
                          </p>
                          {item.special_instructions && (
                            <p className="text-sm text-blue-600">
                              Note: {item.special_instructions}
                            </p>
                          )}
                        </div>
                        <p className="font-medium">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Calculs */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Sous-total</span>
                      <span>{formatCurrency(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Frais de livraison</span>
                      <span>{deliveryMethod === 'delivery' ? '2 000 GNF' : 'Gratuit'}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{formatCurrency(grandTotal)}</span>
                    </div>
                  </div>

                  {/* Bouton de commande */}
                  <Button 
                    onClick={handleSubmitOrder}
                    disabled={isProcessing || !isFormValid()}
                    className="w-full gap-2"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Traitement...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Confirmer la commande
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    En passant cette commande, vous acceptez nos conditions générales de vente.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
