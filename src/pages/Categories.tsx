import { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/Layout';
import CategoriesGrid from '@/components/Categories';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, X, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSearch } from '@/hooks/use-search';
import { useCategoriesWithCounts } from '@/hooks/use-homepage';
import { Skeleton } from '@/components/ui/skeleton';

// Popular searches
const popularSearches = [
  "Restaurants", "Cafés", "Livraison", "Pharmacie", "Supermarché", 
  "Colis urgent", "Électronique", "Coiffure"
];

// Dummy recent searches - in a real app, these would come from user history
const recentSearches = [
  "Pharmacie de garde", "Restaurant africain", "Café wifi", "Supermarché livraison"
];

// Mapping des onglets vers les types de recherche
const tabToSearchType = {
  'all': undefined,
  'food': 'business',
  'shopping': 'business', 
  'services': 'business',
  'other': 'business'
};

const Categories = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllPopular, setShowAllPopular] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [isSearching, setIsSearching] = useState(false);

  // Récupérer les catégories depuis Supabase
  const { data: categories, isLoading: categoriesLoading } = useCategoriesWithCounts();

  // Recherche dynamique avec SearchService
  const { results: searchResults, isLoading: searchLoading, suggestions } = useSearch(
    searchTerm,
    { type: tabToSearchType[activeTab as keyof typeof tabToSearchType] },
    50
  );

  // Filtrer les catégories basé sur searchTerm et activeTab
  const filteredCategories = useMemo(() => {
    if (!categories) return [];

    let filtered = [...categories];

    // Filtrer par terme de recherche
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchLower) ||
        category.description?.toLowerCase().includes(searchLower)
      );
    }

    // Filtrer par type d'onglet (si pas "all")
    if (activeTab !== 'all') {
      filtered = filtered.filter(category => {
        const categoryName = category.name.toLowerCase();
        switch (activeTab) {
          case 'food':
            return ['restaurant', 'café', 'pizzeria', 'fast-food', 'boulangerie', 'pâtisserie'].some(foodType =>
              categoryName.includes(foodType)
            );
          case 'shopping':
            return ['supermarché', 'épicerie', 'boutique', 'magasin', 'centre commercial'].some(shopType =>
              categoryName.includes(shopType)
            );
          case 'services':
            return ['pharmacie', 'coiffure', 'nettoyage', 'réparation', 'livraison', 'transport'].some(serviceType =>
              categoryName.includes(serviceType)
            );
          case 'other':
            return !['restaurant', 'café', 'pizzeria', 'fast-food', 'boulangerie', 'pâtisserie', 'supermarché', 'épicerie', 'boutique', 'magasin', 'centre commercial', 'pharmacie', 'coiffure', 'nettoyage', 'réparation', 'livraison', 'transport'].some(type =>
              categoryName.includes(type)
            );
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [categories, searchTerm, activeTab]);

  // Gérer le changement de recherche
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsSearching(true);
  };

  // Effacer la recherche
  const clearSearch = () => {
    setSearchTerm('');
    setIsSearching(false);
  };

  // Gérer le clic sur une recherche populaire/récente
  const handleSearchClick = (term: string) => {
    setSearchTerm(term);
    setIsSearching(true);
  };

  // Gérer le changement d'onglet
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Loading state
  const isLoading = categoriesLoading || searchLoading;

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

              {/* Indicateur de recherche en cours */}
              {isSearching && searchTerm && (
                <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
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
                    onClick={() => handleSearchClick(search)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 cursor-pointer py-2 px-3 transition-colors"
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
                        onClick={() => handleSearchClick(search)}
                        className="cursor-pointer py-2 px-3 border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        {search}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Suggestions de recherche */}
          {suggestions.length > 0 && searchTerm && (
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Suggestions :</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 5).map((suggestion, index) => (
                  <Badge 
                    key={index} 
                    variant="outline"
                    onClick={() => handleSearchClick(suggestion)}
                    className="cursor-pointer py-2 px-3 border-guinea-red text-guinea-red hover:bg-guinea-red hover:text-white transition-colors"
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Categories Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-8">
            <TabsList className="grid grid-cols-3 sm:grid-cols-5 lg:w-[500px]">
              <TabsTrigger value="all">Tous</TabsTrigger>
              <TabsTrigger value="food">Nourriture</TabsTrigger>
              <TabsTrigger value="shopping">Shopping</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="other">Autres</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Résultats de recherche */}
          {searchTerm && searchResults.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">
                Résultats de recherche pour "{searchTerm}" ({searchResults.length} trouvé{searchResults.length > 1 ? 's' : ''})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.slice(0, 6).map((result) => (
                  <div key={`${result.type}-${result.id}`} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-guinea-red/10 rounded-full flex items-center justify-center">
                        <span className="text-guinea-red text-lg">
                          {result.type === 'business' ? '🏪' : result.type === 'menu_item' ? '🍽️' : '🏷️'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{result.name}</h3>
                        {result.description && (
                          <p className="text-sm text-gray-600">{result.description}</p>
                        )}
                        {result.cuisine_type && (
                          <p className="text-xs text-gray-500">{result.cuisine_type}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Categories Grid */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {searchTerm ? `Catégories filtrées` : 'Catégories de Services'}
                {searchTerm && ` (${filteredCategories.length} résultat${filteredCategories.length > 1 ? 's' : ''})`}
              </h2>
              {searchTerm && (
                <Button variant="outline" onClick={clearSearch} size="sm">
                  Effacer la recherche
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div key={index} className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm">
                    <Skeleton className="w-12 h-12 rounded-full mb-3" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'Aucune catégorie trouvée' : 'Aucune catégorie disponible'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm 
                    ? `Aucune catégorie ne correspond à "${searchTerm}". Essayez un autre terme de recherche.`
                    : 'Aucune catégorie n\'est actuellement disponible.'
                  }
                </p>
                {searchTerm && (
                  <Button variant="outline" onClick={clearSearch}>
                    Effacer la recherche
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4">
                {filteredCategories.map((category) => (
                  <div 
                    key={category.id} 
                    className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 group cursor-pointer"
                    onClick={() => window.location.href = category.link}
                  >
                    <div className={`${category.color} p-3 rounded-full mb-3 group-hover:scale-110 transition-transform duration-200 flex items-center justify-center`}>
                      <span className="text-2xl" role="img" aria-label={category.name}>
                        {category.icon}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900 text-sm text-center mb-1 group-hover:text-guinea-red transition-colors">
                      {category.name}
                    </span>
                    {category.restaurant_count > 0 && (
                      <span className="text-xs text-gray-500">
                        {category.restaurant_count} service{category.restaurant_count > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

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
