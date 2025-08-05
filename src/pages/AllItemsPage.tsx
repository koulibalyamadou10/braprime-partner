import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useFeaturedItems } from '@/hooks/use-homepage';
import { useCartContext } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { ItemDetailModal } from '@/components/ItemDetailModal';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  Clock, 
  MapPin, 
  ChefHat,
  ShoppingCart,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';

const AllItemsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: allItems, isLoading, error } = useFeaturedItems(50); // Récupérer plus d'articles
  const { addToCart } = useCartContext();
  const { isAuthenticated } = useAuth();
  
  // États locaux
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedBusiness, setSelectedBusiness] = useState(searchParams.get('business') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());

  // Extraire les catégories et restaurants uniques
  const categories = React.useMemo(() => {
    if (!allItems) return [];
    const cats = new Set<string>();
    allItems.forEach(item => {
      if (item.menu_categories?.name) {
        cats.add(item.menu_categories.name);
      }
    });
    return Array.from(cats).sort();
  }, [allItems]);

  const businesses = React.useMemo(() => {
    if (!allItems) return [];
    const biz = new Set<string>();
    allItems.forEach(item => {
      if (item.businesses?.name) {
        biz.add(item.businesses.name);
      }
    });
    return Array.from(biz).sort();
  }, [allItems]);

  // Filtrer et trier les articles
  const filteredItems = React.useMemo(() => {
    if (!allItems) return [];

    let filtered = allItems.filter(item => {
      // Filtre par recherche
      if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !item.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Filtre par catégorie
      if (selectedCategory !== 'all' && item.menu_categories?.name !== selectedCategory) {
        return false;
      }

      // Filtre par restaurant
      if (selectedBusiness !== 'all' && item.businesses?.name !== selectedBusiness) {
        return false;
      }

      return true;
    });

    // Trier les articles
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'popular':
          return (b.is_popular ? 1 : 0) - (a.is_popular ? 1 : 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [allItems, searchTerm, selectedCategory, selectedBusiness, sortBy]);

  // Mettre à jour les paramètres d'URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedBusiness !== 'all') params.set('business', selectedBusiness);
    if (sortBy !== 'name') params.set('sort', sortBy);
    setSearchParams(params);
  }, [searchTerm, selectedCategory, selectedBusiness, sortBy, setSearchParams]);

  // Gérer l'ajout au panier
  const handleAddToCart = async (item: any) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    const itemId = item.id.toString();
    setLoadingItems(prev => new Set(prev).add(itemId));

    try {
      const businessId = item.business_id || item.businesses?.id;
      
      if (!businessId) {
        console.error('Aucun business_id trouvé pour cet article:', item);
        return;
      }

      const cartItem = {
        menu_item_id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        image: item.image,
        special_instructions: item.description
      };

      await addToCart(
        cartItem,
        businessId,
        item.businesses?.name || 'Restaurant'
      );
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
    } finally {
      setLoadingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  // Formater les montants
  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k GNF`;
    }
    return `${amount} GNF`;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-4">
                <Skeleton className="w-full h-48 mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
            <p className="text-gray-600">Une erreur est survenue lors du chargement des articles.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tous les Articles</h1>
          <p className="text-gray-600">
            Découvrez notre sélection complète de plats et articles ({filteredItems.length} articles)
          </p>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher un article..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Catégorie */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Restaurant */}
            <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
              <SelectTrigger>
                <SelectValue placeholder="Restaurant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les restaurants</SelectItem>
                {businesses.map(business => (
                  <SelectItem key={business} value={business}>{business}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Tri */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nom</SelectItem>
                <SelectItem value="price-low">Prix croissant</SelectItem>
                <SelectItem value="price-high">Prix décroissant</SelectItem>
                <SelectItem value="popular">Populaires</SelectItem>
              </SelectContent>
            </Select>

            {/* Mode d'affichage */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Résultats */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun article trouvé</h3>
            <p className="text-gray-600">Essayez de modifier vos critères de recherche.</p>
          </div>
        ) : (
          <div className={cn(
            "grid gap-6",
            viewMode === 'grid' 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "grid-cols-1"
          )}>
            {filteredItems.map((item) => {
              const itemId = item.id.toString();
              const isLoading = loadingItems.has(itemId);
              
              return (
                <div 
                  key={item.id} 
                  className={cn(
                    "bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-200",
                    viewMode === 'list' && "flex"
                  )}
                >
                  {/* Image */}
                  <div className={cn(
                    "relative overflow-hidden",
                    viewMode === 'list' ? "w-48 h-48 flex-shrink-0" : "w-full h-48"
                  )}>
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {item.is_popular && (
                        <Badge className="bg-yellow-500 text-white text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Populaire
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className={cn(
                    "p-4",
                    viewMode === 'list' && "flex-1 flex flex-col justify-between"
                  )}>
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                          {item.name}
                        </h3>
                        <span className="font-bold text-lg text-guinea-red ml-2">
                          {formatCurrency(item.price)}
                        </span>
                      </div>

                      {item.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      {/* Informations du restaurant */}
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <ChefHat className="h-4 w-4 mr-1" />
                        <span className="font-medium">{item.businesses?.name || 'Restaurant'}</span>
                      </div>

                      {/* Catégorie */}
                      {item.menu_categories?.name && (
                        <Badge variant="outline" className="text-xs mb-3">
                          {item.menu_categories.name}
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setSelectedItem(item)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        Voir détails
                      </Button>
                      <Button
                        onClick={() => handleAddToCart(item)}
                        disabled={isLoading}
                        size="sm"
                        className="bg-guinea-red hover:bg-guinea-red/90"
                      >
                        {isLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        ) : (
                          <ShoppingCart className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de détails */}
      <ItemDetailModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onAddToCart={handleAddToCart}
        loadingItems={loadingItems}
      />
    </Layout>
  );
};

export default AllItemsPage; 