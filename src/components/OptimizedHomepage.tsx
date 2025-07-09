import { lazy, Suspense, useEffect, useState } from 'react';
import { useHomepageEssential } from '@/hooks/use-homepage';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy loading des composants
const Categories = lazy(() => import('@/components/Categories'));
const PopularItems = lazy(() => import('@/components/PopularItems'));
const FeaturedItems = lazy(() => import('@/components/FeaturedItems'));
const HowItWorks = lazy(() => import('@/components/HowItWorks'));
const PartnerSection = lazy(() => import('@/components/PartnerSection').then(module => ({ default: module.PartnerSection })));

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

      <ProgressiveLoader delay={200}>
        <FeaturedItems />
      </ProgressiveLoader>

      <ProgressiveLoader delay={300}>
        <HowItWorks />
      </ProgressiveLoader>

      <ProgressiveLoader delay={400}>
        <PartnerSection />
      </ProgressiveLoader>
    </>
  );
};

export default OptimizedHomepage; 