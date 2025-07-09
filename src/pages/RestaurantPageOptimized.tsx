import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/contexts/AuthContext';
import { AddToCartButton } from '@/components/AddToCartButton';
import { FloatingCart } from '@/components/FloatingCart';
import { useRestaurantData, useRestaurantEssential, useRestaurantMenuItems } from '@/hooks/use-restaurant-data';
import BusinessPageSkeleton from '@/components/BusinessPageSkeleton';
import ShareModal from '@/components/ShareModal';
import { useFavorites } from '@/hooks/use-favorites';
import { cn } from '@/lib/utils';
import { 
  Clock, Star, Phone, MapPin, ChevronLeft, 
  ChevronRight, Info, Heart, Share, ShoppingBag, Utensils
} from 'lucide-react';

const RestaurantPageOptimized = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { addToCart, cart } = useCart();
  const { isBusinessFavorite, toggleBusinessFavorite, isTogglingBusiness } = useFavorites();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [showMenuItems, setShowMenuItems] = useState(false);
  
  // Option 1: Récupérer toutes les données en une seule requête (recommandé)
  const { 
    data: restaurantData, 
    isLoading: isLoadingAll, 
    error: errorAll 
  } = useRestaurantData(id);

  // Option 2: Récupérer les données essentielles d'abord, puis les articles de menu
  const { 
    data: essentialData, 
    isLoading: isLoadingEssential, 
    error: errorEssential 
  } = useRestaurantEssential(id);

  // Charger les articles de menu seulement quand nécessaire
  const { 
    data: menuItems, 
    isLoading: menuItemsLoading, 
    error: menuItemsError 
  } = useRestaurantMenuItems(id, showMenuItems);

  // Utiliser les données de l'option 1 si disponibles, sinon l'option 2
  const business = restaurantData?.business || essentialData?.business;
  const categories = restaurantData?.categories || essentialData?.categories;
  const allMenuItems = restaurantData?.menuItems || menuItems || [];
  
  const isLoading = isLoadingAll || isLoadingEssential;
  const error = errorAll || errorEssential;
  
  // Sélectionner automatiquement la première catégorie si aucune n'est sélectionnée
  useEffect(() => {
    if (categories && categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  // Charger les articles de menu quand l'utilisateur interagit avec les catégories
  useEffect(() => {
    if (selectedCategory && !restaurantData) {
      setShowMenuItems(true);
    }
  }, [selectedCategory, restaurantData]);

  // Gestion des erreurs
  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
            <p className="text-gray-600 mb-4">
              {error.message === 'Commerce non trouvé' 
                ? 'Ce commerce n\'existe pas ou a été supprimé.'
                : 'Une erreur est survenue lors du chargement du commerce.'
              }
            </p>
            <Button asChild>
              <Navigate to="/" replace />
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Affichage du skeleton pendant le chargement
  if (isLoading || !business) {
    return (
      <Layout>
        <BusinessPageSkeleton />
      </Layout>
    );
  }
  
  // Formater les montants
  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k GNF`;
    }
    return `${amount} GNF`;
  };
  
  const handleAddToCart = async (item: {
    id: number;
    name: string;
    price: number;
    image?: string;
  }) => {
    if (!currentUser) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour ajouter des articles au panier.",
        variant: "destructive",
      });
      return;
    }

    await addToCart({
      menu_item_id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image
    }, business.id, business.name);
  };

  const handleToggleFavorite = () => {
    if (!currentUser) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour ajouter aux favoris.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      toggleBusinessFavorite(business.id);
      const isFavorite = isBusinessFavorite(business.id);
      toast({
        title: isFavorite ? "Retiré des favoris" : "Ajouté aux favoris",
        description: isFavorite 
          ? `${business.name} a été retiré de vos favoris.`
          : `${business.name} a été ajouté à vos favoris.`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier les favoris. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const handleOpenShareModal = () => {
    setShareModalOpen(true);
    toast({
      title: "Partage",
      description: "Ouvrir les options de partage pour ce restaurant.",
    });
  };

  const handleCloseShareModal = () => {
    setShareModalOpen(false);
  };
  
  // Filtrer les articles par catégorie sélectionnée
  const filteredItems = selectedCategory 
    ? allMenuItems.filter(item => item.category_id === selectedCategory) || []
    : allMenuItems || [];
  
  return (
    <Layout>
      {/* Cover Image */}
      <div className="h-64 md:h-80 w-full relative overflow-hidden">
        <img 
          src={business.cover_image} 
          alt={business.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end">
          <div className="w-20 h-20 rounded-xl overflow-hidden border-4 border-white mr-4">
            <img 
              src={business.logo} 
              alt={`${business.name} logo`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-white">
            <h1 className="text-2xl md:text-3xl font-bold">{business.name}</h1>
            <div className="flex flex-wrap items-center text-sm mt-2">
              <span className="mr-3">{business.cuisine_type}</span>
              <div className="flex items-center mr-3">
                <Star className="h-4 w-4 fill-guinea-yellow text-guinea-yellow mr-1" />
                <span>{business.rating}</span>
                <span className="text-xs ml-1">({business.review_count})</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{business.delivery_time}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="container mx-auto px-4 my-6">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <p className="text-gray-700 mb-4">{business.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">{business.address}</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">{business.phone}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">Ouvert: {business.opening_hours}</span>
            </div>
            <div className="flex items-center">
              <Info className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">Frais de livraison: {formatCurrency(business.delivery_fee)}</span>
            </div>
          </div>
          <div className="flex mt-6 space-x-4">
            <Button 
              variant="outline" 
              className={cn(
                "flex items-center transition-all duration-200",
                isBusinessFavorite(business.id) && "bg-red-50 text-red-600 border-red-200"
              )}
              onClick={handleToggleFavorite}
              disabled={isTogglingBusiness}
            >
              <Heart className={cn(
                "h-4 w-4 mr-2",
                isBusinessFavorite(business.id) && "fill-red-500 text-red-500"
              )} />
              {isBusinessFavorite(business.id) ? "Favori" : "Favoris"}
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center"
              onClick={handleOpenShareModal}
            >
              <Share className="h-4 w-4 mr-2" />
              Partager
            </Button>
          </div>
        </div>

        {/* Menu avec onglets de catégories */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          {/* Onglets des catégories */}
          {!categories || categories.length === 0 ? (
            <div className="text-center py-4 text-gray-500 mb-6">
              Aucune catégorie disponible
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 mb-6 border-b">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-guinea-red text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
          
          {/* Liste des articles de la catégorie sélectionnée */}
          {menuItemsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="border rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-3"></div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : menuItemsError ? (
            <div className="text-center py-8 text-red-500">
              Erreur lors du chargement du menu: {menuItemsError.message}
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredItems.map(item => (
                <div key={item.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white">
                  <div className="flex">
                    {/* Image de l'article - côté gauche */}
                    {item.image && (
                      <div className="w-32 h-32 flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    {/* Contenu de la carte - côté droit */}
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          {item.is_popular && (
                            <Badge className="bg-yellow-100 text-yellow-800 text-xs">Populaire</Badge>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-lg">{formatCurrency(item.price)}</span>
                        <AddToCartButton
                          item={item}
                          businessId={business.id}
                          businessName={business.name}
                          variant="compact"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {selectedCategory 
                ? 'Aucun article disponible dans cette catégorie'
                : 'Aucun article disponible dans le menu'
              }
            </div>
          )}
        </div>
      </div>

      {/* Panier flottant optimisé mobile */}
      <FloatingCart variant="mobile" />

      {/* Modal Partage */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={handleCloseShareModal}
        business={business}
      />
    </Layout>
  );
};

export default RestaurantPageOptimized; 