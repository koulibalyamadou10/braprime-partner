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

  if (isLoading) {
    return <CategoriesSkeleton showAll={showAll} />;
  }

  if (error) {
    console.error('Erreur lors du chargement des catégories:', error);
  }

  // Utiliser uniquement les données de la base de données et filtrer les doublons
  const displayCategories = categories || [];
  const uniqueCategories = displayCategories.filter((category, index, self) => 
    index === self.findIndex(c => c.id === category.id && c.name === category.name)
  );
  const limitedCategories = showAll ? uniqueCategories : uniqueCategories.slice(0, 10);

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold">Catégories de Services</h2>
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
          {limitedCategories.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">Aucune catégorie trouvée.</div>
          ) : (
            limitedCategories.map((category) => (
              <Link 
                key={category.id} 
                to={category.link}
                className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 group"
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
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default Categories;
