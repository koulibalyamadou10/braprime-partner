import { ArrowRight, Users, ShoppingBag, Clock, Star, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useHomepageStats } from "@/hooks/use-homepage";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/contexts/UserRoleContext";
import { Skeleton } from "@/components/ui/skeleton";

// Composant de chargement pour le Hero
const HeroSkeleton = () => {
  return (
    <section className="relative py-12 md:py-20 overflow-hidden">
      <div className="absolute inset-0 -z-10 opacity-10">
        <div className="absolute inset-y-0 left-0 w-1/3 guinea-gradient opacity-20" />
        <div className="absolute top-1/4 right-1/4 w-48 h-48 rounded-full bg-guinea-yellow opacity-20" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-guinea-green opacity-20" />
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
          <div className="flex-1 text-center md:text-left">
            <Skeleton className="h-12 md:h-16 lg:h-20 w-full mb-6" />
            <Skeleton className="h-6 md:h-8 w-3/4 mb-8" />
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Skeleton className="h-14 w-48" />
              <Skeleton className="h-14 w-48" />
            </div>
          </div>
          <div className="flex-1 relative">
            <Skeleton className="w-full max-w-md mx-auto aspect-square rounded-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

// Composant pour afficher les statistiques
const StatsDisplay = ({ stats }: { stats: any }) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}k`;
    }
    return num.toString();
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
      <div className="flex flex-col items-center text-center">
        <div className="bg-guinea-red/10 p-2 rounded-full mb-2">
          <ShoppingBag className="h-5 w-5 text-guinea-red" />
        </div>
        <div className="text-lg font-bold text-gray-900">{formatNumber(stats.totalRestaurants)}</div>
        <div className="text-xs text-gray-600">Services</div>
      </div>
      
      <div className="flex flex-col items-center text-center">
        <div className="bg-guinea-yellow/10 p-2 rounded-full mb-2">
          <Users className="h-5 w-5 text-guinea-yellow" />
        </div>
        <div className="text-lg font-bold text-gray-900">{formatNumber(stats.totalCustomers)}</div>
        <div className="text-xs text-gray-600">Clients</div>
      </div>
      
      <div className="flex flex-col items-center text-center">
        <div className="bg-guinea-green/10 p-2 rounded-full mb-2">
          <ShoppingBag className="h-5 w-5 text-guinea-green" />
        </div>
        <div className="text-lg font-bold text-gray-900">{formatNumber(stats.totalOrders)}</div>
        <div className="text-xs text-gray-600">Commandes</div>
      </div>
      
      <div className="flex flex-col items-center text-center">
        <div className="bg-blue-500/10 p-2 rounded-full mb-2">
          <Clock className="h-5 w-5 text-blue-500" />
        </div>
        <div className="text-lg font-bold text-gray-900">{stats.averageDeliveryTime}min</div>
        <div className="text-xs text-gray-600">Livraison</div>
      </div>
    </div>
  );
};

const Hero = () => {
  const { data: stats, isLoading, error } = useHomepageStats();
  const { currentUser } = useAuth();
  const { isAdmin, isPartner, isDriver } = useUserRole();

  if (isLoading) {
    return <HeroSkeleton />;
  }

  // Déterminer le lien du tableau de bord selon le rôle
  const getDashboardLink = () => {
    if (isAdmin) return '/dashboard/admin';
    if (isPartner) return '/dashboard/partner';
    if (isDriver) return '/driver/login'; // Les chauffeurs utilisent l'app mobile
    return '/dashboard';
  };

  return (
    <section className="relative py-12 md:py-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 opacity-10">
        <div className="absolute inset-y-0 left-0 w-1/3 guinea-gradient opacity-20" />
        <div className="absolute top-1/4 right-1/4 w-48 h-48 rounded-full bg-guinea-yellow opacity-20" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-guinea-green opacity-20" />
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
              <span className="block">Livraison rapide en</span>
              <span className="text-guinea-red">Guinée Conakry</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-8">
              Commandez de la nourriture, des courses et des articles essentiels auprès de vos restaurants et commerces locaux préférés. Livraison rapide dans toutes les régions de Guinée.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button asChild className="bg-guinea-red hover:bg-guinea-red/90 text-white py-6 px-8 text-lg">
                <Link to="/categories">
                  Voir les catégories
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              {currentUser ? (
                <Button asChild variant="outline" className="py-6 px-8 text-lg border-guinea-green text-guinea-green hover:bg-guinea-green/10">
                  <Link to={getDashboardLink()}>
                    <User className="mr-2 h-5 w-5" />
                    Mon compte
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="outline" className="py-6 px-8 text-lg border-guinea-green text-guinea-green hover:bg-guinea-green/10">
                  <Link to="/login">S'inscrire / Connexion</Link>
                </Button>
              )}
            </div>
            
            {/* Statistiques dynamiques */}
            {stats && <StatsDisplay stats={stats} />}
          </div>
          <div className="flex-1 relative">
            <div className="relative w-full max-w-md mx-auto aspect-square">
              <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl bg-white">
                <div className="guinea-gradient h-1/3 w-full"></div>
                <div className="p-8">
                  <div className="w-full h-32 bg-gray-200 rounded-lg mb-6 animate-pulse"></div>
                  <div className="w-3/4 h-6 bg-gray-300 rounded-md mb-4 animate-pulse"></div>
                  <div className="w-1/2 h-6 bg-gray-300 rounded-md mb-8 animate-pulse"></div>
                  <div className="flex justify-between items-center">
                    <div className="w-1/3 h-10 bg-guinea-green rounded-md animate-pulse"></div>
                    <div className="w-1/3 h-10 bg-guinea-red rounded-md animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
