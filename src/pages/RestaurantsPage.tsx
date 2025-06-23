import { useState } from 'react';
import Layout from '@/components/Layout';
import { Link } from 'react-router-dom';
import { 
  Search, Filter, Clock, Star, TrendingUp 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { usePopularRestaurants } from '@/hooks/use-homepage';
import { Skeleton } from '@/components/ui/skeleton';

// Composant de chargement pour les restaurants
const RestaurantsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm">
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
  );
};

const RestaurantsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tous');
  
  // Utiliser les données dynamiques
  const { data: restaurants, isLoading, error } = usePopularRestaurants(20);

  // Données de fallback si pas de données ou erreur
  const fallbackRestaurants = [
    {
      id: 1,
      name: "Le Petit Baoulé",
      cover_image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      cuisine_type: "Cuisine Guinéenne",
      rating: 4.8,
      review_count: 124,
      delivery_time: "25-35 min",
      delivery_fee: 15000,
      address: "Kaloum",
      is_popular: true,
      order_count: 156
    },
    {
      id: 2,
      name: "Maquis du Bonheur",
      cover_image: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      cuisine_type: "Grill Africain",
      rating: 4.6,
      review_count: 89,
      delivery_time: "30-45 min",
      delivery_fee: 20000,
      address: "Dixinn",
      is_popular: false,
      order_count: 98
    }
  ];

  // Utiliser les données dynamiques ou les données de fallback
  const displayRestaurants = restaurants || fallbackRestaurants;

  // Générer les filtres dynamiquement à partir des types de cuisine
  const filters = ['Tous', ...new Set(displayRestaurants.map(r => r.cuisine_type))];
  
  const filteredRestaurants = displayRestaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         restaurant.cuisine_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = activeFilter === 'Tous' || 
                         restaurant.cuisine_type.includes(activeFilter);
    
    return matchesSearch && matchesFilter;
  });

  // Formater les montants
  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k GNF`;
    }
    return `${amount} GNF`;
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Restaurants à Conakry</h1>
          
          {/* Search and Filters Skeleton */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <Skeleton className="h-10 flex-grow" />
              <Skeleton className="h-10 w-24" />
            </div>
            <div className="flex overflow-x-auto pb-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-20 mr-2" />
              ))}
            </div>
          </div>
          
          <RestaurantsSkeleton />
        </div>
      </Layout>
    );
  }

  if (error) {
    console.error('Erreur lors du chargement des restaurants:', error);
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Restaurants à Conakry</h1>
        
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-grow relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <Input
                type="text"
                placeholder="Rechercher un restaurant, une cuisine, un quartier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="md:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Filtrer
            </Button>
          </div>
          
          <div className="flex overflow-x-auto pb-2 hide-scrollbar">
            {filters.map((filter, index) => (
              <Button
                key={index}
                variant={activeFilter === filter ? "default" : "outline"}
                className={`mr-2 whitespace-nowrap ${
                  activeFilter === filter ? "bg-guinea-red text-white" : ""
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Restaurant Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.length > 0 ? (
            filteredRestaurants.map((restaurant) => (
              <div key={restaurant.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                <Link to={`/restaurant/${restaurant.id}`}>
                  <div className="relative h-48 w-full">
                    <img 
                      src={restaurant.cover_image} 
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                    />
                    {restaurant.is_popular && (
                      <Badge className="absolute top-3 right-3 bg-guinea-red/90">
                        <TrendingUp className="h-3.5 w-3.5 mr-1" />
                        Populaire
                      </Badge>
                    )}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                      <span className="text-xs font-medium">{restaurant.rating}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-base">{restaurant.name}</h3>
                      <div className="flex items-center bg-guinea-yellow/20 px-2 py-1 rounded">
                        <Star className="h-3.5 w-3.5 fill-guinea-yellow text-guinea-yellow mr-1" />
                        <span className="font-medium text-sm">{restaurant.rating}</span>
                        <span className="text-xs text-gray-500 ml-1">({restaurant.review_count})</span>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mb-2">
                      <span>{restaurant.cuisine_type}</span>
                      <span className="mx-2">•</span>
                      <span>{restaurant.address}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <div className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1 text-gray-500" />
                        <span>{restaurant.delivery_time}</span>
                      </div>
                      <span className="text-gray-500">{formatCurrency(restaurant.delivery_fee)}</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <Search className="h-10 w-10 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Aucun restaurant trouvé</h2>
              <p className="text-gray-600">Essayez de modifier vos critères de recherche.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default RestaurantsPage;
