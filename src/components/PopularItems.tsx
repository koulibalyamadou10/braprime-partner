import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePopularRestaurants } from "@/hooks/use-homepage";
import { Clock, Star, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

// Composant de chargement pour les services populaires
const PopularItemsSkeleton = () => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <Skeleton className="w-full h-40" />
              <div className="p-3">
                <div className="flex justify-between items-start mb-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-3 w-full mb-2" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-8">
          <Skeleton className="h-10 w-48" />
        </div>
      </div>
    </section>
  );
};

const PopularItems = () => {
  const { data: services, isLoading, error } = usePopularRestaurants(12);

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
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Populaires</h2>
          <Button asChild variant="outline">
            <Link to="/articles">Voir tous</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {displayServices.slice(0, 12).map((service) => (
            <div key={service.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
              <Link to={`/services/${service.id}`}>
                <div className="relative h-40 w-full">
                  <img 
                    src={service.cover_image} 
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                  {service.is_popular && (
                    <Badge className="absolute top-3 right-3 bg-guinea-red/90">
                      <TrendingUp className="h-3.5 w-3.5 mr-1" />
                      Populaire
                    </Badge>
                  )}
                </div>
                <div className="p-3">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-base">{service.name}</h3>
                    <div className="flex items-center bg-guinea-yellow/20 px-2 py-1 rounded">
                      <Star className="h-3.5 w-3.5 fill-guinea-yellow text-guinea-yellow mr-1" />
                      <span className="font-medium text-sm">{service.rating || 4.5}</span>
                      <span className="text-xs text-gray-500 ml-1">({service.review_count || 0})</span>
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mb-2">
                    <span>{service.cuisine_type || 'Restaurant'}</span>
                    <span className="mx-2">•</span>
                    <span>{service.business_type || 'Service'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <div className="flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1 text-gray-500" />
                      <span>{service.delivery_time || '20-30 min'}</span>
                    </div>
                    <span className="text-gray-500">{formatCurrency(service.delivery_fee || 0)}</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-8">
          <Button asChild variant="default" className="bg-guinea-red hover:bg-guinea-red/90">
            <Link to="/articles">Voir plus de services populaires</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PopularItems; 