import { Coffee, Utensils, ShoppingBasket, ShoppingCart, Package, Gift, Pill, Tv, Briefcase, Apple, FileText, Shirt, BookOpen, Flower, Dog, Sparkles, Hammer, Dumbbell, Gamepad2, Home, Bike, Baby, Wine, Scissors, Car, Wrench, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCategoriesWithCounts } from "@/hooks/use-homepage";
import { Skeleton } from "@/components/ui/skeleton";

// Mapping des icônes pour les catégories
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'Restaurants': Utensils,
  'Cafés': Coffee,
  'Marchés': ShoppingBasket,
  'Supermarchés': ShoppingCart,
  'Colis': Package,
  'Cadeaux': Gift,
  'Pharmacie': Pill,
  'Électronique': Tv,
  'Fournitures': Briefcase,
  'Documents': FileText,
  'Beauté': Sparkles,
  'Bricolage': Hammer,
  'Coiffure': Scissors,
  'default': Utensils
};

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
              <Skeleton className="w-12 h-12 rounded-full mb-3" />
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
}

const Categories = ({ showAll = false }: CategoriesProps) => {
  const { data: categories, isLoading, error } = useCategoriesWithCounts();

  // Données de fallback si pas de données ou erreur
  const fallbackCategories = [
    {
      id: 1,
      name: "Restaurants",
      icon: "Utensils",
      color: "bg-guinea-red",
      link: "/restaurants",
      restaurant_count: 0
    },
    {
      id: 4,
      name: "Supermarchés",
      icon: "ShoppingCart",
      color: "bg-blue-500",
      link: "/supermarkets",
      restaurant_count: 0
    },
    {
      id: 5,
      name: "Colis",
      icon: "Package",
      color: "bg-purple-500",
      link: "/packages",
      restaurant_count: 0
    },
    {
      id: 7,
      name: "Pharmacie",
      icon: "Pill",
      color: "bg-green-500",
      link: "/pharmacy",
      restaurant_count: 0
    },
    {
      id: 8,
      name: "Électronique",
      icon: "Tv",
      color: "bg-indigo-500",
      link: "/electronic-stores",
      restaurant_count: 0
    }
  ];

  // Utiliser les données dynamiques ou les données de fallback
  const displayCategories = categories || fallbackCategories;
  const limitedCategories = showAll ? displayCategories : displayCategories.slice(0, 5);

  if (isLoading) {
    return <CategoriesSkeleton showAll={showAll} />;
  }

  if (error) {
    console.error('Erreur lors du chargement des catégories:', error);
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold">Catégories</h2>
          {!showAll && (
            <Link to="/categories">
              <Button variant="ghost" className="text-guinea-red hover:text-guinea-red/90 flex items-center">
                Voir toutes les catégories
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4">
          {limitedCategories.map((category) => {
            const IconComponent = iconMap[category.name] || iconMap.default;
            
            return (
              <Link 
                key={category.id} 
                to={category.link}
                className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
              >
                <div className={`${category.color} p-3 rounded-full mb-3`}>
                  <IconComponent className="h-5 w-5 text-white" />
                </div>
                <span className="font-medium text-gray-900 text-sm text-center mb-1">
                  {category.name}
                </span>
                {category.restaurant_count > 0 && (
                  <span className="text-xs text-gray-500">
                    {category.restaurant_count} restaurant{category.restaurant_count > 1 ? 's' : ''}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;
