import { useHomepageStats } from "@/hooks/use-homepage";
import { Users, ShoppingBag, Clock, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Composant de chargement pour les statistiques
const LiveStatsSkeleton = () => {
  return (
    <section className="py-8 bg-guinea-red text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="text-center">
              <Skeleton className="h-8 w-16 mx-auto mb-2 bg-white/20" />
              <Skeleton className="h-4 w-20 mx-auto bg-white/20" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const LiveStats = () => {
  const { data: stats, isLoading, error } = useHomepageStats();

  if (isLoading) {
    return <LiveStatsSkeleton />;
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
      value: formatNumber(stats.totalRestaurants),
      label: "Restaurants",
      color: "text-yellow-300"
    },
    {
      icon: Users,
      value: formatNumber(stats.totalCustomers),
      label: "Clients satisfaits",
      color: "text-green-300"
    },
    {
      icon: TrendingUp,
      value: formatNumber(stats.totalOrders),
      label: "Commandes livrées",
      color: "text-blue-300"
    },
    {
      icon: Clock,
      value: `${stats.averageDeliveryTime}min`,
      label: "Temps moyen",
      color: "text-purple-300"
    }
  ];

  return (
    <section className="py-8 bg-guinea-red text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {statsData.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 mb-3 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="text-2xl md:text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-white/80">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LiveStats; 