import { Skeleton } from "@/components/ui/skeleton";

export const SkeletonProductDetail = () => {
  return (
    <div className="min-h-screen py-8 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <Skeleton className="h-10 w-32 mb-6" />

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images Section */}
          <div className="space-y-6">
            <Skeleton className="aspect-square rounded-2xl" />

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
                <Skeleton className="h-4 w-12 mb-2" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
                <Skeleton className="h-4 w-12 mb-2" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>

          {/* Product Details Section */}
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>

            <Skeleton className="h-10 w-3/4 mb-4" />
            <Skeleton className="h-6 w-40 mb-6" />

            <div className="mb-8">
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>

            <div className="mb-8">
              <Skeleton className="h-6 w-24 mb-4" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-18 rounded-full" />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-8">
              <Skeleton className="flex-1 h-12 rounded-xl" />
              <Skeleton className="h-12 w-12 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
