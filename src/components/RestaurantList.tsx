
import { Link } from "react-router-dom";
import { Clock, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Mock data for restaurants
const restaurants = [
  {
    id: 1,
    name: "Le Petit Baoulé",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    cuisineType: "Cuisine Guinéenne",
    rating: 4.8,
    reviewCount: 124,
    deliveryTime: "25-35 min",
    deliveryFee: "15,000 GNF",
    trending: true,
    neighborhood: "Kaloum"
  },
  {
    id: 2,
    name: "Maquis du Bonheur",
    image: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    cuisineType: "Grill Africain",
    rating: 4.6,
    reviewCount: 89,
    deliveryTime: "30-45 min",
    deliveryFee: "20,000 GNF",
    trending: false,
    neighborhood: "Dixinn"
  },
  {
    id: 3,
    name: "Boulangerie Madina",
    image: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    cuisineType: "Boulangerie",
    rating: 4.5,
    reviewCount: 76,
    deliveryTime: "15-25 min",
    deliveryFee: "10,000 GNF",
    trending: true,
    neighborhood: "Madina"
  },
  {
    id: 4,
    name: "Le Café de Conakry",
    image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    cuisineType: "Café & Brunch",
    rating: 4.3,
    reviewCount: 64,
    deliveryTime: "20-30 min",
    deliveryFee: "15,000 GNF",
    trending: false,
    neighborhood: "Camayenne"
  },
  {
    id: 5,
    name: "Le Nil",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    cuisineType: "Cuisine Libanaise",
    rating: 4.7,
    reviewCount: 118,
    deliveryTime: "30-40 min",
    deliveryFee: "20,000 GNF",
    trending: true,
    neighborhood: "Ratoma"
  },
  {
    id: 6,
    name: "Poulet Express",
    image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    cuisineType: "Poulet Frit",
    rating: 4.4,
    reviewCount: 92,
    deliveryTime: "25-35 min",
    deliveryFee: "15,000 GNF",
    trending: false,
    neighborhood: "Matoto"
  }
];

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <div key={restaurant.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
              <Link to={`/restaurant/${restaurant.id}`}>
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
      </div>
    </section>
  );
};

export default RestaurantList;
