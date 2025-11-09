import { Skeleton } from "@/components/ui/skeleton";

export const SkeletonCategoryCard = () => {
  return (
    <div className="relative h-64 overflow-hidden rounded-xl">
      <Skeleton className="w-full h-full" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
};
