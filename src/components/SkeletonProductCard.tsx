import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const SkeletonProductCard = () => {
  return (
    <Card className="overflow-hidden h-full border-0 shadow-md flex flex-col rounded-xl">
      <div className="relative">
        <div className="aspect-square overflow-hidden">
          <Skeleton className="w-full h-full rounded-none" />
        </div>
      </div>
      <div className="flex flex-col flex-1">
        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
          <div className="flex-1">
            <Skeleton className="h-4 w-3/4 mb-3" />
            <Skeleton className="h-4 w-1/2 mb-3" />
          </div>
          <div className="flex items-center gap-2 mb-3 mt-auto">
            <Skeleton className="h-6 w-20" />
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Skeleton className="w-full h-10 rounded-lg" />
        </CardFooter>
      </div>
    </Card>
  );
};
