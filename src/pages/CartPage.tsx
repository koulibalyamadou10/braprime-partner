import { useState, useEffect } from 'react';
import { useCartContext } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft,
  Package,
  Store,
  User,
  LogIn,
  UserPlus
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useToast } from '@/hooks/use-toast';

const CartPage = () => {
  const { cart, loading, error, removeFromCart, updateQuantity, clearCart } = useCartContext();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Calculer le total du panier
  const cartTotal = cart?.total || 0;
  const totalItems = cart?.item_count || 0;

  // Gérer la mise à jour de la quantité
  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(itemId);
    } else {
      await updateQuantity(itemId, newQuantity);
    }
  };

  // Gérer la suppression d'un article
  const handleRemoveItem = async (itemId: string) => {
    await removeFromCart(itemId);
  };

  // Gérer le vidage du panier
  const handleClearCart = async () => {
    await clearCart();
  };

  // Gérer le passage au checkout
  const handleCheckout = () => {
    if (!currentUser) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour passer votre commande.",
        variant: "destructive",
      });
      return;
    }

    if (!cart || cart.items.length === 0) {
      toast({
        title: "Panier vide",
        description: "Votre panier est vide.",
        variant: "destructive",
      });
      return;
    }

    navigate('/checkout');
  };

  // Rediriger vers les catégories si le panier est vide
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
                  Ajoutez des articles à votre panier pour commencer vos achats.
                </p>
                <Button onClick={() => navigate('/categories')} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Continuer les achats
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
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Mon Panier</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                {totalItems} {totalItems === 1 ? 'article' : 'articles'} dans votre panier
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/categories')}
              className="gap-2 w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              Continuer les achats
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Articles du panier */}
            <div className="lg:col-span-2 space-y-4">
              {/* Restaurant Info */}
              {cart?.business_name && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <Store className="h-5 w-5 text-guinea-red mr-3" />
                      <div>
                        <span className="text-sm text-gray-500">Commander de</span>
                        <h3 className="font-semibold">{cart.business_name}</h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Articles */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Articles ({totalItems})
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700"
                      onClick={handleClearCart}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Vider le panier
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cart?.items.map((item) => (
                    <div key={item.id} className="border rounded-lg overflow-hidden">
                      {/* Version mobile */}
                      <div className="block md:hidden">
                        <div className="p-4">
                          {/* En-tête avec image et nom */}
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
                              {item.image && (
                                <img 
                                  src={item.image} 
                                  alt={item.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm">{item.name}</h3>
                              <p className="text-xs text-muted-foreground">
                                {formatCurrency(item.price)} chacun
                              </p>
                              {item.special_instructions && (
                                <p className="text-xs text-blue-600 mt-1">
                                  Note: {item.special_instructions}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={loading}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          {/* Contrôles et prix */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                disabled={loading}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center font-medium text-sm">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                disabled={loading}
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-sm">
                                {formatCurrency(item.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Version desktop */}
                      <div className="hidden md:flex items-center gap-4 p-4">
                      {/* Image de l'article */}
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        )}
                      </div>
                      
                      {/* Détails de l'article */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.price)} chacun
                        </p>
                        {item.special_instructions && (
                          <p className="text-sm text-blue-600 mt-1">
                            Note: {item.special_instructions}
                          </p>
                        )}
                      </div>
                      
                      {/* Contrôles de quantité */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={loading}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={loading}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {/* Prix total de l'article */}
                      <div className="text-right min-w-0">
                        <p className="font-medium">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                      
                      {/* Bouton supprimer */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={loading}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Résumé et checkout */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Résumé de la commande</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Sous-total */}
                  <div className="flex justify-between">
                    <span>Sous-total ({totalItems} articles)</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>

                  <Separator />

                  {/* Total */}
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>

                  {/* Menu pour utilisateurs non connectés */}
                  {!currentUser && (
                    <>
                      <Separator />
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <User className="h-5 w-5 text-blue-600" />
                          <h4 className="font-medium text-blue-900">Connexion requise</h4>
                        </div>
                        <p className="text-sm text-blue-700 mb-4">
                          Connectez-vous ou créez un compte pour passer votre commande.
                        </p>
                        <div className="space-y-2">
                          <Button 
                            onClick={() => navigate('/login')}
                            className="w-full gap-2"
                            size="sm"
                          >
                            <LogIn className="h-4 w-4" />
                            Se connecter
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => navigate('/register')}
                            className="w-full gap-2"
                            size="sm"
                          >
                            <UserPlus className="h-4 w-4" />
                            Créer un compte
                          </Button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Bouton checkout */}
                  <Button 
                    onClick={handleCheckout}
                    disabled={loading || !cart || cart.items.length === 0}
                    className="w-full gap-2"
                    size="lg"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {currentUser ? 'Passer à la caisse' : 'Se connecter pour commander'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
