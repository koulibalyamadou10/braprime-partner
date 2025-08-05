import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Star, 
  Clock, 
  MapPin, 
  ChefHat, 
  ShoppingCart, 
  Heart,
  X,
  Plus,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFavorites } from '@/hooks/use-favorites';
import { useAuth } from '@/contexts/AuthContext';

interface ItemDetailModalProps {
  item: any;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: any) => void;
  loadingItems: Set<string>;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onAddToCart,
  loadingItems
}) => {
  const [quantity, setQuantity] = React.useState(1);
  const { currentUser } = useAuth();
  const { 
    toggleMenuItemFavorite, 
    isMenuItemFavorite, 
    isTogglingMenuItem 
  } = useFavorites();

  // Formater les montants
  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k GNF`;
    }
    return `${amount} GNF`;
  };

  // Calculer le prix total
  const totalPrice = item ? item.price * quantity : 0;

  // Gérer l'ajout au panier avec quantité
  const handleAddToCart = () => {
    if (!item) return;
    
    // Créer une copie de l'article avec la quantité
    const itemWithQuantity = {
      ...item,
      quantity: quantity
    };
    
    onAddToCart(itemWithQuantity);
    setQuantity(1); // Reset quantity
  };

  // Gérer l'ajout/retrait des favoris
  const handleToggleFavorite = () => {
    if (!item) return;
    toggleMenuItemFavorite(item.id);
  };

  // Vérifier si l'article est en favori
  const isFavorite = item ? isMenuItemFavorite(item.id) : false;

  if (!item) return null;

  const itemId = item.id.toString();
  const isLoading = loadingItems.has(itemId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Détails de l'article</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image principale */}
          <div className="relative">
            <img 
              src={item.image} 
              alt={item.name}
              className="w-full h-64 object-cover rounded-lg"
            />
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {item.is_popular && (
                <Badge className="bg-yellow-500 text-white">
                  <Star className="h-3 w-3 mr-1" />
                  Populaire
                </Badge>
              )}
              {item.menu_categories?.name && (
                <Badge variant="secondary" className="bg-white/90">
                  {item.menu_categories.name}
                </Badge>
              )}
              {isFavorite && (
                <Badge className="bg-red-500 text-white">
                  <Heart className="h-3 w-3 mr-1 fill-current" />
                  Favori
                </Badge>
              )}
            </div>

            {/* Prix */}
            <div className="absolute top-4 right-4">
              <div className="bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                <span className="font-bold text-xl text-guinea-red">
                  {formatCurrency(item.price)}
                </span>
              </div>
            </div>
          </div>

          {/* Informations principales */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{item.name}</h2>
            
            {/* Restaurant */}
            <div className="flex items-center text-gray-600 mb-3">
              <ChefHat className="h-4 w-4 mr-2 text-guinea-red" />
              <span className="font-medium">{item.businesses?.name || 'Restaurant'}</span>
            </div>

            {/* Description */}
            {item.description && (
              <p className="text-gray-700 leading-relaxed mb-4">
                {item.description}
              </p>
            )}
          </div>

          <Separator />

          {/* Informations détaillées */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Restaurant */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-guinea-red" />
                Restaurant
              </h3>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="font-medium">{item.businesses?.name || 'Restaurant'}</p>
                <p className="text-sm text-gray-600">{item.businesses?.cuisine_type || 'Cuisine'}</p>
                {item.businesses?.address && (
                  <p className="text-sm text-gray-600 mt-1">{item.businesses.address}</p>
                )}
              </div>
            </div>

            {/* Informations de livraison */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-guinea-red" />
                Livraison
              </h3>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Temps de préparation :</span> {item.preparation_time || 20} min
                </p>
                {item.businesses?.delivery_time && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Livraison :</span> {item.businesses.delivery_time}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Informations nutritionnelles */}
          {item.nutritional_info && Object.keys(item.nutritional_info).length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Informations nutritionnelles</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {item.nutritional_info.calories && (
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <p className="text-sm text-gray-600">Calories</p>
                      <p className="font-semibold text-blue-600">{item.nutritional_info.calories}</p>
                    </div>
                  )}
                  {item.nutritional_info.proteines && (
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <p className="text-sm text-gray-600">Protéines</p>
                      <p className="font-semibold text-green-600">{item.nutritional_info.proteines}g</p>
                    </div>
                  )}
                  {item.nutritional_info.glucides && (
                    <div className="bg-yellow-50 rounded-lg p-3 text-center">
                      <p className="text-sm text-gray-600">Glucides</p>
                      <p className="font-semibold text-yellow-600">{item.nutritional_info.glucides}g</p>
                    </div>
                  )}
                  {item.nutritional_info.lipides && (
                    <div className="bg-red-50 rounded-lg p-3 text-center">
                      <p className="text-sm text-gray-600">Lipides</p>
                      <p className="font-semibold text-red-600">{item.nutritional_info.lipides}g</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Allergènes */}
          {item.allergens && item.allergens.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Allergènes</h3>
                <div className="flex flex-wrap gap-2">
                  {item.allergens.map((allergen: string, index: number) => (
                    <Badge key={index} variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                      {allergen}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Actions */}
          <div className="space-y-4">
            {/* Sélecteur de quantité */}
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">Quantité :</span>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-gray-100"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 hover:bg-gray-100"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Prix total */}
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
              <span className="font-medium text-gray-900">Prix total :</span>
              <span className="font-bold text-xl text-guinea-red">
                {formatCurrency(totalPrice)}
              </span>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={isLoading}
                className="flex-1 bg-guinea-red hover:bg-guinea-red/90"
                size="lg"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <ShoppingCart className="h-5 w-5 mr-2" />
                )}
                Ajouter au panier
              </Button>
              
              <Button 
                variant={isFavorite ? "default" : "outline"}
                size="lg" 
                className={cn(
                  "px-6 transition-all duration-200",
                  isFavorite && "bg-red-500 hover:bg-red-600 text-white"
                )}
                onClick={handleToggleFavorite}
                disabled={isTogglingMenuItem || !currentUser}
              >
                {isTogglingMenuItem ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
                ) : (
                  <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 