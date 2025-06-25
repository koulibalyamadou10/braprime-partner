import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, Minus, ShoppingBag, ChevronLeft, Store, ArrowRight, Loader2 } from 'lucide-react';

const CartPage = () => {
  const { currentUser } = useAuth();
  const { 
    cart, 
    loading, 
    error,
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    refreshCart
  } = useCart();
  const navigate = useNavigate();
  
  // Formater la monnaie
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  useEffect(() => {
    // Si l'utilisateur n'est pas connecté, rediriger vers la connexion
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Si le panier est vide, rediriger vers la page d'accueil
    if (!loading && (!cart || cart.items.length === 0)) {
      navigate('/');
    }
  }, [currentUser, cart, loading, navigate]);
  
  const handleClearCart = async () => {
    await clearCart();
  };

  // Afficher le chargement
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Chargement du panier...</span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Afficher l'erreur
  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={refreshCart}>
              Réessayer
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Si pas de panier ou panier vide
  if (!cart || cart.items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-12">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Votre panier est vide</h3>
            <p className="text-center text-muted-foreground mb-4">
              Explorez nos restaurants pour ajouter des articles à votre panier.
            </p>
            <Button asChild>
              <Link to="/categories">Commander maintenant</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  const subtotal = cart.total;
  const tax = subtotal * 0.18; // 18% VAT in Guinea
  const deliveryFee = 15000; // Fixed fee in GNF
  const grandTotal = subtotal + tax + deliveryFee;
  
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
            {cart.business_name && (
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex items-center">
                <Store className="h-5 w-5 text-guinea-green mr-3" />
                <div>
                  <span className="text-sm text-gray-500">Commander de</span>
                  <h3 className="font-semibold">{cart.business_name}</h3>
                </div>
              </div>
            )}
            
            {/* Cart Items */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-semibold">Articles ({cart.item_count})</h2>
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
                {cart.items.map((item) => (
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
                        {formatCurrency(item.price)}
                      </p>
                      {item.special_instructions && (
                        <p className="text-sm text-gray-500 mt-1">
                          Note: {item.special_instructions}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                        <button
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="font-bold text-lg mb-4">Résumé de la commande</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sous-total</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">TVA (18%)</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Frais de livraison</span>
                  <span>{formatCurrency(deliveryFee)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(grandTotal)}</span>
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
