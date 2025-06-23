
import Layout from '@/components/Layout';
import { Link } from 'react-router-dom';
import { Package as PackageIcon, Filter, Clock, Star, TrendingUp, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

// Dummy data for delivery packages
const packages = [
  {
    id: 1,
    name: "Livraison Express",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    packageType: "Colis Urgent",
    rating: 4.9,
    reviewCount: 156,
    deliveryTime: "1-2 heures",
    deliveryFee: "35,000 GNF",
    trending: true,
    neighborhood: "Toute la ville",
    minOrder: "Aucun minimum"
  },
  {
    id: 2,
    name: "Livraison Standard",
    image: "https://images.unsplash.com/photo-1591078954153-9c0a71fa62be?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    packageType: "Colis Normal",
    rating: 4.7,
    reviewCount: 127,
    deliveryTime: "3-5 heures",
    deliveryFee: "25,000 GNF",
    trending: false,
    neighborhood: "Toute la ville",
    minOrder: "Aucun minimum"
  },
  {
    id: 3,
    name: "Livraison Économique",
    image: "https://images.unsplash.com/photo-1581515286348-98549f342db8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    packageType: "Colis Économique",
    rating: 4.5,
    reviewCount: 98,
    deliveryTime: "Même jour",
    deliveryFee: "15,000 GNF",
    trending: true,
    neighborhood: "Toute la ville",
    minOrder: "Aucun minimum"
  },
  {
    id: 4,
    name: "Livraison Documents",
    image: "https://images.unsplash.com/photo-1568219656418-15c329312bf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    packageType: "Documents Urgents",
    rating: 4.8,
    reviewCount: 112,
    deliveryTime: "1-3 heures",
    deliveryFee: "20,000 GNF",
    trending: false,
    neighborhood: "Toute la ville",
    minOrder: "Aucun minimum"
  }
];

const filters = [
  "Tous",
  "Colis Urgent",
  "Colis Normal",
  "Colis Économique",
  "Documents Urgents"
];

const PackagesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tous');
  
  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         pkg.packageType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = activeFilter === 'Tous' || 
                         pkg.packageType.includes(activeFilter);
    
    return matchesSearch && matchesFilter;
  });
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Livraison de Colis à Conakry</h1>
        
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-grow relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <Input
                type="text"
                placeholder="Rechercher un type de colis ou service..."
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
                  activeFilter === filter ? "bg-purple-500 text-white" : ""
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Packages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.length > 0 ? (
            filteredPackages.map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                <Link to={`/package/${pkg.id}`}>
                  <div className="relative h-48 w-full">
                    <img 
                      src={pkg.image} 
                      alt={pkg.name}
                      className="w-full h-full object-cover"
                    />
                    {pkg.trending && (
                      <Badge className="absolute top-3 right-3 bg-purple-500/90">
                        <TrendingUp className="h-3.5 w-3.5 mr-1" />
                        Populaire
                      </Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{pkg.name}</h3>
                      <div className="flex items-center bg-purple-500/20 px-2 py-1 rounded">
                        <Star className="h-4 w-4 fill-purple-500 text-purple-500 mr-1" />
                        <span className="font-medium">{pkg.rating}</span>
                        <span className="text-xs text-gray-500 ml-1">({pkg.reviewCount})</span>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <span>{pkg.packageType}</span>
                      <span className="mx-2">•</span>
                      <span>{pkg.neighborhood}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-gray-500" />
                        <span>{pkg.deliveryTime}</span>
                      </div>
                      <span className="text-gray-500">{pkg.deliveryFee}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {pkg.minOrder}
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-12 text-center">
              <p className="text-gray-500 text-lg">Aucun service de colis ne correspond à votre recherche.</p>
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

export default PackagesPage;
