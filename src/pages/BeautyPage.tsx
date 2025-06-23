import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Clock, Star, ChevronRight, Sparkles } from 'lucide-react';

// Beauty service providers data
const beautyProviders = [
  {
    id: 1,
    name: "Belle Beauté",
    image: "https://images.unsplash.com/photo-1560750588-73207b1ef5b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    serviceType: "Institut de beauté",
    rating: 4.8,
    reviewCount: 124,
    deliveryTime: "Service à domicile",
    deliveryFee: "25,000 GNF",
    trending: true,
    neighborhood: "Kaloum",
    minOrder: "50,000 GNF",
    specialties: ["Soins visage", "Maquillage", "Manucure"]
  },
  {
    id: 2,
    name: "Conakry Cosmétiques",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    serviceType: "Produits de beauté",
    rating: 4.6,
    reviewCount: 87,
    deliveryTime: "30-45 min",
    deliveryFee: "15,000 GNF",
    trending: false,
    neighborhood: "Dixinn",
    minOrder: "30,000 GNF",
    specialties: ["Cosmétiques", "Parfumerie", "Soins corps"]
  },
  {
    id: 3,
    name: "Elite Beauty",
    image: "https://images.unsplash.com/photo-1571646034647-52e926b88ee7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    serviceType: "Salon premium",
    rating: 4.9,
    reviewCount: 106,
    deliveryTime: "Service à domicile",
    deliveryFee: "40,000 GNF",
    trending: true,
    neighborhood: "Ratoma",
    minOrder: "100,000 GNF",
    specialties: ["Soins luxe", "Maquillage événement", "Anti-âge"]
  },
  {
    id: 4,
    name: "Naturel Beauty",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    serviceType: "Cosmétiques bio",
    rating: 4.7,
    reviewCount: 78,
    deliveryTime: "40-60 min",
    deliveryFee: "20,000 GNF",
    trending: false,
    neighborhood: "Matam",
    minOrder: "25,000 GNF",
    specialties: ["Produits bio", "Soins naturels", "Aromathérapie"]
  },
  {
    id: 5,
    name: "Make-Up Pro",
    image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    serviceType: "Studio de maquillage",
    rating: 4.8,
    reviewCount: 93,
    deliveryTime: "Service à domicile",
    deliveryFee: "30,000 GNF",
    trending: true,
    neighborhood: "Kaloum",
    minOrder: "60,000 GNF",
    specialties: ["Maquillage professionnel", "Mariage", "Événement"]
  },
  {
    id: 6,
    name: "Skincare Plus",
    image: "https://images.unsplash.com/photo-1612165399138-503349a32be0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    serviceType: "Spécialiste soins peau",
    rating: 4.5,
    reviewCount: 65,
    deliveryTime: "35-50 min",
    deliveryFee: "18,000 GNF",
    trending: false,
    neighborhood: "Dixinn",
    minOrder: "40,000 GNF",
    specialties: ["Soins visage", "Anti-acné", "Hydratation"]
  },
  {
    id: 7,
    name: "Nails Art",
    image: "https://images.unsplash.com/photo-1604654894611-6973b7069588?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    serviceType: "Spécialiste ongles",
    rating: 4.7,
    reviewCount: 118,
    deliveryTime: "Service à domicile",
    deliveryFee: "20,000 GNF",
    trending: true,
    neighborhood: "Ratoma",
    minOrder: "35,000 GNF",
    specialties: ["Manucure", "Pédicure", "Extensions"]
  },
  {
    id: 8,
    name: "Parfumerie Exquise",
    image: "https://images.unsplash.com/photo-1519669011783-4b2e186f9137?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    serviceType: "Parfums et senteurs",
    rating: 4.6,
    reviewCount: 72,
    deliveryTime: "25-45 min",
    deliveryFee: "15,000 GNF",
    trending: false,
    neighborhood: "Kaloum",
    minOrder: "30,000 GNF",
    specialties: ["Parfums", "Huiles essentielles", "Bougies parfumées"]
  }
];

// Filters for beauty providers
const filters = [
  { id: 'all', name: 'Tous' },
  { id: 'soins visage', name: 'Soins visage' },
  { id: 'maquillage', name: 'Maquillage' },
  { id: 'manucure', name: 'Manucure/Pédicure' },
  { id: 'cosmétiques', name: 'Cosmétiques' },
  { id: 'parfumerie', name: 'Parfumerie' },
  { id: 'produits bio', name: 'Produits bio' },
  { id: 'soins corps', name: 'Soins corps' },
  { id: 'événement', name: 'Événement' }
];

const BeautyPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Filter beauty providers based on search term and active filter
  const filteredProviders = beautyProviders.filter(provider => {
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
            src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
            alt="Beauty background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Beauté et Cosmétiques
          </h1>
          <p className="text-white md:text-lg max-w-2xl mb-6">
            Produits de beauté, services et soins esthétiques livrés à domicile ou avec service à domicile.
          </p>
          <div className="relative max-w-md">
            <Input
              type="text"
              placeholder="Rechercher un service de beauté..."
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
                <Sparkles className="h-4 w-4 mr-2" />
                {filter.name}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Beauty Providers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.length > 0 ? (
            filteredProviders.map(provider => (
              <Link 
                to={`/beauty/${provider.id}`} 
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
              <Sparkles className="h-12 w-12 mx-auto text-gray-400 mb-4" />
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

export default BeautyPage; 