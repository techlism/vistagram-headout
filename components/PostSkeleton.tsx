import { Skeleton } from '@/components/ui/skeleton';

export function PostSkeleton() {
    return (
        <div className=" border-b">
            <div className="flex items-center space-x-3 p-4">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="space-y-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>

            <Skeleton className="w-full aspect-square" />

            <div className="p-4 space-y-3">
                <div className="flex space-x-4">
                    <Skeleton className="w-5 h-5" />
                    <Skeleton className="w-5 h-5" />
                    <Skeleton className="w-5 h-5" />
                </div>
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-20" />
            </div>
        </div>
    );
}