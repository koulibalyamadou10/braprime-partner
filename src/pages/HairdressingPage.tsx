import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Clock, Star, ChevronRight, Scissors } from 'lucide-react';

// Hairdressing service providers data
const hairdressingProviders = [
  {
    id: 1,
    name: "Coiff'Elite",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    serviceType: "Salon de coiffure",
    rating: 4.9,
    reviewCount: 143,
    deliveryTime: "Service à domicile",
    deliveryFee: "30,000 GNF",
    trending: true,
    neighborhood: "Ratoma",
    minOrder: "50,000 GNF",
    specialties: ["Coupe femme", "Coupe homme", "Coiffure événement"]
  },
  {
    id: 2,
    name: "African Beauty Hair",
    image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    serviceType: "Spécialiste tresses",
    rating: 4.8,
    reviewCount: 126,
    deliveryTime: "Service à domicile",
    deliveryFee: "25,000 GNF",
    trending: true,
    neighborhood: "Kaloum",
    minOrder: "40,000 GNF",
    specialties: ["Tresses", "Nattes", "Extensions"]
  },
  {
    id: 3,
    name: "Men's Barber",
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    serviceType: "Barbier",
    rating: 4.7,
    reviewCount: 98,
    deliveryTime: "Service à domicile",
    deliveryFee: "20,000 GNF",
    trending: false,
    neighborhood: "Dixinn",
    minOrder: "30,000 GNF",
    specialties: ["Coupe homme", "Barbe", "Rasage"]
  },
  {
    id: 4,
    name: "Hair Colors",
    image: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    serviceType: "Spécialiste coloration",
    rating: 4.6,
    reviewCount: 84,
    deliveryTime: "Service à domicile",
    deliveryFee: "35,000 GNF",
    trending: false,
    neighborhood: "Matam",
    minOrder: "60,000 GNF",
    specialties: ["Coloration", "Mèches", "Balayage"]
  },
  {
    id: 5,
    name: "Hair Extensions Pro",
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    serviceType: "Spécialiste extensions",
    rating: 4.8,
    reviewCount: 112,
    deliveryTime: "Service à domicile",
    deliveryFee: "40,000 GNF",
    trending: true,
    neighborhood: "Ratoma",
    minOrder: "80,000 GNF",
    specialties: ["Extensions", "Tissage", "Perruques"]
  },
  {
    id: 6,
    name: "Kids Hair Salon",
    image: "https://images.unsplash.com/photo-1533167649158-6d508895b680?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    serviceType: "Coiffure enfants",
    rating: 4.7,
    reviewCount: 76,
    deliveryTime: "Service à domicile",
    deliveryFee: "25,000 GNF",
    trending: false,
    neighborhood: "Kaloum",
    minOrder: "35,000 GNF",
    specialties: ["Coupe enfant", "Tresses enfant", "Coiffure scolaire"]
  },
  {
    id: 7,
    name: "Royal Style",
    image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    serviceType: "Salon de luxe",
    rating: 4.9,
    reviewCount: 135,
    deliveryTime: "Service à domicile",
    deliveryFee: "50,000 GNF",
    trending: true,
    neighborhood: "Dixinn",
    minOrder: "100,000 GNF",
    specialties: ["Coiffure luxe", "Mariage", "Soins capillaires"]
  },
  {
    id: 8,
    name: "Locks & Natural",
    image: "https://images.unsplash.com/photo-1499557354967-2b2d8910bcca?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    serviceType: "Spécialiste cheveux naturels",
    rating: 4.8,
    reviewCount: 91,
    deliveryTime: "Service à domicile",
    deliveryFee: "30,000 GNF",
    trending: false,
    neighborhood: "Matam",
    minOrder: "45,000 GNF",
    specialties: ["Locks", "Cheveux naturels", "Soins naturels"]
  }
];

// Filters for hairdressing providers
const filters = [
  { id: 'all', name: 'Tous' },
  { id: 'coupe femme', name: 'Coupe femme' },
  { id: 'coupe homme', name: 'Coupe homme' },
  { id: 'tresses', name: 'Tresses' },
  { id: 'extensions', name: 'Extensions' },
  { id: 'coloration', name: 'Coloration' },
  { id: 'mariage', name: 'Mariage' },
  { id: 'enfant', name: 'Enfant' },
  { id: 'soins capillaires', name: 'Soins capillaires' }
];

const HairdressingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Filter hairdressing providers based on search term and active filter
  const filteredProviders = hairdressingProviders.filter(provider => {
    const matchesSearch = 
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      provider.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.neighborhood.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      activeFilter === 'all' || 
      provider.specialties.some(
        specialty => specialty.toLowerCase().includes(activeFilter.toLowerCase())
      );
    
    return matchesSearch && matchesFilter;
  });
  
  return (
    <Layout>
      {/* Hero section */}
      <div className="relative h-64 bg-gradient-to-r from-guinea-red to-guinea-red/70 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
            alt="Hairdressing background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Coiffure à Domicile
          </h1>
          <p className="text-white md:text-lg max-w-2xl mb-6">
            Services de coiffure, barbier et soins capillaires directement chez vous par des professionnels qualifiés.
          </p>
          <div className="relative max-w-md">
            <Input
              type="text"
              placeholder="Rechercher un service de coiffure..."
              className="pl-10 pr-4 py-3 rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Filtrer par spécialité</h2>
          <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
            {filters.map(filter => (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? "default" : "outline"}
                className={activeFilter === filter.id ? "bg-guinea-red hover:bg-guinea-red/90" : ""}
                onClick={() => setActiveFilter(filter.id)}
              >
                <Scissors className="h-4 w-4 mr-2" />
                {filter.name}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Hairdressing Providers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.length > 0 ? (
            filteredProviders.map(provider => (
              <Link 
                to={`/hairdressing/${provider.id}`} 
                key={provider.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={provider.image} 
                    alt={provider.name}
                    className="w-full h-full object-cover"
                  />
                  {provider.trending && (
                    <div className="absolute top-0 right-0 bg-guinea-red text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
                      Populaire
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{provider.name}</h3>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-guinea-yellow text-guinea-yellow mr-1" />
                      <span className="font-medium">{provider.rating}</span>
                      <span className="text-gray-500 text-xs ml-1">({provider.reviewCount})</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{provider.serviceType}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {provider.specialties.map((specialty, index) => (
                      <span 
                        key={index}
                        className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm border-t pt-3 mt-2">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-500 mr-1" />
                      <span className="text-gray-700">{provider.deliveryTime}</span>
                    </div>
                    <span className="text-guinea-red font-medium">{provider.deliveryFee}</span>
                    <span className="text-gray-600">Min: {provider.minOrder}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t flex justify-between items-center">
                    <span className="text-gray-600 text-sm">{provider.neighborhood}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-guinea-red hover:text-guinea-red/90"
                    >
                      Voir <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-16 text-center">
              <Scissors className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aucun service trouvé</h3>
              <p className="text-gray-600 mb-6">
                Aucun service ne correspond à votre recherche.
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setActiveFilter('all');
                }}
                className="bg-guinea-red hover:bg-guinea-red/90"
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

export default HairdressingPage; 