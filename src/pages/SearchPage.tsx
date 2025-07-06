import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Link } from 'react-router-dom';
import { 
  Search, MapPin, Clock, Star, TrendingUp, Home, Building, Utensils, Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearch, useSearchHistory } from '@/hooks/use-search';
import { SearchResult } from '@/lib/services/search';

// Composant de chargement pour les résultats de recherche
const SearchResultsSkeleton = () => {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm">
              <Skeleton className="w-full h-48" />
              <div className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-3" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [activeTab, setActiveTab] = useState<'all' | 'business' | 'menu_item' | 'category'>('all');
  
  // Utiliser la recherche dynamique
  const { results, total, hasMore, suggestions, isLoading, error } = useSearch(
    searchTerm, 
    { type: activeTab === 'all' ? undefined : activeTab }, 
    20
  );

  // Utiliser l'historique de recherche
  const { searchHistory, addToHistory } = useSearchHistory();
  
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm.trim() });
      addToHistory(searchTerm.trim());
    }
  };

  // Formater les montants
  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k GNF`;
    }
    return `${amount} GNF`;
  };

  // Rendu d'un résultat de commerce
  const renderBusinessResult = (result: SearchResult) => (
    <div key={`${result.type}-${result.id}`} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      <Link to={`/services/${result.id}`}>
        <div className="relative h-48 w-full">
          <img 
            src={result.image || 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'} 
            alt={result.name}
            className="w-full h-full object-cover"
          />
          {result.rating && result.rating >= 4.5 && (
            <Badge className="absolute top-3 right-3 bg-guinea-red/90">
              <TrendingUp className="h-3.5 w-3.5 mr-1" />
              Populaire
            </Badge>
          )}
          {result.rating && (
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center">
              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
              <span className="text-xs font-medium">{result.rating}</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-bold text-base mb-1">{result.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{result.cuisine_type}</p>
          {result.address && (
            <div className="flex items-center text-xs text-gray-500 mb-2">
              <MapPin className="h-3 w-3 mr-1" />
              <span>{result.address}</span>
            </div>
          )}
          <div className="flex justify-between text-xs">
            {result.delivery_time && (
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>{result.delivery_time}</span>
              </div>
            )}
            {result.delivery_fee && (
              <span>{formatCurrency(result.delivery_fee)}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );

  // Rendu d'un résultat d'article de menu
  const renderMenuItemResult = (result: SearchResult) => (
    <div key={`${result.type}-${result.id}`} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      <Link to={`/services/${result.business_name}`}>
        <div className="relative h-48 w-full">
          <img 
            src={result.image || 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'} 
            alt={result.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="font-bold text-base mb-1">{result.name}</h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{result.description}</p>
          {result.business_name && (
            <div className="flex items-center text-xs text-gray-500 mb-2">
              <Building className="h-3 w-3 mr-1" />
              <span>{result.business_name}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            {result.price && (
              <span className="font-bold text-guinea-red">{formatCurrency(result.price)}</span>
            )}
            <Button size="sm" className="bg-guinea-red hover:bg-guinea-red/90 text-white">
              Commander
            </Button>
          </div>
        </div>
      </Link>
    </div>
  );

  // Rendu d'un résultat de catégorie
  const renderCategoryResult = (result: SearchResult) => (
    <div key={`${result.type}-${result.id}`} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <Link to={`/category/${result.name.toLowerCase()}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{result.name}</h3>
            {result.description && (
              <p className="text-sm text-gray-600">{result.description}</p>
            )}
          </div>
          <Tag className="h-5 w-5 text-guinea-red" />
        </div>
      </Link>
    </div>
  );

  // Filtrer les résultats par type
  const businessResults = results.filter(r => r.type === 'business');
  const menuItemResults = results.filter(r => r.type === 'menu_item');
  const categoryResults = results.filter(r => r.type === 'category');

  const hasResults = results.length > 0;
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <form className="flex mb-6">
              <Skeleton className="h-10 flex-grow" />
              <Skeleton className="h-10 w-24 ml-2" />
            </form>
            <div className="flex overflow-x-auto pb-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-20 mr-2" />
              ))}
            </div>
          </div>
          <SearchResultsSkeleton />
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex mb-6">
            <div className="flex-grow relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <Input
                type="text"
                placeholder="Rechercher un service, un commerce, un plat, un quartier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" className="ml-2 bg-guinea-red hover:bg-guinea-red/90">
              Rechercher
            </Button>
          </form>
          
          <div className="flex overflow-x-auto pb-2 hide-scrollbar">
            <Button
              variant={activeTab === 'all' ? "default" : "outline"}
              className={`mr-2 whitespace-nowrap ${
                activeTab === 'all' ? "bg-guinea-red text-white" : ""
              }`}
              onClick={() => setActiveTab('all')}
            >
              Tout ({total})
            </Button>
            <Button
              variant={activeTab === 'business' ? "default" : "outline"}
              className={`mr-2 whitespace-nowrap ${
                activeTab === 'business' ? "bg-guinea-red text-white" : ""
              }`}
              onClick={() => setActiveTab('business')}
            >
              Services ({businessResults.length})
            </Button>
            <Button
              variant={activeTab === 'menu_item' ? "default" : "outline"}
              className={`mr-2 whitespace-nowrap ${
                activeTab === 'menu_item' ? "bg-guinea-red text-white" : ""
              }`}
              onClick={() => setActiveTab('menu_item')}
            >
              Plats ({menuItemResults.length})
            </Button>
            <Button
              variant={activeTab === 'category' ? "default" : "outline"}
              className={`mr-2 whitespace-nowrap ${
                activeTab === 'category' ? "bg-guinea-red text-white" : ""
              }`}
              onClick={() => setActiveTab('category')}
            >
              Catégories ({categoryResults.length})
            </Button>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Suggestions :</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm(suggestion);
                      setSearchParams({ q: suggestion });
                      addToHistory(suggestion);
                    }}
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {queryParam && (
          <h1 className="text-2xl font-bold mb-6">
            Résultats pour "{queryParam}" ({total} trouvé{total > 1 ? 's' : ''})
          </h1>
        )}
        
        {!hasResults && queryParam && (
          <div className="text-center py-10">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Aucun résultat trouvé</h2>
            <p className="text-gray-600 mb-6">Essayez d'autres mots-clés ou parcourez nos catégories populaires.</p>
            <Button asChild className="bg-guinea-red hover:bg-guinea-red/90">
              <Link to="/" className="flex items-center">
                <Home className="mr-2 h-5 w-5" />
                Retour à l'accueil
              </Link>
            </Button>
          </div>
        )}
        
        {(activeTab === 'all' || activeTab === 'business') && businessResults.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Services & Commerces</h2>
              {businessResults.length > 2 && (
                <Link to="/restaurants" className="text-guinea-red hover:text-guinea-red/80 text-sm font-medium">
                  Voir tous
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {businessResults.slice(0, 6).map(renderBusinessResult)}
            </div>
          </div>
        )}
        
        {(activeTab === 'all' || activeTab === 'menu_item') && menuItemResults.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Plats</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItemResults.slice(0, 6).map(renderMenuItemResult)}
            </div>
          </div>
        )}
        
        {(activeTab === 'all' || activeTab === 'category') && categoryResults.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Catégories</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryResults.map(renderCategoryResult)}
                  </div>
                </div>
        )}

        {/* Historique de recherche */}
        {!queryParam && searchHistory.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Recherches récentes</h2>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((historyItem, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => {
                    setSearchTerm(historyItem);
                    setSearchParams({ q: historyItem });
                  }}
                  className="text-sm"
                >
                  {historyItem}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SearchPage;
