import { Skeleton } from "@/components/ui/skeleton";

export const SkeletonFilterSidebar = () => {
  return (
    <div className="bg-card rounded-xl shadow-lg p-5 sm:p-6 sticky top-24 border border-border max-h-[calc(100vh-120px)] overflow-y-auto">
      <div className="flex items-center justify-between mb-5 sm:mb-6 pb-4 border-b border-border">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>

      <div className="space-y-6">
        {/* Search */}
        <div>
          <Skeleton className="h-4 w-16 mb-3" />
          <div className="relative">
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          <Skeleton className="h-10 w-full mt-3 rounded-xl" />
        </div>

        {/* Category Filter */}
        <div>
          <Skeleton className="h-4 w-20 mb-3" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>

        {/* Collection Filter */}
        <div>
          <Skeleton className="h-4 w-20 mb-3" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>

        {/* Price Range */}
        <div>
          <Skeleton className="h-4 w-20 mb-3" />
          <div className="bg-secondary rounded-xl p-4">
            <div className="flex justify-between mb-4">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Skeleton className="h-3 w-8 mb-2" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
                <Skeleton className="h-4 w-4" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-8 mb-2" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              </div>
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
