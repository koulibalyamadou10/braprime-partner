
import Layout from '@/components/Layout';
import { Link } from 'react-router-dom';
import { Coffee, Filter, Clock, Star, TrendingUp, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

// Dummy data for cafes
const cafes = [
  {
    id: 1,
    name: "Le Café de Conakry",
    image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    cuisineType: "Café & Brunch",
    rating: 4.7,
    reviewCount: 92,
    deliveryTime: "15-25 min",
    deliveryFee: "15,000 GNF",
    trending: true,
    neighborhood: "Kaloum",
    minOrder: "25,000 GNF"
  },
  {
    id: 2,
    name: "Baobab Coffee",
    image: "https://images.unsplash.com/photo-1513639595782-31f25c297fef?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    cuisineType: "Café & Pâtisserie",
    rating: 4.5,
    reviewCount: 78,
    deliveryTime: "20-30 min",
    deliveryFee: "12,000 GNF",
    trending: false,
    neighborhood: "Dixinn",
    minOrder: "20,000 GNF"
  },
  {
    id: 3,
    name: "Le Petit Paris",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    cuisineType: "Café Français",
    rating: 4.6,
    reviewCount: 65,
    deliveryTime: "25-35 min",
    deliveryFee: "18,000 GNF",
    trending: true,
    neighborhood: "Camayenne",
    minOrder: "30,000 GNF"
  },
  {
    id: 4,
    name: "Café Nimba",
    image: "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    cuisineType: "Café Tradition",
    rating: 4.3,
    reviewCount: 47,
    deliveryTime: "15-25 min",
    deliveryFee: "10,000 GNF",
    trending: false,
    neighborhood: "Matam",
    minOrder: "15,000 GNF"
  }
];

const filters = [
  "Tous",
  "Café & Brunch",
  "Café Français",
  "Café Tradition",
  "Pâtisserie"
];

const CafesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tous');
  
  const filteredCafes = cafes.filter(cafe => {
    const matchesSearch = cafe.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         cafe.cuisineType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cafe.neighborhood.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = activeFilter === 'Tous' || 
                         cafe.cuisineType.includes(activeFilter);
    
    return matchesSearch && matchesFilter;
  });
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Cafés à Conakry</h1>
        
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-grow relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <Input
                type="text"
                placeholder="Rechercher un café, un quartier..."
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
                  activeFilter === filter ? "bg-guinea-yellow text-white" : ""
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Cafes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCafes.length > 0 ? (
            filteredCafes.map((cafe) => (
              <div key={cafe.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                <Link to={`/cafe/${cafe.id}`}>
                  <div className="relative h-48 w-full">
                    <img 
                      src={cafe.image} 
                      alt={cafe.name}
                      className="w-full h-full object-cover"
                    />
                    {cafe.trending && (
                      <Badge className="absolute top-3 right-3 bg-guinea-yellow/90">
                        <TrendingUp className="h-3.5 w-3.5 mr-1" />
                        Populaire
                      </Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{cafe.name}</h3>
                      <div className="flex items-center bg-guinea-yellow/20 px-2 py-1 rounded">
                        <Star className="h-4 w-4 fill-guinea-yellow text-guinea-yellow mr-1" />
                        <span className="font-medium">{cafe.rating}</span>
                        <span className="text-xs text-gray-500 ml-1">({cafe.reviewCount})</span>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <span>{cafe.cuisineType}</span>
                      <span className="mx-2">•</span>
                      <span>{cafe.neighborhood}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-gray-500" />
                        <span>{cafe.deliveryTime}</span>
                      </div>
                      <span className="text-gray-500">{cafe.deliveryFee}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Commande minimum: {cafe.minOrder}
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-12 text-center">
              <p className="text-gray-500 text-lg">Aucun café ne correspond à votre recherche.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchTerm('');
                  setActiveFilter('Tous');
                }}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CafesPage;
