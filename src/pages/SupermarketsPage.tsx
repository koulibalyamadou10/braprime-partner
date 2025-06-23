
import Layout from '@/components/Layout';
import { Link } from 'react-router-dom';
import { ShoppingCart, Filter, Clock, Star, TrendingUp, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

// Dummy data for supermarkets
const supermarkets = [
  {
    id: 1,
    name: "SuperMarché Casino",
    image: "https://images.unsplash.com/photo-1534723328310-e82dad3ee43f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    marketType: "Supermarché International",
    rating: 4.8,
    reviewCount: 143,
    deliveryTime: "30-45 min",
    deliveryFee: "25,000 GNF",
    trending: true,
    neighborhood: "Camayenne",
    minOrder: "50,000 GNF"
  },
  {
    id: 2,
    name: "Bonagui Market",
    image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    marketType: "Supermarché Local",
    rating: 4.5,
    reviewCount: 92,
    deliveryTime: "25-40 min",
    deliveryFee: "20,000 GNF",
    trending: false,
    neighborhood: "Dixinn",
    minOrder: "35,000 GNF"
  },
  {
    id: 3,
    name: "Leader Price",
    image: "https://images.unsplash.com/photo-1601598851547-4302969d0614?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    marketType: "Supermarché Discount",
    rating: 4.3,
    reviewCount: 78,
    deliveryTime: "35-50 min",
    deliveryFee: "22,000 GNF",
    trending: true,
    neighborhood: "Kaloum",
    minOrder: "40,000 GNF"
  },
  {
    id: 4,
    name: "Supermarché Kalima",
    image: "https://images.unsplash.com/photo-1515706886582-54c73c5eaf41?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    marketType: "Supermarché Local",
    rating: 4.2,
    reviewCount: 65,
    deliveryTime: "40-55 min",
    deliveryFee: "30,000 GNF",
    trending: false,
    neighborhood: "Matoto",
    minOrder: "45,000 GNF"
  }
];

const filters = [
  "Tous",
  "Supermarché International",
  "Supermarché Local",
  "Supermarché Discount"
];

const SupermarketsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tous');
  
  const filteredSupermarkets = supermarkets.filter(supermarket => {
    const matchesSearch = supermarket.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         supermarket.marketType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supermarket.neighborhood.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = activeFilter === 'Tous' || 
                         supermarket.marketType.includes(activeFilter);
    
    return matchesSearch && matchesFilter;
  });
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Supermarchés à Conakry</h1>
        
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-grow relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <Input
                type="text"
                placeholder="Rechercher un supermarché, un type, un quartier..."
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
                  activeFilter === filter ? "bg-blue-500 text-white" : ""
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Supermarkets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSupermarkets.length > 0 ? (
            filteredSupermarkets.map((supermarket) => (
              <div key={supermarket.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                <Link to={`/supermarket/${supermarket.id}`}>
                  <div className="relative h-48 w-full">
                    <img 
                      src={supermarket.image} 
                      alt={supermarket.name}
                      className="w-full h-full object-cover"
                    />
                    {supermarket.trending && (
                      <Badge className="absolute top-3 right-3 bg-blue-500/90">
                        <TrendingUp className="h-3.5 w-3.5 mr-1" />
                        Populaire
                      </Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{supermarket.name}</h3>
                      <div className="flex items-center bg-blue-500/20 px-2 py-1 rounded">
                        <Star className="h-4 w-4 fill-blue-500 text-blue-500 mr-1" />
                        <span className="font-medium">{supermarket.rating}</span>
                        <span className="text-xs text-gray-500 ml-1">({supermarket.reviewCount})</span>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <span>{supermarket.marketType}</span>
                      <span className="mx-2">•</span>
                      <span>{supermarket.neighborhood}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-gray-500" />
                        <span>{supermarket.deliveryTime}</span>
                      </div>
                      <span className="text-gray-500">{supermarket.deliveryFee}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Commande minimum: {supermarket.minOrder}
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-12 text-center">
              <p className="text-gray-500 text-lg">Aucun supermarché ne correspond à votre recherche.</p>
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

export default SupermarketsPage;
