import Layout from '@/components/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useCartContext } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { OrderService, type CreateOrderData } from '@/lib/services/orders';
import { PaymentService, type PaymentRequest } from '@/lib/services/payment';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  MessageSquare,
  ShoppingCart,
  Trash2,
  Truck
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CheckoutPage = () => {
  const { cart, loading, error, clearCart } = useCartContext();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile_money' | 'online'>('cash');
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
    landmark: '', // Point de repère
    notes: '',
    email: ''
  });
  const [deliveryTimeMode, setDeliveryTimeMode] = useState<'asap' | 'scheduled'>('asap');
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [scheduledTime, setScheduledTime] = useState<string>('12:00');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

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

  // Réinitialiser l'état du calendrier quand on change de mode de livraison
  useEffect(() => {
    if (deliveryTimeMode === 'asap') {
      setScheduledDate(undefined);
      setScheduledTime('12:00');
    }
  }, [deliveryTimeMode]);

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

  // Validation du formulaire (sans modifier l'état)
  const validateForm = useCallback(() => {
    const errors: string[] = [];
    
    if (!cart || cart.items.length === 0) {
      errors.push('Votre panier est vide');
      return errors;
    }
    
    // Vérifier les champs requis du formulaire
    if (!formData.firstName.trim()) errors.push('Le prénom est requis');
    if (!formData.lastName.trim()) errors.push('Le nom est requis');
    if (!formData.phone.trim()) errors.push('Le téléphone est requis');
    if (!formData.address.trim()) errors.push('L\'adresse est requise');
    if (!formData.city.trim()) errors.push('La ville est requise');
    
    // Si c'est une livraison, vérifier que l'adresse est complète
    if (deliveryMethod === 'delivery' && !formData.address.trim()) {
      errors.push('L\'adresse de livraison est requise');
    }
    
    // Vérifier les champs de livraison programmée
    if (deliveryTimeMode === 'scheduled') {
      if (!scheduledDate) {
        errors.push('Veuillez sélectionner une date de livraison');
      }
      if (!scheduledTime) {
        errors.push('Veuillez sélectionner une heure de livraison');
      }
      if (scheduledDate && scheduledTime) {
        try {
          // Vérifier que la date/heure est dans le futur
          const scheduledDateTime = new Date(scheduledDate);
          const [hour, minute] = scheduledTime.split(':');
          scheduledDateTime.setHours(Number(hour), Number(minute), 0, 0);
          
          // Vérifier que la date est valide
          if (isNaN(scheduledDateTime.getTime())) {
            errors.push('La date et heure de livraison ne sont pas valides');
          } else if (scheduledDateTime <= new Date()) {
            errors.push('La date et heure de livraison doivent être dans le futur');
          }
        } catch (error) {
          errors.push('Erreur lors de la validation de la date de livraison');
        }
      }
    }
    
    return errors;
  }, [cart, formData.firstName, formData.lastName, formData.phone, formData.address, formData.city, deliveryMethod, deliveryTimeMode, scheduledDate, scheduledTime]);

  // Validation du formulaire (pour le bouton disabled)
  const isFormValid = useCallback(() => {
    const errors = validateForm();
    return errors.length === 0;
  }, [validateForm]);

  // Fonction pour créer la date de livraison programmée
  const createScheduledDeliveryTime = useCallback((date: Date | undefined, time: string): string | null => {
    if (!date || !time) return null;
    
    try {
      // Créer une nouvelle date en combinant la date sélectionnée avec l'heure
      const deliveryDate = new Date(date);
      const [hour, minute] = time.split(':');
      deliveryDate.setHours(Number(hour), Number(minute), 0, 0);
      
      // Vérifier que la date est valide
      if (isNaN(deliveryDate.getTime())) {
        console.error('Date de livraison invalide:', date, time);
        return null;
      }
      
      return deliveryDate.toISOString();
    } catch (error) {
      console.error('Erreur lors de la création de la date de livraison:', error);
      return null;
    }
  }, []);

  // Gérer la soumission de la commande
  const handleSubmitOrder = async () => {
    // Valider le formulaire
    const errors = validateForm();
    setValidationErrors(errors);
    
    if (errors.length > 0) {
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

      // Déterminer le type de livraison et les champs associés
      const deliveryType = deliveryTimeMode === 'asap' ? 'asap' : 'scheduled';
      
      // Préparer les données de la commande
      const orderData: CreateOrderData = {
        id: crypto.randomUUID(), // Générer un UUID unique
        user_id: currentUser.id,
        business_id: cart.business_id, // Utiliser l'ID du commerce du panier
        business_name: cart.business_name, // Utiliser le nom du commerce du panier
        items: cart.items,
        status: 'pending',
        total: cartTotal,
        delivery_fee: deliveryFee,
        tax: tax,
        grand_total: grandTotal,
        delivery_address: `${formData.address}, ${formData.city}`,
        delivery_instructions: formData.notes || undefined,
        landmark: formData.landmark || undefined, // Point de repère
        delivery_method: deliveryMethod,
        payment_method: paymentMethod,
        payment_status: 'pending',
        // Champs spécifiques aux types de livraison
        delivery_type: deliveryType,
        available_for_drivers: false, // Par défaut, pas disponible pour les chauffeurs
        // Champs pour les livraisons programmées
        ...(deliveryType === 'scheduled' && scheduledDate && scheduledTime && {
          preferred_delivery_time: createScheduledDeliveryTime(scheduledDate, scheduledTime),
          scheduled_delivery_window_start: (() => {
            const baseTime = createScheduledDeliveryTime(scheduledDate, scheduledTime);
            if (!baseTime) return null;
            const baseDate = new Date(baseTime);
            baseDate.setMinutes(baseDate.getMinutes() - 15); // -15 minutes
            return baseDate.toISOString();
          })(),
          scheduled_delivery_window_end: (() => {
            const baseTime = createScheduledDeliveryTime(scheduledDate, scheduledTime);
            if (!baseTime) return null;
            const baseDate = new Date(baseTime);
            baseDate.setMinutes(baseDate.getMinutes() + 15); // +15 minutes
            return baseDate.toISOString();
          })(),
        })
      };

      // Vérifier que la date de livraison programmée est valide
      if (deliveryType === 'scheduled' && !orderData.preferred_delivery_time) {
        toast({
          title: "Erreur",
          description: "La date de livraison programmée n'est pas valide. Veuillez réessayer.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // Vérifier que le panier a les bonnes informations du commerce
      if (!cart.business_id || !cart.business_name || cart.business_name === 'Commerce') {
        toast({
          title: "Erreur",
          description: "Informations du commerce manquantes. Veuillez vider votre panier et recommencer.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // Créer la commande via le service
      const { order, error } = await OrderService.createOrder(orderData);
      
      if (error) {
        toast({
          title: "Erreur",
          description: error,
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }
      
      if (order) {
        // Si le paiement est en ligne, créer l'URL de paiement
        if (paymentMethod === 'online') {
          try {
            // Préparer les données de paiement
            const paymentData: PaymentRequest = {
              order_id: order.id,
              user_id: currentUser.id,
              amount: 1000,
              currency: 'GNF',
              payment_method: 'lp-om-gn', // Orange Money par défaut
              phone_number: formData.phone || currentUser.phone || '',
              order_number: `CMD-${order.id.substring(0, 8)}`,
              business_name: cart.business_name,
              customer_name: `${formData.firstName} ${formData.lastName}`,
              customer_email: currentUser.email || formData.email || '',
            };

            // Créer l'URL de paiement
            const paymentResponse = await PaymentService.createPayment(paymentData);

            if (paymentResponse.success && paymentResponse.payment_url) {
              // Vider le panier après création réussie
              clearCart();
              
              toast({
                title: "Redirection vers le paiement",
                description: "Vous allez être redirigé vers la page de paiement sécurisée.",
              });

              // Rediriger vers Lengo Pay
              window.location.href = paymentResponse.payment_url;
              return;
            } else {
              // En cas d'échec du paiement en ligne, continuer avec le paiement à la livraison
              toast({
                title: "Paiement en ligne indisponible",
                description: "Le paiement sera effectué à la livraison.",
                variant: "destructive",
              });
            }
          } catch (paymentError) {
            console.error('Erreur lors de la création du paiement:', paymentError);
            toast({
              title: "Erreur de paiement",
              description: "Le paiement sera effectué à la livraison.",
              variant: "destructive",
            });
          }
        }

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

  // Gérer le vidage du panier et recommencer
  const handleClearCartAndRestart = async () => {
    await clearCart();
    navigate('/categories');
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

  // Vérifier que le panier a les bonnes informations du commerce
  if (!loading && cart && (!cart.business_id || !cart.business_name || cart.business_name === 'Commerce')) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Informations du commerce manquantes</h2>
                <p className="text-muted-foreground text-center mb-6">
                  Votre panier ne contient pas les bonnes informations du commerce. 
                  Veuillez vider votre panier et recommencer vos achats.
                </p>
                <div className="flex gap-4">
                  <Button onClick={handleClearCartAndRestart} className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Vider le panier et recommencer
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/cart')} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Retour au panier
                  </Button>
                </div>
              </CardContent>
            </Card>
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
                  
                  <div>
                    <Label htmlFor="landmark">Point de repère</Label>
                    <Input
                      id="landmark"
                      value={formData.landmark}
                      onChange={(e) => setFormData(prev => ({ ...prev, landmark: e.target.value }))}
                      placeholder="Ex: près de la pharmacie, derrière la mosquée, à côté de l'école..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Facilitez la livraison en indiquant un point de repère proche
                    </p>
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
                  <RadioGroup value={paymentMethod} onValueChange={(value: 'cash' | 'card' | 'mobile_money' | 'online') => setPaymentMethod(value)}>
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
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="online" id="online" />
                        <Label htmlFor="online" className="flex-1 cursor-pointer">
                          <span>Paiement en ligne (Lengo Pay)</span>
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

              {/* Type de livraison */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Type de livraison
                  </CardTitle>
                  <CardDescription>
                    Choisissez le type de livraison qui vous convient
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={deliveryTimeMode}
                    onValueChange={val => setDeliveryTimeMode(val as 'asap' | 'scheduled')}
                    className="grid grid-cols-1 gap-4"
                  >
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <RadioGroupItem value="asap" id="asap" />
                      <div className="flex-1">
                        <Label htmlFor="asap" className="cursor-pointer">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">Livraison rapide</span>
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800">ASAP</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Livraison immédiate dans les 30-45 minutes
                          </p>
                        </Label>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <RadioGroupItem value="scheduled" id="scheduled" />
                      <div className="flex-1">
                        <Label htmlFor="scheduled" className="cursor-pointer">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">Livraison programmée</span>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">Programmée</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Choisissez la date et l'heure de votre choix
                          </p>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>

                  {/* Options pour la livraison programmée */}
                  {deliveryTimeMode === 'scheduled' && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-3">Programmer votre livraison</h4>
                      
                      {/* Sélection de la date */}
                      <div className="mb-4">
                        <Label className="text-sm font-medium text-blue-900 mb-2 block">
                          Date de livraison *
                        </Label>
                        <div className="space-y-2">
                          <Input
                            type="date"
                            value={scheduledDate ? scheduledDate.toISOString().split('T')[0] : ''}
                            onChange={(e) => {
                              const date = e.target.value ? new Date(e.target.value) : undefined;
                              setScheduledDate(date);
                            }}
                            min={new Date().toISOString().split('T')[0]}
                            max={(() => {
                              const maxDate = new Date();
                              maxDate.setDate(maxDate.getDate() + 30);
                              return maxDate.toISOString().split('T')[0];
                            })()}
                            className={`w-full ${
                              scheduledDate 
                                ? 'border-green-300 bg-green-50 focus:border-green-400' 
                                : 'border-blue-300 focus:border-blue-400'
                            }`}
                            placeholder="Sélectionner une date"
                          />
                          {scheduledDate && (
                            <p className="text-xs text-green-600 font-medium">
                              ✅ {format(scheduledDate, 'EEEE dd MMMM yyyy')}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Sélection de l'heure */}
                      <div className="mb-4">
                        <Label className="text-sm font-medium text-blue-900 mb-2 block">
                          Heure de livraison *
                        </Label>
                        <Select value={scheduledTime} onValueChange={setScheduledTime}>
                          <SelectTrigger className={`w-full ${
                            scheduledTime && scheduledTime !== '12:00'
                              ? 'border-green-300 hover:border-green-400 bg-green-50' 
                              : 'border-blue-300 hover:border-blue-400'
                          }`}>
                            <Clock className={`mr-2 h-4 w-4 ${
                              scheduledTime && scheduledTime !== '12:00' ? 'text-green-600' : 'text-blue-600'
                            }`} />
                            <SelectValue placeholder="Choisir une heure" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map(time => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {scheduledTime && scheduledTime !== '12:00' && (
                          <p className="text-xs text-green-600 mt-1 font-medium">
                            ⏰ Heure sélectionnée : {scheduledTime}
                          </p>
                        )}
                      </div>

                      {/* Informations sur la fenêtre de livraison */}
                      <div className="bg-white p-3 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm font-medium text-blue-900">
                            Fenêtre de livraison
                          </span>
                        </div>
                        <p className="text-xs text-blue-700">
                          Votre commande sera livrée dans une fenêtre de ±15 minutes autour de l'heure choisie.
                        </p>
                        {scheduledDate && scheduledTime && (
                          <div className="mt-2 p-2 bg-blue-100 rounded text-xs text-blue-800">
                            <strong>Livraison prévue :</strong><br/>
                            {format(scheduledDate, 'EEEE dd MMMM yyyy')} à {scheduledTime}<br/>
                            <span className="text-blue-600">
                              (Entre {(() => {
                                const [hour, minute] = scheduledTime.split(':');
                                const baseDate = new Date(scheduledDate);
                                baseDate.setHours(Number(hour), Number(minute), 0, 0);
                                const start = new Date(baseDate.getTime() - 15 * 60000);
                                const end = new Date(baseDate.getTime() + 15 * 60000);
                                return `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')} et ${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;
                              })()})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Aperçu du type de livraison sélectionné */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">
                        {deliveryTimeMode === 'asap' ? 'Livraison rapide' : 'Livraison programmée'}
                      </span>
                      <Badge 
                        variant="secondary" 
                        className={deliveryTimeMode === 'asap' 
                          ? 'bg-orange-100 text-orange-800' 
                          : 'bg-blue-100 text-blue-800'
                        }
                      >
                        {deliveryTimeMode === 'asap' ? 'ASAP' : 'Programmée'}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600">
                      {deliveryTimeMode === 'asap' ? (
                        <div>
                          <p>🚚 Votre commande sera livrée dans les 30-45 minutes</p>
                          <p className="text-gray-500 mt-1">• Livraison immédiate</p>
                          <p className="text-gray-500">• Assignation automatique d'un chauffeur</p>
                        </div>
                      ) : (
                        <div>
                          {scheduledDate && scheduledTime ? (
                            <>
                              <p>🚚 Livraison programmée</p>
                              <p className="text-blue-600 font-medium mt-1">
                                {format(scheduledDate, 'EEEE dd MMMM yyyy')} à {scheduledTime}
                              </p>
                              <p className="text-gray-500 mt-1">• Fenêtre de livraison : ±15 minutes</p>
                              <p className="text-gray-500">• Chauffeur assigné à l'approche de l'heure</p>
                            </>
                          ) : (
                            <p className="text-orange-600">⚠️ Veuillez sélectionner une date et une heure</p>
                          )}
                        </div>
                      )}
                    </div>
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
                      <span>{deliveryMethod === 'delivery' ? '1 000 GNF' : 'Gratuit'}</span>
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

                  {/* Affichage des erreurs de validation */}
                  {validationErrors.length > 0 && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium text-red-800">
                          Veuillez corriger les erreurs suivantes :
                        </span>
                      </div>
                      <ul className="text-sm text-red-700 space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

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
