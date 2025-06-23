import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useOrder } from '@/contexts/OrderContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useForm } from 'react-hook-form';
import { 
  ChevronLeft, MapPin, CreditCard, Landmark, Phone, 
  User, ShoppingBag, Clock, AlertCircle, Truck, Store
} from 'lucide-react';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface CheckoutFormValues {
  fullName: string;
  phone: string;
  address: string;
  neighborhood: string;
  landmark: string;
  instructions: string;
  paymentMethod: 'cash' | 'orange_money' | 'mtn_money';
}

const CheckoutPage = () => {
  const { cart, currentRestaurantName, getCartTotal, getCartCount, placeOrder, deliveryMethod, setDeliveryMethod } = useOrder();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<CheckoutFormValues>({
    defaultValues: {
      fullName: currentUser?.name || '',
      phone: currentUser?.phoneNumber || '',
      address: currentUser?.address || '',
      neighborhood: '',
      landmark: '',
      instructions: '',
      paymentMethod: 'cash',
    },
  });
  
  useEffect(() => {
    // Update form with user info when user data is available
    if (currentUser) {
      form.setValue('fullName', currentUser.name);
      if (currentUser.phoneNumber) {
        form.setValue('phone', currentUser.phoneNumber);
      }
      if (currentUser.address) {
        form.setValue('address', currentUser.address);
      }
    }
  }, [currentUser, form]);
  
  const subtotal = getCartTotal();
  const tax = subtotal * 0.18; // 18% VAT in Guinea
  const deliveryFee = deliveryMethod === 'delivery' ? 15000 : 0; // No delivery fee for pickup
  const grandTotal = subtotal + tax + deliveryFee;
  
  // Redirect if cart is empty
  if (cart.length === 0) {
    navigate('/');
    toast({
      title: "Panier vide",
      description: "Votre panier est vide. Explorez nos restaurants pour commander.",
    });
    return null;
  }
  
  // Redirect if not logged in as customer
  if (!currentUser || currentUser.role !== 'customer') {
    navigate('/');
    toast({
      title: "Connexion requise",
      description: "Vous devez être connecté en tant que client pour passer une commande.",
    });
    return null;
  }
  
  const onSubmit = (data: CheckoutFormValues) => {
    setIsSubmitting(true);
    const fullAddress = `${data.address}, ${data.neighborhood}, Conakry`;
    
    try {
      // Place the order and get the order ID
      const orderId = placeOrder(fullAddress);
      
      if (orderId) {
        toast({
          title: "Commande effectuée avec succès",
          description: "Votre commande a été créée et est en cours de traitement.",
        });
        
        // Simulate payment processing for demo
        setTimeout(() => {
          // Redirect to order confirmation page
          navigate(`/order-confirmation/${orderId}`);
        }, 2000);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création de votre commande.",
        variant: "destructive",
      });
      setIsSubmitting(false);
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
            asChild
          >
            <Link to="/cart">
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Retour au panier</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Finaliser la commande</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Delivery Method Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="font-bold text-lg mb-4">Mode de livraison</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card 
                  className={`cursor-pointer border-2 transition-all ${
                    deliveryMethod === 'delivery' ? 'border-guinea-red' : 'border-transparent'
                  }`}
                  onClick={() => setDeliveryMethod('delivery')}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base flex items-center">
                        <Truck className="h-5 w-5 mr-2 text-guinea-red" />
                        Livraison
                      </CardTitle>
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                        deliveryMethod === 'delivery' ? 'border-guinea-red' : 'border-gray-300'
                      }`}>
                        {deliveryMethod === 'delivery' && (
                          <div className="h-3 w-3 rounded-full bg-guinea-red"></div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription>
                      {deliveryFee > 0 ? 
                        `Frais: ${deliveryFee.toLocaleString()} GNF` : 
                        'Frais de livraison inclus'
                      }
                    </CardDescription>
                    <p className="text-sm mt-1 text-gray-500">Livraison à domicile</p>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer border-2 transition-all ${
                    deliveryMethod === 'pickup' ? 'border-guinea-red' : 'border-transparent'
                  }`}
                  onClick={() => setDeliveryMethod('pickup')}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base flex items-center">
                        <Store className="h-5 w-5 mr-2 text-guinea-red" />
                        À emporter
                      </CardTitle>
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                        deliveryMethod === 'pickup' ? 'border-guinea-red' : 'border-gray-300'
                      }`}>
                        {deliveryMethod === 'pickup' && (
                          <div className="h-3 w-3 rounded-full bg-guinea-red"></div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription>
                      Aucun frais supplémentaire
                    </CardDescription>
                    <p className="text-sm mt-1 text-gray-500">Récupérez votre commande sur place</p>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Delivery Information */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="font-bold text-lg mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-guinea-red" />
                    Informations personnelles
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      rules={{ required: "Le nom complet est requis" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom complet</FormLabel>
                          <FormControl>
                            <Input placeholder="Votre nom complet" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      rules={{ 
                        required: "Le numéro de téléphone est requis",
                        pattern: {
                          value: /^\+?[0-9]{9,15}$/,
                          message: "Entrez un numéro de téléphone valide"
                        }
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone</FormLabel>
                          <FormControl>
                            <Input placeholder="+224 XXX XX XX XX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Delivery Address - Only show if delivery method is selected */}
                {deliveryMethod === 'delivery' && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="font-bold text-lg mb-4 flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-guinea-red" />
                      Adresse de livraison
                    </h2>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="address"
                        rules={{ required: "L'adresse est requise" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Adresse</FormLabel>
                            <FormControl>
                              <Input placeholder="Rue / Avenue / Boulevard" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="neighborhood"
                          rules={{ required: "Le quartier est requis" }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quartier</FormLabel>
                              <FormControl>
                                <Input placeholder="Votre quartier" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="landmark"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Point de repère (optionnel)</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: Près de la station Total" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="instructions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instructions de livraison (optionnel)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Instructions spéciales pour le livreur"
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
                
                {/* Payment Method */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="font-bold text-lg mb-4 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-guinea-red" />
                    Mode de paiement
                  </h2>
                  
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    rules={{ required: "Le mode de paiement est requis" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            className="space-y-3"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="cash" id="cash" />
                              <Label htmlFor="cash" className="flex items-center">
                                <span className="mr-3">💵</span>
                                Paiement à la livraison
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="orange_money" id="orange_money" />
                              <Label htmlFor="orange_money" className="flex items-center">
                                <span className="mr-3">🟠</span>
                                Orange Money
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="mtn_money" id="mtn_money" />
                              <Label htmlFor="mtn_money" className="flex items-center">
                                <span className="mr-3">🟡</span>
                                MTN Money
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="hidden lg:block">
                  <Button 
                    type="submit"
                    className="w-full bg-guinea-red hover:bg-guinea-red/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        Traitement...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Passer la commande
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="font-bold text-lg mb-4">Résumé de la commande</h2>
              
              {currentRestaurantName && (
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center">
                    <Store className="h-4 w-4 text-guinea-green mr-2" />
                    <span className="text-sm text-gray-700">{currentRestaurantName}</span>
                  </div>
                </div>
              )}
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sous-total</span>
                  <span>{subtotal.toLocaleString()} GNF</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">TVA (18%)</span>
                  <span>{tax.toLocaleString()} GNF</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {deliveryMethod === 'delivery' ? 'Frais de livraison' : 'Frais de préparation'}
                  </span>
                  <span>{deliveryFee.toLocaleString()} GNF</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{grandTotal.toLocaleString()} GNF</span>
                </div>
              </div>
              
              <div className="space-y-2">
                {/* Delivery method info */}
                <div className="text-sm p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center text-gray-700">
                    {deliveryMethod === 'delivery' ? (
                      <>
                        <Truck className="h-4 w-4 mr-2 text-guinea-red" />
                        <span>Livraison à domicile</span>
                      </>
                    ) : (
                      <>
                        <Store className="h-4 w-4 mr-2 text-guinea-red" />
                        <span>À récupérer sur place</span>
                      </>
                    )}
                  </div>
                  <p className="mt-1 text-gray-500">
                    {deliveryMethod === 'delivery' 
                      ? 'Livraison estimée: 30-60 minutes' 
                      : 'Préparation estimée: 20-30 minutes'}
                  </p>
                </div>
                
                <Button 
                  type="submit"
                  form="checkout-form"
                  className="w-full bg-guinea-red hover:bg-guinea-red/90"
                  disabled={isSubmitting}
                  onClick={() => form.handleSubmit(onSubmit)()}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Traitement...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Passer la commande
                    </span>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  asChild
                >
                  <Link to="/cart">
                    Modifier le panier
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

export default CheckoutPage;
