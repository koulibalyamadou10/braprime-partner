import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Clock, Star, ChevronRight, Pill } from 'lucide-react';

// Pharmacy providers data
const pharmacyProviders = [
  {
    id: 1,
    name: "Pharmacie Centrale",
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    serviceType: "Pharmacie & Santé",
    rating: 4.8,
    reviewCount: 132,
    deliveryTime: "20-35 min",
    deliveryFee: "15,000 GNF",
    trending: true,
    neighborhood: "Kaloum",
    minOrder: "20,000 GNF",
    specialties: ["Médicaments", "Soins personnels"]
  },
  {
    id: 2,
    name: "PharmaSanté",
    image: "https://images.unsplash.com/photo-1631248055158-edec7a3c072f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    serviceType: "Pharmacie complète",
    rating: 4.6,
    reviewCount: 98,
    deliveryTime: "25-40 min",
    deliveryFee: "12,000 GNF",
    trending: false,
    neighborhood: "Dixinn",
    minOrder: "15,000 GNF",
    specialties: ["Médicaments", "Vitamines"]
  },
  {
    id: 3,
    name: "MédiExpress",
    image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    serviceType: "Pharmacie rapide",
    rating: 4.7,
    reviewCount: 115,
    deliveryTime: "15-30 min",
    deliveryFee: "20,000 GNF",
    trending: true,
    neighborhood: "Ratoma",
    minOrder: "25,000 GNF",
    specialties: ["Urgence", "Médicaments"]
  },
  {
    id: 4,
    name: "PharmaPlus",
    image: "https://images.unsplash.com/photo-1647427060118-4911c9821b82?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    serviceType: "Pharmacie & Matériel médical",
    rating: 4.5,
    reviewCount: 87,
    deliveryTime: "30-45 min",
    deliveryFee: "18,000 GNF",
    trending: false,
    neighborhood: "Kaloum",
    minOrder: "20,000 GNF",
    specialties: ["Matériel médical", "Médicaments"]
  },
  {
    id: 5,
    name: "BébéPharma",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    serviceType: "Spécialiste enfants",
    rating: 4.9,
    reviewCount: 142,
    deliveryTime: "25-50 min",
    deliveryFee: "15,000 GNF",
    trending: true,
    neighborhood: "Matam",
    minOrder: "15,000 GNF",
    specialties: ["Bébé & Enfant", "Soins personnels"]
  },
  {
    id: 6,
    name: "PharmaNature",
    image: "https://images.unsplash.com/photo-1626903292519-bf576757b893?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    serviceType: "Produits naturels",
    rating: 4.3,
    reviewCount: 56,
    deliveryTime: "40-60 min",
    deliveryFee: "12,000 GNF",
    trending: false,
    neighborhood: "Dixinn",
    minOrder: "18,000 GNF",
    specialties: ["Naturel", "Vitamines"]
  },
  {
    id: 7,
    name: "Pharmacie 24/7",
    image: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    serviceType: "Service permanent",
    rating: 4.7,
    reviewCount: 124,
    deliveryTime: "20-40 min",
    deliveryFee: "25,000 GNF",
    trending: true,
    neighborhood: "Ratoma",
    minOrder: "20,000 GNF",
    specialties: ["Urgence", "24h/24"]
  },
  {
    id: 8,
    name: "MédiConfort",
    image: "https://images.unsplash.com/photo-1567427361984-0cbe7396fc4c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    serviceType: "Pharmacie & Bien-être",
    rating: 4.4,
    reviewCount: 76,
    deliveryTime: "35-55 min",
    deliveryFee: "15,000 GNF",
    trending: false,
    neighborhood: "Matam",
    minOrder: "15,000 GNF",
    specialties: ["Bien-être", "Soins personnels"]
  }
];

// Filters for pharmacy providers
const filters = [
  { id: 'all', name: 'Tous' },
  { id: 'médicaments', name: 'Médicaments' },
  { id: 'soins personnels', name: 'Soins personnels' },
  { id: 'vitamines', name: 'Vitamines' },
  { id: 'bébé & enfant', name: 'Bébé & Enfant' },
  { id: 'matériel médical', name: 'Matériel médical' },
  { id: 'urgence', name: 'Urgence' },
  { id: 'naturel', name: 'Naturel' },
  { id: '24h/24', name: '24h/24' }
];

const PharmaciesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Filter pharmacy providers based on search term and active filter
  const filteredProviders = pharmacyProviders.filter(provider => {
    const matchesSearch = 
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      provider.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.neighborhood.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      activeFilter === 'all' || 
      provider.specialties.some(
        specialty => specialty.toLowerCase() === activeFilter.toLowerCase()
      );
    
    return matchesSearch && matchesFilter;
  });
  
  return (
    <Layout>
      {/* Hero section */}
      <div className="relative h-64 bg-gradient-to-r from-guinea-red to-guinea-red/70 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
            alt="Pharmacy background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Livraison de Médicaments
          </h1>
          <p className="text-white md:text-lg max-w-2xl mb-6">
            Service de livraison rapide de médicaments, produits de santé et conseils pharmaceutiques à domicile 24h/24.
          </p>
          <div className="relative max-w-md">
            <Input
              type="text"
              placeholder="Rechercher une pharmacie..."
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
                <Pill className="h-4 w-4 mr-2" />
                {filter.name}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Pharmacy Providers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.length > 0 ? (
            filteredProviders.map(provider => (
              <Link 
                to={`/pharmacy/${provider.id}`} 
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
              <Pill className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aucune pharmacie trouvée</h3>
              <p className="text-gray-600 mb-6">
                Aucune pharmacie ne correspond à votre recherche.
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

export default PharmaciesPage; 