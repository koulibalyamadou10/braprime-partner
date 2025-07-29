import Layout from '@/components/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCategoriesWithCounts } from '@/hooks/use-homepage';
import { useSearch } from '@/hooks/use-search';
import {
    Apple,
    Award,
    Baby,
    Bike,
    BookOpen,
    Briefcase,
    Cake,
    Calendar,
    Camera,
    Car,
    Coffee,
    Dog,
    Dumbbell,
    Eye,
    FileText,
    Flower,
    Gamepad2,
    Gift,
    Globe,
    Hammer,
    Headphones,
    Heart,
    Home,
    Key,
    Loader2,
    MapPin,
    Monitor,
    Music,
    Package,
    Palette,
    Pill,
    Scissors,
    Search,
    Settings,
    Shield,
    ShoppingBasket, ShoppingCart,
    Smartphone,
    Sparkles,
    Star,
    Store,
    Target,
    TrendingUp,
    Truck,
    Tv,
    Users,
    Utensils,
    Wine,
    Wrench,
    X,
    Zap
} from 'lucide-react';
import { useMemo, useState } from 'react';



// Mapping des onglets vers les types de recherche
const tabToSearchType = {
  'all': undefined,
  'food': 'business',
  'shopping': 'business', 
  'services': 'business',
  'other': 'business'
};

// Fonction pour convertir les noms d'icônes en composants Lucide React
const getIconComponent = (iconName: string) => {
  const iconMap: { [key: string]: any } = {
    'Utensils': Utensils,
    'Coffee': Coffee,
    'ShoppingBasket': ShoppingBasket,
    'ShoppingCart': ShoppingCart,
    'Pill': Pill,
    'Tv': Tv,
    'Sparkles': Sparkles,
    'Scissors': Scissors,
    'Hammer': Hammer,
    'BookOpen': BookOpen,
    'FileText': FileText,
    'Package': Package,
    'Gift': Gift,
    'Briefcase': Briefcase,
    // Ajout d'icônes spécifiques pour éviter les répétitions
    'Store': Store,
    'Heart': Heart,
    'Zap': Zap,
    'Camera': Camera,
    'Music': Music,
    'Palette': Palette,
    'Globe': Globe,
    'Shield': Shield,
    'Truck': Truck,
    'MapPin': MapPin,
    'Calendar': Calendar,
    'Users': Users,
    'Settings': Settings,
    'Star': Star,
    'Award': Award,
    'Target': Target,
    'TrendingUp': TrendingUp,
    'Cake': Cake,
    'Eye': Eye,
    'Smartphone': Smartphone,
    'Monitor': Monitor,
    'Headphones': Headphones,
    'Key': Key,
    'Apple': Apple,
    'Flower': Flower,
    'Dog': Dog,
    'Dumbbell': Dumbbell,
    'Gamepad2': Gamepad2,
    'Home': Home,
    'Bike': Bike,
    'Baby': Baby,
    'Wine': Wine,
    'Car': Car,
    'Wrench': Wrench,
  };
  
  // Normaliser le nom de l'icône
  const normalizedIcon = iconName?.trim() || '';
  const IconComponent = iconMap[normalizedIcon] || Utensils; // Icône par défaut
  
  return (
    <IconComponent 
      className="h-6 w-6" 
      strokeWidth={2}
      fill="none"
      style={{ 
        minWidth: '24px', 
        minHeight: '24px',
        display: 'block',
        flexShrink: 0,
        color: 'white',
        stroke: 'white'
      }} 
    />
  );
};

// Fonction pour assigner une icône spécifique à chaque catégorie
const getCategoryIcon = (categoryName: string) => {
  const lowerName = categoryName.toLowerCase();
  
  // Mapping spécifique des catégories vers leurs icônes
  const categoryIconMap: { [key: string]: any } = {
    // Catégories principales avec noms normalisés
    'restaurant': Utensils,
    'restaurants': Utensils,
    'café': Coffee,
    'cafe': Coffee,
    'marché': Store,
    'market': Store,
    'pharmacie': Pill,
    'pharmacy': Pill,
    'supermarché': Store,
    'supermarket': Store,
    'beauté': Flower,
    'beauty': Flower,
    'électronique': Monitor,
    'electronics': Monitor,
    'electronic': Monitor,
    'vêtements': ShoppingBasket,
    'clothing': ShoppingBasket,
    'livres': BookOpen,
    'books': BookOpen,
    'documents': FileText,
    'cadeaux': Gift,
    'gifts': Gift,
    'cadeau': Gift,
    'gift': Gift,
    'quincaillerie': Hammer,
    'hardware': Hammer,
    'colis': Package,
    'packages': Package,
    'package': Package,
    'sport': Dumbbell,
    'sports': Dumbbell,
    'autre': Briefcase,
    'other': Briefcase,
    
    // Autres catégories
    'coffee': Coffee,
    'utensils': Utensils,
    'shoppingbasket': ShoppingBasket,
    'shoppingcart': ShoppingCart,
    'pill': Pill,
    'tv': Tv,
    'briefcase': Briefcase,
    'apple': Apple,
    'filetext': FileText,
    'shirt': ShoppingBasket,
    'bookopen': BookOpen,
    'flower': Flower,
    'dog': Dog,
    'sparkles': Sparkles,
    'hammer': Hammer,
    'dumbbell': Dumbbell,
    'gamepad2': Gamepad2,
    'home': Home,
    'bike': Bike,
    'baby': Baby,
    'wine': Wine,
    'scissors': Scissors,
    'car': Car,
    'wrench': Wrench,
    'store': Store,
    'heart': Heart,
    'zap': Zap,
    'camera': Camera,
    'music': Music,
    'palette': Palette,
    'globe': Globe,
    'shield': Shield,
    'truck': Truck,
    'mappin': MapPin,
    'calendar': Calendar,
    'users': Users,
    'settings': Settings,
    'star': Star,
    'award': Award,
    'target': Target,
    'trendingup': TrendingUp,
    'cake': Cake,
    'eye': Eye,
    'smartphone': Smartphone,
    'monitor': Monitor,
    'headphones': Headphones,
    'key': Key,
  };
  
  return categoryIconMap[lowerName] || Utensils;
};

// Fonction pour traduire et capitaliser les noms de catégories
const translateAndCapitalize = (name: string) => {
  const translations: { [key: string]: string } = {
    'restaurants': 'Restaurants',
    'cafes': 'Cafés',
    'markets': 'Marchés',
    'pharmacies': 'Pharmacies',
    'beauty': 'Beauté',
    'books': 'Livres',
    'clothing': 'Vêtements',
    'documents': 'Documents',
    'electronics': 'Électronique',
    'gifts': 'Cadeaux',
    'hardware': 'Quincaillerie',
    'packages': 'Colis',
    'coffee': 'Café',
    'utensils': 'Ustensiles',
    'shoppingbasket': 'Courses',
    'shoppingcart': 'Panier',
    'gift': 'Cadeau',
    'pill': 'Médicaments',
    'tv': 'Télévision',
    'briefcase': 'Bureau',
    'apple': 'Fruits',
    'filetext': 'Documents',
    'shirt': 'Vêtements',
    'bookopen': 'Livres',
    'flower': 'Fleurs',
    'dog': 'Animaux',
    'sparkles': 'Beauté',
    'hammer': 'Outils',
    'dumbbell': 'Sport',
    'gamepad2': 'Jeux',
    'home': 'Maison',
    'bike': 'Vélo',
    'baby': 'Bébé',
    'wine': 'Vins',
    'scissors': 'Coiffure',
    'car': 'Automobile',
    'wrench': 'Réparation',
    'store': 'Magasin',
    'heart': 'Santé',
    'zap': 'Électricité',
    'camera': 'Photo',
    'music': 'Musique',
    'palette': 'Art',
    'globe': 'International',
    'shield': 'Sécurité',
    'truck': 'Transport',
    'mappin': 'Localisation',
    'calendar': 'Événements',
    'users': 'Services',
    'settings': 'Configuration',
    'star': 'Premium',
    'award': 'Récompenses',
    'target': 'Objectifs',
    'trendingup': 'Tendances',
    'cake': 'Pâtisserie',
    'eye': 'Optique',
    'smartphone': 'Téléphonie',
    'monitor': 'Informatique',
    'headphones': 'Audio',
    'key': 'Clés',
  };
  
  const lowerName = name.toLowerCase();
  return translations[lowerName] || name.charAt(0).toUpperCase() + name.slice(1);
};

const Categories = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isSearching, setIsSearching] = useState(false);

  // Fonction pour générer une couleur aléatoire basée sur l'ID de la catégorie
  const getRandomColor = (id: number) => {
    const colors = [
      '#ef4444', // red
      '#3b82f6', // blue
      '#10b981', // green
      '#f59e0b', // yellow
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#6366f1', // indigo
      '#f97316', // orange
      '#14b8a6', // teal
      '#06b6d4', // cyan
      '#84cc16', // lime
      '#059669', // emerald
      '#f43f5e', // rose
      '#7c3aed', // violet
      '#d946ef', // fuchsia
      '#0ea5e9', // sky
      '#dc2626', // guinea-red
      '#fbbf24', // guinea-yellow
      '#059669', // guinea-green
    ];
    return colors[id % colors.length];
  };

  // Fonction pour normaliser les noms de catégories
  const normalizeCategoryName = (name: string) => {
    const lowerName = name.toLowerCase().trim();
    
    // Mapping des variations de noms vers un nom standard
    const nameMapping: { [key: string]: string } = {
      'market': 'Marché',
      'marché': 'Marché',
      'pharmacy': 'Pharmacie',
      'pharmacie': 'Pharmacie',
      'supermarket': 'Supermarché',
      'supermarché': 'Supermarché',
      'cafe': 'Café',
      'café': 'Café',
      'restaurant': 'Restaurant',
      'restaurants': 'Restaurants',
      'beauty': 'Beauté',
      'beauté': 'Beauté',
      'electronics': 'Électronique',
      'électronique': 'Électronique',
      'electronic': 'Électronique',
      'clothing': 'Vêtements',
      'vêtements': 'Vêtements',
      'books': 'Livres',
      'livres': 'Livres',
      'documents': 'Documents',
      'gifts': 'Cadeaux',
      'cadeaux': 'Cadeaux',
      'gift': 'Cadeau',
      'cadeau': 'Cadeau',
      'hardware': 'Quincaillerie',
      'quincaillerie': 'Quincaillerie',
      'packages': 'Colis',
      'colis': 'Colis',
      'package': 'Colis',
      'sports': 'Sport',
      'sport': 'Sport',
      'other': 'Autre',
      'autre': 'Autre',
    };
    
    return nameMapping[lowerName] || name.charAt(0).toUpperCase() + name.slice(1);
  };

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

    // Dédupliquer les catégories et normaliser les noms
    const normalizedCategories = filtered.reduce((acc, category) => {
      const normalizedName = normalizeCategoryName(category.name);
      
      // Vérifier si une catégorie avec ce nom normalisé existe déjà
      const existingIndex = acc.findIndex(cat => normalizeCategoryName(cat.name) === normalizedName);
      
      if (existingIndex === -1) {
        // Ajouter la nouvelle catégorie avec le nom normalisé
        acc.push({
          ...category,
          name: normalizedName
        });
      } else {
        // Fusionner les compteurs si nécessaire
        const existing = acc[existingIndex];
        acc[existingIndex] = {
          ...existing,
          restaurant_count: (existing.restaurant_count || 0) + (category.restaurant_count || 0)
        };
      }
      
      return acc;
    }, [] as any[]);

    return normalizedCategories;
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
        <div className="bg-gray-900 text-white">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl md:text-3xl font-semibold mb-2">Catégories</h1>
            <p className="text-gray-300 max-w-2xl mb-6">
              Découvrez tous nos services de livraison
            </p>
            
            {/* Search Box */}
            <div className="relative max-w-md">
              <Input
                type="text"
                placeholder="Rechercher..."
                className="pl-9 py-3 rounded-md text-gray-800 bg-white"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              
              {searchTerm && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 h-6 w-6 p-0"
                  onClick={clearSearch}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}

              {/* Indicateur de recherche en cours */}
              {isSearching && searchTerm && (
                <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">

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
                {filteredCategories.map((category) => {
                  const iconBgColor = getRandomColor(category.id);
                  
                  return (
                    <div 
                      key={category.id} 
                      className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 group cursor-pointer"
                      onClick={() => window.location.href = category.link}
                    >
                      <div 
                        className="p-3 rounded-full mb-3 group-hover:scale-110 transition-transform duration-200 flex items-center justify-center"
                        style={{ backgroundColor: iconBgColor }}
                      >
                        {(() => {
                          const IconComponent = getCategoryIcon(category.name);
                          return (
                            <IconComponent 
                              className="h-6 w-6" 
                              strokeWidth={2}
                              fill="none"
                              style={{ 
                                minWidth: '24px', 
                                minHeight: '24px',
                                display: 'block',
                                flexShrink: 0,
                                color: 'white',
                                stroke: 'white'
                              }} 
                            />
                          );
                        })()}
                      </div>
                      <span className="font-medium text-gray-900 text-sm text-center group-hover:text-guinea-red transition-colors">
                        {translateAndCapitalize(category.name)}
                      </span>
                    </div>
                  );
                })}
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
