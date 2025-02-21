export default function Loading() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8" />
      
      {/* Tab Navigation Skeleton */}
      <div className="border-b">
        <div className="flex gap-8">
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Date Navigation Skeleton */}
      <div className="flex items-center gap-4 my-8">
        <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
      </div>

      {/* Chart Skeleton */}
      <div className="bg-white rounded-lg p-8">
        <div className="h-[400px] bg-gray-100 rounded animate-pulse" />
        
        {/* Legend Skeleton */}
        <div className="mt-6 flex gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Info Section Skeleton */}
      <div className="bg-gray-100 rounded-lg p-8">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded bg-gray-200 animate-pulse mt-1" />
          <div className="space-y-2">
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-20 w-full bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
} 