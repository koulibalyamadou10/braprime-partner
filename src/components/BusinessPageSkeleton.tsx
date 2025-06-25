import { Skeleton } from '@/components/ui/skeleton';

const BusinessPageSkeleton = () => {
  return (
    <div>
      {/* Cover Image Skeleton */}
      <div className="h-64 md:h-80 w-full relative overflow-hidden">
        <Skeleton className="w-full h-full" />
        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end">
          <Skeleton className="w-20 h-20 rounded-xl mr-4" />
          <div className="flex-1">
            <Skeleton className="h-8 w-48 mb-2" />
            <div className="flex space-x-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Skeleton */}
      <div className="container mx-auto px-4 my-6">
        {/* Business Info Skeleton */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <Skeleton className="h-4 w-full mb-4" />
          <Skeleton className="h-4 w-3/4 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center">
                <Skeleton className="h-5 w-5 mr-2" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
          <div className="flex mt-6 space-x-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        
        {/* Menu Tabs Skeleton */}
        <div className="border-b mb-6">
          <div className="flex space-x-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-20" />
            ))}
          </div>
        </div>
        
        {/* Menu Items Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="flex-1 p-4">
                <div className="flex justify-between mb-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <Skeleton className="h-10 w-24" />
              </div>
              <div className="hidden md:block w-28 h-auto">
                <Skeleton className="w-full h-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BusinessPageSkeleton; 