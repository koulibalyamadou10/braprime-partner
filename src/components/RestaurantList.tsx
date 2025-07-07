import { Link } from "react-router-dom";
import { Clock, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Données vides - à remplacer par des données dynamiques depuis Supabase
const restaurants: any[] = [];

const RestaurantList = () => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Restaurants populaires</h2>
          <Button asChild variant="outline">
            <Link to="/restaurants">Voir tous</Link>
          </Button>
        </div>

        {restaurants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Aucun restaurant disponible pour le moment</p>
            <p className="text-gray-400 text-sm mt-2">Les restaurants seront affichés ici une fois ajoutés à la base de données</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <div key={restaurant.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                <Link to={`/services/${restaurant.id}`}>
                  <div className="relative h-48 w-full">
                    <img 
                      src={restaurant.image} 
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                    />
                    {restaurant.trending && (
                      <Badge className="absolute top-3 right-3 bg-guinea-red/90">
                        <TrendingUp className="h-3.5 w-3.5 mr-1" />
                        Populaire
                      </Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{restaurant.name}</h3>
                      <div className="flex items-center bg-guinea-yellow/20 px-2 py-1 rounded">
                        <Star className="h-4 w-4 fill-guinea-yellow text-guinea-yellow mr-1" />
                        <span className="font-medium">{restaurant.rating}</span>
                        <span className="text-xs text-gray-500 ml-1">({restaurant.reviewCount})</span>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <span>{restaurant.cuisineType}</span>
                      <span className="mx-2">•</span>
                      <span>{restaurant.neighborhood}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-gray-500" />
                        <span>{restaurant.deliveryTime}</span>
                      </div>
                      <span className="text-gray-500">{restaurant.deliveryFee}</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default RestaurantList;
