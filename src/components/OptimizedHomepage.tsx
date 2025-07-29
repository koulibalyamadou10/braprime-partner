import { Skeleton } from '@/components/ui/skeleton';
import { useHomepageEssential } from '@/hooks/use-homepage';
import { lazy, Suspense, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Truck, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Lazy loading des composants
const Categories = lazy(() => import('@/components/Categories'));
const PopularItems = lazy(() => import('@/components/PopularItems'));

// Composant de chargement optimisé
const SectionSkeleton = () => (
  <div className="py-12">
    <div className="container mx-auto px-4">
      <Skeleton className="h-8 w-64 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Composant pour charger les sections de manière progressive
const ProgressiveLoader = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!shouldLoad) {
    return <SectionSkeleton />;
  }

  return <Suspense fallback={<SectionSkeleton />}>{children}</Suspense>;
};

// Nouveau composant pour la section Devenir Partenaire/Chauffeur
const BecomePartnerDriver = () => {
  const navigate = useNavigate();

  const handleBecomePartner = () => {
    navigate('/pricing');
  };

  const handleBecomeDriver = () => {
    navigate('/devenir-chauffeur');
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-guinea-red to-guinea-yellow bg-clip-text text-transparent">
            Rejoignez BraPrime
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Choisissez votre voie et développez votre activité avec la première plateforme de livraison de Guinée
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Colonne Devenir Partenaire */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-guinea-red to-guinea-red/80 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Devenir Partenaire</h3>
              <p className="text-gray-600">Développez votre activité avec BraPrime</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-guinea-red/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-4 w-4 text-guinea-red" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Augmentez vos ventes</h4>
                  <p className="text-sm text-gray-600">Accédez à des milliers de clients et multipliez votre chiffre d'affaires</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-guinea-red/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-4 w-4 text-guinea-red" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Dashboard intuitif</h4>
                  <p className="text-sm text-gray-600">Gérez vos commandes et votre menu facilement</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-guinea-red/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-4 w-4 text-guinea-red" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Paiements sécurisés</h4>
                  <p className="text-sm text-gray-600">Transactions sécurisées et paiements garantis</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-guinea-red/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-4 w-4 text-guinea-red" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Support dédié</h4>
                  <p className="text-sm text-gray-600">Équipe de support disponible pour vous accompagner</p>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleBecomePartner}
              className="w-full bg-gradient-to-r from-guinea-red to-guinea-red/90 hover:from-guinea-red/90 hover:to-guinea-red text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Building2 className="h-5 w-5 mr-2" />
              Devenir Partenaire
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Colonne Devenir Chauffeur */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-guinea-green to-guinea-green/80 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Devenir Chauffeur</h3>
              <p className="text-gray-600">Gagnez un revenu flexible en livrant</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-guinea-green/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-4 w-4 text-guinea-green" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Revenu flexible</h4>
                  <p className="text-sm text-gray-600">Gagnez selon vos disponibilités et votre zone</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-guinea-green/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-4 w-4 text-guinea-green" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Horaires libres</h4>
                  <p className="text-sm text-gray-600">Travaillez quand vous voulez, où vous voulez</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-guinea-green/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-4 w-4 text-guinea-green" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Paiements rapides</h4>
                  <p className="text-sm text-gray-600">Recevez vos gains rapidement et en toute sécurité</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-guinea-green/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-4 w-4 text-guinea-green" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Formation gratuite</h4>
                  <p className="text-sm text-gray-600">Formation complète pour exceller dans votre rôle</p>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleBecomeDriver}
              className="w-full bg-gradient-to-r from-guinea-green to-guinea-green/90 hover:from-guinea-green/90 hover:to-guinea-green text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Truck className="h-5 w-5 mr-2" />
              Devenir Chauffeur
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

const OptimizedHomepage = () => {
  const { isLoading, error } = useHomepageEssential();

  if (error) {
    console.error('Erreur lors du chargement de la page d\'accueil:', error);
  }

  return (
    <>
      {/* Sections chargées immédiatement */}
      <ProgressiveLoader delay={0}>
        <Categories />
      </ProgressiveLoader>

      {/* Sections chargées avec délai progressif */}
      <ProgressiveLoader delay={100}>
        <PopularItems />
      </ProgressiveLoader>

      {/* Nouvelle section Devenir Partenaire/Chauffeur */}
      <ProgressiveLoader delay={200}>
        <BecomePartnerDriver />
      </ProgressiveLoader>
    </>
  );
};

export default OptimizedHomepage; 