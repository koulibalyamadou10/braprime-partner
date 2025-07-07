import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Star, Clock, MapPin, Filter, Grid, List } from 'lucide-react';
import { useBusinessesByType } from '@/hooks/use-business';
import { useBusinessTypes } from '@/hooks/use-homepage';
import { Skeleton } from '@/components/ui/skeleton';

const CategoryDetail = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    rating: 'all',
    deliveryTime: 'all-times',
    priceRange: 'all'
  });

  // Récupérer les données du type de commerce
  const { data: businessTypes, isLoading: businessTypesLoading } = useBusinessTypes();
  const businessType = businessTypes?.find(type => type.id.toString() === categoryId);

  // Récupérer les commerces de ce type
  const { data: businesses, isLoading: businessesLoading } = useBusinessesByType(categoryId || '');

  // Filtrer les commerces par critères de recherche et filtres
  const filteredBusinesses = businesses?.filter(business => {
    // Filtrer par recherche
    if (searchTerm && !business.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filtrer par note
    if (filters.rating && filters.rating !== 'all' && business.rating < parseFloat(filters.rating)) {
      return false;
    }
    
    // Filtrer par temps de livraison
    if (filters.deliveryTime && filters.deliveryTime !== 'all-times') {
      const deliveryTime = parseInt(business.delivery_time || '0');
      const filterTime = parseInt(filters.deliveryTime);
      if (deliveryTime > filterTime) return false;
    }
    
    return true;
  }) || [];

  // Trier les commerces
  const sortedBusinesses = [...filteredBusinesses].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'delivery_time':
        return parseInt(a.delivery_time || '0') - parseInt(b.delivery_time || '0');
      case 'distance':
        return parseFloat(a.distance || '0') - parseFloat(b.distance || '0');
      default:
        return 0;
    }
  });

  if (businessTypesLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-48 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!businessType) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Type de commerce non trouvé</h1>
            <p className="text-gray-600 mb-6">Le type de commerce que vous recherchez n'existe pas.</p>
            <Button asChild>
              <Link to="/">Retour à l'accueil</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* En-tête du type de commerce */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {businessType.image_url && (
              <img 
                src={businessType.image_url} 
                alt={businessType.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{businessType.name}</h1>
              <p className="text-gray-600">{businessType.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{sortedBusinesses.length} commerces disponibles</span>
            <span>•</span>
            <span>Livraison rapide</span>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Barre de recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher un commerce..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtres */}
            <div className="flex gap-2">
              <Select value={filters.rating} onValueChange={(value) => setFilters(prev => ({ ...prev, rating: value }))}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Note" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="4.5">4.5+ étoiles</SelectItem>
                  <SelectItem value="4.0">4.0+ étoiles</SelectItem>
                  <SelectItem value="3.5">3.5+ étoiles</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.deliveryTime} onValueChange={(value) => setFilters(prev => ({ ...prev, deliveryTime: value }))}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Livraison" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-times">Tous</SelectItem>
                  <SelectItem value="30">≤ 30 min</SelectItem>
                  <SelectItem value="45">≤ 45 min</SelectItem>
                  <SelectItem value="60">≤ 60 min</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nom</SelectItem>
                  <SelectItem value="rating">Note</SelectItem>
                  <SelectItem value="delivery_time">Temps de livraison</SelectItem>
                  <SelectItem value="distance">Distance</SelectItem>
                </SelectContent>
              </Select>

              {/* Boutons de vue */}
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des commerces */}
        {businessesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-48 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : sortedBusinesses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun commerce trouvé</h3>
            <p className="text-gray-600 mb-6">
              Aucun commerce ne correspond à vos critères de recherche.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setFilters({ rating: 'all', deliveryTime: 'all-times', priceRange: 'all' });
              }}
            >
              Réinitialiser les filtres
            </Button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {sortedBusinesses.map((business) => (
              <Card key={business.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <Link to={`/services/${business.id}`}>
                  <div className="relative">
                    <img 
                      src={business.cover_image || '/images/placeholder-restaurant.jpg'} 
                      alt={business.name}
                      className={`w-full object-cover ${viewMode === 'grid' ? 'h-48' : 'h-32'}`}
                    />
                    {business.is_popular && (
                      <Badge className="absolute top-2 right-2 bg-guinea-red">
                        Populaire
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{business.name}</h3>
                      <div className="flex items-center bg-guinea-yellow/20 px-2 py-1 rounded">
                        <Star className="h-4 w-4 fill-guinea-yellow text-guinea-yellow mr-1" />
                        <span className="font-medium">{business.rating || 'N/A'}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">{business.description}</p>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{business.address}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-gray-500" />
                        <span>{business.delivery_time || 'N/A'} min</span>
                      </div>
                      <span className="text-gray-500">
                        {business.delivery_fee ? `${business.delivery_fee} GNF` : 'Gratuit'}
                      </span>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CategoryDetail; 