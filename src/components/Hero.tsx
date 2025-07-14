import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/contexts/UserRoleContext";
import { ArrowRight, User } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  const { currentUser } = useAuth();
  const { isAdmin, isPartner, isDriver } = useUserRole();

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
          </div>
          <div className="flex-1 relative">
            <div className="relative w-full max-w-md mx-auto aspect-square">
              <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl bg-white">
                <div className="guinea-gradient h-1/3 w-full"></div>
                <div className="p-8">
                  <div className="w-full h-32 bg-gray-200 rounded-lg mb-6"></div>
                  <div className="w-3/4 h-6 bg-gray-300 rounded-md mb-4"></div>
                  <div className="w-1/2 h-6 bg-gray-300 rounded-md mb-8"></div>
                  <div className="flex justify-between items-center">
                    <div className="w-1/3 h-10 bg-guinea-green rounded-md"></div>
                    <div className="w-1/3 h-10 bg-guinea-red rounded-md"></div>
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
