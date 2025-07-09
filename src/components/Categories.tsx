import { Coffee, Utensils, ShoppingBasket, ShoppingCart, Package, Gift, Pill, Tv, Briefcase, Apple, FileText, Shirt, BookOpen, Flower, Dog, Sparkles, Hammer, Dumbbell, Gamepad2, Home, Bike, Baby, Wine, Scissors, Car, Wrench, ChevronRight, Store, Heart, Zap, Camera, Music, Palette, Globe, Shield, Truck, MapPin, Calendar, Users, Settings, Star, Award, Target, TrendingUp, Cake, Eye, Smartphone, Monitor, Headphones, Key } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCategoriesWithCounts } from "@/hooks/use-homepage";
import { Skeleton } from "@/components/ui/skeleton";

// Composant de chargement pour les catégories
const CategoriesSkeleton = ({ showAll = false }: { showAll?: boolean }) => {
  const itemCount = showAll ? 13 : 5;
  
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <Skeleton className="h-8 w-32" />
          {!showAll && <Skeleton className="h-10 w-48" />}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4">
          {Array.from({ length: itemCount }).map((_, index) => (
            <div key={index} className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm">
              <Skeleton className="w-16 h-16 rounded-full mb-3" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

interface CategoriesProps {
  showAll?: boolean;
  customCategories?: any[];
  title?: string;
  showViewAllButton?: boolean;
  className?: string;
}

// Mapping des icônes Lucide
const iconMapping: { [key: string]: any } = {
  'Coffee': Coffee,
  'Utensils': Utensils,
  'ShoppingBasket': ShoppingBasket,
  'ShoppingCart': ShoppingCart,
  'Package': Package,
  'Gift': Gift,
  'Pill': Pill,
  'Tv': Tv,
  'Briefcase': Briefcase,
  'Apple': Apple,
  'FileText': FileText,
  'Shirt': Shirt,
  'BookOpen': BookOpen,
  'Flower': Flower,
  'Dog': Dog,
  'Sparkles': Sparkles,
  'Hammer': Hammer,
  'Dumbbell': Dumbbell,
  'Gamepad2': Gamepad2,
  'Home': Home,
  'Bike': Bike,
  'Baby': Baby,
  'Wine': Wine,
  'Scissors': Scissors,
  'Car': Car,
  'Wrench': Wrench,
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
};

// Fonction pour obtenir l'icône Lucide
const getIconComponent = (iconName: string) => {
  if (!iconName) return Utensils;
  
  // Normaliser le nom de l'icône
  const normalizedIcon = iconName.trim();
  
  // Retourner l'icône Lucide correspondante ou Utensils par défaut
  return iconMapping[normalizedIcon] || Utensils;
};

const Categories = ({ 
  showAll = false, 
  customCategories, 
  title = "Catégories de Services",
  showViewAllButton = true,
  className = ""
}: CategoriesProps) => {
  const { data: categories, isLoading, error } = useCategoriesWithCounts();

  if (isLoading) {
    return <CategoriesSkeleton showAll={showAll} />;
  }

  if (error) {
    console.error('Erreur lors du chargement des catégories:', error);
  }

  // Utiliser les catégories personnalisées si fournies, sinon utiliser les données de la base
  const displayCategories = customCategories || categories || [];
  const uniqueCategories = displayCategories.filter((category, index, self) => 
    index === self.findIndex(c => c.id === category.id && c.name === category.name)
  );
  const limitedCategories = showAll ? uniqueCategories : uniqueCategories.slice(0, 10);

  return (
    <section className={`py-12 bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
          {!showAll && showViewAllButton && (
            <Link to="/categories">
              <Button variant="ghost" className="text-guinea-red hover:text-guinea-red/90 flex items-center">
                Voir toutes les catégories
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4">
          {limitedCategories.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">Aucune catégorie trouvée.</div>
          ) : (
            limitedCategories.map((category) => {
              // Générer une couleur de fond basée sur la couleur de l'icône
              const getCardBgColor = (iconColor: string) => {
                const colorMap: { [key: string]: string } = {
                  'bg-red-500': 'bg-red-50 hover:bg-red-100',
                  'bg-blue-500': 'bg-blue-50 hover:bg-blue-100',
                  'bg-green-500': 'bg-green-50 hover:bg-green-100',
                  'bg-yellow-500': 'bg-yellow-50 hover:bg-yellow-100',
                  'bg-purple-500': 'bg-purple-50 hover:bg-purple-100',
                  'bg-pink-500': 'bg-pink-50 hover:bg-pink-100',
                  'bg-indigo-500': 'bg-indigo-50 hover:bg-indigo-100',
                  'bg-orange-500': 'bg-orange-50 hover:bg-orange-100',
                  'bg-teal-500': 'bg-teal-50 hover:bg-teal-100',
                  'bg-cyan-500': 'bg-cyan-50 hover:bg-cyan-100',
                  'bg-lime-500': 'bg-lime-50 hover:bg-lime-100',
                  'bg-emerald-500': 'bg-emerald-50 hover:bg-emerald-100',
                  'bg-rose-500': 'bg-rose-50 hover:bg-rose-100',
                  'bg-violet-500': 'bg-violet-50 hover:bg-violet-100',
                  'bg-fuchsia-500': 'bg-fuchsia-50 hover:bg-fuchsia-100',
                  'bg-sky-500': 'bg-sky-50 hover:bg-sky-100',
                  'bg-amber-500': 'bg-amber-50 hover:bg-amber-100',
                  'bg-stone-500': 'bg-stone-50 hover:bg-stone-100',
                  'bg-neutral-500': 'bg-neutral-50 hover:bg-neutral-100',
                  'bg-zinc-500': 'bg-zinc-50 hover:bg-zinc-100',
                  'bg-gray-500': 'bg-gray-50 hover:bg-gray-100',
                  'bg-slate-500': 'bg-slate-50 hover:bg-slate-100',
                  'bg-guinea-red': 'bg-red-50 hover:bg-red-100',
                  'bg-guinea-yellow': 'bg-yellow-50 hover:bg-yellow-100',
                  'bg-guinea-green': 'bg-green-50 hover:bg-green-100',
                };
                return colorMap[iconColor] || 'bg-white hover:bg-gray-50';
              };

              const cardBgColor = getCardBgColor(category.color);
              
              // Récupérer l'icône Lucide
              const IconComponent = getIconComponent(category.icon);
              
              return (
                <Link 
                  key={category.id} 
                  to={category.link}
                  className={`flex flex-col items-center p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 group ${cardBgColor}`}
                >
                  <div className={`${category.color} p-4 rounded-full mb-3 group-hover:scale-110 transition-transform duration-200 flex items-center justify-center`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-medium text-gray-900 text-sm text-center mb-1 group-hover:text-guinea-red transition-colors">
                    {category.name}
                  </span>
                  {category.restaurant_count > 0 && (
                    <span className="text-xs text-gray-500">
                      {category.restaurant_count} service{category.restaurant_count > 1 ? 's' : ''}
                    </span>
                  )}
                </Link>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default Categories;
