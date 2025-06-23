import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Link } from 'react-router-dom';
import { 
  Search, MapPin, Clock, Star, TrendingUp, Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { usePopularRestaurants, useFeaturedItems } from '@/hooks/use-homepage';
import { Skeleton } from '@/components/ui/skeleton';

// Composant de chargement pour les résultats de recherche
const SearchResultsSkeleton = () => {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
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
      </div>
    </div>
  );
};

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [activeTab, setActiveTab] = useState<'all' | 'restaurants' | 'dishes' | 'areas'>('all');
  
  // Utiliser les données dynamiques
  const { data: restaurants, isLoading: restaurantsLoading } = usePopularRestaurants(20);
  const { data: featuredItems, isLoading: itemsLoading } = useFeaturedItems(20);

  // Données de fallback
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
    }
  ];

  const fallbackItems = [
    {
      id: 1,
      name: "Poulet Yassa",
      description: "Poulet mariné avec oignons, citron et épices, servi avec du riz",
      price: 60000,
      image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      restaurants: { name: "Le Petit Baoulé", cuisine_type: "Restaurant" }
    }
  ];

  // Utiliser les données dynamiques ou les données de fallback
  const displayRestaurants = restaurants || fallbackRestaurants;
  const displayItems = featuredItems || fallbackItems;

  // Zones de livraison (statiques pour l'instant)
  const areas = [
    { id: 1, name: "Kaloum", deliveryTime: "20-30 min" },
    { id: 2, name: "Dixinn", deliveryTime: "25-35 min" },
    { id: 3, name: "Ratoma", deliveryTime: "30-40 min" },
    { id: 4, name: "Matam", deliveryTime: "20-35 min" },
    { id: 5, name: "Matoto", deliveryTime: "35-45 min" },
  ];
  
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchParams({ q: searchTerm });
  };
  
  const filteredRestaurants = displayRestaurants.filter(restaurant => {
    return restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           restaurant.cuisine_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
           restaurant.address.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  const filteredDishes = displayItems.filter(dish => {
    return dish.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           dish.description.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  const filteredAreas = areas.filter(area => {
    return area.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const hasResults = filteredRestaurants.length > 0 || filteredDishes.length > 0 || filteredAreas.length > 0;
  const isLoading = restaurantsLoading || itemsLoading;

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
          <div className="mb-8">
            <form className="flex mb-6">
              <Skeleton className="h-10 flex-grow" />
              <Skeleton className="h-10 w-24 ml-2" />
            </form>
            <div className="flex overflow-x-auto pb-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-20 mr-2" />
              ))}
            </div>
          </div>
          <SearchResultsSkeleton />
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex mb-6">
            <div className="flex-grow relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <Input
                type="text"
                placeholder="Rechercher un restaurant, un plat, un quartier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" className="ml-2 bg-guinea-red hover:bg-guinea-red/90">
              Rechercher
            </Button>
          </form>
          
          <div className="flex overflow-x-auto pb-2 hide-scrollbar">
            <Button
              variant={activeTab === 'all' ? "default" : "outline"}
              className={`mr-2 whitespace-nowrap ${
                activeTab === 'all' ? "bg-guinea-red text-white" : ""
              }`}
              onClick={() => setActiveTab('all')}
            >
              Tout
            </Button>
            <Button
              variant={activeTab === 'restaurants' ? "default" : "outline"}
              className={`mr-2 whitespace-nowrap ${
                activeTab === 'restaurants' ? "bg-guinea-red text-white" : ""
              }`}
              onClick={() => setActiveTab('restaurants')}
            >
              Restaurants
            </Button>
            <Button
              variant={activeTab === 'dishes' ? "default" : "outline"}
              className={`mr-2 whitespace-nowrap ${
                activeTab === 'dishes' ? "bg-guinea-red text-white" : ""
              }`}
              onClick={() => setActiveTab('dishes')}
            >
              Plats
            </Button>
            <Button
              variant={activeTab === 'areas' ? "default" : "outline"}
              className={`mr-2 whitespace-nowrap ${
                activeTab === 'areas' ? "bg-guinea-red text-white" : ""
              }`}
              onClick={() => setActiveTab('areas')}
            >
              Quartiers
            </Button>
          </div>
        </div>
        
        {queryParam && (
          <h1 className="text-2xl font-bold mb-6">Résultats pour "{queryParam}"</h1>
        )}
        
        {!hasResults && queryParam && (
          <div className="text-center py-10">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Aucun résultat trouvé</h2>
            <p className="text-gray-600 mb-6">Essayez d'autres mots-clés ou parcourez nos catégories populaires.</p>
            <Button asChild className="bg-guinea-red hover:bg-guinea-red/90">
              <Link to="/" className="flex items-center">
                <Home className="mr-2 h-5 w-5" />
                Retour à l'accueil
              </Link>
            </Button>
          </div>
        )}
        
        {(activeTab === 'all' || activeTab === 'restaurants') && filteredRestaurants.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Restaurants</h2>
              {filteredRestaurants.length > 2 && (
                <Link to="/restaurants" className="text-guinea-red hover:text-guinea-red/80 text-sm font-medium">
                  Voir tous
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRestaurants.slice(0, 6).map((restaurant) => (
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
                      <h3 className="font-bold text-base mb-1">{restaurant.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{restaurant.cuisine_type}</p>
                      <div className="flex items-center text-xs text-gray-500 mb-2">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{restaurant.address}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{restaurant.delivery_time}</span>
                        </div>
                        <span>{formatCurrency(restaurant.delivery_fee)}</span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {(activeTab === 'all' || activeTab === 'dishes') && filteredDishes.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Plats</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDishes.slice(0, 6).map((dish) => (
                <div key={dish.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                  <Link to={`/restaurant/${dish.restaurants?.name}`}>
                    <div className="relative h-48 w-full">
                      <img 
                        src={dish.image} 
                        alt={dish.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-base mb-1">{dish.name}</h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{dish.description}</p>
                      <div className="flex items-center text-xs text-gray-500 mb-2">
                        <span>{dish.restaurants?.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-guinea-red">{formatCurrency(dish.price)}</span>
                        <Button size="sm" className="bg-guinea-red hover:bg-guinea-red/90 text-white">
                          Commander
                        </Button>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {(activeTab === 'all' || activeTab === 'areas') && filteredAreas.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Quartiers</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAreas.map((area) => (
                <div key={area.id} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{area.name}</h3>
                      <p className="text-sm text-gray-600">Temps de livraison: {area.deliveryTime}</p>
                    </div>
                    <MapPin className="h-5 w-5 text-guinea-red" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SearchPage;
