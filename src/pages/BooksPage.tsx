import { useState } from 'react';
import Layout from '@/components/Layout';
import { Link } from 'react-router-dom';
import { 
  Search, Filter, Clock, Star, TrendingUp, BookOpen 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

// Bookstore data
const bookstores = [
  {
    id: 1,
    name: "Librairie Harmattan",
    image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    storeType: "Librairie & Papeterie",
    rating: 4.7,
    reviewCount: 95,
    deliveryTime: "30-45 min",
    deliveryFee: "20,000 GNF",
    trending: true,
    neighborhood: "Kaloum",
    minOrder: "35,000 GNF",
    specialties: ["Littérature", "Académique"]
  },
  {
    id: 2,
    name: "Pages d'Afrique",
    image: "https://images.unsplash.com/photo-1526243741027-444d633d7365?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    storeType: "Librairie Internationale",
    rating: 4.8,
    reviewCount: 87,
    deliveryTime: "35-50 min",
    deliveryFee: "25,000 GNF",
    trending: true,
    neighborhood: "Dixinn",
    minOrder: "40,000 GNF",
    specialties: ["International", "Livres rares"]
  },
  {
    id: 3,
    name: "Librairie Universitaire",
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    storeType: "Livres académiques",
    rating: 4.5,
    reviewCount: 64,
    deliveryTime: "25-40 min",
    deliveryFee: "15,000 GNF",
    trending: false,
    neighborhood: "Ratoma",
    minOrder: "30,000 GNF",
    specialties: ["Universitaire", "Sciences"]
  },
  {
    id: 4,
    name: "Au Monde des Enfants",
    image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    storeType: "Livres jeunesse",
    rating: 4.9,
    reviewCount: 132,
    deliveryTime: "20-35 min",
    deliveryFee: "18,000 GNF",
    trending: true,
    neighborhood: "Matam",
    minOrder: "25,000 GNF",
    specialties: ["Jeunesse", "Éducatif"]
  },
  {
    id: 5,
    name: "BookTech",
    image: "https://images.unsplash.com/photo-1569728723358-d1a317aa7fba?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    storeType: "Librairie numérique",
    rating: 4.6,
    reviewCount: 76,
    deliveryTime: "10-20 min",
    deliveryFee: "10,000 GNF",
    trending: true,
    neighborhood: "Camayenne",
    minOrder: "20,000 GNF",
    specialties: ["E-books", "Technologie"]
  },
  {
    id: 6,
    name: "Carrefour des Savoirs",
    image: "https://images.unsplash.com/photo-1515125520141-3e3b67bc0a88?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    storeType: "Librairie généraliste",
    rating: 4.4,
    reviewCount: 58,
    deliveryTime: "30-45 min",
    deliveryFee: "20,000 GNF",
    trending: false,
    neighborhood: "Lambandji",
    minOrder: "30,000 GNF",
    specialties: ["Généraliste", "Fournitures"]
  },
  {
    id: 7,
    name: "La Plume d'Or",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    storeType: "Livres & Papeterie",
    rating: 4.3,
    reviewCount: 45,
    deliveryTime: "25-40 min",
    deliveryFee: "18,000 GNF",
    trending: false,
    neighborhood: "Matoto",
    minOrder: "25,000 GNF",
    specialties: ["Littérature", "Papeterie"]
  },
  {
    id: 8,
    name: "Livres d'Occasion",
    image: "https://images.unsplash.com/photo-1518373714866-3f1478910cc0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    storeType: "Livres d'occasion",
    rating: 4.2,
    reviewCount: 37,
    deliveryTime: "35-50 min",
    deliveryFee: "22,000 GNF",
    trending: false,
    neighborhood: "Kaloum",
    minOrder: "15,000 GNF",
    specialties: ["Occasion", "Rare"]
  }
];

const filters = [
  "Tous",
  "Littérature",
  "Académique",
  "Jeunesse",
  "E-books",
  "Occasion",
  "Papeterie"
];

const BooksPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tous');
  
  const filteredBookstores = bookstores.filter(bookstore => {
    const matchesSearch = bookstore.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         bookstore.storeType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bookstore.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bookstore.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = activeFilter === 'Tous' || 
                         bookstore.specialties.some(s => s.includes(activeFilter)) ||
                         bookstore.storeType.includes(activeFilter);
    
    return matchesSearch && matchesFilter;
  });
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Librairies à Conakry</h1>
        
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-grow relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <Input
                type="text"
                placeholder="Rechercher une librairie, un type de livres, un quartier..."
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
                  activeFilter === filter ? "bg-guinea-red text-white" : ""
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Bookstore Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookstores.length > 0 ? (
            filteredBookstores.map((bookstore) => (
              <div key={bookstore.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                <Link to={`/books/${bookstore.id}`}>
                  <div className="relative h-48 w-full">
                    <img 
                      src={bookstore.image} 
                      alt={bookstore.name}
                      className="w-full h-full object-cover"
                    />
                    {bookstore.trending && (
                      <Badge className="absolute top-3 right-3 bg-guinea-red/90">
                        <TrendingUp className="h-3.5 w-3.5 mr-1" />
                        Populaire
                      </Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{bookstore.name}</h3>
                      <div className="flex items-center bg-guinea-yellow/20 px-2 py-1 rounded">
                        <Star className="h-4 w-4 fill-guinea-yellow text-guinea-yellow mr-1" />
                        <span className="font-medium">{bookstore.rating}</span>
                        <span className="text-xs text-gray-500 ml-1">({bookstore.reviewCount})</span>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <span>{bookstore.storeType}</span>
                      <span className="mx-2">•</span>
                      <span>{bookstore.neighborhood}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {bookstore.specialties.map((specialty, index) => (
                        <Badge key={index} variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200">
                          <BookOpen className="h-3 w-3 mr-1" />
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-gray-500" />
                        <span>{bookstore.deliveryTime}</span>
                      </div>
                      <span className="text-gray-500">{bookstore.deliveryFee}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Commande minimum: {bookstore.minOrder}
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-12 text-center">
              <p className="text-gray-500 text-lg">Aucune librairie ne correspond à votre recherche.</p>
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

export default BooksPage; 