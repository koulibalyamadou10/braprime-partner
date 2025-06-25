import { useHomepageStats } from "@/hooks/use-homepage";
import { Users, ShoppingBag, Clock, TrendingUp, MapPin, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

// Composant de chargement pour les statistiques
const RealTimeStatsSkeleton = () => {
  return (
    <section className="py-12 bg-gradient-to-r from-guinea-red to-guinea-red/90 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <Skeleton className="h-8 w-64 mx-auto mb-4 bg-white/20" />
          <Skeleton className="h-4 w-96 mx-auto bg-white/20" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="text-center">
              <Skeleton className="h-12 w-12 mx-auto mb-3 bg-white/20 rounded-full" />
              <Skeleton className="h-8 w-16 mx-auto mb-2 bg-white/20" />
              <Skeleton className="h-4 w-20 mx-auto bg-white/20" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Composant pour animer les nombres
const AnimatedNumber = ({ value, duration = 2000 }: { value: number; duration?: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setDisplayValue(Math.floor(progress * value));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration]);

  return <span>{displayValue.toLocaleString()}</span>;
};

const RealTimeStats = () => {
  const { data: stats, isLoading, error } = useHomepageStats();

  if (isLoading) {
    return <RealTimeStatsSkeleton />;
  }

  if (error || !stats) {
    return null; // Ne pas afficher si erreur
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}k`;
    }
    return num.toString();
  };

  const statsData = [
    {
      icon: ShoppingBag,
      value: stats.totalRestaurants,
      label: "Restaurants",
      color: "text-yellow-300",
      bgColor: "bg-yellow-500/20"
    },
    {
      icon: Users,
      value: stats.totalCustomers,
      label: "Clients satisfaits",
      color: "text-green-300",
      bgColor: "bg-green-500/20"
    },
    {
      icon: TrendingUp,
      value: stats.totalOrders,
      label: "Commandes livrées",
      color: "text-blue-300",
      bgColor: "bg-blue-500/20"
    },
    {
      icon: Clock,
      value: stats.averageDeliveryTime,
      label: "Temps moyen (min)",
      color: "text-purple-300",
      bgColor: "bg-purple-500/20"
    },
    {
      icon: MapPin,
      value: 8,
      label: "Zones couvertes",
      color: "text-orange-300",
      bgColor: "bg-orange-500/20"
    },
    {
      icon: Star,
      value: 4.8,
      label: "Note moyenne",
      color: "text-pink-300",
      bgColor: "bg-pink-500/20"
    }
  ];

  return (
    <section className="py-12 bg-gradient-to-r from-guinea-red to-guinea-red/90 text-white relative overflow-hidden">
      {/* Effet de particules en arrière-plan */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-white rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-16 h-16 bg-white rounded-full animate-pulse delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            BraPrime en Chiffres
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Découvrez l'impact de notre plateforme sur la livraison en Guinée
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {statsData.map((stat, index) => (
            <div 
              key={index} 
              className="text-center group hover:scale-105 transition-transform duration-300"
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${stat.bgColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
              <div className="text-2xl md:text-3xl font-bold mb-2">
                {stat.label.includes('Temps') || stat.label.includes('Note') || stat.label.includes('Zones') ? (
                  stat.value
                ) : (
                  <AnimatedNumber value={stat.value} />
                )}
                {stat.label.includes('Note') && <span className="text-lg">/5</span>}
              </div>
              <div className="text-sm text-white/80 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Section des statistiques en temps réel */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Données mises à jour en temps réel</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RealTimeStats; 