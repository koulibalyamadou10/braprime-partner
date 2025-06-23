
import Layout from '@/components/Layout';
import { Link } from 'react-router-dom';
import { ShoppingBasket, Filter, Clock, Star, TrendingUp, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

// Dummy data for markets
const markets = [
  {
    id: 1,
    name: "Marché Madina",
    image: "https://images.unsplash.com/photo-1506306699893-3d351d83fa96?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    marketType: "Marché Central",
    rating: 4.6,
    reviewCount: 134,
    deliveryTime: "30-45 min",
    deliveryFee: "20,000 GNF",
    trending: true,
    neighborhood: "Madina",
    minOrder: "30,000 GNF"
  },
  {
    id: 2,
    name: "Marché Niger",
    image: "https://images.unsplash.com/photo-1513125370-3460ebe3401b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    marketType: "Fruits et Légumes",
    rating: 4.5,
    reviewCount: 87,
    deliveryTime: "25-40 min",
    deliveryFee: "18,000 GNF",
    trending: false,
    neighborhood: "Kaloum",
    minOrder: "25,000 GNF"
  },
  {
    id: 3,
    name: "Marché Taouyah",
    image: "https://images.unsplash.com/photo-1573246123716-6b1782bfc499?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    marketType: "Marché Local",
    rating: 4.3,
    reviewCount: 62,
    deliveryTime: "30-50 min",
    deliveryFee: "25,000 GNF",
    trending: true,
    neighborhood: "Ratoma",
    minOrder: "35,000 GNF"
  },
  {
    id: 4,
    name: "Marché Matoto",
    image: "https://images.unsplash.com/photo-1604719312566-8912e9c8a213?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    marketType: "Marché de Quartier",
    rating: 4.4,
    reviewCount: 75,
    deliveryTime: "35-55 min",
    deliveryFee: "22,000 GNF",
    trending: false,
    neighborhood: "Matoto",
    minOrder: "30,000 GNF"
  }
];

const filters = [
  "Tous",
  "Marché Central",
  "Fruits et Légumes",
  "Marché Local",
  "Marché de Quartier"
];

const MarketsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tous');
  
  const filteredMarkets = markets.filter(market => {
    const matchesSearch = market.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         market.marketType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         market.neighborhood.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = activeFilter === 'Tous' || 
                         market.marketType.includes(activeFilter);
    
    return matchesSearch && matchesFilter;
  });
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Marchés à Conakry</h1>
        
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-grow relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <Input
                type="text"
                placeholder="Rechercher un marché, un type, un quartier..."
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
                  activeFilter === filter ? "bg-guinea-green text-white" : ""
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Markets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMarkets.length > 0 ? (
            filteredMarkets.map((market) => (
              <div key={market.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                <Link to={`/market/${market.id}`}>
                  <div className="relative h-48 w-full">
                    <img 
                      src={market.image} 
                      alt={market.name}
                      className="w-full h-full object-cover"
                    />
                    {market.trending && (
                      <Badge className="absolute top-3 right-3 bg-guinea-green/90">
                        <TrendingUp className="h-3.5 w-3.5 mr-1" />
                        Populaire
                      </Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{market.name}</h3>
                      <div className="flex items-center bg-guinea-green/20 px-2 py-1 rounded">
                        <Star className="h-4 w-4 fill-guinea-green text-guinea-green mr-1" />
                        <span className="font-medium">{market.rating}</span>
                        <span className="text-xs text-gray-500 ml-1">({market.reviewCount})</span>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <span>{market.marketType}</span>
                      <span className="mx-2">•</span>
                      <span>{market.neighborhood}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-gray-500" />
                        <span>{market.deliveryTime}</span>
                      </div>
                      <span className="text-gray-500">{market.deliveryFee}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Commande minimum: {market.minOrder}
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-12 text-center">
              <p className="text-gray-500 text-lg">Aucun marché ne correspond à votre recherche.</p>
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

export default MarketsPage;
