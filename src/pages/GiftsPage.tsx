
import Layout from '@/components/Layout';
import { Link } from 'react-router-dom';
import { Gift, Filter, Clock, Star, TrendingUp, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

// Dummy data for gifts
const gifts = [
  {
    id: 1,
    name: "Fleurs & Surprises",
    image: "https://images.unsplash.com/photo-1462690417829-5b41247f6b0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    giftType: "Fleurs",
    rating: 4.9,
    reviewCount: 178,
    deliveryTime: "2-3 heures",
    deliveryFee: "25,000 GNF",
    trending: true,
    neighborhood: "Toute la ville",
    minOrder: "75,000 GNF"
  },
  {
    id: 2,
    name: "Gâteaux d'Anniversaire",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    giftType: "Pâtisserie",
    rating: 4.7,
    reviewCount: 136,
    deliveryTime: "3-5 heures",
    deliveryFee: "20,000 GNF",
    trending: false,
    neighborhood: "Toute la ville",
    minOrder: "100,000 GNF"
  },
  {
    id: 3,
    name: "Cadeaux Artisanaux",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    giftType: "Artisanat Local",
    rating: 4.6,
    reviewCount: 95,
    deliveryTime: "Même jour",
    deliveryFee: "30,000 GNF",
    trending: true,
    neighborhood: "Toute la ville",
    minOrder: "150,000 GNF"
  },
  {
    id: 4,
    name: "Paniers Gourmands",
    image: "https://images.unsplash.com/photo-1544967007-14189e03ca10?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    giftType: "Gastronomie",
    rating: 4.8,
    reviewCount: 112,
    deliveryTime: "3-6 heures",
    deliveryFee: "20,000 GNF",
    trending: false,
    neighborhood: "Toute la ville",
    minOrder: "125,000 GNF"
  }
];

const filters = [
  "Tous",
  "Fleurs",
  "Pâtisserie",
  "Artisanat Local",
  "Gastronomie"
];

const GiftsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tous');
  
  const filteredGifts = gifts.filter(gift => {
    const matchesSearch = gift.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         gift.giftType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = activeFilter === 'Tous' || 
                         gift.giftType.includes(activeFilter);
    
    return matchesSearch && matchesFilter;
  });
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Cadeaux à Conakry</h1>
        
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-grow relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <Input
                type="text"
                placeholder="Rechercher un type de cadeau ou un service..."
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
                  activeFilter === filter ? "bg-pink-500 text-white" : ""
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Gifts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGifts.length > 0 ? (
            filteredGifts.map((gift) => (
              <div key={gift.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                <Link to={`/gift/${gift.id}`}>
                  <div className="relative h-48 w-full">
                    <img 
                      src={gift.image} 
                      alt={gift.name}
                      className="w-full h-full object-cover"
                    />
                    {gift.trending && (
                      <Badge className="absolute top-3 right-3 bg-pink-500/90">
                        <TrendingUp className="h-3.5 w-3.5 mr-1" />
                        Populaire
                      </Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{gift.name}</h3>
                      <div className="flex items-center bg-pink-500/20 px-2 py-1 rounded">
                        <Star className="h-4 w-4 fill-pink-500 text-pink-500 mr-1" />
                        <span className="font-medium">{gift.rating}</span>
                        <span className="text-xs text-gray-500 ml-1">({gift.reviewCount})</span>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <span>{gift.giftType}</span>
                      <span className="mx-2">•</span>
                      <span>{gift.neighborhood}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-gray-500" />
                        <span>{gift.deliveryTime}</span>
                      </div>
                      <span className="text-gray-500">{gift.deliveryFee}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Commande minimum: {gift.minOrder}
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-12 text-center">
              <p className="text-gray-500 text-lg">Aucun service de cadeaux ne correspond à votre recherche.</p>
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

export default GiftsPage;
