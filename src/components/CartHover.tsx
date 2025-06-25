import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight,
  Package
} from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { formatCurrency } from '@/lib/utils';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

interface CartHoverProps {
  isMobile?: boolean;
}

const CartHover = ({ isMobile = false }: CartHoverProps) => {
  const { cart, loading, removeFromCart, updateQuantity } = useCart();
  const [isOpen, setIsOpen] = useState(false);

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

  // Version mobile - lien simple vers le panier
  if (isMobile) {
    return (
      <Link
        to="/cart"
        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
      >
        <ShoppingCart className="mr-3 h-5 w-5" />
        Panier
        {!loading && totalItems > 0 && (
          <span className="ml-auto bg-guinea-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </Link>
    );
  }

  // Si le panier est vide
  if (!loading && (!cart || cart.items.length === 0)) {
    return (
      <HoverCard openDelay={300}>
        <HoverCardTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="sr-only">Panier</span>
          </Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80 p-0" align="end">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShoppingCart className="h-5 w-5" />
                Mon Panier
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col items-center justify-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Votre panier est vide
                </p>
                <Button asChild size="sm">
                  <Link to="/categories">
                    Commencer les achats
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </HoverCardContent>
      </HoverCard>
    );
  }

  return (
    <HoverCard openDelay={300}>
      <HoverCardTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
        >
          <ShoppingCart className="h-5 w-5" />
          {!loading && totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-guinea-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
          <span className="sr-only">Panier</span>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-0" align="end">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Mon Panier
              </div>
              <Badge variant="secondary">
                {totalItems} {totalItems === 1 ? 'article' : 'articles'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-guinea-red"></div>
              </div>
            ) : (
              <>
                {/* Liste des articles */}
                <div className="max-h-64 overflow-y-auto space-y-3 mb-4">
                  {cart?.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      {/* Image de l'article */}
                      <div className="w-10 h-10 bg-gray-200 rounded-md flex-shrink-0">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover rounded-md"
                          />
                        )}
                      </div>
                      
                      {/* Détails de l'article */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(item.price)} chacun
                        </p>
                      </div>
                      
                      {/* Contrôles de quantité */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={loading}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-6 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={loading}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {/* Prix total de l'article */}
                      <div className="text-right min-w-0">
                        <p className="font-medium text-sm">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                      
                      {/* Bouton supprimer */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={loading}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  
                  {/* Message si plus de 3 articles */}
                  {cart && cart.items.length > 3 && (
                    <div className="text-center py-2">
                      <p className="text-xs text-muted-foreground">
                        +{cart.items.length - 3} autres articles
                      </p>
                    </div>
                  )}
                </div>

                <Separator className="my-3" />

                {/* Résumé */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Sous-total</span>
                    <span className="font-medium">{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Livraison</span>
                    <span className="text-muted-foreground">Calculée à la commande</span>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="space-y-2">
                  <Button asChild className="w-full" size="sm">
                    <Link to="/cart" className="flex items-center justify-center gap-2">
                      Voir le panier complet
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  
                  {cart && cart.items.length > 0 && (
                    <Button 
                      variant="outline" 
                      asChild 
                      className="w-full" 
                      size="sm"
                    >
                      <Link to="/cart">
                        Passer la commande
                      </Link>
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </HoverCardContent>
    </HoverCard>
  );
};

export default CartHover; 