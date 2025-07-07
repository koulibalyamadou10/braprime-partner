import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Check, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartContext } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface AddToCartButtonProps {
  item: {
    id: number;
    name: string;
    price: number;
    image?: string;
  };
  businessId: number;
  businessName: string;
  variant?: 'default' | 'compact' | 'icon';
  className?: string;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  item,
  businessId,
  businessName,
  variant = 'default',
  className
}) => {
  const { currentUser } = useAuth();
  const { cart, addToCart, updateQuantity, removeFromCart, loading } = useCartContext();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Trouver l'article dans le panier
  const cartItem = cart?.items.find(cartItem => 
    cartItem.menu_item_id === item.id && cartItem.name === item.name
  );
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = async () => {
    if (!currentUser) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour ajouter des articles au panier.",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);
    
    try {
      await addToCart({
        menu_item_id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        image: item.image
      }, businessId, businessName);

      // Animation de succès
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1000);
      
      toast({
        title: "Article ajouté",
        description: `${item.name} a été ajouté à votre panier.`,
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'article au panier. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleIncreaseQuantity = async () => {
    if (cartItem) {
      try {
      await updateQuantity(cartItem.id, quantity + 1);
        toast({
          title: "Quantité mise à jour",
          description: `Quantité de ${item.name} augmentée.`,
        });
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de modifier la quantité. Veuillez réessayer.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDecreaseQuantity = async () => {
    if (cartItem) {
      try {
      if (quantity === 1) {
        await removeFromCart(cartItem.id);
          toast({
            title: "Article retiré",
            description: `${item.name} a été retiré du panier.`,
          });
      } else {
        await updateQuantity(cartItem.id, quantity - 1);
          toast({
            title: "Quantité mise à jour",
            description: `Quantité de ${item.name} diminuée.`,
          });
        }
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de modifier la quantité. Veuillez réessayer.",
          variant: "destructive",
        });
      }
    }
  };

  // Variant icon (juste l'icône)
  if (variant === 'icon') {
    return (
      <Button
        onClick={handleAddToCart}
        disabled={isAdding || loading}
        size="icon"
        className={cn(
          "h-8 w-8 rounded-full",
          showSuccess && "bg-green-600 hover:bg-green-700",
          className
        )}
      >
        {showSuccess ? (
          <Check size={16} />
        ) : isAdding ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
        ) : (
          <Plus size={16} />
        )}
      </Button>
    );
  }

  // Variant compact (petit bouton)
  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {quantity > 0 ? (
          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
            <button
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              onClick={handleDecreaseQuantity}
              disabled={isAdding || loading}
            >
              <Minus size={14} />
            </button>
            <span className="px-2 py-1 font-medium min-w-[2rem] text-center text-sm">
              {quantity}
            </span>
            <button
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              onClick={handleIncreaseQuantity}
              disabled={isAdding || loading}
            >
              <Plus size={14} />
            </button>
          </div>
        ) : (
          <Button
            onClick={handleAddToCart}
            disabled={isAdding || loading}
            size="sm"
            className={cn(
              "h-8 px-3 text-xs",
              showSuccess && "bg-green-600 hover:bg-green-700",
              className
            )}
          >
            {showSuccess ? (
              <Check size={14} />
            ) : isAdding ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
            ) : (
              <Plus size={14} />
            )}
            <span className="ml-1">Ajouter</span>
          </Button>
        )}
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
            disabled={isAdding || loading}
          >
            <Minus size={16} />
          </button>
          <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
            {quantity}
          </span>
          <button
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            onClick={handleIncreaseQuantity}
            disabled={isAdding || loading}
          >
            <Plus size={16} />
          </button>
        </div>
      ) : (
        <Button
          onClick={handleAddToCart}
          disabled={isAdding || loading}
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