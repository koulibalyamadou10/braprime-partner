import React, { useState, useEffect } from 'react';
import DashboardLayout, { customerNavItems } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  Truck, 
  Building2,
  Utensils,
  Coffee,
  ShoppingBag,
  Package
} from 'lucide-react';
import { useFavorites } from '@/hooks/use-favorites';
import { toast } from 'sonner';
import { UserFavoritesSkeleton } from '@/components/dashboard/DashboardSkeletons';

const UserFavorites = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('businesses');
  const { favorites, removeFavorite, isLoading, error } = useFavorites();

  // Filtrer les favoris selon la recherche
  const filteredBusinesses = favorites.businesses?.filter(business =>
    business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    business.category.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredItems = favorites.items?.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.business_name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleRemoveBusinessFavorite = async (businessId: number) => {
    try {
      await removeFavorite('business', businessId);
      toast.success('Commerce retiré des favoris');
    } catch (error) {
      toast.error('Erreur lors de la suppression du favori');
    }
  };

  const handleRemoveItemFavorite = async (itemId: string) => {
    try {
      await removeFavorite('item', itemId);
      toast.success('Article retiré des favoris');
    } catch (error) {
      toast.error('Erreur lors de la suppression du favori');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'restaurant':
        return <Utensils className="h-4 w-4" />;
      case 'cafe':
        return <Coffee className="h-4 w-4" />;
      case 'market':
        return <ShoppingBag className="h-4 w-4" />;
      case 'pharmacy':
        return <Package className="h-4 w-4" />;
      default:
        return <Building2 className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category.toLowerCase()) {
      case 'restaurant':
        return 'Restaurant';
      case 'cafe':
        return 'Café';
      case 'market':
        return 'Marché';
      case 'pharmacy':
        return 'Pharmacie';
      default:
        return category;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout navItems={customerNavItems} title="Mes Favoris">
        <UserFavoritesSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={customerNavItems} title="Mes Favoris">
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Mes Favoris</h2>
            <p className="text-muted-foreground">
              Vos commerces et articles préférés
            </p>
          </div>
        </div>

        {/* Barre de recherche */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                type="text"
                placeholder="Rechercher dans vos favoris..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Onglets */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="businesses" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Commerces ({filteredBusinesses.length})
            </TabsTrigger>
            <TabsTrigger value="items" className="flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              Articles ({filteredItems.length})
            </TabsTrigger>
          </TabsList>

          {/* Onglet Commerces */}
          <TabsContent value="businesses" className="space-y-4">
            {filteredBusinesses.length > 0 ? (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredBusinesses.map((business) => (
                  <Card key={business.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(business.category)}
                          <Badge variant="outline">
                            {getCategoryLabel(business.category)}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveBusinessFavorite(business.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Heart className="h-4 w-4 fill-current" />
                        </Button>
                      </div>
                      <CardTitle className="text-lg">{business.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{business.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{business.rating.toFixed(1)} ({business.review_count} avis)</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{business.delivery_time} min</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Truck className="h-4 w-4" />
                          <span>{business.delivery_fee} GNF</span>
                        </div>
                      </div>
                      <Button className="w-full mt-4" asChild>
                        <a href={`/services/${business.id}`}>
                          Voir le menu
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {searchQuery ? 'Aucun commerce trouvé' : 'Aucun commerce favori'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery 
                      ? 'Aucun commerce ne correspond à votre recherche'
                      : 'Commencez à ajouter des commerces à vos favoris'
                    }
                  </p>
                  {!searchQuery && (
                    <Button asChild>
                      <a href="/restaurants">
                        Découvrir des commerces
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Onglet Articles */}
          <TabsContent value="items" className="space-y-4">
            {filteredItems.length > 0 ? (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {item.category}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItemFavorite(item.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Heart className="h-4 w-4 fill-current" />
                        </Button>
                      </div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <CardDescription>{item.business_name}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{item.rating?.toFixed(1) || 'N/A'} ({item.review_count || 0} avis)</span>
                        </div>
                        <div className="text-lg font-semibold text-green-600">
                          {item.price} GNF
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <Button className="w-full mt-4" asChild>
                        <a href={`/services/${item.business_id}`}>
                          Commander
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {searchQuery ? 'Aucun article trouvé' : 'Aucun article favori'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery 
                      ? 'Aucun article ne correspond à votre recherche'
                      : 'Commencez à ajouter des articles à vos favoris'
                    }
                  </p>
                  {!searchQuery && (
                    <Button asChild>
                      <a href="/restaurants">
                        Découvrir des articles
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default UserFavorites; 