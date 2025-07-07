import { Link } from "react-router-dom";
import { Star, Clock, ShoppingCart, Package, MapPin, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFeaturedItems } from "@/hooks/use-homepage";
import { useCartContext } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

// Composant de chargement pour les articles en vedette
const FeaturedItemsSkeleton = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
              <Skeleton className="w-full h-56" />
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex justify-between items-center mb-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FeaturedItems = () => {
  const { data: featuredItems, isLoading, error } = useFeaturedItems(6);
  const { addToCart } = useCartContext();
  const { isAuthenticated } = useAuth();
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());

  if (isLoading) {
    return <FeaturedItemsSkeleton />;
  }

  if (error) {
    console.error('Erreur lors du chargement des articles en vedette:', error);
  }

  // Si aucun article n'est trouvé, ne pas afficher la section
  if (!featuredItems || featuredItems.length === 0) {
    return null;
  }

  // Formater les montants
  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k GNF`;
    }
    return `${amount} GNF`;
  };

  // Gérer l'ajout au panier
  const handleAddToCart = async (item: any) => {
    if (!isAuthenticated) {
      // Rediriger vers la page de connexion si non connecté
      window.location.href = '/login';
      return;
    }

    const itemId = item.id.toString();
    
    // Marquer cet article comme en cours de chargement
    setLoadingItems(prev => new Set(prev).add(itemId));

    try {
      // Vérifier si l'article a un business_id valide
      const businessId = item.business_id || item.businesses?.id;
      
      if (!businessId) {
        console.error('Aucun business_id trouvé pour cet article:', item);
        return;
      }

      const cartItem = {
        menu_item_id: item.id, // Utiliser l'ID numérique du menu_item
        name: item.name,
        price: item.price,
        quantity: 1,
        image: item.image,
        special_instructions: item.description // Utiliser description comme special_instructions
      };

      await addToCart(
        cartItem,
        businessId,
        item.businesses?.name || 'Restaurant'
      );
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
    } finally {
      // Retirer l'article de la liste des articles en cours de chargement
      setLoadingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-guinea-red to-guinea-yellow bg-clip-text text-transparent">
            Articles en Vedette
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez nos plats les plus populaires, préparés avec passion par nos meilleurs restaurants
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredItems.map((item) => {
            const itemId = item.id.toString();
            const isLoading = loadingItems.has(itemId);
            
            return (
              <div 
                key={item.id} 
                className="group bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-xl hover:border-guinea-red/20 transition-all duration-300 hover:scale-105"
              >
                {/* Image avec overlay */}
                <div className="relative overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <Badge className="bg-guinea-red text-white border-0 shadow-lg">
                      <Star className="h-3 w-3 mr-1" />
                      Populaire
                    </Badge>
                    {item.rating && (
                      <Badge variant="secondary" className="bg-white/90 text-gray-800 border-0 shadow-lg">
                        <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                        {item.rating}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Prix */}
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                      <span className="font-bold text-lg text-guinea-red">
                        {formatCurrency(item.price)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Contenu */}
                <div className="p-6">
                  {/* Titre et type de cuisine */}
                  <div className="mb-3">
                    <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-guinea-red transition-colors">
                      {item.name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <ChefHat className="h-4 w-4 mr-1" />
                      <span>{item.businesses?.cuisine_type || 'Restaurant'}</span>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                  
                  {/* Informations du restaurant et livraison */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1 text-guinea-red" />
                      <span className="font-medium">{item.businesses?.name || 'Restaurant'}</span>
                    </div>
                    {item.businesses?.delivery_time && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{item.businesses.delivery_time}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Bouton Ajouter au panier */}
                  <Button 
                    onClick={() => handleAddToCart(item)}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-guinea-red to-guinea-red/90 hover:from-guinea-red/90 hover:to-guinea-red text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                    {isLoading ? 'Ajout en cours...' : 'Ajouter au panier'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Bouton Voir plus */}
        <div className="text-center mt-12">
          <Button asChild variant="outline" size="lg" className="border-2 border-guinea-red text-guinea-red hover:bg-guinea-red hover:text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300">
            <Link to="/articles">
              Voir tous les articles
              <ChefHat className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedItems; 