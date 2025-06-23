import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Clock, Star, ChevronRight, Laptop } from 'lucide-react';

// Electronics stores data
const electronicsStores = [
  {
    id: "1",
    name: "Électro Plus",
    image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    storeType: "Électronique & Technologie",
    rating: 4.6,
    reviewCount: 84,
    deliveryTime: "45-60 min",
    deliveryFee: "30,000 GNF",
    trending: true,
    neighborhood: "Ratoma",
    minOrder: "100,000 GNF",
    specialties: ["Smartphones", "Ordinateurs", "TV & Audio"]
  },
  {
    id: "2",
    name: "Digital World",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    storeType: "Électroménager & Technologie",
    rating: 4.5,
    reviewCount: 67,
    deliveryTime: "50-75 min",
    deliveryFee: "35,000 GNF",
    trending: false,
    neighborhood: "Kaloum",
    minOrder: "150,000 GNF",
    specialties: ["Électroménager", "Accessoires", "Ordinateurs"]
  },
  {
    id: "3",
    name: "Smart Technologies",
    image: "https://images.unsplash.com/photo-1612815292258-f4354f7f5ae5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    storeType: "Smartphones & Accessoires",
    rating: 4.8,
    reviewCount: 104,
    deliveryTime: "30-50 min",
    deliveryFee: "25,000 GNF",
    trending: true,
    neighborhood: "Dixinn",
    minOrder: "75,000 GNF",
    specialties: ["Smartphones", "Accessoires", "Réparation"]
  },
  {
    id: "4",
    name: "Conakry Computers",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    storeType: "Informatique & Bureautique",
    rating: 4.7,
    reviewCount: 92,
    deliveryTime: "40-65 min",
    deliveryFee: "40,000 GNF",
    trending: false,
    neighborhood: "Ratoma",
    minOrder: "200,000 GNF",
    specialties: ["Ordinateurs", "Imprimantes", "Accessoires"]
  },
  {
    id: "5",
    name: "Audio Vision",
    image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    storeType: "TV & Systèmes Audio",
    rating: 4.9,
    reviewCount: 78,
    deliveryTime: "60-90 min",
    deliveryFee: "50,000 GNF",
    trending: true,
    neighborhood: "Matam",
    minOrder: "300,000 GNF",
    specialties: ["TV & Audio", "Home Cinéma", "Installation"]
  },
  {
    id: "6",
    name: "Tecno Shop",
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    storeType: "Téléphonie & Gadgets",
    rating: 4.4,
    reviewCount: 61,
    deliveryTime: "35-55 min",
    deliveryFee: "20,000 GNF",
    trending: false,
    neighborhood: "Kaloum",
    minOrder: "50,000 GNF",
    specialties: ["Smartphones", "Gadgets", "Accessoires"]
  },
  {
    id: "7",
    name: "Électroménager Express",
    image: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    storeType: "Électroménager",
    rating: 4.6,
    reviewCount: 73,
    deliveryTime: "60-120 min",
    deliveryFee: "45,000 GNF",
    trending: true,
    neighborhood: "Dixinn",
    minOrder: "250,000 GNF",
    specialties: ["Électroménager", "Installation", "Service après-vente"]
  },
  {
    id: "8",
    name: "Gaming Zone",
    image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    storeType: "Jeux Vidéo & Consoles",
    rating: 4.8,
    reviewCount: 89,
    deliveryTime: "40-60 min",
    deliveryFee: "30,000 GNF",
    trending: false,
    neighborhood: "Ratoma",
    minOrder: "100,000 GNF",
    specialties: ["Consoles", "Jeux Vidéo", "Accessoires Gaming"]
  }
];

// Filters for electronics stores
const filters = [
  { id: 'all', name: 'Tous' },
  { id: 'smartphones', name: 'Smartphones' },
  { id: 'ordinateurs', name: 'Ordinateurs' },
  { id: 'tv & audio', name: 'TV & Audio' },
  { id: 'électroménager', name: 'Électroménager' },
  { id: 'accessoires', name: 'Accessoires' },
  { id: 'réparation', name: 'Réparation' },
  { id: 'installation', name: 'Installation' },
  { id: 'gaming', name: 'Gaming' }
];

const ElectronicsStoresPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Filter electronics stores based on search term and active filter
  const filteredStores = electronicsStores.filter(store => {
    const matchesSearch = 
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      store.storeType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.neighborhood.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      activeFilter === 'all' || 
      store.specialties.some(
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
            src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
            alt="Electronics background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Livraison d'Électronique
          </h1>
          <p className="text-white md:text-lg max-w-2xl mb-6">
            Smartphones, ordinateurs, TV et autres appareils électroniques livrés à domicile avec installation disponible.
          </p>
          <div className="relative max-w-md">
            <Input
              type="text"
              placeholder="Rechercher un magasin d'électronique..."
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
                <Laptop className="h-4 w-4 mr-2" />
                {filter.name}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Electronics Stores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.length > 0 ? (
            filteredStores.map(store => (
              <Link 
                to={`/electronics/${store.id}`} 
                key={store.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={store.image} 
                    alt={store.name}
                    className="w-full h-full object-cover"
                  />
                  {store.trending && (
                    <div className="absolute top-0 right-0 bg-guinea-red text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
                      Populaire
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{store.name}</h3>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-guinea-yellow text-guinea-yellow mr-1" />
                      <span className="font-medium">{store.rating}</span>
                      <span className="text-gray-500 text-xs ml-1">({store.reviewCount})</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{store.storeType}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {store.specialties.map((specialty, index) => (
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
                      <span className="text-gray-700">{store.deliveryTime}</span>
                    </div>
                    <span className="text-guinea-red font-medium">{store.deliveryFee}</span>
                    <span className="text-gray-600">Min: {store.minOrder}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t flex justify-between items-center">
                    <span className="text-gray-600 text-sm">{store.neighborhood}</span>
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
              <Laptop className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aucun magasin trouvé</h3>
              <p className="text-gray-600 mb-6">
                Aucun magasin ne correspond à votre recherche.
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

export default ElectronicsStoresPage; 