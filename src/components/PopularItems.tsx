import { Link } from "react-router-dom";
import { Clock, Star, TrendingUp, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePopularRestaurants } from "@/hooks/use-homepage";
import { Skeleton } from "@/components/ui/skeleton";

// Composant de chargement pour les services populaires
const PopularItemsSkeleton = () => {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
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

const PopularItems = () => {
  const { data: services, isLoading, error } = usePopularRestaurants(8);

  // Utiliser uniquement les données de la base de données
  const displayServices = services || [];

  if (isLoading) {
    return <PopularItemsSkeleton />;
  }

  if (error) {
    console.error('Erreur lors du chargement des services populaires:', error);
  }

  // Formater les montants
  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k GNF`;
    }
    return `${amount} GNF`;
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold">Services Populaires</h2>
          <Button asChild variant="ghost" className="text-guinea-red hover:text-guinea-red/90 flex items-center">
            <Link to="/categories">
              Voir tous les services
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayServices.map((service) => (
            <Link 
              key={service.id} 
              to={`/services/${service.id}`}
              className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <div className="relative">
                <img 
                  src={service.cover_image} 
                  alt={service.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                />
                {service.is_popular && (
                  <Badge className="absolute top-3 left-3 bg-guinea-red text-white">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Populaire
                  </Badge>
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center">
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                  <span className="text-xs font-medium">{service.rating}</span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-guinea-red transition-colors">
                  {service.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{service.cuisine_type}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{service.delivery_time}</span>
                  </div>
                  <span>{formatCurrency(service.delivery_fee)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500">
                    <span>{service.review_count} avis</span>
                    {service.order_count > 0 && (
                      <span className="ml-2">• {service.order_count} commandes</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {service.address}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularItems; 