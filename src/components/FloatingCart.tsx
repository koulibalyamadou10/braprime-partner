import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/contexts/AuthContext';

export interface FloatingCartProps {
  className?: string;
  variant?: 'bottom' | 'corner';
}

export const FloatingCart: React.FC<FloatingCartProps> = ({
  className,
  variant = 'bottom'
}) => {
  const { currentUser } = useAuth();
  const { cart, loading } = useCart();

  // Ne pas afficher si l'utilisateur n'est pas connecté ou s'il n'y a pas d'articles
  if (!currentUser || !cart || cart.item_count === 0 || loading) {
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
            <span className="absolute -top-1 -right-1 bg-white text-guinea-red text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
              {itemCount}
            </span>
          </Link>
        </Button>
      </div>
    );
  }

  // Variant bottom (barre en bas)
  return (
    <div className={cn("fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t p-4 z-50 animate-in slide-in-from-bottom duration-300", className)}>
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingBag className="h-6 w-6 text-guinea-red" />
              <span className="absolute -top-1 -right-1 bg-guinea-red text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
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