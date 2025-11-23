import { Skeleton } from "@/components/ui/skeleton";

export const SkeletonCollectionCard = () => {
  return (
    <div className="relative h-80 overflow-hidden rounded-xl">
      <Skeleton className="w-full h-full" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <Skeleton className="h-6 w-40 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
};
