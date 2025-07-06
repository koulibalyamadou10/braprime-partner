import { Link } from "react-router-dom";
import { Star, Clock, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFeaturedItems } from "@/hooks/use-homepage";
import { Skeleton } from "@/components/ui/skeleton";

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
            <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <Skeleton className="w-full h-48" />
              <div className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-3" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
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

  // Utiliser uniquement les données de la base de données
  const displayItems = featuredItems || [];

  if (isLoading) {
    return <FeaturedItemsSkeleton />;
  }

  if (error) {
    console.error('Erreur lors du chargement des articles en vedette:', error);
  }

  // Formater les montants
  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k GNF`;
    }
    return `${amount} GNF`;
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold">Articles en Vedette</h2>
          <Button asChild variant="ghost" className="text-guinea-red hover:text-guinea-red/90">
            <Link to="/categories">
              Voir tous les services
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayItems.map((item) => (
            <div 
              key={item.id} 
              className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <div className="relative">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <Badge className="absolute top-3 left-3 bg-guinea-red text-white">
                  <Star className="h-3 w-3 mr-1" />
                  Populaire
                </Badge>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-guinea-red transition-colors">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {item.description}
                </p>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center text-sm text-gray-500">
                    <span>{item.restaurants?.name}</span>
                  </div>
                  <div className="text-lg font-bold text-guinea-red">
                    {formatCurrency(item.price)}
                  </div>
                </div>
                
                <Button 
                  asChild 
                  className="w-full bg-guinea-red hover:bg-guinea-red/90 text-white"
                >
                  <Link to={`/services/${item.restaurants?.name}`}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Commander
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedItems; 