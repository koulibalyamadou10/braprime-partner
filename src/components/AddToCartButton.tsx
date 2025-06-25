import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useOrder } from '@/contexts/OrderContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Minus, ShoppingCart, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddToCartButtonProps {
  item: {
    id: number;
    name: string;
    price: number;
    image?: string;
    description?: string;
  };
  businessId: number;
  businessName: string;
  variant?: 'default' | 'compact' | 'card';
  className?: string;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  item,
  businessId,
  businessName,
  variant = 'default',
  className
}) => {
  const { addToCart, removeFromCart, updateQuantity, cart } = useOrder();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const cartItem = cart.find(cartItem => cartItem.id === item.id);
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = async () => {
    setIsAdding(true);
    
    try {
      addToCart(
        {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          image: item.image
        },
        businessId,
        businessName
      );

      // Animation de succès
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1000);

      toast({
        title: "Ajouté au panier",
        description: `${item.name} a été ajouté à votre panier.`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'article au panier.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleIncreaseQuantity = () => {
    updateQuantity(item.id, quantity + 1);
    toast({
      title: "Quantité mise à jour",
      description: `Quantité de ${item.name} mise à jour.`,
    });
  };

  const handleDecreaseQuantity = () => {
    if (quantity === 1) {
      removeFromCart(item.id);
      toast({
        title: "Retiré du panier",
        description: `${item.name} a été retiré du panier.`,
      });
    } else {
      updateQuantity(item.id, quantity - 1);
      toast({
        title: "Quantité mise à jour",
        description: `Quantité de ${item.name} mise à jour.`,
      });
    }
  };

  // Variant compact pour les cartes
  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {quantity > 0 ? (
          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
            <button
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              onClick={handleDecreaseQuantity}
              disabled={isAdding}
            >
              <Minus size={14} />
            </button>
            <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
              {quantity}
            </span>
            <button
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              onClick={handleIncreaseQuantity}
              disabled={isAdding}
            >
              <Plus size={14} />
            </button>
          </div>
        ) : (
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={isAdding}
            className={cn(
              "bg-guinea-green hover:bg-guinea-green/90 text-white transition-all duration-200",
              showSuccess && "bg-green-600",
              className
            )}
          >
            {showSuccess ? (
              <Check size={14} />
            ) : isAdding ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <Plus size={14} />
            )}
            <span className="ml-1">Ajouter</span>
          </Button>
        )}
      </div>
    );
  }

  // Variant card pour les cartes de produits
  if (variant === 'card') {
    return (
      <div className={cn("flex items-center justify-between mt-auto", className)}>
        <span className="font-medium">{(item.price).toLocaleString()} GNF</span>
        <div className="flex items-center">
          {quantity > 0 ? (
            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
              <button
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                onClick={handleDecreaseQuantity}
                disabled={isAdding}
              >
                <Minus size={16} />
              </button>
              <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                {quantity}
              </span>
              <button
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                onClick={handleIncreaseQuantity}
                disabled={isAdding}
              >
                <Plus size={16} />
              </button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={isAdding}
              className={cn(
                "bg-guinea-green hover:bg-guinea-green/90 text-white transition-all duration-200",
                showSuccess && "bg-green-600",
                className
              )}
            >
              {showSuccess ? (
                <Check size={16} />
              ) : isAdding ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <ShoppingCart size={16} />
              )}
              <span className="ml-1">Ajouter</span>
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Variant default
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {quantity > 0 ? (
        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
          <button
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            onClick={handleDecreaseQuantity}
            disabled={isAdding}
          >
            <Minus size={16} />
          </button>
          <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
            {quantity}
          </span>
          <button
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            onClick={handleIncreaseQuantity}
            disabled={isAdding}
          >
            <Plus size={16} />
          </button>
        </div>
      ) : (
        <Button
          onClick={handleAddToCart}
          disabled={isAdding}
          className={cn(
            "bg-guinea-green hover:bg-guinea-green/90 text-white transition-all duration-200",
            showSuccess && "bg-green-600",
            className
          )}
        >
          {showSuccess ? (
            <Check size={16} />
          ) : isAdding ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
          ) : (
            <ShoppingCart size={16} />
          )}
          <span className="ml-2">Ajouter au panier</span>
        </Button>
      )}
    </div>
  );
}; 