import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Clock, Star, ChevronRight, FileText } from 'lucide-react';

// Document service providers data
const documentProviders = [
  {
    id: 1,
    name: "DocExpress",
    image: "https://images.unsplash.com/photo-1568219656418-15c329312bf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    serviceType: "Service Express",
    rating: 4.9,
    reviewCount: 156,
    deliveryTime: "30-60 min",
    deliveryFee: "10,000 GNF",
    trending: true,
    neighborhood: "Kaloum",
    minOrder: "10,000 GNF",
    specialties: ["Administratif", "Professionnel"]
  },
  {
    id: 2,
    name: "PaperTrail",
    image: "https://images.unsplash.com/photo-1586282391129-76a6df230234?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    serviceType: "Documents administratifs",
    rating: 4.7,
    reviewCount: 103,
    deliveryTime: "40-70 min",
    deliveryFee: "12,000 GNF",
    trending: false,
    neighborhood: "Dixinn",
    minOrder: "15,000 GNF",
    specialties: ["Administratif", "International"]
  },
  {
    id: 3,
    name: "RapidDocs",
    image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    serviceType: "Service de livraison rapide",
    rating: 4.5,
    reviewCount: 89,
    deliveryTime: "20-45 min",
    deliveryFee: "15,000 GNF",
    trending: true,
    neighborhood: "Ratoma",
    minOrder: "20,000 GNF",
    specialties: ["Professionnel", "Confidentiel"]
  },
  {
    id: 4,
    name: "DipCalm",
    image: "https://images.unsplash.com/photo-1621618957061-e43a469bcfdf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    serviceType: "Documents diplomatiques",
    rating: 4.8,
    reviewCount: 76,
    deliveryTime: "60-120 min",
    deliveryFee: "20,000 GNF",
    trending: false,
    neighborhood: "Kaloum",
    minOrder: "30,000 GNF",
    specialties: ["International", "Diplomatique"]
  },
  {
    id: 5,
    name: "LegalExpress",
    image: "https://images.unsplash.com/photo-1589391886645-d51941baf7fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    serviceType: "Documents juridiques",
    rating: 4.6,
    reviewCount: 92,
    deliveryTime: "45-90 min",
    deliveryFee: "18,000 GNF",
    trending: true,
    neighborhood: "Matam",
    minOrder: "25,000 GNF",
    specialties: ["Juridique", "Administratif"]
  },
  {
    id: 6,
    name: "SchoolPapers",
    image: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    serviceType: "Documents académiques",
    rating: 4.4,
    reviewCount: 67,
    deliveryTime: "30-60 min",
    deliveryFee: "12,000 GNF",
    trending: false,
    neighborhood: "Dixinn",
    minOrder: "10,000 GNF",
    specialties: ["Académique", "Scolaire"]
  },
  {
    id: 7,
    name: "MedDocs",
    image: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    serviceType: "Documents médicaux",
    rating: 4.9,
    reviewCount: 112,
    deliveryTime: "25-50 min",
    deliveryFee: "15,000 GNF",
    trending: true,
    neighborhood: "Ratoma",
    minOrder: "15,000 GNF",
    specialties: ["Médical", "Confidentiel"]
  },
  {
    id: 8,
    name: "TechDocs",
    image: "https://images.unsplash.com/photo-1581092921461-eab10e6a4ca8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    serviceType: "Documents technologiques",
    rating: 4.7,
    reviewCount: 78,
    deliveryTime: "40-70 min",
    deliveryFee: "12,000 GNF",
    trending: false,
    neighborhood: "Matam",
    minOrder: "20,000 GNF",
    specialties: ["Technologique", "Professionnel"]
  }
];

// Filters for document providers
const filters = [
  { id: 'all', name: 'Tous' },
  { id: 'administratif', name: 'Administratif' },
  { id: 'professionnel', name: 'Professionnel' },
  { id: 'international', name: 'International' },
  { id: 'confidentiel', name: 'Confidentiel' },
  { id: 'juridique', name: 'Juridique' },
  { id: 'academique', name: 'Académique' },
  { id: 'medical', name: 'Médical' },
  { id: 'diplomatique', name: 'Diplomatique' }
];

const DocumentsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Filter document providers based on search term and active filter
  const filteredProviders = documentProviders.filter(provider => {
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
            src="https://images.unsplash.com/photo-1633613286991-611fe299c4be?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
            alt="Documents background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Livraison de Documents
          </h1>
          <p className="text-white md:text-lg max-w-2xl mb-6">
            Services de collecte, transport et livraison de documents administratifs, professionnels et personnels par des coursiers fiables.
          </p>
          <div className="relative max-w-md">
            <Input
              type="text"
              placeholder="Rechercher un service de documents..."
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
                <FileText className="h-4 w-4 mr-2" />
                {filter.name}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Document Providers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.length > 0 ? (
            filteredProviders.map(provider => (
              <Link 
                to={`/documents/${provider.id}`} 
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
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
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

export default DocumentsPage; 