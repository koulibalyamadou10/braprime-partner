
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useOrder } from '@/contexts/OrderContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, Minus, ShoppingBag, ChevronLeft, Store, ArrowRight } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const CartPage = () => {
  const { 
    cart, 
    currentRestaurantName, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartTotal, 
    getCartCount 
  } = useOrder();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const subtotal = getCartTotal();
  const tax = subtotal * 0.18; // 18% VAT in Guinea
  const deliveryFee = 15000; // Fixed fee in GNF
  const grandTotal = subtotal + tax + deliveryFee;
  
  useEffect(() => {
    // If cart is empty, redirect to home
    if (cart.length === 0) {
      navigate('/');
      toast({
        title: "Panier vide",
        description: "Votre panier est vide. Explorez nos restaurants pour commander.",
      });
    }
  }, [cart, navigate, toast]);
  
  const handleClearCart = () => {
    clearCart();
    toast({
      title: "Panier vidé",
      description: "Tous les articles ont été retirés de votre panier.",
    });
  };
  
  if (cart.length === 0) {
    return null; // Will redirect in useEffect
  }
  
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
            <Link to="/">
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Retour</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Votre Panier</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Restaurant Info */}
            {currentRestaurantName && (
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex items-center">
                <Store className="h-5 w-5 text-guinea-green mr-3" />
                <div>
                  <span className="text-sm text-gray-500">Commander de</span>
                  <h3 className="font-semibold">{currentRestaurantName}</h3>
                </div>
              </div>
            )}
            
            {/* Cart Items */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-semibold">Articles ({getCartCount()})</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-500 hover:text-red-700"
                  onClick={handleClearCart}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Vider le panier
                </Button>
              </div>
              
              <ul className="divide-y divide-gray-100">
                {cart.map((item) => (
                  <li key={item.id} className="p-4 flex items-center">
                    {item.image && (
                      <div className="h-16 w-16 rounded-md overflow-hidden mr-4 flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="flex-grow">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-gray-500 text-sm mt-1">
                        {item.price.toLocaleString()} GNF
                      </p>
                    </div>
                    
                    <div className="flex items-center">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 rounded-full"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                        <span className="sr-only">Réduire</span>
                      </Button>
                      
                      <span className="mx-3 w-6 text-center">{item.quantity}</span>
                      
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 rounded-full"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                        <span className="sr-only">Augmenter</span>
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="ml-4 text-gray-500 hover:text-red-500"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Supprimer</span>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="font-bold text-lg mb-4">Résumé de la commande</h2>
              
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
                  <span className="text-gray-600">Frais de livraison</span>
                  <span>{deliveryFee.toLocaleString()} GNF</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{grandTotal.toLocaleString()} GNF</span>
                </div>
              </div>
              
              <Button 
                className="w-full bg-guinea-red hover:bg-guinea-red/90"
                asChild
              >
                <Link to="/checkout" className="flex items-center justify-center">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Passer à la caisse
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full mt-3"
                asChild
              >
                <Link to="/" className="flex items-center justify-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter d'autres articles
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
