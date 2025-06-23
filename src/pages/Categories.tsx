import { useState } from 'react';
import Layout from '@/components/Layout';
import CategoriesGrid from '@/components/Categories';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Popular searches
const popularSearches = [
  "Restaurants", "Cafés", "Livraison", "Pharmacie", "Supermarché", 
  "Colis urgent", "Électronique", "Coiffure"
];

// Dummy recent searches - in a real app, these would come from user history
const recentSearches = [
  "Pharmacie de garde", "Restaurant africain", "Café wifi", "Supermarché livraison"
];

const Categories = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllPopular, setShowAllPopular] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-guinea-red to-guinea-red/80 text-white">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Explorez Toutes Nos Catégories</h1>
            <p className="text-lg max-w-2xl mb-8 text-white/90">
              Découvrez tous nos services de livraison et trouvez exactement ce que vous cherchez.
            </p>
            
            {/* Search Box */}
            <div className="relative max-w-2xl">
              <Input
                type="text"
                placeholder="Rechercher une catégorie ou un service..."
                className="pl-10 py-6 rounded-lg text-gray-800"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              
              {searchTerm && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Quick Searches */}
          {!searchTerm && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Recherches populaires</h2>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowAllPopular(!showAllPopular)}
                  className="text-guinea-red hover:text-guinea-red/80"
                >
                  {showAllPopular ? 'Voir moins' : 'Voir plus'}
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {(showAllPopular ? popularSearches : popularSearches.slice(0, 5)).map((search, index) => (
                  <Badge 
                    key={index} 
                    onClick={() => setSearchTerm(search)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 cursor-pointer py-2 px-3"
                  >
                    {search}
                  </Badge>
                ))}
              </div>
              
              {recentSearches.length > 0 && (
                <>
                  <h2 className="text-xl font-bold mt-6 mb-4">Recherches récentes</h2>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, index) => (
                      <Badge 
                        key={index} 
                        variant="outline"
                        onClick={() => setSearchTerm(search)}
                        className="cursor-pointer py-2 px-3 border-gray-300"
                      >
                        {search}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Categories Tabs */}
          <Tabs defaultValue="all" className="mb-8">
            <TabsList className="grid grid-cols-3 sm:grid-cols-5 lg:w-[500px]">
              <TabsTrigger value="all" onClick={() => setActiveTab('all')}>Tous</TabsTrigger>
              <TabsTrigger value="food" onClick={() => setActiveTab('food')}>Nourriture</TabsTrigger>
              <TabsTrigger value="shopping" onClick={() => setActiveTab('shopping')}>Shopping</TabsTrigger>
              <TabsTrigger value="services" onClick={() => setActiveTab('services')}>Services</TabsTrigger>
              <TabsTrigger value="other" onClick={() => setActiveTab('other')}>Autres</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Main Categories Grid */}
          <CategoriesGrid showAll={true} />

          {/* Special Offers or Promotions */}
          <div className="bg-white p-6 rounded-lg shadow-sm mt-12">
            <h2 className="text-xl font-bold mb-4">Offres Spéciales</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="rounded-lg overflow-hidden border">
                <div className="h-40 bg-gradient-to-r from-guinea-red/80 to-guinea-yellow/80 relative">
                  <div className="absolute top-4 left-4 bg-white text-guinea-red font-bold px-3 py-1 rounded-full text-sm">
                    -25%
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">Restaurants Premium</span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-3">Profitez de 25% de réduction sur la livraison</p>
                  <Button variant="outline" className="w-full">Voir l'offre</Button>
                </div>
              </div>
              
              <div className="rounded-lg overflow-hidden border">
                <div className="h-40 bg-gradient-to-r from-guinea-green/80 to-blue-500/80 relative">
                  <div className="absolute top-4 left-4 bg-white text-guinea-green font-bold px-3 py-1 rounded-full text-sm">
                    2-en-1
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">Supermarché & Pharmacie</span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-3">Commandez à deux endroits, payez une seule livraison</p>
                  <Button variant="outline" className="w-full">Voir l'offre</Button>
                </div>
              </div>
              
              <div className="rounded-lg overflow-hidden border">
                <div className="h-40 bg-gradient-to-r from-purple-500/80 to-pink-500/80 relative">
                  <div className="absolute top-4 left-4 bg-white text-purple-500 font-bold px-3 py-1 rounded-full text-sm">
                    Nouveau
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">Livraison Express</span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-3">Livraison prioritaire en moins de 30 minutes</p>
                  <Button variant="outline" className="w-full">Essayer</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Categories;
