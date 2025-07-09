import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingBag, X, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartContext } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

export interface FloatingCartProps {
  className?: string;
  variant?: 'bottom' | 'corner' | 'mobile';
  showDetails?: boolean;
}

export const FloatingCart: React.FC<FloatingCartProps> = ({
  className,
  variant = 'bottom',
  showDetails = false
}) => {
  const { currentUser } = useAuth();
  const { cart, loading } = useCartContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Détecter si on est sur mobile
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Animation d'apparition
  useEffect(() => {
    if (cart && cart.item_count > 0) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [cart?.item_count]);

  // Ne pas afficher si l'utilisateur n'est pas connecté ou s'il n'y a pas d'articles
  if (!currentUser || !cart || cart.item_count === 0 || loading || !isVisible) {
    return null;
  }

  const itemCount = cart.item_count;
  const total = cart.total;

  // Formater la monnaie
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Variant corner (coin de l'écran)
  if (variant === 'corner') {
    return (
      <div className={cn("fixed bottom-4 right-4 z-50", className)}>
        <Button
          className="bg-guinea-red hover:bg-guinea-red/90 rounded-full w-14 h-14 flex items-center justify-center relative shadow-lg transition-all duration-200 hover:scale-105"
          asChild
        >
          <Link to="/cart">
            <ShoppingBag className="h-6 w-6" />
            <Badge className="absolute -top-1 -right-1 bg-white text-guinea-red text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse border-0">
              {itemCount}
            </Badge>
          </Link>
        </Button>
      </div>
    );
  }

  // Variant mobile optimisé
  if (variant === 'mobile' || isMobile) {
    return (
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
        isExpanded ? "h-64" : "h-20",
        className
      )}>
        {/* Barre principale du panier */}
        <div className="bg-white shadow-lg border-t border-gray-200 h-20 flex items-center px-4">
          <div className="flex items-center justify-between w-full">
            {/* Côté gauche - Icône et info */}
            <div className="flex items-center gap-3 flex-1">
              <div className="relative">
                <ShoppingBag className="h-6 w-6 text-guinea-red" />
                <Badge className="absolute -top-1 -right-1 bg-guinea-red text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-0">
                  {itemCount}
                </Badge>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {itemCount} article{itemCount > 1 ? 's' : ''}
                </p>
                {cart.business_name && (
                  <p className="text-xs text-gray-500 truncate">
                    {cart.business_name}
                  </p>
                )}
              </div>
            </div>
            
            {/* Côté droit - Total et boutons */}
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-gray-500">Total</p>
                <p className="font-bold text-sm text-guinea-red">
                  {formatCurrency(total)}
                </p>
              </div>
              
              {/* Bouton d'expansion */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 h-8 w-8"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
              
              {/* Bouton Voir le panier */}
              <Button
                className="bg-guinea-red hover:bg-guinea-red/90 text-white px-4 py-2 text-sm h-8"
                asChild
              >
                <Link to="/cart">
                  Voir
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Section détaillée (expandable) */}
        {isExpanded && (
          <div className="bg-white border-t border-gray-100 h-44 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Détails du panier</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="p-1 h-6 w-6"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              
              {/* Liste des articles */}
              <div className="space-y-2 max-h-24 overflow-y-auto">
                {cart.items?.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-6 h-6 rounded object-cover"
                        />
                      )}
                      <span className="truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">x{item.quantity}</span>
                      <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  </div>
                ))}
                {cart.items && cart.items.length > 3 && (
                  <div className="text-xs text-gray-500 text-center py-1">
                    +{cart.items.length - 3} autre(s) article(s)
                  </div>
                )}
              </div>
              
              {/* Total et bouton commander */}
              <div className="border-t border-gray-100 pt-3 mt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Total</span>
                  <span className="font-bold text-lg text-guinea-red">
                    {formatCurrency(total)}
                  </span>
                </div>
                <Button
                  className="w-full bg-guinea-red hover:bg-guinea-red/90 text-white py-2"
                  asChild
                >
                  <Link to="/cart">
                    Commander maintenant
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Variant bottom (barre en bas) - Desktop
  return (
    <div className={cn("fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t p-4 z-50 animate-in slide-in-from-bottom duration-300", className)}>
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingBag className="h-6 w-6 text-guinea-red" />
              <Badge className="absolute -top-1 -right-1 bg-guinea-red text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-0">
                {itemCount}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium">
                {itemCount} article{itemCount > 1 ? 's' : ''} dans le panier
              </p>
              {cart.business_name && (
                <p className="text-xs text-gray-500">
                  De {cart.business_name}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-gray-500">Total</p>
              <p className="font-bold text-lg text-guinea-red">
                {formatCurrency(total)}
              </p>
            </div>
            
            <Button
              className="bg-guinea-red hover:bg-guinea-red/90 text-white px-6 py-2"
              asChild
            >
              <Link to="/cart">
                Voir le panier
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}; 